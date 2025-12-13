import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: ['lib/nextron.ts', 'lib/nextron-dev.ts', 'lib/nextron-build.ts'],
    outDir: 'bin',
    format: ['cjs', 'esm'],
    banner: '#!/usr/bin/env node',
    dts: false,
    minify: process.env.NODE_ENV === 'production',
  },
  {
    entry: {
      'webpack.config': 'lib/configs/webpack.config.production.ts',
    },
    outDir: 'bin',
    format: ['esm'],
    dts: false,
    minify: process.env.NODE_ENV === 'production',
  },
])
