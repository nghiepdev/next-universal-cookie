import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';

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
      babelHelpers: 'runtime',
      exclude: 'node_modules/**',
    }),
    commonjs(),
  ],
  external: [
    'react',
    'cookie',
    'react-cookie',
    'universal-cookie',
    /@babel\/runtime/,
  ],
};
