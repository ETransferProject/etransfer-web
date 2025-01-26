/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    coverage: {
      all: false,
      enabled: true,
      provider: 'v8',
      include: ['src/utils/**/*.[jt]s?(x)'],
      exclude: [
        'node_modules',
        '**/dist/*.*',
        '**/.*',
        '**/*.setup.*',
        '**/__tests__/*.*',
        'src/utils/telegram-web-app.js',
      ],
      reportsDirectory: './coverage',
      reporter: [
        ['json-summary', { file: 'coverage-summary.json' }],
        ['lcov', { file: 'lcov.info' }],
        ['text'],
      ],
    },
    pool: 'vmThreads',
    poolOptions: {
      vmThreads: {
        useAtomics: true,
      },
    },
    deps: {
      optimizer: {
        web: {
          enabled: true,
          include: [],
        },
      },
    },
    css: false,
    isolate: true, // only safe with the poolOptions above
    reporters: ['default'],
  },
  worker: {
    format: 'es',
  },
});
