module.exports = {
  preset: "jest-expo",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|react-clone-referenced-element|@expo(nent)?/.*|expo(nent)?|lottie-react-native)"
  ],
  moduleNameMapper: {
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@navigation/(.*)$": "<rootDir>/src/navigation/$1",
    "^@screens/(.*)$": "<rootDir>/src/screens/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@context/(.*)$": "<rootDir>/src/context/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@constants/(.*)$": "<rootDir>/src/constants/$1",
    "^@assets/(.*)$": "<rootDir>/src/assets/$1"
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/android/",
    "/ios/",
    "<rootDir>/__tests__/setup.ts",
    "<rootDir>/__tests__/hooks/useCamera.test.ts"
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/context/AuthContext.tsx",
    "src/services/api/cart.api.ts"
  ],
  coverageReporters: ["text", "lcov"],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 65,
      functions: 70,
      lines: 70
    },
    "./src/context/AuthContext.tsx": {
      lines: 80
    },
    "./src/services/api/cart.api.ts": {
      lines: 80
    }
  }
};
