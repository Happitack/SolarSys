// vite.config.ts
import { defineConfig } from 'vite';

// Export a function that receives the command ('serve' or 'build')
export default defineConfig(({ command }) => ({
  // Set base conditionally
  base: command === 'build'
    ? '/SolarSys/' // Base path for GitHub Pages build
    : '/',          // Use root base for local development server
  // Other config...
}));