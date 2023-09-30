import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'

export default [
    {
        input: 'scripts/module.js',
        plugins: [
            commonjs(),
            resolve({ browser: true })
        ],
        output: {
            format: 'esm',
            file: 'dist/module.min.js',
            generatedCode: { constBindings: true },
            plugins: [
                terser({ keep_classnames: true, keep_fnames: true })
            ],
            sourcemap: true
        }
    }
]