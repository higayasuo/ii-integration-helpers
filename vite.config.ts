import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      outDir: 'dist',
      include: ['src'],
      exclude: ['**/__tests__/**'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        '@dfinity/agent',
        '@dfinity/identity',
        '@dfinity/auth-client',
        'canister-manager',
        'expo-icp-frontend-helpers',
        'expo-icp-app-connect-helpers',
      ],
    },
  },
});
