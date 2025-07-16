let currentUser = null;
const members = [
  { code: 'MEMBER001', name: 'Mouhamed Niang', dob: '01012000', status: 'actif', contributions: [{ name: 'Mensuelle', amount: 2000, paid: true }] }
];
const contributions = [{ name: 'Mensuelle', amount: 2000 }];
const suggestions = [];
const gallery = [];
const events = [{ name: 'Conférence Annuelle', date: '2025-08-02T15:00:00' }];
const coranData = {
  ar: Array(30).fill().map((_, i) => `Juz' ${i + 1} (Arabe)`),
  fr: Array(30).fill().map((_, i) => `Juz' ${i + 1} (Français)`),
  en: Array(30).fill().map((_, i) => `Juz' ${i + 1} (Anglais)`),
};

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelector(`#${pageId}`).classList.add('active');
  document.querySelector(`a[onclick="showPage('${pageId}')"]`).classList.add('active');
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
}

function updateCountdown() {
  const eventDate = new Date(events[0].date);
  const now = new Date();
  const diff = eventDate - now;
  if (diff <= 0) {
    document.getElementById('countdown').textContent = 'Événement en cours !';
    return;
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  document.getElementById('countdown').textContent = `JOUR J - ${days} jours ${hours}h ${minutes}m ${seconds}s`;
}

setInterval(updateCountdown, 1000);

document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);

document.querySelector('#language-selector').addEventListener('change', (e) => {
  const lang = e.target.value;
  document.querySelector('#settings-language').value = lang;
  updateCoranContent(lang);
});

document.querySelector('#settings-language').addEventListener('change', (e) => {
  const lang = e.target.value;
  document.querySelector('#language-selector').value = lang;
  updateCoranContent(lang);
});

document.querySelector('.chatbot-button').addEventListener('click', () => {
  alert('Assistant IA : Posez vos questions sur ANSAR ALMOUYASSAR !');
});

document.querySelector('#login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const code = document.querySelector('#member-code').value;
  const password = document.querySelector('#password').value;
  const errorMessage = document.querySelector('#error-message');

  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[012])(19|20)\d\d$/;
  if (!dateRegex.test(password)) {
    errorMessage.textContent = 'Mot de passe invalide (format : JJMMAAAA)';
    errorMessage.style.display = 'block';
    return;
  }

  if (code === 'ADMIN123' && password === '01012000') {
    currentUser = { code: 'ADMIN123', role: 'admin' };
    showPage('secret');
  } else {
    const member = members.find(m => m.code === code && m.dob === password);
    if (member) {
      currentUser = member;
      document.getElementById('personal-title').textContent = `Espace de ${member.name}`;
      updatePersonalInfo();
      showPage('personal');
    } else {
      errorMessage.textContent = 'Code ou mot de passe incorrect';
      errorMessage.style.display = 'block';
    }
  }
});

document.querySelector('#add-member-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const name = document.querySelector('#new-member-name').value;
  const dob = document.querySelector('#new-member-dob').value;
  const status = document.querySelector('#new-member-status').value;
  const code = `MEMBER${(members.length + 1).toString().padStart(3, '0')}`;
  members.push({ code, name, dob, status, contributions: [] });
  updateMembersList();
});

document.querySelector('#add-contribution-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const name = document.querySelector('#contribution-name').value;
  const amount = parseInt(document.querySelector('#contribution-amount').value);
  contributions.push({ name, amount });
  members.forEach(member => member.contributions.push({ name, amount, paid: false }));
  updateContributionsList();
  updatePersonalInfo();
});

document.querySelector('#suggestion-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser) return;
  const text = document.querySelector('#suggestion-text').value;
  suggestions.push({ member: currentUser.name, text });
  updateSuggestionsList();
});

function updateMembersList() {
  const list = document.querySelector('#members-list');
  list.innerHTML = members.map(m => `
    <div class="member-card">
      <p><strong>Nom :</strong> ${m.name}</p>
      <p><strong>Code :</strong> ${m.code}</p>
      <p><strong>Statut :</strong> ${m.status}</p>
    </div>
  `).join('');
}

function updateContributionsList() {
  const list = document.querySelector('#contributions-list');
  list.innerHTML = contributions.map(c => `
    <div class="contribution-card">
      <p><strong>${c.name}</strong>: ${c.amount} FCFA</p>
    </div>
  `).join('');
}

function updatePersonalInfo() {
  if (!currentUser) return;
  const info = document.querySelector('#personal-info');
  const contributions = document.querySelector('#personal-contributions');
  info.innerHTML = `
    <p><strong>Nom :</strong> ${currentUser.name}</p>
    <p><strong>Code :</strong> ${currentUser.code}</p>
    <p><strong>Statut :</strong> ${currentUser.status}</p>
  `;
  contributions.innerHTML = currentUser.contributions.map(c => `
    <div class="contribution-card">
      <p><strong>${c.name}</strong>: ${c.amount} FCFA (${c.paid ? 'Payé' : 'Non payé'})</p>
    </div>
  `).join('');
}

function updateSuggestionsList() {
  const list = document.querySelector('#suggestions-list');
  list.innerHTML = suggestions.map(s => `
    <div class="suggestion-card">
      <p><strong>${s.member}</strong>: ${s.text}</p>
    </div>
  `).join('');
}

function updateCoranContent(lang) {
  const content = document.querySelector('#coran-content');
  content.innerHTML = coranData[lang].map(juz => `<p>${juz}</p>`).join('');
}

function payContribution() {
  window.open('https://wave.com', '_blank'); // Remplacer par le lien Wave/Orange Money
}

function startCall(type) {
  alert(`Lancement d'un appel ${type === 'group' ? 'de groupe' : 'individuel'} (WebRTC à implémenter)`);
}

function startLive() {
  alert('Lancement d’un live (WebRTC à implémenter)');
}

updateMembersList();
updateContributionsList();
updateSuggestionsList();
updateCoranContent('ar');
