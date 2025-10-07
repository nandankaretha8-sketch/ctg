import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Make environment variables available to the client
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    // Environment variables that should be exposed to the client
    envPrefix: 'VITE_',
    build: {
      // Optimize build for production
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      rollupOptions: {
        output: {
          // Optimized chunk splitting to reduce dependencies and improve reliability
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            'query-vendor': ['@tanstack/react-query'],
            'ui-vendor': [
              '@radix-ui/react-dialog', 
              '@radix-ui/react-dropdown-menu', 
              '@radix-ui/react-toast', 
              '@radix-ui/react-tooltip',
              '@radix-ui/react-select',
              '@radix-ui/react-accordion',
              '@radix-ui/react-alert-dialog'
            ],
            'icons-vendor': ['lucide-react'],
            'utils-vendor': ['clsx', 'tailwind-merge', 'class-variance-authority'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          },
          // Ensure consistent chunk naming
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
            return `assets/[name]-[hash].js`;
          },
          // Optimize asset naming
          assetFileNames: 'assets/[name]-[hash].[ext]',
          entryFileNames: 'assets/[name]-[hash].js',
        },
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      // Pre-bundle dependencies for faster dev server and better reliability
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'lucide-react',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-toast',
        '@radix-ui/react-tooltip',
        '@radix-ui/react-select',
        'clsx',
        'tailwind-merge',
        'class-variance-authority',
      ],
      // Force pre-bundling of these dependencies
      force: true,
    },
    // Add build optimizations
    esbuild: {
      target: 'esnext',
      format: 'esm',
    },
  };
});