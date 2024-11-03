module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 20000,
  maxWorkers: 1,
  transform: {
    '^.+\\.jsx?$': 'babel-jest', // Para JavaScript
    '^.+\\.tsx?$': 'ts-jest', // Para TypeScript
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
}
