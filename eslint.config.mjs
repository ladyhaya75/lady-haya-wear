import eslint from "@eslint/js";
import nextEslint from "@next/eslint-plugin-next";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Config plate (ESLint 9) sans eslint-config-next : évite @rushstack/eslint-patch
 * et l’erreur « Failed to patch ESLint » avec `next lint` / ESLint CLI.
 */
export default tseslint.config(
	{
		ignores: [
			".next/**",
			"node_modules/**",
			"out/**",
			"public/sw.js",
			"public/workbox*.js",
			"prisma/migrations/**",
		],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ["**/*.{js,jsx,ts,tsx}"],
		...nextEslint.flatConfig.coreWebVitals,
	},
	react.configs.flat["jsx-runtime"],
	reactHooks.configs["recommended-latest"],
	{
		files: ["**/*.{js,jsx,ts,tsx}"],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
			parserOptions: {
				ecmaFeatures: { jsx: true },
			},
		},
		settings: {
			react: { version: "detect" },
		},
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
			"import/no-anonymous-default-export": "off",
			"prefer-const": "off",
			"react/no-unescaped-entities": "off",
		},
	}
);
