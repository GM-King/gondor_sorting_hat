import test from 'node:test';
import assert from 'node:assert/strict';
import { ALLOWED_BY_CLASS, CLASSES, COMBINATIONS, RACES, hashText, normalizeName, sortName } from '../public/sorting.js';
import { characterSvg, describeResult } from '../public/character.js';
import { characterStats } from '../public/stats.js';

const expected = {
  Druid: ['Night Elf', 'Tauren', 'Skyborne'],
  Hunter: ['Human', 'Dwarf', 'Night Elf', 'Orc', 'Tauren', 'Troll', 'Skyborne'],
  Mage: ['Human', 'Gnome', 'Orc', 'Undead', 'Troll', 'Skyborne'],
  Paladin: ['Human', 'Dwarf', 'Undead'],
  Priest: ['Human', 'Dwarf', 'Night Elf', 'Gnome', 'Undead', 'Troll'],
  Rogue: ['Human', 'Dwarf', 'Night Elf', 'Gnome', 'Orc', 'Undead', 'Troll', 'Skyborne'],
  Shaman: ['Dwarf', 'Orc', 'Tauren', 'Troll', 'Skyborne'],
  Warlock: ['Human', 'Gnome', 'Orc', 'Undead', 'Troll'],
  Warrior: ['Human', 'Dwarf', 'Night Elf', 'Gnome', 'Orc', 'Undead', 'Tauren', 'Troll', 'Skyborne']
};

test('only the 52 marked cells appear, in table order', () => {
  assert.deepEqual(ALLOWED_BY_CLASS, expected);
  assert.equal(COMBINATIONS.length, 52);
  assert.deepEqual(COMBINATIONS, CLASSES.flatMap(characterClass =>
    RACES.filter(race => expected[characterClass].includes(race)).map(race => ({ race, characterClass }))
  ));
});

test('names normalize consistently and field boundaries stay distinct', () => {
  assert.equal(normalizeName('  E\u0301MILIE   Anne  '), 'émilie anne');
  assert.deepEqual(sortName('  Émilie ', ' O’Neill '), sortName('e\u0301milie', 'o’neill'));
  assert.notEqual(hashText('sort:2:ab|1:c'), hashText('sort:1:a|2:bc'));
  assert.notEqual(sortName('ab', 'c').artworkSeed, sortName('a', 'bc').artworkSeed);
  assert.deepEqual(sortName('Jean-Luc', "O'Brien"), sortName('Jean-Luc', "O'Brien"));
});

test('pine and pineapple are whole-field Easter eggs in either field', () => {
  for (const word of ['pine', 'pineapple', ' PINE ', 'PineApple']) {
    assert.equal(sortName(word, 'Jones').title, 'Leather Ball');
    assert.equal(sortName('Jones', word).title, 'Leather Ball');
  }
  for (const word of ['Pinehurst', 'Alpine', 'Mary Pine', 'pine apple']) {
    assert.equal(sortName(word, 'Jones').kind, 'character');
  }
});

test('every allowed result renders a valid SVG shell with appropriate race and class detail', () => {
  for (const combination of COMBINATIONS) {
    const result = { kind: 'character', ...combination, artworkSeed: 123456 };
    const svg = characterSvg(result);
    assert.match(svg, /^<svg /);
    assert.match(svg, /<\/svg>$/);
    assert.match(svg, new RegExp(`${combination.race} ${combination.characterClass}`));
    assert.ok(describeResult(result).length > 20);
    if (combination.race === 'Skyborne') assert.match(svg, /#5eaeec/);
  }
  assert.match(characterSvg(sortName('Pine', 'Jones')), /stitched leather ball/);
});

test('result art includes the entered name and guild without injecting markup', () => {
  const result = sortName('Chickenzuggy', 'Harv');
  const svg = characterSvg(result, 'Chickenzuggy', 'Harv');
  assert.match(svg, /Chickenzuggy Harv/);
  assert.match(svg, /&lt;Gondor Calls For Raid&gt;/);
  const unsafe = characterSvg(result, '<img src=x>', 'O&N');
  assert.match(unsafe, /&lt;img src=x&gt;/);
  assert.match(unsafe, /O&amp;N/);
  assert.doesNotMatch(unsafe, /<img src=x>/);
  const egg = characterSvg(sortName('Pine', 'Jones'), 'Pine', 'Jones');
  assert.match(egg, /Pine Jones/);
  assert.match(egg, /&lt;Gondor Calls For Raid&gt;/);
  assert.match(svg, /<rect x="0" y="0" width="320" height="80"/);
});

test('all 50 hairstyles are reachable and stable for each name', () => {
  const styles = new Set();
  for (let i = 0; i < 5000 && styles.size < 50; i++) {
    const result = sortName(`Hero${i}`, 'Tester');
    const svg = characterSvg(result);
    const style = Number(svg.match(/data-hairstyle="(\d+)"/)?.[1]);
    assert.ok(Number.isInteger(style) && style >= 0 && style < 50);
    styles.add(style);
  }
  assert.equal(styles.size, 50);

  const normalized = sortName('  Émilie ', ' O’Neill ');
  const repeated = sortName('e\u0301milie', 'o’neill');
  const styleOf = result => characterSvg(result).match(/data-hairstyle="(\d+)"/)[1];
  assert.equal(styleOf(normalized), styleOf(repeated));
  assert.equal(styleOf(normalized), styleOf({ ...normalized, race: 'Skyborne', characterClass: 'Mage' }));
});

test('profile measurements are stable and match the drawn body type', () => {
  const base = { kind: 'character', race: 'Human', characterClass: 'Warrior' };
  const feminine = { ...base, artworkSeed: 2 };
  const masculine = { ...base, artworkSeed: 3 };
  const femaleStats = characterStats(feminine);
  const maleStats = characterStats(masculine);
  assert.deepEqual(characterStats(feminine), femaleStats);
  assert.equal(femaleStats.bodyType, 2);
  assert.equal(femaleStats.anatomyLabel, 'Vagina Depth');
  assert.equal(maleStats.bodyType, 1);
  assert.equal(maleStats.anatomyLabel, 'Penis Length');
  for (const stats of [femaleStats, maleStats]) {
    assert.match(stats.height, /^\d+\.\d{2} m$/);
    assert.match(stats.weight, /^\d+ kg$/);
    assert.match(stats.girth, /^\d+ cm$/);
    assert.match(stats.anatomy, /^\d+ cm$/);
    assert.match(stats.shoeSize, /^\d+ US$/);
  }
  assert.match(characterSvg(feminine), /cx="136" cy="237"/);
  assert.match(characterSvg(feminine), /M160 282 C155 286 156 296 160 303 C164 296 165 286 160 282Z M160 285 Q159 293 160 300/);
  assert.doesNotMatch(characterSvg(masculine), /cx="136" cy="237"/);
  assert.match(characterSvg(masculine), /M162 300 L162 306/);
  assert.doesNotMatch(characterSvg(feminine), /cx="91" cy="238"/);
  assert.equal(characterStats({ kind: 'easter-egg', artworkSeed: 4 }), null);
});

test('anatomy measurements favor 1–3 cm and only rarely reach 10 cm', () => {
  const counts = Array(11).fill(0);
  for (let artworkSeed = 0; artworkSeed < 10000; artworkSeed++) {
    const stats = characterStats({ kind: 'character', race: 'Human', characterClass: 'Warrior', artworkSeed });
    counts[Number.parseInt(stats.anatomy, 10)]++;
  }
  assert.equal(counts[0], 0);
  assert.ok(counts.slice(1, 4).reduce((sum, count) => sum + count, 0) > 8500);
  assert.ok(counts.slice(7).reduce((sum, count) => sum + count, 0) < 300);
  assert.ok(counts[10] > 0);
});

test('sorting can reach every allowed combination without selecting a blank cell', () => {
  const reached = new Set();
  const allowed = new Set(COMBINATIONS.map(x => `${x.race}|${x.characterClass}`));
  for (let i = 0; i < 4000; i++) {
    const result = sortName(`Hero${i}`, 'Tester');
    const key = `${result.race}|${result.characterClass}`;
    assert.ok(allowed.has(key));
    reached.add(key);
  }
  assert.deepEqual(reached, allowed);
});

test('empty names are rejected before sorting', () => {
  assert.throws(() => sortName('  ', 'Took'), RangeError);
  assert.throws(() => sortName('Peregrin', '  '), RangeError);
});
