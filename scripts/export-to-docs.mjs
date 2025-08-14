import { rmSync, mkdirSync, existsSync, cpSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const outDir = join(root, 'docs');

// With output: 'export', Next writes static files to ./out after `next build`
const from = join(root, 'out');
if (!existsSync(from)) {
	throw new Error('Expected static export output in ./out. Ensure `next build` ran with output: "export".');
}

// Clean docs/ and copy over
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(from, outDir, { recursive: true });

// Ensure .nojekyll exists so _next assets are served
mkdirSync(outDir, { recursive: true });
try {
	cpSync(join(root, 'docs', '.nojekyll'), join(outDir, '.nojekyll'), { force: true });
} catch {}

console.log('Exported static site to docs/');


