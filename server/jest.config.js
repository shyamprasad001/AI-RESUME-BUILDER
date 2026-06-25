export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/app.js', // usually exclude app.js or server.js entry points if they just start the server, though we might test it
  ],
  transform: {}, // We are using ES Modules via experimental-vm-modules, so no transform is needed if node version >= 16
};
