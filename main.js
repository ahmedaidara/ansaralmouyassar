let currentUser = null;
let members = JSON.parse(localStorage.getItem('members')) || [
  {
    code: '001',
    firstname: 'Mouhamed',
    lastname: 'Niang',
    age: 45,
    dob: '01012000',
    birthplace: 'Dakar',
    photo: 'assets/images/default-photo.png',
    email: 'mouhamed.niang@example.com',
    activity: 'Président',
    address: '123 Rue Principale, Dakar',
    phone: '+221123456789',
    residence: 'Dakar',
    role: 'president',
    status: 'actif',
    contributions: [
      { name: 'Mensuelle', amount: 2000, years: { '2023': [false, false, false, false, false, false, false, false, false, false, false, false], '2024': [false, false, false, false, false, false, false, false, false, false, false, false], '2025': [false, false, false, false, false, false, false, false, false, false, false, false] } }
    ]
  }
];
let contributions = JSON.parse(localStorage.getItem('contributions')) || [
  { name: 'Mensuelle', amount: 2000, years: ['2023', '2024', '2025'] }
];
let suggestions = JSON.parse(localStorage.getItem('suggestions')) || [];
let gallery = JSON.parse(localStorage.getItem('gallery')) || [];
let events = JSON.parse(localStorage.getItem('events')) || [];
let messages = JSON.parse(localStorage.getItem('messages')) || [];
let autoMessages = JSON.parse(localStorage.getItem('autoMessages')) || [];
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let internalDocs = JSON.parse(localStorage.getItem('internalDocs')) || [];
let presidentFiles = JSON.parse(localStorage.getItem('presidentFiles')) || [];
let secretaryFiles = JSON.parse(localStorage.getItem('secretaryFiles')) || [];
let library = JSON.parse(localStorage.getItem('library')) || [
  { category: 'Fikhs', name: 'Livre de Fikh 1', url: 'assets/books/fikh1.pdf' },
  { category: 'Hadis', name: 'Sahih Bukhari', url: 'assets/books/hadis1.pdf' },
  { category: 'Langue', name: 'Apprendre l\'Arabe', url: 'assets/books/langue1.pdf' }
];
let isChatOpen = false;
let selectedCallMembers = [];
const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const presidentCode = '0000';
const validCodes = {
  admin: ['JESUISMEMBRE66', '33333333', '44444444', '55555555'],
  tresorier: ['JESUISTRESORIER444', '66666666', '77777777', '88888888'],
  president: ['PRESIDENT000', '99999999', '11112222', '33334444'],
  secretaire: ['SECRETAIRE000', '55556666', '77778888', '99990000'],
  secretEntry: ['ADMIN12301012000', '00000000', '11111111', '22222222']
};

function saveData() {
  localStorage.setItem('members', JSON.stringify(members));
  localStorage.setItem('contributions', JSON.stringify(contributions));
  localStorage.setItem('suggestions', JSON.stringify(suggestions));
  localStorage.setItem('gallery', JSON.stringify(gallery));
  localStorage.setItem('events', JSON.stringify(events));
  localStorage.setItem('messages', JSON.stringify(messages));
  localStorage.setItem('autoMessages', JSON.stringify(autoMessages));
  localStorage.setItem('notes', JSON.stringify(notes));
  localStorage.setItem('internalDocs', JSON.stringify(internalDocs));
  localStorage.setItem('presidentFiles', JSON.stringify(presidentFiles));
  localStorage.setItem('secretaryFiles', JSON.stringify(secretaryFiles));
  localStorage.setItem('library', JSON.stringify(library));
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelector(`#${pageId}`).classList.add('active');
  document.querySelector(`a[onclick="showPage('${pageId}')"]`).classList.add('active');
  if (pageId === 'members') updateMembersList();
  if (pageId === 'events') updateEventsList();
  if (pageId === 'gallery') updateGalleryContent();
  if (pageId === 'messages') updateMessagesList();
  if (pageId === 'coran') updateCoranContent();
  if (pageId === 'library') updateLibraryContent();
  if (pageId === 'personal') {
    document.querySelector('#personal-login').style.display = currentUser && currentUser.role !== 'admin' && currentUser.role !== 'tresorier' && currentUser.role !== 'president' && currentUser.role !== 'secretaire' ? 'none' : 'block';
    document.querySelector('#personal-content').style.display = currentUser && currentUser.role !== 'admin' && currentUser.role !== 'tresorier' && currentUser.role !== 'president' && currentUser.role !== 'secretaire' ? 'block' : 'none';
    if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'tresorier' && currentUser.role !== 'president' && currentUser.role !== 'secretaire') updatePersonalInfo();
  }
  if (pageId === 'president') updatePresidentFilesList();
  if (pageId === 'secretary') updateSecretaryFilesList();
}

function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`#${tabId}`).classList.add('active');
  document.querySelector(`button[onclick="showTab('${tabId}')"]`).classList.add('active');
  if (tabId === 'edit-member') updateEditMembersList();
  if (tabId === 'gallery-admin') updateGalleryAdminList();
  if (tabId === 'events-admin') updateEventsAdminList();
  if (tabId === 'messages-admin') updateMessagesAdminList();
  if (tabId === 'auto-messages') updateAutoMessagesList();
  if (tabId === 'notes') updateNotesList();
  if (tabId === 'internal-docs') updateInternalDocsList();
  if (tabId === 'suggestions-admin') updateSuggestionsList();
  if (tabId === 'stats') updateStats();
  if (tabId === 'video-calls') updateCallMembersList();
}

function showTreasurerTab(tabId) {
  document.querySelectorAll('#treasurer .tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('#treasurer .tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`#${tabId}`).classList.add('active');
  document.querySelector(`button[onclick="showTreasurerTab('${tabId}')"]`).classList.add('active');
  if (tabId === 'manage-contributions') updateContributionsTreasurerList();
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
}

function updateEventsCountdown() {
  const countdownDiv = document.getElementById('events-countdown');
  countdownDiv.innerHTML = '';
  events.forEach(event => {
    const eventDate = new Date(`${event.date}T${event.time}`);
    const now = new Date();
    const diff = eventDate - now;
    let text = '';
    if (diff <= 0 && diff > -30 * 60 * 1000) {
      text = `Événement "${event.name}" : EN COURS`;
    } else if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      text = `Événement "${event.name}" : JOUR J - ${days} jours ${hours}h ${minutes}m ${seconds}s`;
    }
    if (text) {
      countdownDiv.innerHTML += `<div>${text}</div>`;
    }
  });
  if (!events.length) countdownDiv.innerHTML = '';
}

function checkAutoMessages() {
  const now = new Date();
  autoMessages.forEach((msg, index) => {
    const msgDate = new Date(`${msg.date}T${msg.time}`);
    if (now >= msgDate && !msg.sent) {
      messages.push({ title: msg.name, text: msg.text, date: now.toISOString() });
      msg.sent = true;
      showMessagePopup(msg.name, msg.text);
      sendNotification(msg.name, msg.text);
      updateMessagesList();
      updateMessagesAdminList();
      saveData();
    }
  });
}

setInterval(() => {
  updateEventsCountdown();
  checkAutoMessages();
  updateContributionsYears();
}, 1000);

function showMessagePopup(title, content) {
  document.getElementById('message-popup-title').textContent = title;
  document.getElementById('message-popup-content').textContent = content;
  document.getElementById('message-popup').style.display = 'block';
}

function closeMessagePopup() {
  document.getElementById('message-popup').style.display = 'none';
}

function sendNotification(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    });
  }
}

function toggleChatbot() {
  isChatOpen = !isChatOpen;
  document.querySelector('#chatbot').style.display = isChatOpen ? 'block' : 'none';
  document.querySelector('#secret-entry').style.display = 'none';
  if (isChatOpen) {
    document.querySelector('#chatbot-messages').innerHTML = '<div class="chatbot-message received">Bienvenue ! Posez une question ou utilisez un mot-clé comme "association", "membre", "cotisation", etc.</div>';
  }
}

document.querySelector('.chatbot-button').addEventListener('click', toggleChatbot);

document.querySelector('#chatbot-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.querySelector('#chatbot-input');
  const message = input.value.trim();
  if (!message) return;
  const messages = document.querySelector('#chatbot-messages');
  messages.innerHTML += `<div class="chatbot-message sent">${message}</div>`;
  if (validCodes.secretEntry.includes(message)) {
    document.querySelector('#secret-entry').style.display = 'block';
  } else {
    const response = getChatbotResponse(message);
    messages.innerHTML += `<div class="chatbot-message received">${response}</div>`;
  }
  input.value = '';
  messages.scrollTop = messages.scrollHeight;
});

function enterSecret() {
  const password = document.querySelector('#secret-password').value;
  let role = null;
  if (validCodes.admin.includes(password)) role = 'admin';
  else if (validCodes.tresorier.includes(password)) role = 'tresorier';
  else if (validCodes.president.includes(password)) role = 'president';
  else if (validCodes.secretaire.includes(password)) role = 'secretaire';
  if (role) {
    currentUser = { code: 'ADMIN123', role };
    toggleChatbot();
    showPage(role === 'tresorier' ? 'treasurer' : role === 'president' ? 'president' : role === 'secretaire' ? 'secretary' : 'secret');
  } else {
    document.querySelector('#chatbot-messages').innerHTML += '<div class="chatbot-message received">Mot de passe incorrect.</div>';
  }
}

document.querySelector('#personal-login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const code = document.querySelector('#personal-member-code').value;
  const password = document.querySelector('#personal-password').value;
  const errorMessage = document.querySelector('#personal-error-message');

  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[012])(19|20)\d\d$/;
  if (!dateRegex.test(password)) {
    errorMessage.textContent = 'Mot de passe invalide (format : JJMMAAAA)';
    errorMessage.style.display = 'block';
    return;
  }

  const member = members.find(m => m.code === code && m.dob === password);
  if (member) {
    currentUser = member;
    document.querySelector('#personal-title').textContent = `Espace de ${member.firstname} ${member.lastname}`;
    document.querySelector('#personal-login').style.display = 'none';
    document.querySelector('#personal-content').style.display = 'block';
    updatePersonalInfo();
  } else {
    errorMessage.textContent = 'Numéro de membre ou mot de passe incorrect';
    errorMessage.style.display = 'block';
  }
});

function logoutPersonal() {
  currentUser = null;
  document.querySelector('#personal-login').style.display = 'block';
  document.querySelector('#personal-content').style.display = 'none';
  showPage('home');
}

document.querySelector('#add-member-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const member = {
    code: String(members.length + 1).padStart(3, '0'),
    firstname: document.querySelector('#new-member-firstname').value,
    lastname: document.querySelector('#new-member-lastname').value,
    age: parseInt(document.querySelector('#new-member-age').value) || null,
    dob: document.querySelector('#new-member-dob').value || null,
    birthplace: document.querySelector('#new-member-birthplace').value || null,
    photo: document.querySelector('#new-member-photo').files[0] ? URL.createObjectURL(document.querySelector('#new-member-photo').files[0]) : 'assets/images/default-photo.png',
    email: document.querySelector('#new-member-email').value || null,
    activity: document.querySelector('#new-member-activity').value || null,
    address: document.querySelector('#new-member-address').value || null,
    phone: document.querySelector('#new-member-phone').value || null,
    residence: document.querySelector('#new-member-residence').value || null,
    role: document.querySelector('#new-member-role').value || 'membre',
    status: document.querySelector('#new-member-status').value || 'actif',
    contributions: contributions.map(c => ({
      name: c.name,
      amount: c.amount,
      years: c.years.reduce((acc, year) => ({ ...acc, [year]: Array(12).fill(false) }), {}),
      paid: false,
      partial: 0
    }))
  };
  members.push(member);
  document.querySelector('#add-member-form').reset();
  updateMembersList();
  updateEditMembersList();
  updateCallMembersList();
  updateContributionsTreasurerList();
  updateStats();
  saveData();
});

document.querySelector('#delete-member-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const code = document.querySelector('#delete-member-code').value;
  if (code !== presidentCode) {
    alert('Code président incorrect');
    return;
  }
  const memberCode = document.querySelector('#delete-member-form').dataset.memberCode;
  const index = members.findIndex(m => m.code === memberCode);
  if (index !== -1) {
    members.splice(index, 1);
    updateMembersList();
    updateEditMembersList();
    updateCallMembersList();
    updateContributionsTreasurerList();
    updateStats();
    document.querySelector('#delete-member-form').style.display = 'none';
    saveData();
  }
});

document.querySelector('#add-contribution-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'tresorier') return;
  const name = document.querySelector('#contribution-name').value;
  const amount = parseInt(document.querySelector('#contribution-amount').value);
  const years = name === 'Mensuelle' ? contributions.find(c => c.name === 'Mensuelle')?.years || ['2023', '2024', '2025'] : [];
  contributions.push({ name, amount, years });
  members.forEach(member => {
    member.contributions.push({
      name,
      amount,
      years: name === 'Mensuelle' ? years.reduce((acc, year) => ({ ...acc, [year]: Array(12).fill(false) }), {}),
      paid: false,
      partial: 0
    });
  });
  document.querySelector('#add-contribution-form').reset();
  updateContributionsTreasurerList();
  updatePersonalInfo();
  updateStats();
  saveData();
});

function updateContributionsYears() {
  const currentYear = new Date().getFullYear().toString();
  if (!contributions.find(c => c.name === 'Mensuelle')?.years.includes(currentYear)) {
    contributions.find(c => c.name === 'Mensuelle')?.years.push(currentYear);
    members.forEach(member => {
      const monthlyCont = member.contributions.find(c => c.name === 'Mensuelle');
      if (monthlyCont) monthlyCont.years[currentYear] = Array(12).fill(false);
    });
    saveData();
  }
}

function payContribution() {
  const waveLink = 'https://pay.wave.com/m/M_sn_dyIw8DZWV46K/c/sn/?amount=2000';
  const orangeMoneyLink = 'https://sugu.orange-sonatel.com/mp/dc3PQ0eEeSdcKQWVvcTH2Z';
  const paymentWindow = window.open('', '_blank');
  paymentWindow.document.write(`
    <html>
      <head><title>Paiement des Cotisations</title></head>
      <body>
        <h2>Choisir une méthode de paiement</h2>
        <a href="${waveLink}" target="_blank" class="link-button">Payer via Wave</a>
        <a href="${orangeMoneyLink}" target="_blank" class="link-button">Payer via Orange Money</a>
        <style>
          body { font-family: 'Roboto', sans-serif; text-align: center; padding: 20px; }
          .link-button { display: block; margin: 10px; padding: 10px; background: #9b9c28; color: white; text-decoration: none; border-radius: 5px; }
          .link-button:hover { background: #778152; }
        </style>
      </body>
    </html>
  `);
}

document.querySelector('#suggestion-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser) return;
  const text = document.querySelector('#suggestion-text').value;
  suggestions.push({ member: `${currentUser.firstname} ${currentUser.lastname}`, text, date: new Date().toISOString() });
  document.querySelector('#suggestion-form').reset();
  updateSuggestionsList();
  saveData();
});

document.querySelector('#add-gallery-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const file = document.querySelector('#gallery-file').files[0];
  if (file) {
    gallery.push({ type: file.type.startsWith('image') ? 'image' : 'video', url: URL.createObjectURL(file), name: file.name });
    document.querySelector('#add-gallery-form').reset();
    updateGalleryContent();
    updateGalleryAdminList();
    saveData();
  }
});

document.querySelector('#add-event-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const event = {
    name: document.querySelector('#event-name').value,
    date: document.querySelector('#event-date').value,
    time: document.querySelector('#event-time').value,
    description: document.querySelector('#event-description').value,
    image: document.querySelector('#event-file').files[0] ? URL.createObjectURL(document.querySelector('#event-file').files[0]) : ''
  };
  events.push(event);
  document.querySelector('#add-event-form').reset();
  updateEventsList();
  updateEventsAdminList();
  updateEventsCountdown();
  saveData();
});

document.querySelector('#add-message-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const title = document.querySelector('#message-title').value;
  const text = document.querySelector('#message-text').value;
  messages.push({ title, text, date: new Date().toISOString() });
  document.querySelector('#add-message-form').reset();
  showMessagePopup(title, text);
  sendNotification(title, text);
  updateMessagesList();
  updateMessagesAdminList();
  saveData();
});

document.querySelector('#add-auto-message-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const autoMessage = {
    name: document.querySelector('#auto-message-name').value,
    text: document.querySelector('#auto-message-text').value,
    date: document.querySelector('#auto-message-date').value,
    time: document.querySelector('#auto-message-time').value,
    sent: false
  };
  autoMessages.push(autoMessage);
  document.querySelector('#add-auto-message-form').reset();
  updateAutoMessagesList();
  saveData();
});

document.querySelector('#add-note-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const theme = document.querySelector('#note-theme').value;
  const text = document.querySelector('#note-text').value;
  notes.push({ theme, text });
  document.querySelector('#add-note-form').reset();
  updateNotesList();
  saveData();
});

document.querySelector('#add-internal-doc-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const file = document.querySelector('#internal-doc').files[0];
  if (file) {
    internalDocs.push({ category: document.querySelector('#internal-doc-category').value, name: file.name, url: URL.createObjectURL(file) });
    document.querySelector('#add-internal-doc-form').reset();
    updateInternalDocsList();
    saveData();
  }
});

document.querySelector('#add-president-file-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'president') return;
  const file = document.querySelector('#president-file').files[0];
  if (file) {
    presidentFiles.push({ category: document.querySelector('#president-file-category').value, name: file.name, url: URL.createObjectURL(file) });
    document.querySelector('#add-president-file-form').reset();
    updatePresidentFilesList();
    saveData();
  }
});

document.querySelector('#add-secretary-file-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'secretaire') return;
  const file = document.querySelector('#secretary-file').files[0];
  if (file) {
    secretaryFiles.push({ category: document.querySelector('#secretary-file-category').value, name: file.name, url: URL.createObjectURL(file) });
    document.querySelector('#add-secretary-file-form').reset();
    updateSecretaryFilesList();
    saveData();
  }
});

function updateMembersList() {
  const search = document.querySelector('#members-search').value.toLowerCase();
  const list = document.querySelector('#members-list');
  list.innerHTML = members
    .filter(m => `${m.firstname} ${m.lastname}`.toLowerCase().includes(search) || m.code.toLowerCase().includes(search))
    .map(m => `
      <div class="member-card">
        <p><strong>${m.firstname} ${m.lastname}</strong></p>
        <p><strong>Numéro :</strong> ${m.code}</p>
      </div>
    `).join('');
}

function updateContributionsTreasurerList() {
  const search = document.querySelector('#contributions-treasurer-search').value.toLowerCase();
  const list = document.querySelector('#contributions-treasurer-list');
  list.innerHTML = members
    .filter(m => `${m.firstname} ${m.lastname}`.toLowerCase().includes(search) || m.code.toLowerCase().includes(search))
    .map(m => `
      <div class="contribution-card">
        <h4>${m.firstname} ${m.lastname} (${m.code})</h4>
        ${contributions.map(c => `
          <div>
            <h5>${c.name} (${c.amount} FCFA)</h5>
            ${c.name === 'Mensuelle' ? c.years.map(year => `
              <p>${year}</p>
              ${months.map((month, index) => `
                <input type="checkbox" id="payment-${m.code}-${year}-${index}" ${m.contributions.find(cont => cont.name === c.name).years[year][index] ? 'checked' : ''} onchange="updateMonthlyPayment('${m.code}', '${year}', ${index}, this.checked)">
                <label for="payment-${m.code}-${year}-${index}">${month}</label>
              `).join('')}
            `).join('') : `
              <input type="checkbox" id="payment-${m.code}-${c.name}" ${m.contributions.find(cont => cont.name === c.name).paid ? 'checked' : ''} onchange="updatePayment('${m.code}', '${c.name}', this.checked)">
              <label for="payment-${m.code}-${c.name}">Payé</label>
              <input type="number" placeholder="Montant partiel" value="${m.contributions.find(cont => cont.name === c.name).partial || 0}" onchange="updatePartialPayment('${m.code}', '${c.name}', this.value)">
              <p>Statut: ${m.contributions.find(cont => cont.name === c.name).paid ? 'Payé' : `Non payé (${m.contributions.find(cont => cont.name === c.name).partial || 0} FCFA)`}</p>
            `}
          </div>
        `).join('')}
      </div>
    `).join('');
}

function updateMonthlyPayment(memberCode, year, monthIndex, paid) {
  if (!currentUser || currentUser.role !== 'tresorier') return;
  const member = members.find(m => m.code === memberCode);
  member.contributions.find(c => c.name === 'Mensuelle').years[year][monthIndex] = paid;
  updateContributionsTreasurerList();
  updatePersonalInfo();
  updateStats();
  saveData();
}

function updatePayment(memberCode, contributionName, paid) {
  if (!currentUser || currentUser.role !== 'tresorier') return;
  const member = members.find(m => m.code === memberCode);
  member.contributions.find(c => c.name === contributionName).paid = paid;
  if (paid) member.contributions.find(c => c.name === contributionName).partial = 0;
  updateContributionsTreasurerList();
  updatePersonalInfo();
  updateStats();
  saveData();
}

function updatePartialPayment(memberCode, contributionName, amount) {
  if (!currentUser || currentUser.role !== 'tresorier') return;
  const member = members.find(m => m.code === memberCode);
  member.contributions.find(c => c.name === contributionName).partial = parseInt(amount) || 0;
  updateContributionsTreasurerList();
  updatePersonalInfo();
  updateStats();
  saveData();
}

function updateEditMembersList() {
  const search = document.querySelector('#edit-member-search').value.toLowerCase();
  const list = document.querySelector('#edit-members-list');
  list.innerHTML = members
    .filter(m => `${m.firstname} ${m.lastname}`.toLowerCase().includes(search) || m.code.toLowerCase().includes(search))
    .map(m => `
      <div class="member-card">
        <p><strong>Prénom :</strong> ${m.firstname}</p>
        <p><strong>Nom :</strong> ${m.lastname}</p>
        <button class="cta-button" onclick="editMember('${m.code}')">Modifier</button>
        <button class="cta-button" onclick="deleteMember('${m.code}')">Supprimer</button>
      </div>
    `).join('');
}

function editMember(code) {
  const member = members.find(m => m.code === code);
  document.querySelector('#new-member-firstname').value = member.firstname;
  document.querySelector('#new-member-lastname').value = member.lastname;
  document.querySelector('#new-member-age').value = member.age || '';
  document.querySelector('#new-member-dob').value = member.dob || '';
  document.querySelector('#new-member-birthplace').value = member.birthplace || '';
  document.querySelector('#new-member-email').value = member.email || '';
  document.querySelector('#new-member-activity').value = member.activity || '';
  document.querySelector('#new-member-address').value = member.address || '';
  document.querySelector('#new-member-phone').value = member.phone || '';
  document.querySelector('#new-member-residence').value = member.residence || '';
  document.querySelector('#new-member-role').value = member.role;
  document.querySelector('#new-member-status').value = member.status;
  showTab('add-member');
}

function deleteMember(code) {
  if (!currentUser || currentUser.role !== 'admin') return;
  document.querySelector('#delete-member-form').dataset.memberCode = code;
  document.querySelector('#delete-member-form').style.display = 'block';
}

function updateEventsList() {
  const search = document.querySelector('#events-search').value.toLowerCase();
  const list = document.querySelector('#events-list');
  list.innerHTML = events
    .filter(e => e.name.toLowerCase().includes(search) || e.description.toLowerCase().includes(search))
    .map(e => `
      <div class="event-card">
        <h4>${e.name}</h4>
        <p>${e.description}</p>
        <p>Date: ${e.date} ${e.time}</p>
        ${e.image ? `<img src="${e.image}" alt="${e.name}" style="max-width: 100%; border-radius: 10px;">` : ''}
      </div>
    `).join('');
}

function updateEventsAdminList() {
  const search = document.querySelector('#events-admin-search').value.toLowerCase();
  const list = document.querySelector('#events-admin-list');
  list.innerHTML = events
    .filter(e => e.name.toLowerCase().includes(search) || e.description.toLowerCase().includes(search))
    .map((e, index) => `
      <div class="event-card">
        <h4>${e.name}</h4>
        <p>${e.description}</p>
        <p>Date: ${e.date} ${e.time}</p>
        ${e.image ? `<img src="${e.image}" alt="${e.name}" style="max-width: 100%; border-radius: 10px;">` : ''}
        <button class="cta-button" onclick="deleteEvent(${index})">Supprimer</button>
      </div>
    `).join('');
}

function deleteEvent(index) {
  if (!currentUser || currentUser.role !== 'admin') return;
  events.splice(index, 1);
  updateEventsList();
  updateEventsAdminList();
  updateEventsCountdown();
  saveData();
}

function updateGalleryContent() {
  const content = document.querySelector('#gallery-content');
  content.innerHTML = gallery
    .map(g => `
      <div>
        ${g.type === 'image' ? `<img src="${g.url}" alt="Galerie">` : `<video src="${g.url}" controls></video>`}
      </div>
    `).join('');
}

function updateGalleryAdminList() {
  const list = document.querySelector('#gallery-admin-list');
  list.innerHTML = gallery
    .map((g, index) => `
      <div>
        ${g.type === 'image' ? `<img src="${g.url}" alt="Galerie" style="max-width: 100%; border-radius: 10px;">` : `<video src="${g.url}" controls style="max-width: 100%; border-radius: 10px;"></video>`}
        <button class="cta-button" onclick="deleteGalleryItem(${index})">Supprimer</button>
      </div>
    `).join('');
}

function deleteGalleryItem(index) {
  if (!currentUser || currentUser.role !== 'admin') return;
  gallery.splice(index, 1);
  updateGalleryContent();
  updateGalleryAdminList();
  saveData();
}

function updateMessagesList() {
  const list = document.querySelector('#messages-list');
  list.innerHTML = messages
    .slice().reverse()
    .map(m => `
      <div class="message-card">
        <h4>${m.title}</h4>
        <p>${m.text}</p>
        <p><small>${new Date(m.date).toLocaleString()}</small></p>
      </div>
    `).join('');
}

function updateMessagesAdminList() {
  const list = document.querySelector('#messages-admin-list');
  list.innerHTML = messages
    .slice().reverse()
    .map((m, index) => `
      <div class="message-card">
        <h4>${m.title}</h4>
        <p>${m.text}</p>
        <p><small>${new Date(m.date).toLocaleString()}</small></p>
        <button class="cta-button" onclick="deleteMessage(${index})">Supprimer</button>
      </div>
    `).join('');
}

function deleteMessage(index) {
  if (!currentUser || currentUser.role !== 'admin') return;
  messages.splice(index, 1);
  updateMessagesList();
  updateMessagesAdminList();
  saveData();
}

function updateAutoMessagesList() {
  const search = document.querySelector('#auto-messages-search').value.toLowerCase();
  const list = document.querySelector('#auto-messages-list');
  list.innerHTML = autoMessages
    .filter(m => m.name.toLowerCase().includes(search) || m.text.toLowerCase().includes(search))
    .map((m, index) => `
      <div class="message-card">
        <h4>${m.name}</h4>
        <p>${m.text}</p>
        <p>Date: ${m.date} ${m.time}</p>
        <p>Statut: ${m.sent ? 'Envoyé' : 'En attente'}</p>
        <button class="cta-button" onclick="deleteAutoMessage(${index})">Supprimer</button>
      </div>
    `).join('');
}

function deleteAutoMessage(index) {
  if (!currentUser || currentUser.role !== 'admin') return;
  autoMessages.splice(index, 1);
  updateAutoMessagesList();
  saveData();
}

function updateNotesList() {
  const search = document.querySelector('#notes-search').value.toLowerCase();
  const list = document.querySelector('#notes-list');
  list.innerHTML = notes
    .filter(n => n.theme.toLowerCase().includes(search) || n.text.toLowerCase().includes(search))
    .map((n, index) => `
      <div class="note-card">
        <h4>${n.theme}</h4>
        <p>${n.text}</p>
        <button class="cta-button" onclick="deleteNote(${index})">Supprimer</button>
      </div>
    `).join('');
}

function deleteNote(index) {
  if (!currentUser || currentUser.role !== 'admin') return;
  notes.splice(index, 1);
  updateNotesList();
  saveData();
}

function updateInternalDocsList() {
  const search = document.querySelector('#internal-docs-search').value.toLowerCase();
  const list = document.querySelector('#internal-docs-list');
  list.innerHTML = internalDocs
    .filter(d => d.category.toLowerCase().includes(search) || d.name.toLowerCase().includes(search))
    .map((d, index) => `
      <div class="file-card">
        <p><strong>Catégorie :</strong> ${d.category}</p>
        <p><strong>Nom :</strong> ${d.name}</p>
        <a href="${d.url}" target="_blank">Ouvrir</a>
        <button class="cta-button" onclick="deleteInternalDoc(${index})">Supprimer</button>
      </div>
    `).join('');
}

function deleteInternalDoc(index) {
  if (!currentUser || currentUser.role !== 'admin') return;
  internalDocs.splice(index, 1);
  updateInternalDocsList();
  saveData();
}

function updatePresidentFilesList() {
  const search = document.querySelector('#president-files-search').value.toLowerCase();
  const list = document.querySelector('#president-files-list');
  list.innerHTML = presidentFiles
    .filter(f => f.category.toLowerCase().includes(search) || f.name.toLowerCase().includes(search))
    .map((f, index) => `
      <div class="file-card">
        <p><strong>Catégorie :</strong> ${f.category}</p>
        <p><strong>Nom :</strong> ${f.name}</p>
        <a href="${f.url}" target="_blank">Ouvrir</a>
        <button class="cta-button" onclick="deletePresidentFile(${index})">Supprimer</button>
      </div>
    `).join('');
}

function deletePresidentFile(index) {
  if (!currentUser || currentUser.role !== 'president') return;
  presidentFiles.splice(index, 1);
  updatePresidentFilesList();
  saveData();
}

function updateSecretaryFilesList() {
  const search = document.querySelector('#secretary-files-search').value.toLowerCase();
  const list = document.querySelector('#secretary-files-list');
  list.innerHTML = secretaryFiles
    .filter(f => f.category.toLowerCase().includes(search) || f.name.toLowerCase().includes(search))
    .map((f, index) => `
      <div class="file-card">
        <p><strong>Catégorie :</strong> ${f.category}</p>
        <p><strong>Nom :</strong> ${f.name}</p>
        <a href="${f.url}" target="_blank">Ouvrir</a>
        <button class="cta-button" onclick="deleteSecretaryFile(${index})">Supprimer</button>
      </div>
    `).join('');
}

function deleteSecretaryFile(index) {
  if (!currentUser || currentUser.role !== 'secretaire') return;
  secretaryFiles.splice(index, 1);
  updateSecretaryFilesList();
  saveData();
}

function updateLibraryContent() {
  const search = document.querySelector('#library-search').value.toLowerCase();
  const content = document.querySelector('#library-content');
  content.innerHTML = library
    .filter(l => l.category.toLowerCase().includes(search) || l.name.toLowerCase().includes(search))
    .map(l => `
      <div class="file-card">
        <p><strong>Catégorie :</strong> ${l.category}</p>
        <p><strong>Nom :</strong> ${l.name}</p>
        <a href="${l.url}" target="_blank">Ouvrir</a>
      </div>
    `).join('');
}

function updateSuggestionsList() {
  const search = document.querySelector('#suggestions-search').value.toLowerCase();
  const list = document.querySelector('#suggestions-list');
  list.innerHTML = suggestions
    .filter(s => s.member.toLowerCase().includes(search) || s.text.toLowerCase().includes(search))
    .map((s, index) => `
      <div class="suggestion-card">
        <p><strong>Membre :</strong> ${s.member}</p>
        <p>${s.text}</p>
        <p><small>${new Date(s.date).toLocaleString()}</small></p>
        <button class="cta-button" onclick="deleteSuggestion(${index})">Supprimer</button>
      </div>
    `).join('');
}

function deleteSuggestion(index) {
  if (!currentUser || currentUser.role !== 'admin') return;
  suggestions.splice(index, 1);
  updateSuggestionsList();
  saveData();
}

function updatePersonalInfo() {
  if (!currentUser) return;
  const info = document.querySelector('#personal-info');
  const contributionsDiv = document.querySelector('#personal-contributions');
  info.innerHTML = `
    <p><strong>Prénom :</strong> ${currentUser.firstname}</p>
    <p><strong>Nom :</strong> ${currentUser.lastname}</p>
    <p><strong>Numéro :</strong> ${currentUser.code}</p>
    ${currentUser.email ? `<p><strong>Email :</strong> ${currentUser.email}</p>` : ''}
    ${currentUser.phone ? `<p><strong>Téléphone :</strong> ${currentUser.phone}</p>` : ''}
    ${currentUser.address ? `<p><strong>Adresse :</strong> ${currentUser.address}</p>` : ''}
    ${currentUser.activity ? `<p><strong>Activité :</strong> ${currentUser.activity}</p>` : ''}
  `;
  contributionsDiv.innerHTML = currentUser.contributions.map(c => `
    <div class="contribution-card">
      <h4>${c.name} (${c.amount} FCFA)</h4>
      ${c.name === 'Mensuelle' ? Object.keys(c.years).map(year => `
        <p>${year} - Payé: ${c.years[year].map((paid, i) => paid ? months[i] : '').filter(m => m).join(', ') || 'Aucun'}</p>
        <p>${year} - Non payé: ${c.years[year].map((paid, i) => !paid ? months[i] : '').filter(m => m).join(', ') || 'Aucun'}</p>
      `).join('') : `
        <p>Statut: ${c.paid ? 'Payé' : `Non payé (${c.partial || 0} FCFA)`}</p>
      `}
    </div>
  `).join('');
}

function updateCoranContent() {
  const search = document.querySelector('#coran-search').value.toLowerCase();
  const content = document.querySelector('#coran-content');
  content.innerHTML = Array.from({ length: 30 }, (_, i) => i + 1)
    .filter(j => `juz ${j}`.includes(search))
    .map(j => `
      <div class="file-card">
        <p><strong>Juz ${j}</strong></p>
        <a href="assets/coran/juz${j}.pdf" target="_blank">Ouvrir</a>
      </div>
    `).join('');
}

function updateStats() {
  const totalAmount = members.reduce((sum, m) => sum + m.contributions.reduce((s, c) => s + (c.name === 'Mensuelle' ? Object.values(c.years).flat().filter(p => p).length * c.amount : c.paid ? c.amount : c.partial || 0), 0), 0);
  const membersByStatus = members.reduce((acc, m) => ({ ...acc, [m.status]: (acc[m.status] || 0) + 1 }), {});
  const contributionsByYear = contributions.find(c => c.name === 'Mensuelle')?.years.reduce((acc, year) => ({
    ...acc,
    [year]: members.reduce((sum, m) => sum + m.contributions.find(c => c.name === 'Mensuelle').years[year].filter(p => p).length, 0)
  }), {}) || {};

  new Chart(document.getElementById('stats-total-amount'), {
    type: 'bar',
    data: {
      labels: ['Montant Total'],
      datasets: [{ label: 'FCFA', data: [totalAmount], backgroundColor: '#9b9c28' }]
    },
    options: { scales: { y: { beginAtZero: true } } }
  });

  new Chart(document.getElementById('stats-members'), {
    type: 'pie',
    data: {
      labels: ['Actif', 'Inactif', 'Liste noire'],
      datasets: [{ data: [membersByStatus.actif || 0, membersByStatus.inactif || 0, membersByStatus['liste-noire'] || 0], backgroundColor: ['#9b9c28', '#778152', '#3a6241'] }]
    }
  });

  new Chart(document.getElementById('stats-status'), {
    type: 'bar',
    data: {
      labels: ['Actif', 'Inactif', 'Liste noire'],
      datasets: [{ label: 'Membres', data: [membersByStatus.actif || 0, membersByStatus.inactif || 0, membersByStatus['liste-noire'] || 0], backgroundColor: '#9b9c28' }]
    },
    options: { scales: { y: { beginAtZero: true } } }
  });

  new Chart(document.getElementById('stats-contributions'), {
    type: 'bar',
    data: {
      labels: Object.keys(contributionsByYear),
      datasets: [{ label: 'Cotisations Mensuelles', data: Object.values(contributionsByYear), backgroundColor: '#9b9c28' }]
    },
    options: { scales: { y: { beginAtZero: true } } }
  });
}

function updateCallMembersList() {
  const search = document.querySelector('#video-calls-search').value.toLowerCase();
  const list = document.querySelector('#members-call-list');
  list.innerHTML = members
    .filter(m => `${m.firstname} ${m.lastname}`.toLowerCase().includes(search) || m.code.toLowerCase().includes(search))
    .map(m => `
      <div class="member-card">
        <input type="checkbox" id="call-${m.code}" value="${m.code}" onchange="toggleCallMember('${m.code}', this.checked)">
        <label for="call-${m.code}">${m.firstname} ${m.lastname} (${m.code})</label>
      </div>
    `).join('');
}

function toggleCallMember(code, checked) {
  if (checked) {
    selectedCallMembers.push(code);
  } else {
    selectedCallMembers = selectedCallMembers.filter(c => c !== code);
  }
}

function toggleCallAll(checked) {
  selectedCallMembers = checked ? members.map(m => m.code) : [];
  updateCallMembersList();
}

function startCall(type) {
  if (!selectedCallMembers.length) {
    alert('Veuillez sélectionner au moins un membre.');
    return;
  }
  const container = document.querySelector('#video-call-container');
  container.innerHTML = '';
  const room = document.createElement('where-by');
  room.setAttribute('room', 'https://ansar.whereby.com/conference');
  room.setAttribute('displayName', currentUser ? `${currentUser.firstname} ${currentUser.lastname}` : 'Invité');
  room.setAttribute('audio', type === 'audio' ? 'true' : 'false');
  room.setAttribute('video', type === 'video' ? 'true' : 'false');
  container.appendChild(room);
}

document.addEventListener('DOMContentLoaded', () => {
  showPage('home');
  updateEventsCountdown();
  checkAutoMessages();
  updateContributionsYears();
});
