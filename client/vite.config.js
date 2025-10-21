// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(),    tailwindcss(),
// ],
// })



  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'
  import tailwindcss from '@tailwindcss/vite'

  // https://vite.dev/config/
  export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: 'https://suyambufoods.com/api',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')  // Strips /api prefix, so /api/admin/login -> /admin/login on backend
        },
        '/productImages': {
          target: 'https://suyambufoods.com/api',
          changeOrigin: true,
          secure: false
        }
      }
    }
  })