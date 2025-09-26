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
          pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : [],
          passes: 3, // Increased passes for better compression
          unsafe: true, // Enable unsafe optimizations
          unsafe_comps: true,
          unsafe_math: true,
        },
        mangle: {
          safari10: true, // Fix Safari 10 issues
          properties: {
            regex: /^_/ // Mangle properties starting with _
          }
        },
        format: {
          comments: false, // Remove all comments
        }
      },
      rollupOptions: {
        output: {
          // CDN-optimized chunk splitting
          manualChunks: (id) => {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // Router
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            // Query library
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            // UI components
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            // Icons
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            // Utils
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
              return 'utils-vendor';
            }
            // Charts
            if (id.includes('recharts')) {
              return 'charts-vendor';
            }
            // Forms
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'forms-vendor';
            }
          },
          // CDN-optimized file naming with longer hash for cache busting
          chunkFileNames: 'assets/[name]-[hash:16].js',
          entryFileNames: 'assets/[name]-[hash:16].js',
          assetFileNames: (assetInfo) => {
            if (!assetInfo.name) {
              return 'assets/[name]-[hash:8].[ext]';
            }
            
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            
            if (/\.(css)$/.test(assetInfo.name)) {
              return `assets/css/[name]-[hash:8].${ext}`;
            }
            if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(assetInfo.name)) {
              return `assets/images/[name]-[hash:8].${ext}`;
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
              return `assets/fonts/[name]-[hash:8].${ext}`;
            }
            return `assets/[name]-[hash:8].${ext}`;
          },
        },
      },
      // CDN optimization settings
      chunkSizeWarningLimit: 1000,
      sourcemap: false, // Disable source maps for production
      cssCodeSplit: true,
      reportCompressedSize: false,
      // Enable tree shaking
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      },
      // Optimize for CDN
      assetsInlineLimit: 4096, // Inline small assets
    },
    optimizeDeps: {
      // Pre-bundle dependencies for faster dev server
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'lucide-react',
      ],
    },
  };
});
