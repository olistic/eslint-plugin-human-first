const docsUrl =
  "https://github.com/olistic/eslint-plugin-human-first/blob/main/docs/rules/no-comments.md";

export default {
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: {
      description:
        "Disallow comments — including ESLint directives — that AI agents over-generate",
      url: docsUrl,
      recommended: true,
    },
    schema: [
      {
        type: "object",
        properties: {
          allow: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{ allow: [] }],
    messages: {
      unexpected:
        "Unexpected comment. Code should be self-documenting. If necessary, use an allowed prefix ({{allowed}}).",
    },
  },
  create(context) {
    const { allow: allowPrefixes } = context.options[0];

    function isAllowed(value) {
      const trimmed = value.trim();

      for (const prefix of allowPrefixes) {
        if (trimmed.startsWith(prefix)) {
          return true;
        }
      }

      return false;
    }

    return {
      Program() {
        const comments = context.sourceCode.getAllComments();

        for (const comment of comments) {
          if (!isAllowed(comment.value)) {
            context.report({
              loc: comment.loc,
              messageId: "unexpected",
              fix(fixer) {
                return fixer.remove(comment);
              },
              data: {
                allowed: allowPrefixes.length
                  ? allowPrefixes.join(", ")
                  : "none configured",
              },
            });
          }
        }
      },
    };
  },
};
