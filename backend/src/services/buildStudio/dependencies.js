/**
 * Packages the generated App.jsx is allowed to import, pinned to versions
 * known to work inside Sandpack's vite-react sandbox. Any other bare import
 * the model produces still gets added to package.json (at "latest") so the
 * project never ships with an unresolved dependency, but only these are
 * mentioned to the model as available.
 */
export const ALLOWED_DEPENDENCIES = {
  react: '^18.3.1',
  'react-dom': '^18.3.1',
  'lucide-react': '^0.462.0',
  'framer-motion': '^11.5.4',
  'react-router-dom': '^6.26.2',
  clsx: '^2.1.1',
}

export const BASE_DEPENDENCIES = {
  react: ALLOWED_DEPENDENCIES.react,
  'react-dom': ALLOWED_DEPENDENCIES['react-dom'],
}

export function resolveDependencyVersion(packageName) {
  return ALLOWED_DEPENDENCIES[packageName] || 'latest'
}

/** Pulls bare (non-relative) import specifiers out of JS/JSX source. */
export function extractImportedPackages(source) {
  const specifiers = new Set()
  const importRegex = /import\s+(?:[^'";]+\s+from\s+)?['"]([^'"]+)['"]/g
  let match

  while ((match = importRegex.exec(source))) {
    specifiers.add(match[1])
  }

  const packages = new Set()
  for (const spec of specifiers) {
    if (spec.startsWith('.') || spec.startsWith('/')) continue
    const segments = spec.split('/')
    const packageName = spec.startsWith('@') ? segments.slice(0, 2).join('/') : segments[0]
    packages.add(packageName)
  }

  return packages
}
