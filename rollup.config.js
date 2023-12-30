import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "app/sbg.js",
  output: {
    file: "public/app.js",
    format: "iife",
    generatedCode: "es2015",
    sourcemap: true
  },
  plugins: [
    commonjs(),
    nodeResolve()
  ]
};
