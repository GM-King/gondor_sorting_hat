import { hashText } from './sorting.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const palette = {
  Human: ['#edac83', '#aa5d50', '#9a563d'],
  Dwarf: ['#dca17b', '#965843', '#813f25'],
  'Night Elf': ['#a58bd1', '#5d5599', '#d1caef'],
  Gnome: ['#f3c49c', '#c47c70', '#efa96b'],
  Orc: ['#78a86b', '#426d49', '#3d5733'],
  Undead: ['#b1bca0', '#677d73', '#8fa38b'],
  Tauren: ['#a97853', '#654232', '#4b2d24'],
  Troll: ['#4da7a3', '#277b7c', '#50c1be'],
  Skyborne: ['#5eaeec', '#2669bc', '#a8dfff']
};

const blurbs = {
  Druid: 'Can speak to trees. The trees have asked for space.',
  Hunter: 'Tracks prey by making louder noises than the prey.',
  Mage: 'Knows three spells and mispronounces all of them.',
  Paladin: 'Extremely holy. Moderately good at parking.',
  Priest: 'Has a healing spell and a very judgmental stare.',
  Rogue: 'Stealth level: visible from another kingdom.',
  Shaman: 'Asks the elements for help. They leave him on read.',
  Warlock: 'Signed a dark pact without reading the terms.',
  Warrior: 'Solves ancient mysteries by hitting them.'
};

export function describeResult(result) {
  return result.kind === 'easter-egg'
    ? 'A legendary artefact of absolutely no known magical importance.'
    : blurbs[result.characterClass];
}

const line = '#201b25';
const shape = (content, props = '') => `<g stroke="${line}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" ${props}>${content}</g>`;

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

// Ten silhouettes and five distinct side treatments make fifty name-seeded styles.
const hairTops = [
  'M108 118 Q109 84 137 77 Q179 61 209 100 L209 119 Q178 108 158 112 Q128 105 108 118Z', // bowl
  'M108 115 L111 74 L138 76 L139 62 L181 63 L181 77 L208 77 L208 116 L186 107 L129 108Z', // flat top
  'M109 117 L98 90 L122 97 L119 64 L143 83 L156 49 L171 78 L197 60 L194 91 L218 87 L207 119Z', // spikes
  'M111 116 Q137 108 142 102 L146 58 L154 43 L163 71 L174 48 L181 99 Q197 104 207 115Z', // mohawk
  'M108 119 Q106 85 129 80 Q147 51 166 75 Q186 48 204 89 L211 119 Q191 101 177 115 Q155 98 140 114Z', // waves
  'M109 116 Q116 78 153 83 Q184 47 217 70 Q197 70 188 93 Q180 111 109 116Z', // swept back
  'M107 117 Q113 78 161 73 Q201 71 209 111 Q189 103 174 131 L155 111 L132 132 L127 109Z', // jagged fringe
  'M108 116 Q116 82 155 77 Q187 70 209 97 L209 119 Q173 112 162 124 L155 104 Q141 115 108 116Z', // side part
  'M107 118 Q98 79 129 72 Q165 53 196 75 Q221 91 211 124 L196 115 Q151 98 121 122Z', // bob cap
  'M106 119 Q100 93 117 80 Q126 61 144 72 Q160 52 177 72 Q200 62 210 91 L211 120 Q187 104 157 110 Q131 100 106 119Z' // curls
];

function nameHair(seed, accent, shade) {
  const style = hashText(`hair:${seed}`) % 50;
  const top = Math.floor(style / 5);
  const sides = style % 5;
  const sideDetails = [
    '<path d="M113 110 L103 126 M207 110 L217 125" fill="none"/>', // cropped
    `<path d="M111 108 Q96 133 105 166 L119 158 L120 111Z M207 108 Q225 131 214 166 L199 158 L198 111Z" fill="${shade}"/>`, // long side locks
    `<path d="M110 109 Q89 140 105 180 L113 178 Q101 138 122 112Z M208 109 Q229 140 213 180 L205 178 Q217 138 196 112Z" fill="${accent}"/><path d="M99 146 L112 150 M205 150 L218 146" fill="none" stroke-width="2"/>`, // braids
    `<path d="M207 99 Q239 91 236 119 Q250 143 225 157 L209 144 Q231 127 214 117Z" fill="${accent}"/><path d="M207 107 L224 116" fill="none" stroke="${shade}" stroke-width="6"/>`, // ponytail
    `<path d="M110 104 Q88 94 77 116 Q67 135 88 152 L108 135Z M207 104 Q230 92 241 116 Q252 138 229 151 L208 135Z" fill="${accent}"/><circle cx="106" cy="111" r="5" fill="${shade}"/><circle cx="211" cy="111" r="5" fill="${shade}"/>` // pigtails
  ];
  return `<g data-hairstyle="${style}" stroke="${line}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M103 122 Q96 84 124 70 Q151 55 170 67 Q204 53 214 96 L213 124 Q184 107 157 112 Q126 105 103 122Z" fill="${shade}"/>
    ${sideDetails[sides]}
    <path d="${hairTops[top]}" fill="${accent}"/>
    ${top === 9 ? `<circle cx="128" cy="84" r="12" fill="${shade}"/><circle cx="161" cy="70" r="13" fill="${accent}"/><circle cx="189" cy="83" r="12" fill="${shade}"/>` : ''}
  </g>`;
}

function featureForRace(race, skin, shade, accent, rng) {
  const ears = {
    Human: '<path d="M103 125 Q74 107 83 150 Q91 172 108 165 M212 125 Q240 105 231 151 Q224 172 210 165" fill="'+skin+'"/>',
    Dwarf: '<path d="M100 125 Q68 105 80 159 Q88 176 106 160 M214 125 Q246 109 231 159 Q221 175 208 160" fill="'+skin+'"/>',
    'Night Elf': '<path d="M103 124 L39 93 Q64 153 107 160 M212 124 L274 93 Q252 153 210 160" fill="'+skin+'"/>',
    Gnome: '<path d="M107 123 L61 113 Q83 143 107 152 M210 123 L255 113 Q235 145 209 152" fill="'+skin+'"/>',
    Orc: '<path d="M106 125 L68 101 Q74 148 108 158 M209 125 L247 101 Q243 149 208 158" fill="'+skin+'"/>',
    Undead: '<path d="M105 126 L78 113 L86 149 L103 160 M211 126 L238 113 L230 149 L211 160" fill="'+skin+'"/>',
    Tauren: '<path d="M109 118 Q51 101 75 53 Q70 93 121 100 M207 118 Q264 101 241 53 Q246 93 197 100" fill="'+accent+'"/><path d="M107 130 Q50 111 72 163 Q83 178 107 155 M209 130 Q265 111 244 163 Q232 178 208 155" fill="'+skin+'"/>',
    Troll: '<path d="M107 126 L50 102 Q72 151 109 156 M209 126 L266 102 Q248 151 209 156" fill="'+skin+'"/>',
    Skyborne: '<path d="M106 125 L55 78 Q74 147 107 158 M209 125 L260 78 Q241 147 208 158" fill="'+skin+'"/>'
  }[race];

  let hair = '';
  if (race === 'Dwarf') hair = `<path d="M114 178 Q94 239 146 231 L157 252 L171 230 Q219 238 203 179 Q179 191 158 183 Q136 193 114 178Z" fill="${accent}"/><path d="M157 194 L157 238" fill="none"/>`;
  else if (race === 'Troll') hair = `<path d="M120 187 Q108 231 128 237 L141 195 M199 187 Q211 231 190 237 L177 195" fill="${accent}"/>`;
  else if (race === 'Orc') hair = `<path d="M124 187 L126 165 L140 189 M190 187 L191 164 L175 189" fill="#f1e0b4"/>`;
  else if (race === 'Undead') hair = `<path d="M111 111 Q128 66 158 79 Q205 67 216 113 L203 105 L187 119 L170 101 L147 115 L124 102Z" fill="${shade}"/>`;
  else if (race === 'Skyborne') hair = `<path d="M112 110 Q119 50 157 80 Q190 54 211 109 L189 94 L179 116 L161 96 L146 116 L128 97Z" fill="${accent}"/>`;
  else if (race === 'Gnome') hair = `<path d="M108 114 Q119 61 159 82 Q201 60 211 113 Q185 103 171 120 L150 103 L132 122Z" fill="${accent}"/>`;
  else if (race === 'Night Elf') hair = `<path d="M107 121 Q116 58 157 77 Q207 52 211 126 L195 110 L171 121 L150 101 L126 120Z" fill="${accent}"/>`;
  else if (race === 'Tauren') hair = `<path d="M109 113 Q120 76 158 86 Q197 74 208 113 L185 99 L161 107 L137 99Z" fill="${shade}"/>`;
  else hair = `<path d="M108 115 Q121 73 156 83 Q202 68 211 114 L189 100 L166 113 L144 99 L121 114Z" fill="${accent}"/>`;

  const nose = race === 'Gnome' ? '<ellipse cx="159" cy="155" rx="15" ry="12" fill="'+shade+'"/>' : '<path d="M157 142 L150 161 L164 164" fill="none"/>';
  const mouth = race === 'Tauren' ? `<ellipse cx="158" cy="186" rx="35" ry="22" fill="${shade}"/><circle cx="142" cy="185" r="4" fill="${line}"/><circle cx="176" cy="185" r="4" fill="${line}"/>` : `<path d="M137 184 Q159 ${rng() > .5 ? 200 : 174} 182 184" fill="none"/>`;
  return { ears, hair, nose, mouth };
}

function classGear(characterClass, rng, leftHand, rightHand) {
  const steel = '#c8ced0', gold = '#eccb75', wood = '#764d35';
  const grip = (hand, drawing) => `<g transform="translate(${hand.x} ${hand.y}) rotate(${Math.floor(rng() * 9) - 4})">${shape(drawing)}<circle r="5" fill="${wood}" stroke="${line}" stroke-width="3"/></g>`;
  const gear = {
    Druid: () => grip(leftHand, `<path d="M0 83 L0 -72" stroke="${wood}" stroke-width="10" fill="none"/><path d="M0 -78 Q-31 -112 -27 -65 Q-11 -57 0 -78 Q25 -112 29 -69 Q12 -52 0 -78Z" fill="#79be72"/>`) + grip(rightHand, `<path d="M0 45 L0 -26" stroke="${wood}" stroke-width="7"/><path d="M0 -27 Q-26 -55 -17 -13 Q0 -8 0 -27 Q19 -54 20 -14 Q8 -8 0 -27Z" fill="#6db77d"/>`),
    Hunter: () => grip(leftHand, `<path d="M-2 -80 Q-55 0 -2 80" stroke="${wood}" stroke-width="10" fill="none"/><path d="M-2 -80 Q16 0 -2 80" stroke="#f1e6bf" stroke-width="3" fill="none"/><path d="M-11 1 L72 -7 M62 -16 L76 -7 L63 1" stroke="${steel}" stroke-width="5" fill="none"/>`),
    Mage: () => grip(rightHand, `<path d="M0 90 L-1 -82" stroke="${wood}" stroke-width="10"/><path d="M-1 -112 L16 -87 L-1 -68 L-17 -88Z" fill="#b98bea"/><path d="M-30 -109 L-22 -104 M21 -118 L24 -110" stroke="${gold}" fill="none"/>`),
    Paladin: () => grip(rightHand, `<path d="M0 40 L0 -66" stroke="${steel}" stroke-width="11"/><path d="M-25 -68 L25 -68 M0 -98 L0 -40" stroke="${gold}" stroke-width="10"/>`) + grip(leftHand, `<path d="M-27 -23 L24 -23 L22 35 L-3 54 L-30 31Z" fill="${gold}"/>`),
    Priest: () => grip(leftHand, `<path d="M0 85 L0 -74" stroke="${wood}" stroke-width="10"/><circle cx="0" cy="-82" r="19" fill="#fff2b6"/>`) + grip(rightHand, `<path d="M0 21 L0 -38 M-19 -18 L19 -18" stroke="${gold}" stroke-width="8"/>`),
    Rogue: () => grip(leftHand, `<path d="M0 20 L-30 -63 L-15 -67 L10 17Z" fill="${steel}"/><path d="M-15 15 L13 4" stroke="${gold}" stroke-width="8"/>`) + grip(rightHand, `<path d="M0 20 L28 -68 L42 -61 L11 18Z" fill="${steel}"/><path d="M-11 5 L16 17" stroke="${gold}" stroke-width="8"/>`),
    Shaman: () => grip(leftHand, `<path d="M0 83 L0 -54" stroke="${wood}" stroke-width="11"/><path d="M-24 -60 L23 -60 L29 -26 L0 -12 L-28 -28Z" fill="#78b8a8"/><circle cy="-37" r="8" fill="${gold}"/>`) + grip(rightHand, `<path d="M0 14 Q-23 -12 0 -43 Q24 -11 0 14Z" fill="#89d6f7"/>`),
    Warlock: () => grip(rightHand, `<path d="M0 89 L0 -66" stroke="${wood}" stroke-width="10"/><path d="M0 -106 Q36 -95 11 -67 Q0 -83 -13 -67 Q-35 -96 0 -106Z" fill="#a376c3"/>`) + grip(leftHand, `<path d="M0 22 Q-34 -13 -9 -48 Q14 -30 0 -10 Q29 -33 15 -48" fill="none" stroke="#c887bc" stroke-width="7"/>`),
    Warrior: () => grip(rightHand, `<path d="M0 92 L0 -65" stroke="${wood}" stroke-width="12"/><path d="M0 -66 L-29 -66 L-33 -113 L0 -126 L31 -113 L27 -66Z" fill="${steel}"/>`) + grip(leftHand, `<path d="M-26 -24 L24 -30 L30 29 L-2 51 L-31 21Z" fill="#948983"/>`)
  };
  return gear[characterClass]();
}

function escapeSvgText(value) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function nameplate(firstName, lastName) {
  const first = firstName.trim();
  const last = lastName.trim();
  const fullName = `${first} ${last}`.trim() || 'Nameless Adventurer';
  const lines = Array.from(fullName).length > 27 && first && last ? [first, last] : [fullName];
  const nameLines = lines.map((text, index) => {
    const length = Array.from(text).length;
    const fontSize = length > 35 ? 15 : length > 24 ? 18 : 22;
    const fit = length > 23 ? ' textLength="282" lengthAdjust="spacingAndGlyphs"' : '';
    const y = lines.length === 1 ? 35 : 23 + index * 21;
    return `<text x="160" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="${fontSize}" font-weight="700" fill="#f4df84" stroke="#11181e" stroke-width="2.4" paint-order="stroke"${fit}>${escapeSvgText(text)}</text>`;
  }).join('');
  return `<rect x="0" y="0" width="320" height="80" fill="#111a22" opacity=".92"/>
    ${nameLines}
    <text x="160" y="68" text-anchor="middle" font-family="Georgia,serif" font-size="16" font-weight="700" fill="#f4df84" stroke="#11181e" stroke-width="2" paint-order="stroke" textLength="291" lengthAdjust="spacingAndGlyphs">&lt;Gondor Calls For Raid&gt;</text>`;
}

function leatherBall(seed, label) {
  const tilt = seed % 19 - 9;
  return `<svg xmlns="${SVG_NS}" viewBox="0 0 320 415" role="img" aria-label="A badly drawn stitched leather ball">
    <g transform="translate(0 65)">
    <ellipse cx="160" cy="301" rx="100" ry="17" fill="#0e1017" opacity=".32"/>
    <g transform="rotate(${tilt} 160 172)">${shape(`<path d="M158 59 Q242 48 264 153 Q275 240 193 276 Q88 299 57 209 Q30 124 94 78 Q125 55 158 59Z" fill="#a66a41"/>
      <path d="M87 83 Q118 148 65 214 M229 70 Q195 143 260 217 M68 215 Q163 187 251 222" fill="none" stroke="#68402b" stroke-width="8"/>
      <path d="M111 120 Q169 150 218 122" fill="none" stroke="#eee0b7" stroke-width="7" stroke-dasharray="7 10"/>
      <ellipse cx="133" cy="180" rx="8" ry="12" fill="#f6eac2"/><ellipse cx="177" cy="181" rx="11" ry="13" fill="#f6eac2"/>
      <circle cx="136" cy="181" r="4" fill="${line}"/><circle cx="176" cy="181" r="5" fill="${line}"/>
      <path d="M141 222 Q163 230 181 216" fill="none" stroke="#4a2821" stroke-width="6"/>`)}</g>
    <text x="160" y="324" text-anchor="middle" font-family="Georgia, serif" font-size="12" letter-spacing="4" fill="#dfbc71">VERY LEGENDARY</text>
    </g>
    ${label}
  </svg>`;
}

export function characterSvg(result, firstName = '', lastName = '') {
  const label = nameplate(firstName, lastName);
  if (result.kind === 'easter-egg') return leatherBall(result.artworkSeed, label);
  const rng = seeded(result.artworkSeed);
  const [skin, shade, accent] = palette[result.race];
  if (!skin) throw new RangeError(`Unknown race: ${result.race}`);
  if (!blurbs[result.characterClass]) throw new RangeError(`Unknown class: ${result.characterClass}`);

  const face = featureForRace(result.race, skin, shade, accent, rng);
  const eyeOffset = Math.floor(rng() * 15) - 7;
  const outfit = ['#585e97', '#935774', '#767b50', '#9a634a'][result.artworkSeed % 4];
  const tilted = Math.floor(rng() * 15) - 7;
  const headTilt = Math.floor(rng() * 21) - 10;
  const feminine = (result.artworkSeed & 1) === 0;
  const width = result.race === 'Gnome' ? 126 : result.race === 'Tauren' ? 143 : result.race === 'Dwarf' ? 122 : 112;
  const height = result.race === 'Gnome' ? 92 : result.race === 'Tauren' ? 104 : 91;
  const leftArm = 42 + Math.floor(rng() * 17);
  const rightArm = 274 + Math.floor(rng() * 13);
  const leftShoe = 39 + Math.floor(rng() * 12);
  const rightShoe = 269 + Math.floor(rng() * 9);
  const body = feminine
    ? `<path d="M119 206 Q142 196 158 210 Q181 195 205 211 L211 267 Q199 278 218 286 L190 300 L154 288 L123 300 L99 286 Q121 271 111 253Z" fill="${outfit}"/>
       <path d="M107 233 Q104 205 132 210 Q159 209 161 237 Q160 263 133 260 Q105 261 107 233Z" fill="${outfit}"/>
       <path d="M160 237 Q162 205 190 209 Q217 215 211 242 Q209 264 182 262 Q160 261 160 237Z" fill="${outfit}"/>
       <path d="M161 224 Q155 247 165 256 M126 262 Q153 270 180 265 M201 270 L213 283" fill="none" stroke="#24202a" stroke-width="3"/>`
    : `<path d="M119 209 Q155 197 196 211 Q219 213 222 263 Q218 294 178 296 Q123 306 104 269 Q105 225 119 209Z" fill="${outfit}"/>
       <path d="M127 240 Q159 253 196 238 M122 266 Q169 278 209 260" fill="none" stroke="#29212c" stroke-width="3"/>
       <path d="M146 211 L159 232 L177 211" fill="none" stroke="#f1d185" stroke-width="7"/>`;
  const raceDoodles = result.race === 'Skyborne'
    ? `<path d="M104 106 L62 74 L94 109 L49 99 L97 121 M208 109 L251 75 L219 119 L266 113 L215 130" fill="${shade}"/>`
    : result.race === 'Undead'
      ? `<path d="M110 190 L127 196 L115 204 M200 185 L218 194 L204 205 M133 265 L145 278" fill="none" stroke="#423b4e" stroke-width="3"/>`
      : '';
  const hairExtras = feminine && !['Tauren', 'Undead'].includes(result.race)
    ? `<path d="M110 117 Q89 154 106 217 L119 225 L123 144 M202 113 Q231 159 212 219 L195 222 L192 146" fill="${accent}"/>`
    : '';
  const anatomy = feminine
    ? `<circle cx="136" cy="237" r="4" fill="#d1a588" stroke="${line}" stroke-width="2"/><circle cx="185" cy="240" r="5" fill="#d1a588" stroke="${line}" stroke-width="2"/>
       <path d="M145 277 Q160 272 176 278 L180 301 Q169 309 160 306 Q150 310 141 301Z" fill="${outfit}" stroke="${line}" stroke-width="4"/>
       <path d="M160 282 C155 286 156 296 160 303 C164 296 165 286 160 282Z M160 285 Q159 293 160 300" fill="none" stroke="#17151c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="M155 277 Q161 273 168 278 L169 290 Q182 288 183 298 Q183 306 171 310 Q160 313 149 308 Q139 302 143 295 Q147 289 156 290Z" fill="${outfit}" stroke="${line}" stroke-width="4"/>
       <path d="M157 288 Q162 286 168 289" fill="none" stroke="#f2d28f" stroke-width="3" stroke-linecap="round"/>
       <path d="M162 300 L162 306" fill="none" stroke="#17151c" stroke-width="1.5" stroke-linecap="round"/>`;

  return `<svg xmlns="${SVG_NS}" viewBox="0 0 320 415" role="img" aria-label="A funny drawing of a ${result.race} ${result.characterClass}">
    <defs><filter id="wobble-${result.artworkSeed}" x="-12%" y="-12%" width="124%" height="124%">
      <feTurbulence type="fractalNoise" baseFrequency=".031" numOctaves="2" seed="${result.artworkSeed % 97}" result="bad-pencil"/>
      <feDisplacementMap in="SourceGraphic" in2="bad-pencil" scale="6" xChannelSelector="R" yChannelSelector="G"/>
    </filter></defs>
    <g transform="translate(0 65)">
    <ellipse cx="162" cy="321" rx="130" ry="11" fill="#0e1017" opacity=".28"/>
    <g transform="rotate(${tilted} 160 186)" filter="url(#wobble-${result.artworkSeed})">
      ${shape(`<path d="M132 272 Q96 289 ${leftShoe+35} 311 L${leftShoe+8} 306 Q${leftShoe+32} 271 120 255Z" fill="${skin}"/>
        <path d="M185 268 Q214 295 ${rightShoe-24} 309 L${rightShoe+4} 298 Q228 272 201 251Z" fill="${skin}"/>
        <path d="M${leftShoe+10} 301 Q${leftShoe-23} 301 ${leftShoe-19} 320 Q${leftShoe-7} 332 ${leftShoe+50} 320 L${leftShoe+41} 308Z" fill="#de4048"/>
        <path d="M${rightShoe-23} 303 Q${rightShoe+32} 298 ${rightShoe+32} 320 Q${rightShoe+16} 333 ${rightShoe-33} 320Z" fill="#d84654"/>
        <path d="M114 217 Q76 212 ${leftArm+13} 192 L${leftArm} 197 Q62 242 104 251Z" fill="${skin}"/>
        <path d="M205 219 Q244 199 ${rightArm-22} 177 L${rightArm} 183 Q272 225 217 252Z" fill="${skin}"/>
        <path d="M${leftArm} 190 Q${leftArm-28} 178 ${leftArm-24} 206 Q${leftArm-12} 224 ${leftArm+15} 210 L${leftArm+12} 190Z" fill="#f4eee7"/>
         <path d="M${rightArm-4} 174 Q${rightArm+29} 169 ${rightArm+24} 197 Q${rightArm+13} 216 ${rightArm-13} 198Z" fill="#f4eee7"/>`)}
      ${shape(body)}
      ${anatomy}
      <g transform="rotate(${headTilt} 158 158)">
        ${shape(raceDoodles + hairExtras + face.ears)}
        ${shape(`<path d="M${158-width/2} 154 Q${151-width/2} ${153-height} 149 ${145-height-14} Q${211+width/2} ${149-height} ${158+width/2} 153 Q${170+width/2} 214 158 214 Q${138-width/2} 224 ${158-width/2} 154Z" fill="${skin}"/>`)}
        ${shape(face.hair)}
        ${nameHair(result.artworkSeed, accent, shade)}
        ${shape(`<path d="M115 139 Q132 126 149 145 M168 135 Q191 130 204 145" fill="none" stroke-width="7"/>
          <ellipse cx="133" cy="154" rx="19" ry="12" fill="#fff8e9" transform="rotate(-10 133 154)"/>
          <ellipse cx="187" cy="149" rx="22" ry="15" fill="#fff8e9" transform="rotate(9 187 149)"/>
          <circle cx="${136+eyeOffset}" cy="155" r="6" fill="${line}"/><circle cx="${190-eyeOffset}" cy="152" r="5" fill="${line}"/>
          ${face.nose}<circle cx="158" cy="163" r="5" fill="${shade}"/>${face.mouth}`)}
        ${feminine ? '<path d="M113 148 L105 140 M114 153 L104 150 M202 146 L211 139 M204 151 L215 149" fill="none" stroke="#221b28" stroke-width="4" stroke-linecap="round"/>' : ''}
        ${result.race === 'Skyborne' ? '<path d="M109 192 Q164 221 210 190" stroke="#b9e7ff" stroke-width="4" fill="none"/>' : ''}
      </g>
      ${classGear(result.characterClass, rng, { x: leftArm - 5, y: 200 }, { x: rightArm + 5, y: 190 })}
      <path d="M96 232 L79 239 M226 243 L244 233 M137 290 L151 294 M202 286 L215 280" fill="none" stroke="#211c27" stroke-width="2" stroke-linecap="round" opacity=".75"/>
    </g>
    </g>
    ${label}
  </svg>`;
}
