import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
export default defineConfig({
 plugins:[react(),tailwindcss()],
 resolve:{alias:{'@':path.resolve('.')}},
 server:{host:'127.0.0.1',port:3000,strictPort:true,proxy:{'/api':'http://127.0.0.1:3001'}},
});
