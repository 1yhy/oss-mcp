import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'es2022',
  sourcemap: true,
  clean: true,
  dts: false,
  skipNodeModulesBundle: true,
  shims: true,
  minify: process.env.NODE_ENV === 'production',
  outDir: 'dist',
  onSuccess: process.env.NODE_ENV === 'development'
    ? 'node dist/index.js --stdio'
    : undefined,
});
