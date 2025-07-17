// Import des fonctions nécessaires depuis Firebase
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB7-fXR59CqNMyYgZTDAdBNpMTE_GkcOlA",
  authDomain: "ansar-93d9e.firebaseapp.com",
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
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelector(`#${pageId}`).classList.add('active');
  document.querySelector(`a[onclick="showPage('${pageId}')"]`).classList.add('active');
  if (pageId === 'members') updateMembersList();
  if (pageId === 'events') updateEventsList();
  if (pageId === 'gallery') updateGalleryContent();
  if (pageId === 'messages') updateMessagesList();
  if (pageId === 'coran') updateCoranContent();
  if (pageId === 'personal') {
    document.querySelector('#personal-login').style.display = currentUser && currentUser.role !== 'admin' ? 'none' : 'block';
    document.querySelector('#personal-content').style.display = currentUser && currentUser.role !== 'admin' ? 'block' : 'none';
    if (currentUser && currentUser.role !== 'admin') updatePersonalInfo();
  }
  if (pageId === 'library') updateLibraryContent();
  if (pageId === 'home') updateMessagePopups();
  if (pageId === 'secret') showTab('add-member');
  if (pageId === 'treasurer-secret') showTab('treasurer-contributions');
  if (pageId === 'president-secret') showTab('president-files');
  if (pageId === 'secretary-secret') showTab('secretary-files');
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
  database.ref('events').once('value').then(snapshot => {
    const events = snapshot.val() ? Object.values(snapshot.val()) : [];
    const countdowns = document.getElementById('event-countdowns');
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

document.querySelector('#settings-language').addEventListener('change', (e) => {
  // Language change handled in settings
});

function toggleChatbot() {
  isChatOpen = !isChatOpen;
  document.querySelector('#chatbot').style.display = isChatOpen ? 'block' : 'none';
  if (isChatOpen) {
    document.querySelector('#chatbot-messages').innerHTML = '<div class="chatbot-message received">Bienvenue ! Posez une question ou utilisez un mot-clé comme "association", "membre", "cotisation", etc.</div>';
  } else {
    clearTimeout(secretEntryTimeout);
    document.querySelector('#secret-entry').style.display = 'none';
  }
}

document.addEventListener('click', (e) => {
  const chatbot = document.querySelector('#chatbot');
  const chatbotButton = document.querySelector('.chatbot-button');
  if (isChatOpen && !chatbot.contains(e.target) && !chatbotButton.contains(e.target)) {
    toggleChatbot();
  }
});

document.querySelector('.chatbot-button').addEventListener('click', toggleChatbot);

function clearChatHistory() {
  document.querySelector('#chatbot-messages').innerHTML = '<div class="chatbot-message received">Historique effacé. Posez une question ou utilisez un mot-clé.</div>';
  document.querySelector('#secret-entry').style.display = 'none';
  clearTimeout(secretEntryTimeout);
}

document.querySelector('#chatbot-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.querySelector('#chatbot-input');
  const message = input.value;
  if (!message) return;
  const messages = document.querySelector('#chatbot-messages');
  messages.innerHTML += `<div class="chatbot-message sent">${message}</div>`;
  const secretCodes = ['ADMIN12301012000', '00000000', '11111111', '22222222'];
  if (secretCodes.includes(message)) {
    document.querySelector('#secret-entry').style.display = 'block';
    secretEntryTimeout = setTimeout(() => {
      document.querySelector('#secret-entry').style.display = 'none';
    }, 30000);
  } else {
    const response = getChatbotResponse(message);
    messages.innerHTML += `<div class="chatbot-message received">${response}</div>`;
  }
  input.value = '';
  messages.scrollTop = messages.scrollHeight;
});

function enterSecret() {
  const password = document.querySelector('#secret-password').value;
  const adminCodes = ['JESUISMEMBRE66', '33333333', '44444444', '55555555'];
  const treasurerCodes = ['JESUISTRESORIER444', '66666666', '77777777', '88888888'];
  const presidentCodes = ['PRESIDENT000', '99999999', '11112222', '33334444'];
  const secretaryCodes = ['SECRETAIRE000', '55556666', '77778888', '99990000'];
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

  database.ref('members').orderByChild('code').equalTo(code).once('value').then(snapshot => {
    const member = snapshot.val() ? Object.values(snapshot.val())[0] : null;
    if (member && member.dob === password) {
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
  database.ref('members').once('value').then(snapshot => {
    const members = snapshot.val() ? Object.values(snapshot.val()) : [];
    const member = {
      code: `${(members.length + 1).toString().padStart(3, '0')}`,
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
      contributions: { 'Mensuelle': { '2023': Array(12).fill(false), '2024': Array(12).fill(false), '2025': Array(12).fill(false) } }
    };
    database.ref('members').push(member);
    document.querySelector('#add-member-form').reset();
  });
});

document.querySelector('#delete-member-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const code = document.querySelector('#delete-member-code').value;
  if (code !== '0000') {
    alert('Code président incorrect');
    return;
  }
  const memberId = document.querySelector('#delete-member-form').dataset.memberId;
  database.ref(`members/${memberId}`).remove();
  document.querySelector('#delete-member-form').style.display = 'none';
});

document.querySelector('#add-contribution-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'tresorier') return;
  const name = document.querySelector('#contribution-name').value;
  const amount = parseInt(document.querySelector('#contribution-amount').value);
  const currentYear = new Date().getFullYear().toString();
  const contribution = { name, amount, years: [currentYear] };
  database.ref('contributions').push(contribution);
  database.ref('members').once('value').then(snapshot => {
    const members = snapshot.val() ? Object.entries(snapshot.val()).map(([id, m]) => ({ id, ...m })) : [];
    members.forEach((member, index) => {
      if (!member.contributions[name]) {
        member.contributions[name] = { [currentYear]: Array(12).fill(false) };
        database.ref(`members/${Object.keys(snapshot.val())[index]}`).update({ contributions: member.contributions });
      }
    });
  });
  document.querySelector('#add-contribution-form').reset();
});

document.querySelector('#suggestion-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser) return;
  const text = document.querySelector('#suggestion-text').value;
  database.ref('suggestions').push({ member: `${currentUser.firstname} ${currentUser.lastname}`, text, timestamp: new Date().toISOString() });
  document.querySelector('#suggestion-form').reset();
});

document.querySelector('#add-gallery-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const file = document.querySelector('#gallery-file').files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      database.ref('gallery').push({ type: file.type.startsWith('image') ? 'image' : 'video', url: reader.result, name: file.name });
    };
    reader.readAsDataURL(file);
    document.querySelector('#add-gallery-form').reset();
  }
});

document.querySelector('#add-event-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const file = document.querySelector('#event-file').files[0];
  const event = {
    name: document.querySelector('#event-name').value,
    description: document.querySelector('#event-description').value,
    datetime: new Date(`${document.querySelector('#event-date').value}T${document.querySelector('#event-time').value}`).toISOString()
  };
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      event.image = reader.result;
      database.ref('events').push(event);
    };
    reader.readAsDataURL(file);
  } else {
    database.ref('events').push(event);
  }
  document.querySelector('#add-event-form').reset();
});

document.querySelector('#add-message-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const title = document.querySelector('#message-title').value;
  const text = document.querySelector('#message-text').value;
  database.ref('messages').push({ title, text, date: new Date().toISOString() });
  document.querySelector('#add-message-form').reset();
  sendNotification('Nouveau message', `${title}: ${text}`);
});

document.querySelector('#add-auto-message-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const autoMessage = {
    name: document.querySelector('#auto-message-name').value,
    text: document.querySelector('#auto-message-text').value,
    datetime: new Date(`${document.querySelector('#auto-message-date').value}T${document.querySelector('#auto-message-time').value}`).toISOString()
  };
  database.ref('autoMessages').push(autoMessage);
  document.querySelector('#add-auto-message-form').reset();
});

document.querySelector('#add-note-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const note = {
    theme: document.querySelector('#note-theme').value,
    text: document.querySelector('#note-text').value
  };
  database.ref('notes').push(note);
  document.querySelector('#add-note-form').reset();
});

document.querySelector('#add-president-file-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'president') return;
  const file = document.querySelector('#president-file').files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      database.ref('presidentFiles').push({ name: file.name, url: reader.result, category: document.querySelector('#president-file-category').value });
    };
    reader.readAsDataURL(file);
    document.querySelector('#add-president-file-form').reset();
  }
});

document.querySelector('#add-president-note-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'president') return;
  const note = {
    theme: document.querySelector('#president-note-theme').value,
    text: document.querySelector('#president-note-text').value
  };
  database.ref('presidentNotes').push(note);
  document.querySelector('#add-president-note-form').reset();
});

document.querySelector('#add-secretary-file-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'secretaire') return;
  const file = document.querySelector('#secretary-file').files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      database.ref('secretaryFiles').push({ name: file.name, url: reader.result, category: document.querySelector('#secretary-file-category').value });
    };
    reader.readAsDataURL(file);
    document.querySelector('#add-secretary-file-form').reset();
  }
});

document.querySelector('#add-secretary-note-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'secretaire') return;
  const note = {
    theme: document.querySelector('#secretary-note-theme').value,
    text: document.querySelector('#secretary-note-text').value
  };
  database.ref('secretaryNotes').push(note);
  document.querySelector('#add-secretary-note-form').reset();
});

function updateMembersList() {
  const search = document.querySelector('#members-search').value.toLowerCase();
  database.ref('members').on('value', snapshot => {
    const members = snapshot.val() ? Object.entries(snapshot.val()).map(([id, m]) => ({ id, ...m })) : [];
    const list = document.querySelector('#members-list');
    list.innerHTML = members
      .filter(m => `${m.firstname} ${m.lastname}`.toLowerCase().includes(search) || m.code.toLowerCase().includes(search))
      .map(m => `
        <div class="member-card">
          <p><strong>${m.firstname} ${m.lastname}</strong></p>
          <p><strong>Numéro :</strong> ${m.code}</p>
        </div>
      `).join('');
  });
}

function updateContributionsAdminList() {
  if (!currentUser || currentUser.role !== 'tresorier') return;
  const search = document.querySelector('#contributions-admin-search').value.toLowerCase();
  database.ref('contributions').on('value', snapshot => {
    const contributions = snapshot.val() ? Object.values(snapshot.val()) : [];
    database.ref('members').on('value', membersSnapshot => {
      const members = membersSnapshot.val() ? Object.entries(membersSnapshot.val()).map(([id, m]) => ({ id, ...m })) : [];
      const list = document.querySelector('#contributions-admin-list');
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
    });
  });
}

function updateMonthlyPayment(memberId, contributionName, year, monthIndex, paid) {
  if (!currentUser || currentUser.role !== 'tresorier') return;
  database.ref(`members/${memberId}/contributions/${contributionName}/${year}/${monthIndex}`).set(paid);
  sendNotification('Mise à jour cotisation', `Cotisation ${contributionName} pour ${year}, ${['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][monthIndex]} marquée comme ${paid ? 'payée' : 'non payée'}.`);
}

function updateEditMembersList() {
  const search = document.querySelector('#edit-member-search').value.toLowerCase();
  database.ref('members').on('value', snapshot => {
    const members = snapshot.val() ? Object.entries(snapshot.val()).map(([id, m]) => ({ id, ...m })) : [];
    const list = document.querySelector('#edit-members-list');
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
  });
}

function editMember(id) {
  database.ref(`members/${id}`).once('value').then(snapshot => {
    const member = snapshot.val();
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
  });
}

function deleteMember(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  document.querySelector('#delete-member-form').dataset.memberId = id;
  document.querySelector('#delete-member-form').style.display = 'block';
}

function updateEventsList() {
  const search = document.querySelector('#events-search').value.toLowerCase();
  database.ref('events').on('value', snapshot => {
    const events = snapshot.val() ? Object.entries(snapshot.val()).map(([id, e]) => ({ id, ...e })) : [];
    const list = document.querySelector('#events-list');
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
  });
}

function updateEventsAdminList() {
  const search = document.querySelector('#events-admin-search').value.toLowerCase();
  database.ref('events').on('value', snapshot => {
    const events = snapshot.val() ? Object.entries(snapshot.val()).map(([id, e]) => ({ id, ...e })) : [];
    const list = document.querySelector('#events-admin-list');
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
  });
}

function deleteEvent(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  database.ref(`events/${id}`).remove();
}

function updateGalleryContent() {
  database.ref('gallery').on('value', snapshot => {
    const gallery = snapshot.val() ? Object.values(snapshot.val()) : [];
    const content = document.querySelector('#gallery-content');
    content.innerHTML = gallery
      .map(g => `
        <div>
          ${g.type === 'image' ? `<img src="${g.url}" alt="Galerie">` : `<video src="${g.url}" controls></video>`}
        </div>
      `).join('');
  });
}

function updateGalleryAdminList() {
  const search = document.querySelector('#gallery-admin-search').value.toLowerCase();
  database.ref('gallery').on('value', snapshot => {
    const gallery = snapshot.val() ? Object.entries(snapshot.val()).map(([id, g]) => ({ id, ...g })) : [];
    const list = document.querySelector('#gallery-admin-list');
    list.innerHTML = gallery
      .filter(g => g.name.toLowerCase().includes(search))
      .map(g => `
        <div>
          ${g.type === 'image' ? `<img src="${g.url}" alt="Galerie" style="max-width: 100%; border-radius: 10px;">` : `<video src="${g.url}" controls style="max-width: 100%; border-radius: 10px;"></video>`}
          <button class="cta-button" onclick="deleteGalleryItem('${g.id}')">Supprimer</button>
        </div>
      `).join('');
  });
}

function deleteGalleryItem(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  database.ref(`gallery/${id}`).remove();
}

function updateMessagesList() {
  database.ref('messages').on('value', snapshot => {
    const messages = snapshot.val() ? Object.values(snapshot.val()) : [];
    const list = document.querySelector('#messages-list');
    list.innerHTML = messages
      .map(m => `
        <div class="message-card">
          <h4>${m.title}</h4>
          <p>${m.text}</p>
          <p><small>${new Date(m.date).toLocaleString()}</small></p>
        </div>
      `).join('');
  });
}

function updateMessagesAdminList() {
  const search = document.querySelector('#messages-admin-search').value.toLowerCase();
  database.ref('messages').on('value', snapshot => {
    const messages = snapshot.val() ? Object.entries(snapshot.val()).map(([id, m]) => ({ id, ...m })) : [];
    const list = document.querySelector('#messages-admin-list');
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
  });
}

function deleteMessage(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  database.ref(`messages/${id}`).remove();
}

function updateMessagePopups() {
  database.ref('messages').on('value', snapshot => {
    const messages = snapshot.val() ? Object.entries(snapshot.val()).map(([id, m]) => ({ id, ...m })) : [];
    const popups = document.getElementById('message-popups');
    popups.innerHTML = messages
      .map(m => `
        <div class="message-popup">
          <h4>${m.title}</h4>
          <p>${m.text}</p>
          <button class="close-button" onclick="deleteMessage('${m.id}')"><span class="material-icons">close</span></button>
        </div>
      `).join('');
  });
}

function checkAutoMessages() {
  const now = new Date();
  database.ref('autoMessages').once('value').then(snapshot => {
    const autoMessages = snapshot.val() ? Object.entries(snapshot.val()).map(([id, m]) => ({ id, ...m })) : [];
    autoMessages.forEach(m => {
      if (new Date(m.datetime) <= now) {
        database.ref('messages').push({ title: m.name, text: m.text, date: now.toISOString() });
        database.ref(`autoMessages/${m.id}`).remove();
        sendNotification('Message automatisé', `${m.name}: ${m.text}`);
      }
    });
  });
}

function updateAutoMessagesList() {
  const search = document.querySelector('#auto-messages-search').value.toLowerCase();
  database.ref('autoMessages').on('value', snapshot => {
    const autoMessages = snapshot.val() ? Object.entries(snapshot.val()).map(([id, m]) => ({ id, ...m })) : [];
    const list = document.querySelector('#auto-messages-list');
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
  });
}

function deleteAutoMessage(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  database.ref(`autoMessages/${id}`).remove();
}

function updateNotesList() {
  const search = document.querySelector('#notes-search').value.toLowerCase();
  database.ref('notes').on('value', snapshot => {
    const notes = snapshot.val() ? Object.entries(snapshot.val()).map(([id, n]) => ({ id, ...n })) : [];
    const list = document.querySelector('#notes-list');
    list.innerHTML = notes
      .filter(n => n.theme.toLowerCase().includes(search) || n.text.toLowerCase().includes(search))
      .map(n => `
        <div class="note-card">
          <p><strong>${n.theme}</strong>: ${n.text}</p>
          <button class="cta-button" onclick="deleteNote('${n.id}')">Supprimer</button>
        </div>
      `).join('');
  });
}

function deleteNote(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  database.ref(`notes/${id}`).remove();
}

function updatePresidentNotesList() {
  const search = document.querySelector('#president-notes-search').value.toLowerCase();
  database.ref('presidentNotes').on('value', snapshot => {
    const notes = snapshot.val() ? Object.entries(snapshot.val()).map(([id, n]) => ({ id, ...n })) : [];
    const list = document.querySelector('#president-notes-list');
    list.innerHTML = notes
      .filter(n => n.theme.toLowerCase().includes(search) || n.text.toLowerCase().includes(search))
      .map(n => `
        <div class="note-card">
          <p><strong>${n.theme}</strong>: ${n.text}</p>
          <button class="cta-button" onclick="deletePresidentNote('${n.id}')">Supprimer</button>
        </div>
      `).join('');
  });
}

function deletePresidentNote(id) {
  if (!currentUser || currentUser.role !== 'president') return;
  database.ref(`presidentNotes/${id}`).remove();
}

function updateSecretaryNotesList() {
  const search = document.querySelector('#secretary-notes-search').value.toLowerCase();
  database.ref('secretaryNotes').on('value', snapshot => {
    const notes = snapshot.val() ? Object.entries(snapshot.val()).map(([id, n]) => ({ id, ...n })) : [];
    const list = document.querySelector('#secretary-notes-list');
    list.innerHTML = notes
      .filter(n => n.theme.toLowerCase().includes(search) || n.text.toLowerCase().includes(search))
      .map(n => `
        <div class="note-card">
          <p><strong>${n.theme}</strong>: ${n.text}</p>
          <button class="cta-button" onclick="deleteSecretaryNote('${n.id}')">Supprimer</button>
        </div>
      `).join('');
  });
}

function deleteSecretaryNote(id) {
  if (!currentUser || currentUser.role !== 'secretaire') return;
  database.ref(`secretaryNotes/${id}`).remove();
}

function updateInternalDocsList() {
  const search = document.querySelector('#internal-docs-search').value.toLowerCase();
  database.ref('internalDocs').on('value', snapshot => {
    const internalDocs = snapshot.val() ? Object.entries(snapshot.val()).map(([id, d]) => ({ id, ...d })) : [];
    const list = document.querySelector('#internal-docs-list');
    list.innerHTML = internalDocs
      .filter(d => d.name.toLowerCase().includes(search) || d.category.toLowerCase().includes(search))
      .map(d => `
        <div class="file-card">
          <p><strong>Catégorie :</strong> ${d.category}</p>
          <a href="${d.url}" download>${d.name}</a>
          <button class="cta-button" onclick="deleteInternalDoc('${d.id}')">Supprimer</button>
        </div>
      `).join('');
  });
}

function deleteInternalDoc(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  database.ref(`internalDocs/${id}`).remove();
}

function updatePresidentFilesList() {
  const search = document.querySelector('#president-files-search').value.toLowerCase();
  database.ref('presidentFiles').on('value', snapshot => {
    const presidentFiles = snapshot.val() ? Object.entries(snapshot.val()).map(([id, f]) => ({ id, ...f })) : [];
    const list = document.querySelector('#president-files-list');
    list.innerHTML = presidentFiles
      .filter(f => f.name.toLowerCase().includes(search) || f.category.toLowerCase().includes(search))
      .map(f => `
        <div class="file-card">
          <p><strong>Catégorie :</strong> ${f.category}</p>
          <a href="${f.url}" download>${f.name}</a>
          <button class="cta-button" onclick="deletePresidentFile('${f.id}')">Supprimer</button>
        </div>
      `).join('');
  });
}

function deletePresidentFile(id) {
  if (!currentUser || currentUser.role !== 'president') return;
  database.ref(`presidentFiles/${id}`).remove();
}

function updateSecretaryFilesList() {
  const search = document.querySelector('#secretary-files-search').value.toLowerCase();
  database.ref('secretaryFiles').on('value', snapshot => {
    const secretaryFiles = snapshot.val() ? Object.entries(snapshot.val()).map(([id, f]) => ({ id, ...f })) : [];
    const list = document.querySelector('#secretary-files-list');
    list.innerHTML = secretaryFiles
      .filter(f => f.name.toLowerCase().includes(search) || f.category.toLowerCase().includes(search))
      .map(f => `
        <div class="file-card">
          <p><strong>Catégorie :</strong> ${f.category}</p>
          <a href="${f.url}" download>${f.name}</a>
          <button class="cta-button" onclick="deleteSecretaryFile('${f.id}')">Supprimer</button>
        </div>
      `).join('');
  });
}

function deleteSecretaryFile(id) {
  if (!currentUser || currentUser.role !== 'secretaire') return;
  database.ref(`secretaryFiles/${id}`).remove();
}

function updateSuggestionsList() {
  const search = document.querySelector('#suggestions-search').value.toLowerCase();
  database.ref('suggestions').on('value', snapshot => {
    const suggestions = snapshot.val() ? Object.entries(snapshot.val()).map(([id, s]) => ({ id, ...s })) : [];
    const list = document.querySelector('#suggestions-list');
    list.innerHTML = suggestions
      .filter(s => s.member.toLowerCase().includes(search) || s.text.toLowerCase().includes(search))
      .map(s => `
        <div class="suggestion-card">
          <p><strong>${s.member}</strong>: ${s.text}</p>
          <p><small>${new Date(s.timestamp).toLocaleString()}</small></p>
          <button class="cta-button" onclick="deleteSuggestion('${s.id}')">Supprimer</button>
        </div>
      `).join('');
  });
}

function deleteSuggestion(id) {
  if (!currentUser || currentUser.role !== 'admin') return;
  database.ref(`suggestions/${id}`).remove();
}

function updatePersonalInfo() {
  if (!currentUser) return;
  database.ref('contributions').on('value', snapshot => {
    const contributions = snapshot.val() ? Object.values(snapshot.val()) : [];
    const info = document.querySelector('#personal-info');
    const contributionsDiv = document.querySelector('#personal-contributions');
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
  });
}

function updateStats() {
  if (!currentUser || currentUser.role !== 'admin') return;
  database.ref('contributions').on('value', snapshot => {
    const contributions = snapshot.val() ? Object.values(snapshot.val()) : [];
    database.ref('members').on('value', membersSnapshot => {
      const members = membersSnapshot.val() ? Object.values(membersSnapshot.val()) : [];
      const totalAmount = contributions.reduce((sum, c) => {
        return sum + members.reduce((mSum, m) => {
          return mSum + c.years.reduce((ySum, y) => {
            return ySum + m.contributions[c.name][y].filter(Boolean).length * c.amount;
          }, 0);
        }, 0);
      }, 0);
      const totalAmountChart = new Chart(document.getElementById('stats-total-amount'), {
        type: 'bar',
        data: {
          labels: ['Montant total'],
          datasets: [{ label: 'FCFA', data: [totalAmount], backgroundColor: '#9b9c28' }]
        }
      });
      const membersChart = new Chart(document.getElementById('stats-members'), {
        type: 'bar',
        data: {
          labels: ['Membres'],
          datasets: [{ label: 'Nombre', data: [members.length], backgroundColor: '#9b9c28' }]
        }
      });
      const statusChart = new Chart(document.getElementById('stats-status'), {
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
      const contributionsChart = new Chart(document.getElementById('stats-contributions'), {
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
    });
  });
}

function initVideoCall() {
  database.ref('members').on('value', snapshot => {
    const members = snapshot.val() ? Object.entries(snapshot.val()).map(([id, m]) => ({ id, ...m })) : [];
    const search = document.querySelector('#video-calls-search').value.toLowerCase();
    const list = document.querySelector('#members-call-list');
    list.innerHTML = members
      .filter(m => `${m.firstname} ${m.lastname}`.toLowerCase().includes(search))
      .map(m => `
        <div>
          <input type="checkbox" id="call-${m.id}" value="${m.id}" onchange="toggleCallMember('${m.id}')">
          <label for="call-${m.id}">${m.firstname} ${m.lastname}</label>
        </div>
      `).join('');
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
  const callAll = document.querySelector('#call-all').checked;
  database.ref('members').once('value').then(snapshot => {
    const members = snapshot.val() ? Object.values(snapshot.val()) : [];
    selectedCallMembers = callAll ? members.map(m => m.id) : [];
    members.forEach(m => {
      document.querySelector(`#call-${m.id}`).checked = callAll;
    });
  });
}

function startCall(type) {
  if (!selectedCallMembers.length) {
    alert('Veuillez sélectionner au moins un membre pour l\'appel.');
    return;
  }
  const roomId = `room_${Date.now()}`;
  const container = document.querySelector('#video-call-container');
  container.innerHTML = `<where-by room="https://whereby.com/${roomId}" displayName="${currentUser ? currentUser.firstname : 'Utilisateur'}"></where-by>`;
  sendNotification('Appel', `Un appel ${type} a été initié dans la salle ${roomId}`);
}

function payWithWave() {
  window.open('https://wave.com', '_blank');
}

function payWithOrangeMoney() {
  window.open('https://www.orangemoney.sn', '_blank');
}

function sendNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

function updateCoranContent() {
  const search = document.querySelector('#coran-search').value.toLowerCase();
  const juz = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    name: `Juz' ${i + 1}`,
    description: `Juz' ${i + 1} du Saint Coran`
  }));
  const content = document.querySelector('#coran-content');
  content.innerHTML = juz
    .filter(j => j.name.toLowerCase().includes(search) || j.description.toLowerCase().includes(search))
    .map(j => `
      <div class="juz-card">
        <h4>${j.name}</h4>
        <p>${j.description}</p>
      </div>
    `).join('');
}

function updateLibraryContent() {
  const search = document.querySelector('#library-search').value.toLowerCase();
  const books = [
    { title: 'Sahih Al-Bukhari', author: 'Imam Al-Bukhari' },
    { title: 'Sahih Muslim', author: 'Imam Muslim' },
    { title: 'Riyad As-Salihin', author: 'Imam An-Nawawi' }
  ];
  const content = document.querySelector('#library-content');
  content.innerHTML = books
    .filter(b => b.title.toLowerCase().includes(search) || b.author.toLowerCase().includes(search))
    .map(b => `
      <div class="book-card">
        <h4>${b.title}</h4>
        <p>Auteur: ${b.author}</p>
      </div>
    `).join('');
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}

if ('Notification' in window && Notification.permission !== 'granted') {
  Notification.requestPermission();
}
