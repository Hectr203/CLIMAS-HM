import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno de forma segura
  const env = loadEnv(mode, process.cwd(), '');

  return {
    build: {
      // Cambiado de "build" a "dist"
      outDir: "dist",
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                return 'vendor-react';
              }
              if (id.includes('redux') || id.includes('@reduxjs')) {
                return 'vendor-redux';
              }
              if (id.includes('react-router')) {
                return 'vendor-router';
              }
              if (id.includes('d3') || id.includes('recharts')) {
                return 'vendor-charts';
              }
              if (id.includes('jspdf') || id.includes('html2canvas')) {
                return 'vendor-pdf';
              }
              if (id.includes('framer-motion')) {
                return 'vendor-motion';
              }
              if (id.includes('axios')) {
                return 'vendor-http';
              }
              if (id.includes('date-fns')) {
                return 'vendor-date';
              }
              if (id.includes('react-hook-form')) {
                return 'vendor-forms';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('dompurify') || id.includes('purify')) {
                return 'vendor-purify';
              }
              if (id.includes('@radix-ui') || id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge')) {
                return 'vendor-ui';
              }
              return 'vendor';
            }
          }
        }
      }
    },
    plugins: [tsconfigPaths(), react(), tagger()],
    server: {
      port: 3000,
      host: "0.0.0.0",
      strictPort: true,
      allowedHosts: ['.amazonaws.com', '.builtwithrocket.new'],
      proxy: {
        '/api': {
          target: env.VITE_API_URL?.replace('/api', '') || 'http://localhost:7071',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    }
  };
});
