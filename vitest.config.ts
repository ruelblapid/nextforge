import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	resolve: {
		alias: {
			'@nextforge': path.resolve(__dirname, './src'),
		},
	},
	test: {
		environment: 'node',
	},
});
