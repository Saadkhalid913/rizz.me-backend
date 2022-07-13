module.exports = {
    preset: "ts-jest",
    setupFiles: ["./tests/config.ts"],
    globalTeardown: "./tests/teardown.ts"
}