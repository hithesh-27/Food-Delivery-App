import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Single-file HTML for embedding in Streamlit (st.components.v1.html).
// Streamlit static serving sends .js as text/plain, so a self-contained bundle is required.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: '../streamlit_embed',
    emptyOutDir: true,
    cssCodeSplit: false,
  },
})
