// Import des fonctions Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getDatabase, ref, onValue, push, remove, update } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB7-fXR59CqNMyYgZTDAdBNpMTE_GkcOlA",
  authDomain: "ansar-93d9e.firebaseapp.com",
  databaseURL: "https://ansar-93d9e-default-rtdb.firebaseio.com",
  projectId: "ansar-93d9e",
  storageBucket: "ansar-93d9e.firebasestorage.app",
  messagingSenderId: "697623655771",
  appId: "1:697623655771:web:2487489b5825ab211f567e",
  measurementId: "G-N3LBBHM2N0"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let currentUser = null;
let isChatOpen = false;
let selectedCallMembers = [];
let secretEntryTimeout;

function showPage(pageId) {
  const pages = document.querySelectorAll('.page');
  const navItems = document.querySelectorAll('.nav-item');
  if (!pages.length || !navItems.length) return;
  pages.forEach(page => page.classList.remove('active'));
  navItems.forEach(item => item.classList.remove('active'));
  const page = document.querySelector(`#${pageId}`);
  const navItem = document.querySelector(`a[onclick="showPage('${pageId}')"]`);
  if (page) page.classList.add('active');
  if (navItem) navItem.classList.add('active');
  if (pageId === 'members') updateMembersList();
  if (pageId === 'events') updateEventsList();
  if (pageId === 'gallery') updateGalleryContent();
  if (pageId === 'messages') updateMessagesList();
  if (pageId === 'coran') updateCoranContent();
  if (pageId === 'personal') {
    const login = document.querySelector('#personal-login');
    const content = document.querySelector('#personal-content');
    if (login && content) {
      login.style.display = currentUser && currentUser.role !== 'admin' ? 'none' : 'block';
      content.style.display = currentUser && currentUser.role !== 'admin' ? 'block' : 'none';
      if (currentUser && currentUser.role !== 'admin') updatePersonalInfo();
    }
  }
  if (pageId === 'library') updateLibraryContent();
  if (pageId === 'home') updateMessagePopups();
  if (pageId === 'secret') showTab('add-member');
  if (pageId === 'treasurer-secret') showTab('treasurer-contributions');
  if (pageId === 'president-secret') showTab('president-files');
  if (pageId === 'secretary-secret') showTab('secretary-files');
}

function showTab(tabId) {
  const tabs = document.querySelectorAll('.tab-content');
  const buttons = document.querySelectorAll('.tab-button');
  if (!tabs.length || !buttons.length) return;
  tabs.forEach(tab => tab.classList.remove('active'));
  buttons.forEach(btn => btn.classList.remove('active'));
  const tab = document.querySelector(`#${tabId}`);
  const button = document.querySelector(`button[onclick="showTab('${tabId}')"]`);
  if (tab) tab.classList.add('active');
  if (button) button.classList.add('active');
  if (tabId === 'edit-member') updateEditMembersList();
  if (tabId === 'gallery-admin') updateGalleryAdminList();
  if (tabId === 'events-admin') updateEventsAdminList();
  if (tabId === 'messages-admin') updateMessagesAdminList();
  if (tabId === 'notes') updateNotesList();
  if (tabId === 'internal-docs') updateInternalDocsList();
  if (tabId === 'suggestions-admin') updateSuggestionsList();
  if (tabId === 'stats') updateStats();
  if (tabId === 'video-calls') initVideoCall();
  if (tabId === 'auto-messages') updateAutoMessagesList();
  if (tabId === 'treasurer-contributions') updateContributionsAdminList();
  if (tabId === 'president-files') updatePresidentFilesList();
  if (tabId === 'president-notes') updatePresidentNotesList();
  if (tabId === 'secretary-files') updateSecretaryFilesList();
  if (tabId === 'secretary-notes') updateSecretaryNotesList();
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
}

function updateEventCountdowns() {
  onValue(ref(database, 'events'), snapshot => {
    const events = snapshot.val() ? Object.values(snapshot.val()) : [];
    const countdowns = document.getElementById('event-countdowns');
    if (!countdowns) return;
    countdowns.innerHTML = events.map(event => {
      const eventDate = new Date(event.datetime);
      const now = new Date();
      const diff = eventDate - now;
      if (diff <= 0 && diff > -30 * 60 * 1000) {
        return `<div id="countdown-${event.name}">Événement ${event.name} : EN COURS</div>`;
      } else if (diff <= -30 * 60 * 1000) {
        return '';
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      return `<div id="countdown-${event.name}">Événement ${event.name} : JOUR J - ${days}j ${hours}h ${minutes}m ${seconds}s</div>`;
    }).join('');
  });
}

setInterval(updateEventCountdowns, 1000);
setInterval(checkAutoMessages, 60000);

document.querySelector('#settings-language')?.addEventListener('change', (e) => {
  // Language change handled in settings
});

function toggleChatbot() {
  isChatOpen = !isChatOpen;
  const chatbot = document.querySelector('#chatbot');
  if (chatbot) {
    chatbot.style.display = isChatOpen ? 'block' : 'none';
    if (isChatOpen) {
      const messages = document.querySelector('#chatbot-messages');
      if (messages) {
        messages.innerHTML = '<div class="chatbot-message received">Bienvenue ! Posez une question ou utilisez un mot-clé comme "association", "membre", "cotisation", etc.</div>';
      }
    } else {
      clearTimeout(secretEntryTimeout);
      const secretEntry = document.querySelector('#secret-entry');
      if (secretEntry) secretEntry.style.display = 'none';
    }
  }
}

document.addEventListener('click', (e) => {
  const chatbot = document.querySelector('#chatbot');
  const chatbotButton = document.querySelector('.chatbot-button');
  if (isChatOpen && chatbot && chatbotButton && !chatbot.contains(e.target) && !chatbotButton.contains(e.target)) {
    toggleChatbot();
  }
});

document.querySelector('.chatbot-button')?.addEventListener('click', () => {
  console.log('Chatbot cliqué');
  toggleChatbot();
});

function clearChatHistory() {
  const messages = document.querySelector('#chatbot-messages');
  const secretEntry = document.querySelector('#secret-entry');
  if (messages) {
    messages.innerHTML = '<div class="chatbot-message received">Historique effacé. Posez une question ou utilisez un mot-clé.</div>';
  }
  if (secretEntry) {
    secretEntry.style.display = 'none';
    clearTimeout(secretEntryTimeout);
  }
}

document.querySelector('#chatbot-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.querySelector('#chatbot-input');
  const message = input?.value;
  if (!message) return;
  const messages = document.querySelector('#chatbot-messages');
  if (messages) {
    messages.innerHTML += `<div class="chatbot-message sent">${message}</div>`;
    const secretCodes = ['ADMIN12301012000', '00000000', '11111111', '22222222'];
    if (secretCodes.includes(message)) {
      const secretEntry = document.querySelector('#secret-entry');
      if (secretEntry) {
        secretEntry.style.display = 'block';
        secretEntryTimeout = setTimeout(() => {
          secretEntry.style.display = 'none';
        }, 30000);
      }
    } else {
      const response = getChatbotResponse(message);
      messages.innerHTML += `<div class="chatbot-message received">${response}</div>`;
    }
    input.value = '';
    messages.scrollTop = messages.scrollHeight;
  }
});

function getChatbotResponse(message) {
  const keywords = {
    association: "Ansar Al Mouyassar est une association dédiée à la communauté, offrant des services comme la gestion des membres, des événements, et des cotisations.",
    membre: "Les membres peuvent s'inscrire via l'espace admin et gérer leurs informations personnelles dans l'espace personnel.",
    cotisation: "Les cotisations sont gérées par le trésorier dans l'espace trésorier, avec des options pour marquer les paiements mensuels."
  };
  for (const [key, response] of Object.entries(keywords)) {
    if (message.toLowerCase().includes(key)) {
      return response;
    }
  }
  return "Désolé, je n'ai pas compris votre demande. Essayez des mots-clés comme 'association', 'membre', ou 'cotisation'.";
}

function enterSecret() {
  const password = document.querySelector('#secret-password')?.value;
  const adminCodes = ['JESUISMEMBRE66', '33333333', '44444444', '55555555'];
  const treasurerCodes = ['JESUISTRESORIER444', '66666666', '77777777', '88888888'];
  const presidentCodes = ['PRESIDENT000', '99999999', '11112222', '33334444'];
  const secretaryCodes = ['SECRETAIRE000', '55556666', '77778888', '99990000'];
  const messages = document.querySelector('#chatbot-messages');
  if (adminCodes.includes(password)) {
    currentUser = { code: 'ADMIN123', role: 'admin' };
    showPage('secret');
    toggleChatbot();
  } else if (treasurerCodes.includes(password)) {
    currentUser = { code: 'TRESORIER', role: 'tresorier' };
    showPage('treasurer-secret');
    toggleChatbot();
  } else if (presidentCodes.includes(password)) {
    currentUser = { code: 'PRESIDENT', role: 'president' };
    showPage('president-secret');
    toggleChatbot();
  } else if (secretaryCodes.includes(password)) {
    currentUser = { code: 'SECRETAIRE', role: 'secretaire' };
    showPage('secretary-secret');
    toggleChatbot();
  } else if (messages) {
    messages.innerHTML += '<div class="chatbot-message received">Mot de passe incorrect.</div>';
  }
}

document.querySelector('#personal-login-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const code = document.querySelector('#personal-member-code')?.value;
  const password = document.querySelector('#personal-password')?.value;
  const errorMessage = document.querySelector('#personal-error-message');
  if (!code || !password || !errorMessage) return;

  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[012])(19|20)\d\d$/;
  if (!dateRegex.test(password)) {
    errorMessage.textContent = 'Mot de passe invalide (format : JJMMAAAA)';
    errorMessage.style.display = 'block';
    return;
  }

  onValue(ref(database, 'members'), snapshot => {
    const members = snapshot.val() ? Object.entries(snapshot.val()).map(([id, m]) => ({ id, ...m })) : [];
    const member = members.find(m => m.code === code);
    if (member && member.dob === password) {
      currentUser = member;
      const title = document.querySelector('#personal-title');
      if (title) title.textContent = `Espace de ${member.firstname} ${member.lastname}`;
      const login = document.querySelector('#personal-login');
      const content = document.querySelector('#personal-content');
      if (login && content) {
        login.style.display = 'none';
        content.style.display = 'block';
      }
      updatePersonalInfo();
    } else {
      errorMessage.textContent = 'Numéro de membre ou mot de passe incorrect';
      errorMessage.style.display = 'block';
    }
  }, { onlyOnce: true });
});

function logoutPersonal() {
  currentUser = null;
  const login = document.querySelector('#personal-login');
  const content = document.querySelector('#personal-content');
  if (login && content) {
    login.style.display = 'block';
    content.style.display = 'none';
  }
  showPage('home');
}

document.querySelector('#add-member-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  onValue(ref(database, 'members'), snapshot => {
    const members = snapshot.val() ? Object.values(snapshot.val()) : [];
    const member = {
      code: `${(members.length + 1).toString().padStart(3, '0')}`,
      firstname: document.querySelector('#new-member-firstname')?.value || '',
      lastname: document.querySelector('#new-member-lastname')?.value || '',
      age: parseInt(document.querySelector('#new-member-age')?.value) || null,
      dob: document.querySelector('#new-member-dob')?.value || null,
      birthplace: document.querySelector('#new-member-birthplace')?.value || null,
      photo: document.querySelector('#new-member-photo')?.files[0] ? URL.createObjectURL(document.querySelector('#new-member-photo').files[0]) : null,
      email: document.querySelector('#new-member-email')?.value || null,
      activity: document.querySelector('#new-member-activity')?.value || null,
      address: document.querySelector('#new-member-address')?.value || null,
      phone: document.querySelector('#new-member-phone')?.value || null,
      residence: document.querySelector('#new-member-residence')?.value || null,
      role: document.querySelector('#new-member-role')?.value || 'membre',
      status: document.querySelector('#new-member-status')?.value || 'actif',
      contributions: { 'Mensuelle': { '2023': Array(12).fill(false), '2024': Array(12).fill(false), '2025': Array(12).fill(false) } }
    };
    push(ref(database, 'members'), member);
    document.querySelector('#add-member-form').reset();
  }, { onlyOnce: true });
});

document.querySelector('#delete-member-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const code = document.querySelector('#delete-member-code')?.value;
  if (code !== '0000') {
    alert('Code président incorrect');
    return;
  }
  const memberId = document.querySelector('#delete-member-form').dataset.memberId;
  if (memberId) {
    remove(ref(database, `members/${memberId}`));
    document.querySelector('#delete-member-form').style.display = 'none';
  }
});

document.querySelector('#add-contribution-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'tresorier') return;
  const name = document.querySelector('#contribution-name')?.value;
  const amount = parseInt(document.querySelector('#contribution-amount')?.value);
  if (!name || !amount) return;
  const currentYear = new Date().getFullYear().toString();
  const contribution = { name, amount, years: [currentYear] };
  push(ref(database, 'contributions'), contribution);
  onValue(ref(database, 'members'), snapshot => {
    const members = snapshot.val() ? Object.entries(snapshot.val()).map(([id, m]) => ({ id, ...m })) : [];
    members.forEach((member, index) => {
      if (!member.contributions[name]) {
        member.contributions[name] = { [currentYear]: Array(12).fill(false) };
        update(ref(database, `members/${members[index].id}`), { contributions: member.contributions });
      }
    });
  }, { onlyOnce: true });
  document.querySelector('#add-contribution-form').reset();
});

document.querySelector('#suggestion-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser) return;
  const text = document.querySelector('#suggestion-text')?.value;
  if (text) {
    push(ref(database, 'suggestions'), { member: `${currentUser.firstname} ${currentUser.lastname}`, text, timestamp: new Date().toISOString() });
    document.querySelector('#suggestion-form').reset();
  }
});

document.querySelector('#add-gallery-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const file = document.querySelector('#gallery-file')?.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      push(ref(database, 'gallery'), { type: file.type.startsWith('image') ? 'image' : 'video', url: reader.result, name: file.name });
      document.querySelector('#add-gallery-form').reset();
    };
    reader.readAsDataURL(file);
  }
});

document.querySelector('#add-event-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const file = document.querySelector('#event-file')?.files[0];
  const event = {
    name: document.querySelector('#event-name')?.value || '',
    description: document.querySelector('#event-description')?.value || '',
    datetime: new Date(`${document.querySelector('#event-date')?.value}T${document.querySelector('#event-time')?.value}`).toISOString()
  };
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      event.image = reader.result;
      push(ref(database, 'events'), event);
      document.querySelector('#add-event-form').reset();
    };
    reader.readAsDataURL(file);
  } else {
    push(ref(database, 'events'), event);
    document.querySelector('#add-event-form').reset();
  }
});

document.querySelector('#add-message-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const title = document.querySelector('#message-title')?.value;
  const text = document.querySelector('#message-text')?.value;
  if (title && text) {
    push(ref(database, 'messages'), { title, text, date: new Date().toISOString() });
    document.querySelector('#add-message-form').reset();
    sendNotification('Nouveau message', `${title}: ${text}`);
  }
});

document.querySelector('#add-auto-message-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const autoMessage = {
    name: document.querySelector('#auto-message-name')?.value || '',
    text: document.querySelector('#auto-message-text')?.value || '',
    datetime: new Date(`${document.querySelector('#auto-message-date')?.value}T${document.querySelector('#auto-message-time')?.value}`).toISOString()
  };
  push(ref(database, 'autoMessages'), autoMessage);
  document.querySelector('#add-auto-message-form').reset();
});

document.querySelector('#add-note-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const note = {
    theme: document.querySelector('#note-theme')?.value || '',
    text: document.querySelector('#note-text')?.value || ''
  };
  push(ref(database, 'notes'), note);
  document.querySelector('#add-note-form').reset();
});

document.querySelector('#add-president-file-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'president') return;
  const file = document.querySelector('#president-file')?.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      push(ref(database, 'presidentFiles'), { name: file.name, url: reader.result, category: document.querySelector('#president-file-category')?.value || '' });
      document.querySelector('#add-president-file-form').reset();
    };
    reader.readAsDataURL(file);
  }
});

document.querySelector('#add-president-note-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'president') return;
  const note = {
    theme: document.querySelector('#president-note-theme')?.value || '',
    text: document.querySelector('#president-note-text')?.value || ''
  };
  push(ref(database, 'presidentNotes'), note);
  document.querySelector('#add-president-note-form').reset();
});

document.querySelector('#add-secretary-file-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'secretaire') return;
  const file = document.querySelector('#secretary-file')?.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      push(ref(database, 'secretaryFiles'), { name: file.name, url: reader.result, category: document.querySelector('#secretary-file-category')?.value || '' });
      document.querySelector('#add-secretary-file-form').reset();
    };
    reader.readAsDataURL(file);
  }
});

document.querySelector('#add-secretary-note-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'secretaire') return;
  const note = {
    theme: document.querySelector('#secretary-note-theme')?.value || '',
    text: document.querySelector('#secretary-note-text')?.value || ''
  };
  push(ref(database, 'secretaryNotes'), note);
  document.querySelector('#add-secretary-note-form').reset();
});

function updateMembersList() {
  const search = document.querySelector('#members-search')?.value.toLowerCase() || '';
  onValue(ref(database, 'members'), snapshot => {
    const members = snapshot.val() ? Object.entries(snapshot.val()).map(([id, m]) => ({ id, ...m })) : [];
    const list = document.querySelector('#members-list');
    if (list) {
      list.innerHTML = members
        .filter(m => `${m.firstname} ${m.lastname}`.toLowerCase().includes(search) || m.code.toLowerCase().includes(search))
        .map(m => `
          <div class="member-card">
            <p><strong>${m.firstname} ${m.lastname}</strong></p>
            <p><strong>Numéro :</strong> ${m.code}</p>
          </div>
        `).join('');
    }
  });
}

function updateContributionsAdminList() {
  if (!currentUser || currentUser.role !== 'tresorier') return;
  const search = document.querySelector('#contributions-admin-search')?.value.toLowerCase() || '';
  onValue(ref(database, 'contributions'), snapshot => {
    const contributions = snapshot.val() ? Object.values(snapshot.val()) : [];
    onValue(ref(database, 'members'), membersSnapshot => {
      const members = membersSnapshot.val() ? Object.entries(membersSnapshot.val()).map(([id, m]) => ({ id, ...m })) : [];
      const list = document.querySelector('#contributions-admin-list');
      if (list) {
        list.innerHTML = contributions
          .filter(c => c.name.toLowerCase().includes(search))
          .map(c => `
            <div class="contribution-card">
              <h4>${c.name} (${c.amount} FCFA)</h4>
              ${members.map(m => `
                <div>
                  <p>${m.firstname} ${m.lastname}</p>
                  ${c.years.map(year => `
                    <h5>${year}</h5>
                    ${['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map((month, i) => `
                      <input type="checkbox" ${m.contributions[c.name][year][i] ? 'checked' : ''} onchange="updateMonthlyPayment('${m.id}', '${c.name}', '${year}', ${i}, this.checked)">
                      <label>${month}</label>
                    `).join('')}
                    <p>Payé: ${m.contributions[c.name][year].map((p, i) => p ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][i] : '').filter(Boolean).join(', ')}</p>
                    <p>Non payé: ${m.contributions[c.name][year].map((p, i) => !p ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][i] : '').filter(Boolean).join(', ')}</p>
                  `).join('')}
                </div>
              `).join('')}
            </div>
          `).join('');
      }
    });
  });
}

function updateMonthlyPayment(memberId, contributionName, year, monthIndex, paid) {
  if (!currentUser || currentUser.role !== 'tresorier') return;
  update(ref(database, `members/${memberId}/contributions/${contributionName}/${year}/${monthIndex}`), paid);
  sendNotification('Mise à jour cotisation', `Cotisation ${contributionName} pour ${year}, ${['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][monthIndex]} marquée comme ${paid ? 'payée' : 'non payée'}.`);
}

function updateEditMembersList() {
  const search = document.querySelector('#edit-member-search')?.value.toLowerCase() || '';
  onValue(ref(database, 'members'), snapshot => {
    const members = snapshot.val() ? Object.entries(snapshot.val()).map(([id, m]) => ({ id, ...m })) : [];
    const list = document.querySelector('#edit-members-list');
    if (list) {
      list.innerHTML = members
        .filter(m => `${m.firstname} ${m.lastname}`.toLowerCase().includes(search) || m.code.toLowerCase().includes(search))
        .map(m => `
          <div class="member-card">
            <p><strong>Prénom :</strong> ${m.firstname}</p>
            <p><strong>Nom :</strong> ${m.lastname}</p>
            <button class="cta-button" onclick="editMember('${m.id}')">Modifier</button>
            <button class="cta-button" onclick="deleteMember('${m.id}')">Supprimer</button>
          </div>
        `).join('');
    }
  });
}

function editMember(id) {
  onValue(ref(database, `members/${id}`), snapshot => {
    const member = snapshot.val();
    if (member) {
      document.querySelector('#new-member-firstname').value = member.firstname || '';
      document.querySelector('#new-member-lastname').value = member.lastname || '';
      document.querySelector('#new-member-age').value = member.age || '';
      document.querySelector('#new-member-dob').value = member.dob || '';
      document.querySelector('#new-member-birthplace').value = member.birthplace || '';
      document.querySelector('#new-member-email').value = member.email || '';
      document.querySelector('#new-member-activity').value = member.activity || '';
      document.querySelector('#new-member-address').value = member.address || '';
      document.querySelector('#new-member-phone').value = member.phone || '';
      document.querySelector('#new-member-residence').value = member.residence || '';
      document.querySelector('#new-member-role').value = member.role || 'membre';
      document.querySelector('#new-member-status').value = member.status || 'actif';
      showTab('add-member');
    }
  }, { onlyOnce: true });
}

function deleteMember(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  const form = document.querySelector('#delete-member-form');
  if (form) {
    form.dataset.memberId = id;
    form.style.display = 'block';
  }
}

function updateEventsList() {
  const search = document.querySelector('#events-search')?.value.toLowerCase() || '';
  onValue(ref(database, 'events'), snapshot => {
    const events = snapshot.val() ? Object.entries(snapshot.val()).map(([id, e]) => ({ id, ...e })) : [];
    const list = document.querySelector('#events-list');
    if (list) {
      list.innerHTML = events
        .filter(e => e.name.toLowerCase().includes(search) || e.description.toLowerCase().includes(search))
        .map(e => `
          <div class="event-card">
            <h4>${e.name}</h4>
            <p>${e.description}</p>
            <p>Date: ${new Date(e.datetime).toLocaleString()}</p>
            ${e.image ? `<img src="${e.image}" alt="${e.name}" style="max-width: 100%; border-radius: 10px;">` : ''}
          </div>
        `).join('');
    }
  });
}

function updateEventsAdminList() {
  const search = document.querySelector('#events-admin-search')?.value.toLowerCase() || '';
  onValue(ref(database, 'events'), snapshot => {
    const events = snapshot.val() ? Object.entries(snapshot.val()).map(([id, e]) => ({ id, ...e })) : [];
    const list = document.querySelector('#events-admin-list');
    if (list) {
      list.innerHTML = events
        .filter(e => e.name.toLowerCase().includes(search) || e.description.toLowerCase().includes(search))
        .map(e => `
          <div class="event-card">
            <h4>${e.name}</h4>
            <p>${e.description}</p>
            <p>Date: ${new Date(e.datetime).toLocaleString()}</p>
            ${e.image ? `<img src="${e.image}" alt="${e.name}" style="max-width: 100%; border-radius: 10px;">` : ''}
            <button class="cta-button" onclick="deleteEvent('${e.id}')">Supprimer</button>
          </div>
        `).join('');
    }
  });
}

function deleteEvent(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  remove(ref(database, `events/${id}`));
}

function updateGalleryContent() {
  onValue(ref(database, 'gallery'), snapshot => {
    const gallery = snapshot.val() ? Object.values(snapshot.val()) : [];
    const content = document.querySelector('#gallery-content');
    if (content) {
      content.innerHTML = gallery
        .map(g => `
          <div>
            ${g.type === 'image' ? `<img src="${g.url}" alt="Galerie">` : `<video src="${g.url}" controls></video>`}
          </div>
        `).join('');
    }
  });
}

function updateGalleryAdminList() {
  const search = document.querySelector('#gallery-admin-search')?.value.toLowerCase() || '';
  onValue(ref(database, 'gallery'), snapshot => {
    const gallery = snapshot.val() ? Object.entries(snapshot.val()).map(([id, g]) => ({ id, ...g })) : [];
    const list = document.querySelector('#gallery-admin-list');
    if (list) {
      list.innerHTML = gallery
        .filter(g => g.name.toLowerCase().includes(search))
        .map(g => `
          <div>
            ${g.type === 'image' ? `<img src="${g.url}" alt="Galerie" style="max-width: 100%; border-radius: 10px;">` : `<video src="${g.url}" controls style="max-width: 100%; border-radius: 10px;"></video>`}
            <button class="cta-button" onclick="deleteGalleryItem('${g.id}')">Supprimer</button>
          </div>
        `).join('');
    }
  });
}

function deleteGalleryItem(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  remove(ref(database, `gallery/${id}`));
}

function updateMessagesList() {
  onValue(ref(database, 'messages'), snapshot => {
    const messages = snapshot.val() ? Object.values(snapshot.val()) : [];
    const list = document.querySelector('#messages-list');
    if (list) {
      list.innerHTML = messages
        .map(m => `
          <div class="message-card">
            <h4>${m.title}</h4>
            <p>${m.text}</p>
            <p><small>${new Date(m.date).toLocaleString()}</small></p>
          </div>
        `).join('');
    }
  });
}

function updateMessagesAdminList() {
  const search = document.querySelector('#messages-admin-search')?.value.toLowerCase() || '';
  onValue(ref(database, 'messages'), snapshot => {
    const messages = snapshot.val() ? Object.entries(snapshot.val()).map(([id, m]) => ({ id, ...m })) : [];
    const list = document.querySelector('#messages-admin-list');
    if (list) {
      list.innerHTML = messages
        .filter(m => m.title.toLowerCase().includes(search) || m.text.toLowerCase().includes(search))
        .map(m => `
          <div class="message-card">
            <h4>${m.title}</h4>
            <p>${m.text}</p>
            <p><small>${new Date(m.date).toLocaleString()}</small></p>
            <button class="cta-button" onclick="deleteMessage('${m.id}')">Supprimer</button>
          </div>
        `).join('');
    }
  });
}

function deleteMessage(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  remove(ref(database, `messages/${id}`));
}

function updateMessagePopups() {
  onValue(ref(database, 'messages'), snapshot => {
    const messages = snapshot.val() ? Object.entries(snapshot.val()).map(([id, m]) => ({ id, ...m })) : [];
    const popups = document.getElementById('message-popups');
    if (popups) {
      popups.innerHTML = messages
        .map(m => `
          <div class="message-popup">
            <h4>${m.title}</h4>
            <p>${m.text}</p>
            <button class="close-button" onclick="deleteMessage('${m.id}')"><span class="material-icons">close</span></button>
          </div>
        `).join('');
    }
  });
}

function checkAutoMessages() {
  const now = new Date();
  onValue(ref(database, 'autoMessages'), snapshot => {
    const autoMessages = snapshot.val() ? Object.entries(snapshot.val()).map(([id, m]) => ({ id, ...m })) : [];
    autoMessages.forEach(m => {
      if (new Date(m.datetime) <= now) {
        push(ref(database, 'messages'), { title: m.name, text: m.text, date: now.toISOString() });
        remove(ref(database, `autoMessages/${m.id}`));
        sendNotification('Message automatisé', `${m.name}: ${m.text}`);
      }
    });
  }, { onlyOnce: true });
}

function updateAutoMessagesList() {
  const search = document.querySelector('#auto-messages-search')?.value.toLowerCase() || '';
  onValue(ref(database, 'autoMessages'), snapshot => {
    const autoMessages = snapshot.val() ? Object.entries(snapshot.val()).map(([id, m]) => ({ id, ...m })) : [];
    const list = document.querySelector('#auto-messages-list');
    if (list) {
      list.innerHTML = autoMessages
        .filter(m => m.name.toLowerCase().includes(search) || m.text.toLowerCase().includes(search))
        .map(m => `
          <div class="message-card">
            <h4>${m.name}</h4>
            <p>${m.text}</p>
            <p>Date: ${new Date(m.datetime).toLocaleString()}</p>
            <button class="cta-button" onclick="deleteAutoMessage('${m.id}')">Supprimer</button>
          </div>
        `).join('');
    }
  });
}

function deleteAutoMessage(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  remove(ref(database, `autoMessages/${id}`));
}

function updateNotesList() {
  const search = document.querySelector('#notes-search')?.value.toLowerCase() || '';
  onValue(ref(database, 'notes'), snapshot => {
    const notes = snapshot.val() ? Object.entries(snapshot.val()).map(([id, n]) => ({ id, ...n })) : [];
    const list = document.querySelector('#notes-list');
    if (list) {
      list.innerHTML = notes
        .filter(n => n.theme.toLowerCase().includes(search) || n.text.toLowerCase().includes(search))
        .map(n => `
          <div class="note-card">
            <p><strong>${n.theme}</strong>: ${n.text}</p>
            <button class="cta-button" onclick="deleteNote('${n.id}')">Supprimer</button>
          </div>
        `).join('');
    }
  });
}

function deleteNote(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  remove(ref(database, `notes/${id}`));
}

function updatePresidentNotesList() {
  const search = document.querySelector('#president-notes-search')?.value.toLowerCase() || '';
  onValue(ref(database, 'presidentNotes'), snapshot => {
    const notes = snapshot.val() ? Object.entries(snapshot.val()).map(([id, n]) => ({ id, ...n })) : [];
    const list = document.querySelector('#president-notes-list');
    if (list) {
      list.innerHTML = notes
        .filter(n => n.theme.toLowerCase().includes(search) || n.text.toLowerCase().includes(search))
        .map(n => `
          <div class="note-card">
            <p><strong>${n.theme}</strong>: ${n.text}</p>
            <button class="cta-button" onclick="deletePresidentNote('${n.id}')">Supprimer</button>
          </div>
        `).join('');
    }
  });
}

function deletePresidentNote(id) {
  if (!currentUser || currentUser.role !== 'president') return;
  remove(ref(database, `presidentNotes/${id}`));
}

function updateSecretaryNotesList() {
  const search = document.querySelector('#secretary-notes-search')?.value.toLowerCase() || '';
  onValue(ref(database, 'secretaryNotes'), snapshot => {
    const notes = snapshot.val() ? Object.entries(snapshot.val()).map(([id, n]) => ({ id, ...n })) : [];
    const list = document.querySelector('#secretary-notes-list');
    if (list) {
      list.innerHTML = notes
        .filter(n => n.theme.toLowerCase().includes(search) || n.text.toLowerCase().includes(search))
        .map(n => `
          <div class="note-card">
            <p><strong>${n.theme}</strong>: ${n.text}</p>
            <button class="cta-button" onclick="deleteSecretaryNote('${n.id}')">Supprimer</button>
          </div>
        `).join('');
    }
  });
}

function deleteSecretaryNote(id) {
  if (!currentUser || currentUser.role !== 'secretaire') return;
  remove(ref(database, `secretaryNotes/${id}`));
}

function updateInternalDocsList() {
  const search = document.querySelector('#internal-docs-search')?.value.toLowerCase() || '';
  onValue(ref(database, 'internalDocs'), snapshot => {
    const internalDocs = snapshot.val() ? Object.entries(snapshot.val()).map(([id, d]) => ({ id, ...d })) : [];
    const list = document.querySelector('#internal-docs-list');
    if (list) {
      list.innerHTML = internalDocs
        .filter(d => d.name.toLowerCase().includes(search) || d.category.toLowerCase().includes(search))
        .map(d => `
          <div class="file-card">
            <p><strong>Catégorie :</strong> ${d.category}</p>
            <a href="${d.url}" download>${d.name}</a>
            <button class="cta-button" onclick="deleteInternalDoc('${d.id}')">Supprimer</button>
          </div>
        `).join('');
    }
  });
}

function deleteInternalDoc(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  remove(ref(database, `internalDocs/${id}`));
}

function updatePresidentFilesList() {
  const search = document.querySelector('#president-files-search')?.value.toLowerCase() || '';
  onValue(ref(database, 'presidentFiles'), snapshot => {
    const presidentFiles = snapshot.val() ? Object.entries(snapshot.val()).map(([id, f]) => ({ id, ...f })) : [];
    const list = document.querySelector('#president-files-list');
    if (list) {
      list.innerHTML = presidentFiles
        .filter(f => f.name.toLowerCase().includes(search) || f.category.toLowerCase().includes(search))
        .map(f => `
          <div class="file-card">
            <p><strong>Catégorie :</strong> ${f.category}</p>
            <a href="${f.url}" download>${f.name}</a>
            <button class="cta-button" onclick="deletePresidentFile('${f.id}')">Supprimer</button>
          </div>
        `).join('');
    }
  });
}

function deletePresidentFile(id) {
  if (!currentUser || currentUser.role !== 'president') return;
  remove(ref(database, `presidentFiles/${id}`));
}

function updateSecretaryFilesList() {
  const search = document.querySelector('#secretary-files-search')?.value.toLowerCase() || '';
  onValue(ref(database, 'secretaryFiles'), snapshot => {
    const secretaryFiles = snapshot.val() ? Object.entries(snapshot.val()).map(([id, f]) => ({ id, ...f })) : [];
    const list = document.querySelector('#secretary-files-list');
    if (list) {
      list.innerHTML = secretaryFiles
        .filter(f => f.name.toLowerCase().includes(search) || f.category.toLowerCase().includes(search))
        .map(f => `
          <div class="file-card">
            <p><strong>Catégorie :</strong> ${f.category}</p>
            <a href="${f.url}" download>${f.name}</a>
            <button class="cta-button" onclick="deleteSecretaryFile('${f.id}')">Supprimer</button>
          </div>
        `).join('');
    }
  });
}

function deleteSecretaryFile(id) {
  if (!currentUser || currentUser.role !== 'secretaire') return;
  remove(ref(database, `secretaryFiles/${id}`));
}

function updateSuggestionsList() {
  const search = document.querySelector('#suggestions-search')?.value.toLowerCase() || '';
  onValue(ref(database, 'suggestions'), snapshot => {
    const suggestions = snapshot.val() ? Object.entries(snapshot.val()).map(([id, s]) => ({ id, ...s })) : [];
    const list = document.querySelector('#suggestions-list');
    if (list) {
      list.innerHTML = suggestions
        .filter(s => s.member.toLowerCase().includes(search) || s.text.toLowerCase().includes(search))
        .map(s => `
          <div class="suggestion-card">
            <p><strong>${s.member}</strong>: ${s.text}</p>
            <p><small>${new Date(s.timestamp).toLocaleString()}</small></p>
            <button class="cta-button" onclick="deleteSuggestion('${s.id}')">Supprimer</button>
          </div>
        `).join('');
    }
  });
}

function deleteSuggestion(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  remove(ref(database, `suggestions/${id}`));
}

function updatePersonalInfo() {
  if (!currentUser) return;
  onValue(ref(database, 'contributions'), snapshot => {
    const contributions = snapshot.val() ? Object.values(snapshot.val()) : [];
    const info = document.querySelector('#personal-info');
    const contributionsDiv = document.querySelector('#personal-contributions');
    if (info) {
      info.innerHTML = `
        <p><strong>Prénom :</strong> ${currentUser.firstname}</p>
        <p><strong>Nom :</strong> ${currentUser.lastname}</p>
        <p><strong>Numéro :</strong> ${currentUser.code}</p>
        ${currentUser.age ? `<p><strong>Âge :</strong> ${currentUser.age}</p>` : ''}
        ${currentUser.dob ? `<p><strong>Date de naissance :</strong> ${currentUser.dob}</p>` : ''}
        ${currentUser.birthplace ? `<p><strong>Lieu de naissance :</strong> ${currentUser.birthplace}</p>` : ''}
        ${currentUser.email ? `<p><strong>Email :</strong> ${currentUser.email}</p>` : ''}
        ${currentUser.activity ? `<p><strong>Activité :</strong> ${currentUser.activity}</p>` : ''}
        ${currentUser.address ? `<p><strong>Adresse :</strong> ${currentUser.address}</p>` : ''}
        ${currentUser.phone ? `<p><strong>Téléphone :</strong> ${currentUser.phone}</p>` : ''}
        ${currentUser.residence ? `<p><strong>Résidence :</strong> ${currentUser.residence}</p>` : ''}
        <p><strong>Statut :</strong> ${currentUser.status}</p>
      `;
    }
    if (contributionsDiv) {
      contributionsDiv.innerHTML = contributions.map(c => `
        <div class="contribution-card">
          <h4>${c.name} (${c.amount} FCFA)</h4>
          ${c.years.map(year => `
            <h5>${year}</h5>
            ${['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map((month, i) => `
              <p>${month}: ${currentUser.contributions[c.name][year][i] ? 'Payé' : 'Non payé'}</p>
            `).join('')}
          `).join('')}
        </div>
      `).join('');
    }
  });
}

function updateStats() {
  if (!currentUser || currentUser.role !== 'admin') return;
  onValue(ref(database, 'contributions'), snapshot => {
    const contributions = snapshot.val() ? Object.values(snapshot.val()) : [];
    onValue(ref(database, 'members'), membersSnapshot => {
      const members = membersSnapshot.val() ? Object.values(membersSnapshot.val()) : [];
      const totalAmount = contributions.reduce((sum, c) => {
        return sum + members.reduce((mSum, m) => {
          return mSum + c.years.reduce((ySum, y) => {
            return ySum + m.contributions[c.name][y].filter(Boolean).length * c.amount;
          }, 0);
        }, 0);
      }, 0);
      const totalAmountChart = document.getElementById('stats-total-amount');
      if (totalAmountChart) {
        new Chart(totalAmountChart, {
          type: 'bar',
          data: {
            labels: ['Montant total'],
            datasets: [{ label: 'FCFA', data: [totalAmount], backgroundColor: '#9b9c28' }]
          }
        });
      }
      const membersChart = document.getElementById('stats-members');
      if (membersChart) {
        new Chart(membersChart, {
          type: 'bar',
          data: {
            labels: ['Membres'],
            datasets: [{ label: 'Nombre', data: [members.length], backgroundColor: '#9b9c28' }]
          }
        });
      }
      const statusChart = document.getElementById('stats-status');
      if (statusChart) {
        new Chart(statusChart, {
          type: 'pie',
          data: {
            labels: ['Actif', 'Inactif', 'Liste noire'],
            datasets: [{
              data: [
                members.filter(m => m.status === 'actif').length,
                members.filter(m => m.status === 'inactif').length,
                members.filter(m => m.status === 'liste-noire').length
              ],
              backgroundColor: ['#9b9c28', '#3a6241', '#ff0000']
            }]
          }
        });
      }
      const contributionsChart = document.getElementById('stats-contributions');
      if (contributionsChart) {
        new Chart(contributionsChart, {
          type: 'bar',
          data: {
            labels: contributions.map(c => c.name),
            datasets: [{
              label: 'Montant collecté',
              data: contributions.map(c => {
                return members.reduce((sum, m) => {
                  return sum + c.years.reduce((ySum, y) => {
                    return ySum + m.contributions[c.name][y].filter(Boolean).length * c.amount;
                  }, 0);
                }, 0);
              }),
              backgroundColor: '#9b9c28'
            }]
          }
        });
      }
    });
  });
}

function initVideoCall() {
  onValue(ref(database, 'members'), snapshot => {
    const members = snapshot.val() ? Object.entries(snapshot.val()).map(([id, m]) => ({ id, ...m })) : [];
    const search = document.querySelector('#video-calls-search')?.value.toLowerCase() || '';
    const list = document.querySelector('#members-call-list');
    if (list) {
      list.innerHTML = members
        .filter(m => `${m.firstname} ${m.lastname}`.toLowerCase().includes(search))
        .map(m => `
          <div>
            <input type="checkbox" id="call-${m.id}" value="${m.id}" onchange="toggleCallMember('${m.id}')">
            <label for="call-${m.id}">${m.firstname} ${m.lastname}</label>
          </div>
        `).join('');
    }
  });
}

function toggleCallMember(memberId) {
  if (selectedCallMembers.includes(memberId)) {
    selectedCallMembers = selectedCallMembers.filter(id => id !== memberId);
  } else {
    selectedCallMembers.push(memberId);
  }
}

function toggleCallAll() {
  const callAll = document.querySelector('#call-all')?.checked;
  onValue(ref(database, 'members'), snapshot => {
    const members = snapshot.val() ? Object.values(snapshot.val()) : [];
    selectedCallMembers = callAll ? members.map(m => m.id) : [];
    members.forEach(m => {
      const checkbox = document.querySelector(`#call-${m.id}`);
      if (checkbox) checkbox.checked = callAll;
    });
  }, { onlyOnce: true });
}

function startCall(type) {
  if (!selectedCallMembers.length) {
    alert('Veuillez sélectionner au moins un membre pour l\'appel.');
    return;
  }
  const roomId = `room_${Date.now()}`;
  const container = document.querySelector('#video-call-container');
  if (container) {
    container.innerHTML = `<where-by room="https://whereby.com/${roomId}" displayName="${currentUser ? currentUser.firstname : 'Utilisateur'}"></where-by>`;
    sendNotification('Appel', `Un appel ${type} a été initié dans la salle ${roomId}`);
  }
}

function sendNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

function updateCoranContent() {
  const search = document.querySelector('#coran-search')?.value.toLowerCase() || '';
  const juz = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    name: `Juz' ${i + 1}`,
    description: `Juz' ${i + 1} du Saint Coran`
  }));
  const content = document.querySelector('#coran-content');
  if (content) {
    content.innerHTML = juz
      .filter(j => j.name.toLowerCase().includes(search) || j.description.toLowerCase().includes(search))
      .map(j => `
        <div class="juz-card">
          <h4>${j.name}</h4>
          <p>${j.description}</p>
        </div>
      `).join('');
  }
}

function updateLibraryContent() {
  const search = document.querySelector('#library-search')?.value.toLowerCase() || '';
  const books = [
    { title: 'Sahih Al-Bukhari', author: 'Imam Al-Bukhari' },
    { title: 'Sahih Muslim', author: 'Imam Muslim' },
    { title: 'Riyad As-Salihin', author: 'Imam An-Nawawi' }
  ];
  const content = document.querySelector('#library-content');
  if (content) {
    content.innerHTML = books
      .filter(b => b.title.toLowerCase().includes(search) || b.author.toLowerCase().includes(search))
      .map(b => `
        <div class="book-card">
          <h4>${b.title}</h4>
          <p>Auteur: ${b.author}</p>
        </div>
      `).join('');
  }
}

if ('Notification' in window && Notification.permission !== 'granted') {
  Notification.requestPermission();
}

// Log pour vérifier le chargement
console.log('main.js chargé avec succès');
