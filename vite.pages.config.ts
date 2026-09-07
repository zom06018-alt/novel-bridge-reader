import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({
 root:fileURLToPath(new URL('./pages',import.meta.url)),
 base:'./',
 plugins:[react()],
 resolve:{alias:{'@':fileURLToPath(new URL('.',import.meta.url))}},
 css:{postcss:fileURLToPath(new URL('.',import.meta.url))},
 build:{outDir:fileURLToPath(new URL('./docs',import.meta.url)),emptyOutDir:true,sourcemap:false},
});
