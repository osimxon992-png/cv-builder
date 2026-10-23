// Bundles scripts/smoke-pdf.jsx for Node and runs it (renders every template into out/).
import { build } from 'esbuild';

await build({
  entryPoints: ['scripts/smoke-pdf.jsx'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  jsx: 'automatic',
  outfile: 'out/smoke.mjs',
  define: { 'import.meta.env.BASE_URL': JSON.stringify('./public/') },
  logLevel: 'warning',
});
await import(new URL('../out/smoke.mjs', import.meta.url));
