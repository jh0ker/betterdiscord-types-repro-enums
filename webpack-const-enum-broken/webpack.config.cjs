const path = require("node:path");

module.exports = {
  mode: "production",
  entry: "./src/index.ts",
  target: "web",
  optimization: { minimize: false },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "EnumDemo.plugin.js",
    library: { type: "commonjs2" },
    iife: true,
  },
  resolve: { extensions: [".ts"] },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "ts-loader",
          // tsconfig has noEmit: true (so the separate `tsc` step in `npm run build`
          // is type-check-only). Override here so ts-loader can actually emit.
          options: { compilerOptions: { noEmit: false } },
        },
        exclude: /node_modules/,
      },
    ],
  },
};
