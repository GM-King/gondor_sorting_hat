// Optional visual review: run `node tests/gallery.mjs`, then open tests/gallery.html.
import { writeFile } from 'node:fs/promises';
import { COMBINATIONS, sortName } from '../public/sorting.js';
import { characterSvg } from '../public/character.js';

const cards = COMBINATIONS.map(({ race, characterClass }, i) => {
  const svg = characterSvg({ kind: 'character', race, characterClass, artworkSeed: i * 98911 + 42 }, 'Chickenzuggy', 'Harv');
  return `<article>${svg}<strong>${race} ${characterClass}</strong></article>`;
});
cards.push(`<article>${characterSvg(sortName('Pine', 'Jones'), 'Pine', 'Jones')}<strong>Leather Ball</strong></article>`);
const html = `<!doctype html><meta charset="utf-8"><title>Gondor character gallery</title><style>body{margin:18px;background:#17212b;color:#efc778;font:15px Georgia,serif}h1{margin:0 0 18px}.grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:10px}article{background:#28333b;border:1px solid #a88b53;text-align:center;padding:5px}svg{width:100%;height:150px}strong{display:block;min-height:32px}</style><h1>Character gallery — ${cards.length} results</h1><div class="grid">${cards.join('')}</div>`;
await writeFile(new URL('./gallery.html', import.meta.url), html);
