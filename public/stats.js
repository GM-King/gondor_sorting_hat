import { hashText } from './sorting.js';

const raceSizes = {
  Human: [172, 77],
  Dwarf: [133, 78],
  'Night Elf': [186, 75],
  Gnome: [111, 39],
  Orc: [192, 113],
  Undead: [174, 62],
  Tauren: [215, 158],
  Troll: [195, 91],
  Skyborne: [181, 83]
};

// Each measurement has its own stable draw, so a name always gets the same profile.
export function characterStats(result) {
  if (result.kind !== 'character') return null;
  const [baseHeight, baseWeight] = raceSizes[result.race];
  if (!baseHeight) throw new RangeError(`Unknown race: ${result.race}`);
  const pick = (label, min, max) => min + hashText(`${result.artworkSeed}:${label}`) % (max - min + 1);
  const bodyType = (result.artworkSeed & 1) === 0 ? 2 : 1;
  const sizeBand = pick('anatomy-band', 0, 999);
  const anatomySize = sizeBand < 900
    ? pick('anatomy-common', 1, 3)
    : sizeBand < 980
      ? pick('anatomy-uncommon', 4, 6)
      : pick('anatomy-rare', 7, 10);
  return {
    bodyType,
    height: `${((baseHeight + pick('height', -17, 17)) / 100).toFixed(2)} m`,
    weight: `${baseWeight + pick('weight', -14, 20)} kg`,
    girth: `${Math.round(baseWeight * 0.45 + 54 + pick('girth', -10, 16))} cm`,
    anatomyLabel: bodyType === 2 ? 'Vagina Depth' : 'Penis Length',
    anatomy: `${anatomySize} cm`,
    shoeSize: `${pick('shoes', 5, 16)} US`
  };
}
