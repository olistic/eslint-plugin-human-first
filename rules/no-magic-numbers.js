const docsUrl =
  "https://github.com/olistic/eslint-plugin-human-first/blob/main/docs/rules/no-magic-numbers.md";

export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow magic numbers that should be named constants",
      url: docsUrl,
      recommended: true,
    },
    schema: [
      {
        type: "object",
        properties: {
          ignoreNumbers: {
            type: "array",
            items: { type: "number" },
            uniqueItems: true,
          },
          ignoreArrayIndexes: { type: "boolean" },
          ignoreDefaultValues: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [
      { ignoreNumbers: [-1, 0, 1, 2], ignoreArrayIndexes: true, ignoreDefaultValues: true },
    ],
    messages: {
      noMagicNumber:
        "No magic number: {{value}}. Extract to a named constant.",
    },
  },
  create(context) {
    const { ignoreNumbers, ignoreArrayIndexes, ignoreDefaultValues } =
      context.options[0];

    function isConstDeclaration(node) {
      let current = node.parent;
      while (current) {
        if (
          current.type === "VariableDeclaration" &&
          current.kind === "const"
        ) {
          return true;
        }
        if (
          current.type === "VariableDeclarator" ||
          current.type === "UnaryExpression" ||
          current.type === "Property"
        ) {
          current = current.parent;
          continue;
        }
        break;
      }
      return false;
    }

    function isEnumMember(node) {
      let current = node.parent;
      while (current) {
        if (current.type === "TSEnumMember") {
          return true;
        }
        current = current.parent;
      }
      return false;
    }

    function isDefaultValue(node) {
      return (
        node.parent.type === "AssignmentPattern" &&
        node.parent.right === node
      );
    }

    function isArrayIndex(node) {
      return (
        node.parent.type === "MemberExpression" &&
        node.parent.computed &&
        node.parent.property === node
      );
    }

    function isTypeAnnotation(node) {
      let current = node.parent;
      while (current) {
        if (
          current.type &&
          (current.type.startsWith("TS") ||
            current.type === "TypeAnnotation")
        ) {
          return true;
        }
        current = current.parent;
      }
      return false;
    }

    function isRadixArgument(node) {
      const { parent } = node;
      if (parent.type !== "CallExpression") {
        return false;
      }
      const { callee } = parent;
      if (
        parent.arguments[1] === node &&
        callee.type === "Identifier" &&
        callee.name === "parseInt"
      ) {
        return true;
      }
      if (
        callee.type === "MemberExpression" &&
        callee.property.type === "Identifier"
      ) {
        if (
          parent.arguments[1] === node &&
          callee.object.type === "Identifier" &&
          callee.object.name === "Number" &&
          callee.property.name === "parseInt"
        ) {
          return true;
        }
        if (
          parent.arguments[0] === node &&
          callee.property.name === "toString"
        ) {
          return true;
        }
      }
      return false;
    }

    function shouldIgnore(node) {
      if (ignoreNumbers.includes(node.value)) {
        return true;
      }

      if (isRadixArgument(node)) {
        return true;
      }

      if (isConstDeclaration(node)) {
        return true;
      }

      if (ignoreArrayIndexes && isArrayIndex(node)) {
        return true;
      }

      if (ignoreDefaultValues && isDefaultValue(node)) {
        return true;
      }

      if (isEnumMember(node)) {
        return true;
      }

      if (isTypeAnnotation(node)) {
        return true;
      }

      return false;
    }

    return {
      Literal(node) {
        if (typeof node.value === "number" && !shouldIgnore(node)) {
          context.report({
            node,
            messageId: "noMagicNumber",
            data: { value: String(node.value) },
          });
        }
      },
    };
  },
};
