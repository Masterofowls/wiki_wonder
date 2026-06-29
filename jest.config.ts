import type { Config } from "jest";

const config: Config = {
  rootDir: ".",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: false,
        tsconfig: {
          module: "CommonJS",
          moduleResolution: "Node",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          verbatimModuleSyntax: false,
          strict: true,
          noUncheckedIndexedAccess: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    "^@wikiwonder/ui$": "<rootDir>/packages/ui/src/index.ts",
    "^@wikiwonder/utils$": "<rootDir>/packages/utils/src/index.ts",
    "^@wikiwonder/config$": "<rootDir>/packages/config/index.ts",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: [
    "<rootDir>/tests/unit/**/*.test.ts",
    "<rootDir>/tests/integration/**/*.test.ts",
    "<rootDir>/packages/**/src/**/*.test.ts",
    "<rootDir>/tools/**/src/**/*.test.ts",
  ],
  modulePathIgnorePatterns: [
    "<rootDir>/node_modules/.bun",
    "<rootDir>/~",
    "<rootDir>/apps/web/.next",
    "<rootDir>/dist",
    "<rootDir>/build",
  ],
  haste: {
    forceNodeFilesystemAPI: true,
  },
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "packages/**/src/**/*.ts",
    "tools/**/src/**/*.ts",
    "!**/*.d.ts",
    "!**/index.ts",
    "!**/__mocks__/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  verbose: true,
  passWithNoTests: true,
};

export default config;
