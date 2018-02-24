const path = require('path');

module.exports = function (config) {
  config.set({
    frameworks: ["jasmine", "karma-typescript"],
    files: [
      "src/**/*.ts"
    ],
    preprocessors: {
      "**/*.ts": "karma-typescript"
    },
    reporters: ["progress", "karma-typescript"],
    browsers: ["Chrome"],
    karmaTypescriptConfig: {
      compilerOptions: {
        baseUrl: ".",
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        module: "commonjs",
        moduleResolution: "node",
        noEmitOnError: true,
        sourceMap: true,
        target: "es5",
        lib: ["dom", "es5", "es6"]
      },
      tsconfig: path.resolve(__dirname, 'tsconfig.json')
    }
  });
};
