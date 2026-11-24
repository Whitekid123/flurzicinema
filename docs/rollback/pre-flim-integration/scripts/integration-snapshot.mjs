import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
const destination = 'docs/rollback/pre-flim-integration';
await fs.mkdir('docs/rollback', { recursive: true });
await fs.mkdir(destination, { recursive: false });
const entries = await fs.readdir('.', { withFileTypes: true });
const folders = new Set(['app', 'components', 'data', 'lib', 'public', 'scripts', 'styles', 'tests', 'types']);
const manifest = [];
async function copy(source) {
  const stat = await fs.stat(source);
  if (stat.isDirectory()) {
    for (const name of await fs.readdir(source)) await copy(path.join(source, name));
    return;
  }
  const bytes = await fs.readFile(source);
  const target = path.join(destination, source);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, bytes);
  manifest.push({ path: source, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}
for (const entry of entries) {
  if (folders.has(entry.name) || (!entry.isDirectory() && !entry.name.startsWith('.env') && !entry.name.endsWith('.tsbuildinfo'))) await copy(entry.name);
}
await fs.writeFile(path.join(destination, 'SNAPSHOT.json'), JSON.stringify({ created: new Date().toISOString(), git: 'No .git repository exists in this checkout; file snapshot preserves the actual uncommitted source.', files: manifest }, null, 2));
console.log(`Preserved ${manifest.length} files in ${destination}`);
