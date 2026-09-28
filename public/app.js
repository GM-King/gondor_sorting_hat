import { sortName } from './sorting.js';
import { characterSvg, describeResult } from './character.js';
import { characterStats } from './stats.js';

const form = document.querySelector('#sort-form');
const firstInput = document.querySelector('#first-name');
const lastInput = document.querySelector('#last-name');
const error = document.querySelector('#form-error');
const button = document.querySelector('#sort-button');
const buttonLabel = document.querySelector('#button-label');
const mascot = document.querySelector('#mascot');
const resultSection = document.querySelector('#result');
const resultHeading = document.querySelector('#result-heading');
const resultDescription = document.querySelector('#result-description');
const resultStats = document.querySelector('#result-stats');
const resultArt = document.querySelector('#result-art');
const announcer = document.querySelector('#announcer');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let sorting = false;

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

form.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.isComposing && (event.target === firstInput || event.target === lastInput)) {
    event.preventDefault();
    form.requestSubmit();
  }
});

function setError(message, field) {
  error.textContent = message;
  error.hidden = !message;
  firstInput.setAttribute('aria-invalid', String(Boolean(message && field === firstInput)));
  lastInput.setAttribute('aria-invalid', String(Boolean(message && field === lastInput)));
  if (field) field.focus();
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (sorting) return;
  const first = firstInput.value.trim();
  const last = lastInput.value.trim();
  if (!first) return setError('The hat needs your first name.', firstInput);
  if (!last) return setError('The hat needs your last name.', lastInput);
  setError('', null);

  sorting = true;
  button.disabled = true;
  firstInput.disabled = true;
  lastInput.disabled = true;
  buttonLabel.textContent = 'THE HAT IS THINKING…';
  announcer.textContent = 'The hat is sorting your destiny.';
  resultSection.classList.remove('is-visible');
  resultSection.hidden = true;
  mascot.classList.add('is-sorting');

  const outcome = sortName(first, last);
  // Leather Ball takes ten extra seconds after the usual sorting sequence.
  await pause(reducedMotion.matches ? 250 : 2950);
  if (outcome.kind === 'easter-egg') {
    buttonLabel.textContent = 'THE HAT IS VERY CONFUSED…';
    announcer.textContent = 'The hat needs a little longer to decide.';
    await pause(10000);
  }
  resultHeading.textContent = outcome.title;
  const stats = characterStats(outcome);
  resultStats.hidden = !stats;
  resultDescription.hidden = Boolean(stats);
  if (stats) {
    document.querySelector('#stat-body-type').textContent = String(stats.bodyType);
    document.querySelector('#stat-height').textContent = stats.height;
    document.querySelector('#stat-weight').textContent = stats.weight;
    document.querySelector('#stat-girth').textContent = stats.girth;
    document.querySelector('#stat-anatomy-label').textContent = stats.anatomyLabel;
    document.querySelector('#stat-anatomy').textContent = stats.anatomy;
    document.querySelector('#stat-shoe-size').textContent = stats.shoeSize;
  } else {
    resultDescription.textContent = describeResult(outcome);
  }
  resultArt.innerHTML = characterSvg(outcome, first, last);
  resultSection.hidden = false;
  requestAnimationFrame(() => resultSection.classList.add('is-visible'));
  mascot.classList.remove('is-sorting');
  buttonLabel.textContent = 'SORT MY DESTINY';
  firstInput.disabled = false;
  lastInput.disabled = false;
  button.disabled = false;
  sorting = false;
  announcer.textContent = stats
    ? `${first} ${last}: ${outcome.title}. Body type ${stats.bodyType}, height ${stats.height}, weight ${stats.weight}, girth ${stats.girth}, ${stats.anatomyLabel} ${stats.anatomy}, shoe size ${stats.shoeSize}.`
    : `${first} ${last}: ${outcome.title}. ${describeResult(outcome)}`;
  resultSection.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
});

for (const input of [firstInput, lastInput]) {
  input.addEventListener('input', () => { if (!error.hidden) setError('', null); });
}
