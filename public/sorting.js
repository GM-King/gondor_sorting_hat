// The table is intentionally written in class order, then race order.
export const RACES = Object.freeze([
  'Human', 'Dwarf', 'Night Elf', 'Gnome', 'Orc', 'Undead', 'Tauren', 'Troll', 'Skyborne'
]);

export const CLASSES = Object.freeze([
  'Druid', 'Hunter', 'Mage', 'Paladin', 'Priest', 'Rogue', 'Shaman', 'Warlock', 'Warrior'
]);

export const ALLOWED_BY_CLASS = Object.freeze({
  Druid: ['Night Elf', 'Tauren', 'Skyborne'],
  Hunter: ['Human', 'Dwarf', 'Night Elf', 'Orc', 'Tauren', 'Troll', 'Skyborne'],
  Mage: ['Human', 'Gnome', 'Orc', 'Undead', 'Troll', 'Skyborne'],
  Paladin: ['Human', 'Dwarf', 'Undead'],
  Priest: ['Human', 'Dwarf', 'Night Elf', 'Gnome', 'Undead', 'Troll'],
  Rogue: ['Human', 'Dwarf', 'Night Elf', 'Gnome', 'Orc', 'Undead', 'Troll', 'Skyborne'],
  Shaman: ['Dwarf', 'Orc', 'Tauren', 'Troll', 'Skyborne'],
  Warlock: ['Human', 'Gnome', 'Orc', 'Undead', 'Troll'],
  Warrior: [...RACES]
});

export const COMBINATIONS = Object.freeze(CLASSES.flatMap(characterClass =>
  RACES.filter(race => ALLOWED_BY_CLASS[characterClass].includes(race))
    .map(race => Object.freeze({ race, characterClass }))
));

export function normalizeName(value) {
  return value.normalize('NFC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('en');
}

// FNV-1a over UTF-8 bytes. A fixed algorithm keeps results stable across browsers.
export function hashText(value) {
  let hash = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(value)) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

export function sortName(firstName, lastName) {
  const first = normalizeName(firstName);
  const last = normalizeName(lastName);
  if (!first || !last) throw new RangeError('Enter both a first and last name.');

  // Length prefixes prevent ("ab", "c") and ("a", "bc") sharing a key.
  const key = `${first.length}:${first}|${last.length}:${last}`;
  const artworkSeed = hashText(`art:${key}`);
  if (['pine', 'pineapple'].includes(first) || ['pine', 'pineapple'].includes(last)) {
    return { kind: 'easter-egg', title: 'Leather Ball', artworkSeed };
  }

  const choice = COMBINATIONS[hashText(`sort:${key}`) % COMBINATIONS.length];
  return { kind: 'character', ...choice, title: `${choice.race} ${choice.characterClass}`, artworkSeed };
}
