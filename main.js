import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getDatabase, ref, set, onValue, remove } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

const firebaseConfig = {
  apiKey: "AIzaSyB7-fXR59CqNMyYgZTDAdBNpMTE_GkcOlA",
  authDomain: "ansar-93d9e.firebaseapp.com",
  projectId: "ansar-93d9e",
  storageBucket: "ansar-93d9e.firebasestorage.app",
  messagingSenderId: "697623655771",
  appId: "1:697623655771:web:2487489b5825ab211f567e",
  measurementId: "G-N3LBBHM2N0"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

let members = [];
let contributions = [];
let events = [];
let suggestions = [];
let gallery = [];
let messages = [];
let autoMessages = [];
let notes = [];
let internalDocs = [];
let presidentFiles = [];
let secretaryFiles = [];
let library = [];
const presidentCode = '0000';
let currentUser = null;
let isChatOpen = false;
let selectedCallMembers = [];
let secretEntryTimeout;

function syncData(path, localArray, updateFunction) {
  const dbRef = ref(db, path);
  onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    localArray.length = 0;
    if (data) {
      Object.values(data).forEach(item => localArray.push(item));
    }
    updateFunction();
  });
}

function saveData(path, data) {
  return set(ref(db, path), data);
}

async function uploadFile(file, path) {
  const fileRef = storageRef(storage, `${path}/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
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
  if (pageId === 'personal') {
    document.querySelector('#personal-login').style.display = currentUser && currentUser.role !== 'admin' ? 'none' : 'block';
    document.querySelector('#personal-content').style.display = currentUser && currentUser.role !== 'admin' ? 'block' : 'none';
    if (currentUser && currentUser.role !== 'admin') updatePersonalInfo();
  }
  if (pageId === 'library') updateLibraryContent();
  if (pageId === 'home') updateMessagePopups();
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
  if (tabId === 'secretary-files') updateSecretaryFilesList();
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
}

function updateEventCountdowns() {
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
    document.querySelector('#secret-entry').style.display = 'none';
    clearTimeout(secretEntryTimeout);
  }
}

function clearChatHistory() {
  document.querySelector('#chatbot-messages').innerHTML = '<div class="chatbot-message received">Historique effacé. Posez une question ou utilisez un mot-clé comme "association", "membre", "cotisation", etc.</div>';
}

document.addEventListener('click', (e) => {
  const chatbot = document.querySelector('#chatbot');
  const chatbotButton = document.querySelector('.chatbot-button');
  if (isChatOpen && !chatbot.contains(e.target) && !chatbotButton.contains(e.target)) {
    toggleChatbot();
  }
});

document.querySelector('.chatbot-button').addEventListener('click', toggleChatbot);

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
    showPage('treasurer');
    showTab('treasurer-contributions');
    toggleChatbot();
  } else if (presidentCodes.includes(password)) {
    currentUser = { code: 'PRESIDENT', role: 'president' };
    showPage('president');
    showTab('president-files');
    toggleChatbot();
  } else if (secretaryCodes.includes(password)) {
    currentUser = { code: 'SECRETAIRE', role: 'secretaire' };
    showPage('secretary');
    showTab('secretary-files');
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

document.querySelector('#add-member-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const member = {
    code: `${(members.length + 1).toString().padStart(3, '0')}`,
    firstname: document.querySelector('#new-member-firstname').value,
    lastname: document.querySelector('#new-member-lastname').value,
    age: parseInt(document.querySelector('#new-member-age').value) || null,
    dob: document.querySelector('#new-member-dob').value || null,
    birthplace: document.querySelector('#new-member-birthplace').value || null,
    photo: document.querySelector('#new-member-photo').files[0] ? await uploadFile(document.querySelector('#new-member-photo').files[0], 'members') : 'assets/images/default-photo.png',
    email: document.querySelector('#new-member-email').value || null,
    activity: document.querySelector('#new-member-activity').value || null,
    address: document.querySelector('#new-member-address').value || null,
    phone: document.querySelector('#new-member-phone').value || null,
    residence: document.querySelector('#new-member-residence').value || null,
    role: document.querySelector('#new-member-role').value || 'membre',
    status: document.querySelector('#new-member-status').value || 'actif',
    contributions: Object.fromEntries(contributions.filter(c => c.name === 'Mensuelle').map(c => {
      const years = {};
      c.years.forEach(year => {
        years[year] = Array(12).fill(false);
      });
      return [c.name, years];
    }))
  };
  members.push(member);
  await saveData('members', members);
  document.querySelector('#add-member-form').reset();
});

document.querySelector('#delete-member-form').addEventListener('submit', async (e) => {
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
    await saveData('members', members);
    document.querySelector('#delete-member-form').style.display = 'none';
  }
});

document.querySelector('#add-contribution-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'tresorier') return;
  const name = document.querySelector('#contribution-name').value;
  const amount = parseInt(document.querySelector('#contribution-amount').value);
  const currentYear = new Date().getFullYear().toString();
  const contribution = { name, amount, years: [currentYear] };
  contributions.push(contribution);
  members.forEach(member => {
    if (!member.contributions[name]) {
      member.contributions[name] = { [currentYear]: Array(12).fill(false) };
    }
  });
  await saveData('contributions', contributions);
  await saveData('members', members);
  document.querySelector('#add-contribution-form').reset();
});

document.querySelector('#suggestion-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) return;
  const text = document.querySelector('#suggestion-text').value;
  suggestions.push({ member: `${currentUser.firstname} ${currentUser.lastname}`, text });
  await saveData('suggestions', suggestions);
  document.querySelector('#suggestion-form').reset();
});

document.querySelector('#add-gallery-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const file = document.querySelector('#gallery-file').files[0];
  if (file) {
    const url = await uploadFile(file, 'gallery');
    gallery.push({ type: file.type.startsWith('image') ? 'image' : 'video', url, name: file.name });
    await saveData('gallery', gallery);
    document.querySelector('#add-gallery-form').reset();
  }
});

document.querySelector('#add-event-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const event = {
    name: document.querySelector('#event-name').value,
    description: document.querySelector('#event-description').value,
    datetime: new Date(`${document.querySelector('#event-date').value}T${document.querySelector('#event-time').value}`).toISOString(),
    image: document.querySelector('#event-file').files[0] ? await uploadFile(document.querySelector('#event-file').files[0], 'events') : ''
  };
  events.push(event);
  await saveData('events', events);
  document.querySelector('#add-event-form').reset();
});

document.querySelector('#add-message-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const title = document.querySelector('#message-title').value;
  const text = document.querySelector('#message-text').value;
  const message = { title, text, date: new Date().toISOString() };
  messages.unshift(message);
  await saveData('messages', messages);
  document.querySelector('#add-message-form').reset();
  sendNotification('Nouveau message', `${title}: ${text}`);
});

document.querySelector('#add-auto-message-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const autoMessage = {
    name: document.querySelector('#auto-message-name').value,
    text: document.querySelector('#auto-message-text').value,
    datetime: new Date(`${document.querySelector('#auto-message-date').value}T${document.querySelector('#auto-message-time').value}`).toISOString()
  };
  autoMessages.push(autoMessage);
  await saveData('autoMessages', autoMessages);
  document.querySelector('#add-auto-message-form').reset();
});

document.querySelector('#add-note-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const note = {
    theme: document.querySelector('#note-theme').value,
    text: document.querySelector('#note-text').value
  };
  notes.push(note);
  await saveData('notes', notes);
  document.querySelector('#add-note-form').reset();
});

document.querySelector('#add-internal-doc-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const file = document.querySelector('#internal-doc').files[0];
  if (file) {
    const url = await uploadFile(file, 'internalDocs');
    internalDocs.push({ name: file.name, url, category: document.querySelector('#internal-doc-category').value });
    await saveData('internalDocs', internalDocs);
    document.querySelector('#add-internal-doc-form').reset();
  }
});

document.querySelector('#add-president-file-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'president') return;
  const file = document.querySelector('#president-file').files[0];
  if (file) {
    const url = await uploadFile(file, 'presidentFiles');
    presidentFiles.push({ name: file.name, url, category: document.querySelector('#president-file-category').value });
    await saveData('presidentFiles', presidentFiles);
    document.querySelector('#add-president-file-form').reset();
  }
});

document.querySelector('#add-secretary-file-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'secretaire') return;
  const file = document.querySelector('#secretary-file').files[0];
  if (file) {
    const url = await uploadFile(file, 'secretaryFiles');
    secretaryFiles.push({ name: file.name, url, category: document.querySelector('#secretary-file-category').value });
    await saveData('secretaryFiles', secretaryFiles);
    document.querySelector('#add-secretary-file-form').reset();
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

function updateContributionsAdminList() {
  if (!currentUser || currentUser.role !== 'tresorier') return;
  const search = document.querySelector('#contributions-admin-search').value.toLowerCase();
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
                <input type="checkbox" ${m.contributions[c.name][year][i] ? 'checked' : ''} onchange="updateMonthlyPayment('${m.code}', '${c.name}', '${year}', ${i}, this.checked)">
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

async function updateMonthlyPayment(memberCode, contributionName, year, monthIndex, paid) {
  if (!currentUser || currentUser.role !== 'tresorier') return;
  const member = members.find(m => m.code === memberCode);
  member.contributions[contributionName][year][monthIndex] = paid;
  await saveData('members', members);
  sendNotification('Mise à jour cotisation', `Cotisation ${contributionName} pour ${member.firstname} ${member.lastname} (${year}, ${['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][monthIndex]}) marquée comme ${paid ? 'payée' : 'non payée'}.`);
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
        <p>Date: ${new Date(e.datetime).toLocaleString()}</p>
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
        <p>Date: ${new Date(e.datetime).toLocaleString()}</p>
        ${e.image ? `<img src="${e.image}" alt="${e.name}" style="max-width: 100%; border-radius: 10px;">` : ''}
        <button class="cta-button" onclick="deleteEvent(${index})">Supprimer</button>
      </div>
    `).join('');
}

async function deleteEvent(index) {
  if (!currentUser || currentUser.role !== 'admin') return;
  events.splice(index, 1);
  await saveData('events', events);
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
  const search = document.querySelector('#gallery-admin-search').value.toLowerCase();
  const list = document.querySelector('#gallery-admin-list');
  list.innerHTML = gallery
    .filter(g => g.name.toLowerCase().includes(search))
    .map((g, index) => `
      <div>
        ${g.type === 'image' ? `<img src="${g.url}" alt="Galerie" style="max-width: 100%; border-radius: 10px;">` : `<video src="${g.url}" controls style="max-width: 100%; border-radius: 10px;"></video>`}
        <button class="cta-button" onclick="deleteGalleryItem(${index})">Supprimer</button>
      </div>
    `).join('');
}

async function deleteGalleryItem(index) {
  if (!currentUser || currentUser.role !== 'admin') return;
  gallery.splice(index, 1);
  await saveData('gallery', gallery);
}

function updateMessagesList() {
  const list = document.querySelector('#messages-list');
  list.innerHTML = messages
    .map(m => `
      <div class="message-card">
        <h4>${m.title}</h4>
        <p>${m.text}</p>
        <p><small>${new Date(m.date).toLocaleString()}</small></p>
      </div>
    `).join('');
}

function updateMessagesAdminList() {
  const search = document.querySelector('#messages-admin-search').value.toLowerCase();
  const list = document.querySelector('#messages-admin-list');
  list.innerHTML = messages
    .filter(m => m.title.toLowerCase().includes(search) || m.text.toLowerCase().includes(search))
    .map((m, index) => `
      <div class="message-card">
        <h4>${m.title}</h4>
        <p>${m.text}</p>
        <p><small>${new Date(m.date).toLocaleString()}</small></p>
        <button class="cta-button" onclick="deleteMessage(${index})">Supprimer</button>
      </div>
    `).join('');
}

async function deleteMessage(index) {
  if (!currentUser || currentUser.role !== 'admin') return;
  messages.splice(index, 1);
  await saveData('messages', messages);
}

function updateMessagePopups() {
  const popups = document.querySelector('#message-popups');
  popups.innerHTML = messages
    .map((m, index) => `
      <div class="message-popup">
        <h4>${m.title}</h4>
        <p>${m.text}</p>
        <button class="close-button" onclick="closeMessage(${index})"><span class="material-icons">close</span></button>
      </div>
    `).join('');
}

async function closeMessage(index) {
  messages.splice(index, 1);
  await saveData('messages', messages);
}

function checkAutoMessages() {
  const now = new Date();
  autoMessages.forEach(async (m, index) => {
    if (new Date(m.datetime) <= now) {
      messages.unshift({ title: m.name, text: m.text, date: now.toISOString() });
      await saveData('messages', messages);
      autoMessages.splice(index, 1);
      await saveData('autoMessages', autoMessages);
      sendNotification('Message automatisé', `${m.name}: ${m.text}`);
    }
  });
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
        <p>Date: ${new Date(m.datetime).toLocaleString()}</p>
        <button class="cta-button" onclick="deleteAutoMessage(${index})">Supprimer</button>
      </div>
    `).join('');
}

async function deleteAutoMessage(index) {
  if (!currentUser || currentUser.role !== 'admin') return;
  autoMessages.splice(index, 1);
  await saveData('autoMessages', autoMessages);
}

function updateNotesList() {
  const search = document.querySelector('#notes-search').value.toLowerCase();
  const list = document.querySelector('#notes-list');
  list.innerHTML = notes
    .filter(n => n.theme.toLowerCase().includes(search) || n.text.toLowerCase().includes(search))
    .map((n, index) => `
      <div class="note-card">
        <p><strong>${n.theme}</strong>: ${n.text}</p>
        <button class="cta-button" onclick="deleteNote(${index})">Supprimer</button>
      </div>
    `).join('');
}

async function deleteNote(index) {
  if (!currentUser || currentUser.role !== 'admin') return;
  notes.splice(index, 1);
  await saveData('notes', notes);
}

function updateInternalDocsList() {
  const search = document.querySelector('#internal-docs-search').value.toLowerCase();
  const list = document.querySelector('#internal-docs-list');
  list.innerHTML = internalDocs
    .filter(d => d.name.toLowerCase().includes(search) || d.category.toLowerCase().includes(search))
    .map((d, index) => `
      <div class="file-card">
        <p><strong>Catégorie :</strong> ${d.category}</p>
        <a href="${d.url}" download>${d.name}</a>
        <button class="cta-button" onclick="deleteInternalDoc(${index})">Supprimer</button>
      </div>
    `).join('');
}

async function deleteInternalDoc(index) {
  if (!currentUser || currentUser.role !== 'admin') return;
  internalDocs.splice(index, 1);
  await saveData('internalDocs', internalDocs);
}

function updatePresidentFilesList() {
  const search = document.querySelector('#president-files-search').value.toLowerCase();
  const list = document.querySelector('#president-files-list');
  list.innerHTML = presidentFiles
    .filter(f => f.name.toLowerCase().includes(search) || f.category.toLowerCase().includes(search))
    .map((f, index) => `
      <div class="file-card">
        <p><strong>Catégorie :</strong> ${f.category}</p>
        <a href="${f.url}" download>${f.name}</a>
        <button class="cta-button" onclick="deletePresidentFile(${index})">Supprimer</button>
      </div>
    `).join('');
}

async function deletePresidentFile(index) {
  if (!currentUser || currentUser.role !== 'president') return;
  presidentFiles.splice(index, 1);
  await saveData('presidentFiles', presidentFiles);
}

function updateSecretaryFilesList() {
  const search = document.querySelector('#secretary-files-search').value.toLowerCase();
  const list = document.querySelector('#secretary-files-list');
  list.innerHTML = secretaryFiles
    .filter(f => f.name.toLowerCase().includes(search) || f.category.toLowerCase().includes(search))
    .map((f, index) => `
      <div class="file-card">
        <p><strong>Catégorie :</strong> ${f.category}</p>
        <a href="${f.url}" download>${f.name}</a>
        <button class="cta-button" onclick="deleteSecretaryFile(${index})">Supprimer</button>
      </div>
    `).join('');
}

async function deleteSecretaryFile(index) {
  if (!currentUser || currentUser.role !== 'secretaire') return;
  secretaryFiles.splice(index, 1);
  await saveData('secretaryFiles', secretaryFiles);
}

function updateSuggestionsList() {
  const search = document.querySelector('#suggestions-search').value.toLowerCase();
  const list = document.querySelector('#suggestions-list');
  list.innerHTML = suggestions
    .filter(s => s.member.toLowerCase().includes(search) || s.text.toLowerCase().includes(search))
    .map((s, index) => `
      <div class="suggestion-card">
        <p><strong>${s.member}</strong>: ${s.text}</p>
        <button class="cta-button" onclick="deleteSuggestion(${index})">Supprimer</button>
      </div>
    `).join('');
}

async function deleteSuggestion(index) {
  if (!currentUser || currentUser.role !== 'admin') return;
  suggestions.splice(index, 1);
  await saveData('suggestions', suggestions);
}

function updateCoranContent() {
  const search = document.querySelector('#coran-search').value.toLowerCase();
  const content = document.querySelector('#coran-content');
  content.innerHTML = Array(30).fill()
    .map((_, i) => ({ juz: `Juz' ${i + 1}`, id: i + 1 }))
    .filter(j => j.juz.toLowerCase().includes(search))
    .map(j => `<p style="font-family: 'Amiri', serif; font-size: 1.2rem;">${j.juz}</p>`).join('');
}

function updateLibraryContent() {
  const search = document.querySelector('#library-search').value.toLowerCase();
  const content = document.querySelector('#library-content');
  content.innerHTML = library
    .filter(l => l.name.toLowerCase().includes(search) || l.category.toLowerCase().includes(search))
    .map(l => `
      <div class="file-card">
        <p><strong>Catégorie :</strong> ${l.category}</p>
        <a href="${l.url}" download>${l.name}</a>
      </div>
    `).join('');
}

function updatePersonalInfo() {
  if (!currentUser) return;
  const info = document.querySelector('#personal-info');
  const contributions = document.querySelector('#personal-contributions');
  info.innerHTML = `
    <img src="${currentUser.photo}" alt="${currentUser.firstname} ${currentUser.lastname}" style="width: 100px; border-radius: 50%;">
    <p><strong>Prénom :</strong> ${currentUser.firstname}</p>
    <p><strong>Nom :</strong> ${currentUser.lastname}</p>
    ${currentUser.age ? `<p><strong>Âge :</strong> ${currentUser.age}</p>` : ''}
    ${currentUser.dob ? `<p><strong>Date de naissance :</strong> ${currentUser.dob}</p>` : ''}
    ${currentUser.birthplace ? `<p><strong>Lieu de naissance :</strong> ${currentUser.birthplace}</p>` : ''}
    ${currentUser.email ? `<p><strong>Email :</strong> ${currentUser.email}</p>` : ''}
    ${currentUser.activity ? `<p><strong>Activité :</strong> ${currentUser.activity}</p>` : ''}
    ${currentUser.address ? `<p><strong>Adresse :</strong> ${currentUser.address}</p>` : ''}
    ${currentUser.phone ? `<p><strong>Téléphone :</strong> ${currentUser.phone}</p>` : ''}
    ${currentUser.residence ? `<p><strong>Résidence :</strong> ${currentUser.residence}</p>` : ''}
    <p><strong>Rôle :</strong> ${currentUser.role}</p>
    <p><strong>Statut :</strong> ${currentUser.status}</p>
  `;
  contributions.innerHTML = Object.entries(currentUser.contributions).map(([name, years]) => `
    <div class="contribution-card">
      <p><strong>${name}</strong>: ${contributions.find(c => c.name === name).amount} FCFA</p>
      ${Object.entries(years).map(([year, months]) => `
        <p><strong>${year}</strong></p>
        <p>Payé: ${months.map((p, i) => p ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][i] : '').filter(Boolean).join(', ')}</p>
        <p>Non payé: ${months.map((p, i) => !p ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][i] : '').filter(Boolean).join(', ')}</p>
      `).join('')}
    </div>
  `).join('');
}

function updateStats() {
  const totalAmount = members.reduce((sum, m) => sum + Object.values(m.contributions).reduce((s, years) => s + Object.values(years).reduce((t, months) => t + months.filter(p => p).length * contributions.find(c => c.name === Object.keys(m.contributions)[0]).amount, 0), 0), 0);
  const membersCount = members.length;
  const activeMembers = members.filter(m => m.status === 'actif').length;
  const upToDateMembers = members.filter(m => Object.values(m.contributions).every(years => Object.values(years).every(months => months.every(p => p)))).length;

  new Chart(document.getElementById('stats-total-amount'), {
    type: 'bar',
    data: {
      labels: ['Somme totale'],
      datasets: [{ label: 'Montant (FCFA)', data: [totalAmount], backgroundColor: '#9b9c28' }]
    }
  });

  new Chart(document.getElementById('stats-members'), {
    type: 'pie',
    data: {
      labels: ['Membres'],
      datasets: [{ data: [membersCount], backgroundColor: ['#3a6241'] }]
    }
  });

  new Chart(document.getElementById('stats-status'), {
    type: 'pie',
    data: {
      labels: ['Actifs', 'Inactifs', 'Liste noire'],
      datasets: [{ data: [activeMembers, membersCount - activeMembers - members.filter(m => m.status === 'liste-noire').length, members.filter(m => m.status === 'liste-noire').length], backgroundColor: ['#3a6241', '#778152', '#9b9c28'] }]
    }
  });

  new Chart(document.getElementById('stats-contributions'), {
    type: 'bar',
    data: {
      labels: ['À jour', 'En retard'],
      datasets: [{ label: 'Membres', data: [upToDateMembers, membersCount - upToDateMembers], backgroundColor: ['#3a6241', '#9b9c28'] }]
    }
  });
}

function updateCallMembersList() {
  const search = document.querySelector('#video-calls-search').value.toLowerCase();
  const list = document.querySelector('#members-call-list');
  list.innerHTML = members
    .filter(m => `${m.firstname} ${m.lastname}`.toLowerCase().includes(search) || m.code.toLowerCase().includes(search))
    .map(m => `
      <div class="member-card">
        <input type="checkbox" id="call-${m.code}" value="${m.code}" onchange="updateSelectedCallMembers('${m.code}', this.checked)">
        <label for="call-${m.code}">${m.firstname} ${m.lastname} (${m.code})</label>
      </div>
    `).join('');
}

function updateSelectedCallMembers(code, checked) {
  if (checked) {
    selectedCallMembers.push(code);
  } else {
    selectedCallMembers = selectedCallMembers.filter(c => c !== code);
  }
}

function toggleCallAll() {
  const checkAll = document.querySelector('#call-all').checked;
  selectedCallMembers = checkAll ? members.map(m => m.code) : [];
  document.querySelectorAll('#members-call-list input[type=checkbox]').forEach(checkbox => {
    checkbox.checked = checkAll;
  });
}

function initVideoCall() {
  if (!currentUser || !['admin', 'tresorier', 'president', 'secretaire'].includes(currentUser.role)) {
    document.querySelector('#video-call-container').innerHTML = '<p>Accès réservé aux membres du bureau.</p>';
    return;
  }
  updateCallMembersList();
  document.querySelector('#video-call-container').innerHTML = '<p>Sélectionnez les membres à appeler ou cochez "Cocher tout".</p>';
}

function startCall(type) {
  if (!currentUser || !['admin', 'tresorier', 'president', 'secretaire'].includes(currentUser.role)) return;
  if (selectedCallMembers.length === 0) {
    alert('Veuillez sélectionner au moins un membre.');
    return;
  }
  const roomId = `ansar-room-${Date.now()}`;
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmFwcGVhci5pbiIsImF1ZCI6Imh0dHBzOi8vYXBpLmFwcGVhci5pbi92MSIsImV4cCI6OTAwNzE5OTI1NDc0MDk5MSwiaWF0IjoxNzUyNzQzMzY5LCJvcmdhbml6YXRpb25JZCI6MzIwMzY3LCJqdGkiOiJmYzdmMjhiYS0xZTViLTRhYjAtOGQwZi1kZWNjNzAxYzkyNzAifQ.2WXwlPQj_-Da17X3IXJrVFYfiAsGlxzaRftPiG5oFWI';
  const videoCallContainer = document.querySelector('#video-call-container');
  const roomUrl = `https://ansar-almouyassar.whereby.com/${roomId}?token=${token}&${type === 'audio' ? 'audioOnly=true' : ''}&displayName=${currentUser.firstname || 'Admin'} ${currentUser.lastname || ''}`;
  videoCallContainer.innerHTML = `<whereby-embed room="${roomUrl}"></whereby-embed>`;
  alert(`${type === 'video' ? 'Appel vidéo' : 'Appel audio'} démarré avec ${selectedCallMembers.length} membre(s).`);
}

function payViaWave() {
  window.open('https://pay.wave.com/m/M_sn_dyIw8DZWV46K/c/sn/?amount=2000', '_blank');
}

function payViaOrangeMoney() {
  window.open('https://sugu.orange-sonatel.com/mp/dc3PQ0eEeSdcKQWVvcTH2Z', '_blank');
}

function sendNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  } else if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    });
  }
}

document.querySelector('#members-search').addEventListener('input', updateMembersList);
document.querySelector('#events-search').addEventListener('input', updateEventsList);
document.querySelector('#coran-search').addEventListener('input', updateCoranContent);
document.querySelector('#library-search').addEventListener('input', updateLibraryContent);
document.querySelector('#edit-member-search').addEventListener('input', updateEditMembersList);
document.querySelector('#gallery-admin-search').addEventListener('input', updateGalleryAdminList);
document.querySelector('#events-admin-search').addEventListener('input', updateEventsAdminList);
document.querySelector('#messages-admin-search').addEventListener('input', updateMessagesAdminList);
document.querySelector('#notes-search').addEventListener('input', updateNotesList);
document.querySelector('#internal-docs-search').addEventListener('input', updateInternalDocsList);
document.querySelector('#suggestions-search').addEventListener('input', updateSuggestionsList);
document.querySelector('#video-calls-search').addEventListener('input', updateCallMembersList);
document.querySelector('#auto-messages-search').addEventListener('input', updateAutoMessagesList);
document.querySelector('#contributions-admin-search').addEventListener('input', updateContributionsAdminList);
document.querySelector('#president-files-search').addEventListener('input', updatePresidentFilesList);
document.querySelector('#secretary-files-search').addEventListener('input', updateSecretaryFilesList);

function initApp() {
  syncData('members', members, () => {
    updateMembersList();
    updateEditMembersList();
    updateCallMembersList();
    updateStats();
    updatePersonalInfo();
  });
  syncData('contributions', contributions, () => {
    updateContributionsAdminList();
    updatePersonalInfo();
    updateStats();
  });
  syncData('events', events, () => {
    updateEventsList();
    updateEventsAdminList();
    updateEventCountdowns();
  });
  syncData('suggestions', suggestions, updateSuggestionsList);
  syncData('gallery', gallery, () => {
    updateGalleryContent();
    updateGalleryAdminList();
  });
  syncData('messages', messages, () => {
    updateMessagesList();
    updateMessagesAdminList();
    updateMessagePopups();
  });
  syncData('autoMessages', autoMessages, updateAutoMessagesList);
  syncData('notes', notes, updateNotesList);
  syncData('internalDocs', internalDocs, updateInternalDocsList);
  syncData('presidentFiles', presidentFiles, updatePresidentFilesList);
  syncData('secretaryFiles', secretaryFiles, updateSecretaryFilesList);
  syncData('library', library, updateLibraryContent);

  // Initialisation des données par défaut si vides
  if (members.length === 0) {
    members.push({
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
      contributions: { 'Mensuelle': { '2023': Array(12).fill(false), '2024': Array(12).fill(false), '2025': Array(12).fill(false) } }
    });
    saveData('members', members);
  }
  if (contributions.length === 0) {
    contributions.push({ name: 'Mensuelle', amount: 2000, years: ['2023', '2024', '2025'] });
    saveData('contributions', contributions);
  }
  if (events.length === 0) {
    events.push({ name: 'Conférence Annuelle', description: 'Conférence 2025', image: 'assets/images/conference.jpg', datetime: '2025-08-17T15:00:00' });
    saveData('events', events);
  }
}

initApp();
