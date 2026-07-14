// Paste the deployed Google Apps Script URL between the quotes below.
const GOOGLE_APPS_SCRIPT_URL = 'PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';

const ENTRY_TYPES = {
  general: { label: 'General entry', price: 1950 },
  gold: { label: 'Gold sponsor', price: 2750 },
};

const PLAYER_FIELDS = [
  { key: 'fullName', label: 'Full name', type: 'text', autocomplete: 'name' },
  { key: 'mobile', label: 'Mobile', type: 'tel', autocomplete: 'tel' },
  { key: 'email', label: 'Email', type: 'email', autocomplete: 'email' },
  { key: 'golfClub', label: 'Golf club', type: 'text', autocomplete: 'organization' },
  { key: 'handicap', label: 'Handicap', type: 'text', inputmode: 'decimal' },
];

const form = document.querySelector('#registration-form');
const playersContainer = document.querySelector('#players-container');
const summaryEntry = document.querySelector('#summary-entry');
const summaryPrice = document.querySelector('#summary-price');
const summaryPlayers = document.querySelector('#summary-players');
const summaryTeamName = document.querySelector('#summary-team-name');
const formStatus = document.querySelector('#form-status');
const submitButton = form.querySelector('.submit-button');
const creditCardFields = document.querySelector('#credit-card-fields');

function renderPlayers() {
  playersContainer.innerHTML = Array.from({ length: 4 }, (_, playerIndex) => `
    <article class="player-card">
      <h4>Player ${playerIndex + 1}</h4>
      <div class="player-fields">
        ${PLAYER_FIELDS.map((field) => `
          <label>
            <span>${field.label}</span>
            <input
              name="players[${playerIndex}].${field.key}"
              type="${field.type}"
              ${field.autocomplete ? `autocomplete="${field.autocomplete}"` : ''}
              ${field.inputmode ? `inputmode="${field.inputmode}"` : ''}
              required
            />
          </label>
        `).join('')}
      </div>
    </article>
  `).join('');
}

function readPayload() {
  const data = new FormData(form);
  return {
    entryType: String(data.get('entryType') || 'general'),
    teamName: String(data.get('teamName') || '').trim(),
    paymentMethod: String(data.get('paymentMethod') || '').trim(),
    signature: String(data.get('signature') || '').trim(),
    players: Array.from({ length: 4 }, (_, playerIndex) => {
      const player = {};
      PLAYER_FIELDS.forEach((field) => {
        player[field.key] = String(data.get(`players[${playerIndex}].${field.key}`) || '').trim();
      });
      return player;
    }),
  };
}

function updateSummary() {
  const payload = readPayload();
  const entry = ENTRY_TYPES[payload.entryType] || ENTRY_TYPES.general;
  const completePlayers = payload.players.filter((player) =>
    PLAYER_FIELDS.every((field) => player[field.key])
  ).length;

  summaryEntry.textContent = entry.label;
  summaryPrice.textContent = `$${entry.price.toLocaleString('en-AU')}`;
  summaryPlayers.textContent = `${completePlayers} of 4 complete`;
  summaryTeamName.textContent = payload.teamName || 'Your team name';
}

function toggleCreditCardFields() {
  const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
  creditCardFields.hidden = selectedMethod !== 'credit-card';
}

function validate(payload) {
  const errors = [];
  if (!payload.teamName) errors.push('Enter a team name.');
  if (!payload.paymentMethod) errors.push('Choose a payment method.');

  payload.players.forEach((player, index) => {
    PLAYER_FIELDS.forEach((field) => {
      if (!player[field.key]) errors.push(`Complete ${field.label.toLowerCase()} for Player ${index + 1}.`);
    });
    if (player.email && !/^\S+@\S+\.\S+$/.test(player.email)) {
      errors.push(`Enter a valid email for Player ${index + 1}.`);
    }
  });
  return errors;
}

function setStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = `form-status ${type || ''}`;
}

form.addEventListener('input', updateSummary);
form.addEventListener('change', (event) => {
  if (event.target.name === 'paymentMethod') toggleCreditCardFields();
  updateSummary();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = readPayload();
  const errors = validate(payload);

  if (errors.length) {
    setStatus(errors[0], 'error');
    form.querySelector(':invalid')?.focus();
    return;
  }

  if (GOOGLE_APPS_SCRIPT_URL.includes('PASTE_')) {
    setStatus('Add your Google Apps Script web app URL in script.js first.', 'error');
    return;
  }

  submitButton.disabled = true;
  setStatus('Submitting registration…');

  try {
    // no-cors is intentional: Apps Script redirects its response to a Google-hosted URL.
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(payload),
    });
    form.reset();
    updateSummary();
    setStatus('Registration submitted. We’ll be in touch soon.', 'success');
  } catch (error) {
    setStatus('The registration could not be sent. Please try again.', 'error');
  } finally {
    submitButton.disabled = false;
  }
});

renderPlayers();
toggleCreditCardFields();
updateSummary();
