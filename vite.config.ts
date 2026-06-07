import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import buildInfo from './buildnumber.json';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/go-trader/',
  define: {
    __BUILD_NUMBER__: JSON.stringify(buildInfo.build),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
})
