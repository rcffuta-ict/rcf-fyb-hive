import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        rules: {
            // Allow intentionally-unused identifiers when prefixed with "_"
            // (e.g. stubbed service parameters).
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
        },
    },
    // Turn off ESLint rules that conflict with Prettier formatting.
    prettier,
    // Keep in sync with eslint-config-next's default ignores.
    // `supabase/functions/**` is Deno, not Next: it uses URL imports and the
    // Deno global, neither of which this config can resolve. It's linted and
    // type-checked by the Deno toolchain instead (`deno check`).
    globalIgnores([
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
        "supabase/functions/**",
    ]),
]);

export default eslintConfig;
