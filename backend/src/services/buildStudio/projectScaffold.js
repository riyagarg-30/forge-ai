/**
 * Deterministic scaffold for every generated Build Studio preview. The model
 * is only ever responsible for App.jsx and index.css — everything else here
 * is fixed, so the project is always a complete, runnable Vite React app
 * regardless of what the model returns.
 *
 * File paths and names (App.jsx, index.jsx, index.html, package.json,
 * vite.config.js at the project root — no src/ directory) deliberately
 * mirror Sandpack's own built-in `vite-react` template files 1:1. Sandpack
 * merges custom `files` on top of the template's default file map by exact
 * path, so matching those paths ensures our files fully replace the
 * template's placeholders instead of leaving them alongside as unused,
 * confusing dead files — and keeps the template's fixed `main` pointer
 * (always "/App.jsx", not overridable via customSetup) pointing at the real
 * generated component. devDependency versions match Sandpack's own template
 * exactly, since those are the versions CodeSandbox's nodebox runtime is
 * verified against.
 */
export function buildScaffoldFiles(dependencies) {
  const packageJson = {
    name: 'build-studio-preview',
    private: true,
    version: '0.0.0',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    dependencies,
    devDependencies: {
      '@vitejs/plugin-react': '3.1.0',
      vite: '4.1.4',
      'esbuild-wasm': '0.17.12',
    },
  }

  return {
    'package.json': JSON.stringify(packageJson, null, 2),
    'vite.config.js': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`,
    'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Build Studio Preview</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.jsx"></script>
  </body>
</html>
`,
    'index.jsx': `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
`,
    'index.css': `:root {
  color-scheme: dark;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #0b0b14;
  color: #f1f5f9;
}
`,
  }
}
