import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../');
const artifactsFigures = path.resolve(root, '../artifacts/figures');
const publicFigures = path.resolve(root, 'public/figures');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) {
      copyDir(s, d);
    } else if (e.name.endsWith('.png')) {
      fs.copyFileSync(s, d);
      console.log(`Copied ${e.name} to ${path.relative(root, d)}`);
    }
  }
}

function copyAssets() {
  if (!fs.existsSync(artifactsFigures)) {
    console.warn(`Artifacts figures directory not found: ${artifactsFigures}`);
    return;
  }

  copyDir(artifactsFigures, publicFigures);
}

copyAssets();
