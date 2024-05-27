const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = {
  entry: {
    index: "./src/app/index.tsx",
    background: "./src/extension/background.ts",
    "insert-nav-tab": "./src/extension/content-scripts/insert-nav-tab.ts",
    "insert-nav-content-root": "./src/extension/content-scripts/insert-nav-content-root.ts",
    "insert-nav-content": "./src/extension/content-scripts/insert-nav-content.tsx"
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              compilerOptions: { noEmit: false }
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        exclude: /node_modules/,
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new Dotenv(),
    new CopyPlugin({
      patterns: [
        { from: "manifest.json", to: "../manifest.json" },
        { from: "src/extension/content-scripts/*.css", to: "../js/[name].css" }
      ]
    }),
    ...getHtmlPlugins(["index"])
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  output: {
    path: path.join(__dirname, "dist/js"),
    filename: "[name].js",
    clean: true
  }
};

function getHtmlPlugins(chunks) {
  return chunks.map(
    (chunk) =>
      new HTMLPlugin({
        title: "React extension",
        filename: `${chunk}.html`,
        chunks: [chunk]
      })
  );
}
