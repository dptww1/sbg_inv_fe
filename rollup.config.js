/* global process */
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";

export default {
  input: "app/sbg.js",
  output: [
    {
      file: "public/app.js",
      format: "iife",
      generatedCode: "es2015",
      sourcemap: true
    },
    {
      file: "public/app.min.js",
      format: "iife",
      generatedCode: "es2015",
      sourcemap: true,
      plugins: [
        terser()
      ]
    }
  ],
  plugins: [
    commonjs(),
    nodeResolve(),
    replace({
      include: "app/request.js",
      preventAssignment: true,
      BACKEND: process.env.BACKEND || 0
    })
  ]
};
