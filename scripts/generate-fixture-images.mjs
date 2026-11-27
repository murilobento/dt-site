// Gera imagens placeholder em public/fixtures/ (tons neutros + rótulo). Uso: node scripts/generate-fixture-images.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const out = 'public/fixtures';
mkdirSync(out, { recursive: true });

const obras = ['obra-em-sao-paulo', 'pinhalzinho-sc', 'regente-feijo-sp', 'presidente-prudente-sp',
  'rodovia-exemplo-sp', 'ponte-exemplo-sc', 'edificio-exemplo-sp', 'obra-minima-exemplo'];
const jobs = [
  ...obras.map((n, i) => [`obra-${n}.webp`, 1600, 1000, 150 + i * 8, `Obra: ${n}`]),
  ...[1, 2, 3, 4].map((n) => [`pinhalzinho-galeria-${n}.webp`, 1600, 1000, 120 + n * 12, `Pinhalzinho galeria ${n}`]),
  ['pinhalzinho-antes.webp', 1600, 1000, 110, 'Pinhalzinho antes'],
  ['pinhalzinho-depois.webp', 1600, 1000, 190, 'Pinhalzinho depois'],
  ...['obras-civis', 'conservacao', 'restauracao', 'construcao-rodoviaria'].map((n, i) => [`servico-${n}.webp`, 1200, 800, 140 + i * 15, `Serviço: ${n}`]),
];

for (const [file, w, h, g, label] of jobs) {
  const fs = Math.round(w / 22);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
<rect width="100%" height="100%" fill="rgb(${g},${g},${g})"/>
<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${fs}" fill="#333">${label} [exemplo]</text></svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 60 }).toFile(`${out}/${file}`);
}
console.log(`${jobs.length} imagens geradas`);
