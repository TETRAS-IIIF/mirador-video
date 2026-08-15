/**
 * Peel through nested `default` wrappers left by bundler CJS/ESM interop.
 * Some bundler/CJS-interop combinations (notably esbuild's dependency
 * pre-bundling in Vite dev mode) can leave a namespace import double-wrapped
 * as `{ default: { default: Component } }` instead of unwrapping it in one
 * step, depending on how the underlying CommonJS module signals __esModule.
 * @param {*} mod the value produced by `import * as mod from '...'`
 * @returns {*} the innermost non-module-shaped value
 */
export default function unwrapDefault(mod) {
  let value = mod;
  while (value && typeof value !== 'function' && typeof value !== 'string' && 'default' in value) {
    value = value.default;
  }
  return value;
}
