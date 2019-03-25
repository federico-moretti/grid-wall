// rollup.config.js
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'dist/index.js',
  output: {
    file: 'umd/index.js',
    format: 'umd',
    name: 'ReflowGrid',
  },
  plugins: [commonjs()],
};
