// @ts-check
import { defineConfig } from 'tsup'

export default defineConfig([
    {
        name: 'Luwio App',
        dts: true, // Generate .d.ts files
        minify: false, // Minify output
        minifyWhitespace: false,
        minifyIdentifiers: false,
        minifySyntax: false,
        keepNames: true,
        splitting: false,
        clean: true,
        sourcemap: true, // Generate sourcemaps
        treeshake: true, // Remove unused code
        outDir: "build", // Output directory
        entry: [
            'src/index.ts'
        ], // Entry point(s)
        format: ['cjs','esm'], // Output format(s)
        target: ['chrome91', 'firefox90', 'edge91', 'safari15', 'ios15', 'opera77'],
        external: ['react', 'react-dom', 'swiper', 'styled-components'],
        injectStyle: false,
    },
])