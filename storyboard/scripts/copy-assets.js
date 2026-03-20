import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../');
const artifactsFigures = path.resolve(root, '../artifacts/figures');
const artifactsReport = path.resolve(root, '../artifacts/report');
const publicFigures = path.resolve(root, 'public/figures');
const publicRoot = path.resolve(root, 'public');

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

function copyPdfs() {
  if (!fs.existsSync(artifactsReport)) {
    console.warn(`Artifacts report directory not found: ${artifactsReport}`);
    return;
  }
  const pdfs = [
    { src: 'BAYESIAN_NEURAL_SHIFTS.pdf', dest: 'report.pdf' },
    { src: 'BAYESIAN_NEURAL_SHIFTS_CONTRACT.pdf', dest: 'contract.pdf' }
  ];
  for (const { src, dest } of pdfs) {
    const srcPath = path.join(artifactsReport, src);
    if (fs.existsSync(srcPath)) {
      const destPath = path.join(publicRoot, dest);
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${src} to ${path.relative(root, destPath)}`);
    }
  }
}

function copyAssets() {
  if (!fs.existsSync(artifactsFigures)) {
    console.warn(`Artifacts figures directory not found: ${artifactsFigures}`);
    return;
  }

  copyDir(artifactsFigures, publicFigures);
  copyPdfs();
}

copyAssets();
