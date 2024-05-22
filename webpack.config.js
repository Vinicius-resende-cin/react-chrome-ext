const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = {
  entry: {
    index: "./src/app/index.tsx",
    background: "./src/extension/background.ts",
    content: "./src/extension/content.tsx"
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
      patterns: [{ from: "manifest.json", to: "../manifest.json" }]
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
