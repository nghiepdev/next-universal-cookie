const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');

module.exports = {
  input: 'index.js',
  output: {
    file: 'bundle.js',
    format: 'umd',
    name: 'next-universal-cookie',
    exports: 'named',
    globals: {
      react: 'React',
      cookie: 'cookie',
      'react-cookie': 'react-cookie',
      'universal-cookie': 'universal-cookie',
    },
  },
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**',
    }),
    commonjs(),
  ],
  external: ['react', 'cookie', 'react-cookie', 'universal-cookie'],
};
