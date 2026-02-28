const { defineConfig } = require('vitest/config');
module.exports = defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['test/**/*.spec.js', 'test/**/*.unit.spec.js', 'test/**/*.integration.spec.js'],
    },
});