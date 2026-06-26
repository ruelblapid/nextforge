import tseslint from 'typescript-eslint';

export default tseslint.config(
	{ ignores: ['dist/**'] },
	...tseslint.configs.recommended,
	{
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'off',
			'@typescript-eslint/no-namespace': 'off',
			'prefer-const': 'warn',
		},
	}
);
