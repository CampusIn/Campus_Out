export default {
    testEnvironment: 'node',

    transform: {
        '^.+\\.js$': 'babel-jest'
    },

    setupFilesAfterEnv: [
        './setup.js'
    ]
}