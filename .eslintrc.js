/**
 * ESLint Configuration
 * Enforces module boundaries
 */

module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Enforce module boundaries
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['**/modules/*/domain/**'],
          message: 'Cannot import from module domain directly. Use module API instead.'
        },
        {
          group: ['**/modules/*/application/**'],
          message: 'Cannot import from module application directly. Use module API instead.'
        },
        {
          group: ['**/modules/*/infrastructure/**'],
          message: 'Cannot import from module infrastructure directly. Use module API instead.'
        }
      ]
    }]
  }
};
