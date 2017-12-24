const resolve = require('rollup-plugin-node-resolve');

export default {
  input: 'build/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs'
  },
  sourcemap: true,
  plugins: [
    resolve({ jsnext: true, module: true }),
  ],
  external: [
    'amqplib'
  ]
};
