let currentUser = null;
const members = [
  {
    code: 'MEMBRE001',
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
    contributions: [{ name: 'Mensuelle', amount: 2000, paid: [true, false, false], partial: 0 }]
  }
];
const contributions = [{ name: 'Mensuelle', amount: 2000 }];
const suggestions = [];
const gallery = [];
const activities = [{ name: 'Conférence Annuelle', description: 'Conférence 2025', image: 'assets/images/conference.jpg', date: '2025-08-02T15:00:00' }];
const messages = [];
const notes = [];
const sensitiveFiles = [];
const internalDocs = [];
const sensitiveFilesPassword = '0000';
const presidentCode = '0000';
let isChatOpen = false;
let selectedCallMembers = [];

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelector(`#${pageId}`).classList.add('active');
  document.querySelector(`a[onclick="showPage('${pageId}')"]`).classList.add('active');
  if (pageId === 'members') updateMembersList();
  if (pageId === 'contributions') updateContributionsList();
  if (pageId === 'activities') updateActivitiesList();
  if (pageId === 'gallery') updateGalleryContent();
  if (pageId === 'messages') updateMessagesList();
  if (pageId === 'coran') updateCoranContent();
  if (pageId === 'personal') {
    document.querySelector('#personal-login').style.display = currentUser && currentUser.role !== 'admin' ? 'none' : 'block';
    document.querySelector('#personal-content').style.display = currentUser && currentUser.role !== 'admin' ? 'block' : 'none';
    if (currentUser && currentUser.role !== 'admin') updatePersonalInfo();
  }
}

function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`#${tabId}`).classList.add('active');
  document.querySelector(`button[onclick="showTab('${tabId}')"]`).classList.add('active');
  if (tabId === 'edit-member') updateEditMembersList();
  if (tabId === 'contributions-admin') updateContributionsAdminList();
  if (tabId === 'gallery-admin') updateGalleryAdminList();
  if (tabId === 'activities-admin') updateActivitiesAdminList();
  if (tabId === 'messages-admin') updateMessagesAdminList();
  if (tabId === 'suggestions-admin') updateSuggestionsList();
  if (tabId === 'notes') updateNotesList();
  if (tabId === 'sensitive-files') document.querySelector('#sensitive-files-content').style.display = 'none';
  if (tabId === 'internal-docs') updateInternalDocsList();
  if (tabId === 'stats') updateStats();
  if (tabId === 'video-calls') initVideoCall();
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
}

function updateCountdown() {
  const eventDate = new Date(activities[0].date);
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
});

document.querySelector('#settings-language').addEventListener('change', (e) => {
  const lang = e.target.value;
  document.querySelector('#language-selector').value = lang;
});

function toggleChatbot() {
  isChatOpen = !isChatOpen;
  document.querySelector('#chatbot').style.display = isChatOpen ? 'block' : 'none';
  if (isChatOpen) {
    document.querySelector('#chatbot-messages').innerHTML = '<div class="chatbot-message received">Bienvenue ! Posez une question ou utilisez un mot-clé comme "association", "membre", "cotisation", etc.</div>';
  }
}

document.querySelector('.chatbot-button').addEventListener('click', toggleChatbot);

document.querySelector('#chatbot-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.querySelector('#chatbot-input');
  const message = input.value;
  if (!message) return;
  const messages = document.querySelector('#chatbot-messages');
  messages.innerHTML += `<div class="chatbot-message sent">${message}</div>`;
  if (message === 'ADMIN12301012000') {
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
  if (password === 'JESUISMEMBRE66') {
    currentUser = { code: 'ADMIN123', role: 'admin' };
    showPage('secret');
    toggleChatbot();
  } else {
    document.querySelector('#chatbot-messages').innerHTML += '<div class="chatbot-message received">Mot de passe incorrect.</div>';
  }
}

document.querySelector('#personal-login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const firstnameLastname = document.querySelector('#personal-firstname-lastname').value;
  const code = document.querySelector('#personal-member-code').value;
  const password = document.querySelector('#personal-password').value;
  const errorMessage = document.querySelector('#personal-error-message');

  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[012])(19|20)\d\d$/;
  if (!dateRegex.test(password)) {
    errorMessage.textContent = 'Mot de passe invalide (format : JJMMAAAA)';
    errorMessage.style.display = 'block';
    return;
  }

  const member = members.find(m => `${m.firstname} ${m.lastname}` === firstnameLastname && m.code === code && m.dob === password);
  if (member) {
    currentUser = member;
    document.querySelector('#personal-title').textContent = `Espace de ${member.firstname} ${member.lastname}`;
    document.querySelector('#personal-login').style.display = 'none';
    document.querySelector('#personal-content').style.display = 'block';
    updatePersonalInfo();
  } else {
    errorMessage.textContent = 'Informations incorrectes';
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
    code: `MEMBRE${(members.length + 1).toString().padStart(3, '0')}`,
    firstname: document.querySelector('#new-member-firstname').value,
    lastname: document.querySelector('#new-member-lastname').value,
    age: parseInt(document.querySelector('#new-member-age').value),
    dob: document.querySelector('#new-member-dob').value,
    birthplace: document.querySelector('#new-member-birthplace').value,
    photo: document.querySelector('#new-member-photo').files[0] ? URL.createObjectURL(document.querySelector('#new-member-photo').files[0]) : 'assets/images/default-photo.png',
    email: document.querySelector('#new-member-email').value,
    activity: document.querySelector('#new-member-activity').value,
    address: document.querySelector('#new-member-address').value,
    phone: document.querySelector('#new-member-phone').value,
    residence: document.querySelector('#new-member-residence').value,
    role: document.querySelector('#new-member-role').value,
    status: document.querySelector('#new-member-status').value,
    contributions: contributions.map(c => ({ name: c.name, amount: c.amount, paid: c.name === 'Mensuelle' ? [false, false, false] : false, partial: 0 }))
  };
  members.push(member);
  document.querySelector('#add-member-form').reset();
  updateMembersList();
  updateEditMembersList();
  updateCallMembersList();
  updateStats();
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
    updateStats();
    document.querySelector('#delete-member-form').style.display = 'none';
  }
});

document.querySelector('#add-contribution-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const name = document.querySelector('#contribution-name').value;
  const amount = parseInt(document.querySelector('#contribution-amount').value);
  contributions.push({ name, amount });
  members.forEach(member => member.contributions.push({ name, amount, paid: name === 'Mensuelle' ? [false, false, false] : false, partial: 0 }));
  document.querySelector('#add-contribution-form').reset();
  updateContributionsList();
  updateContributionsAdminList();
  updatePersonalInfo();
  updateStats();
});

document.querySelector('#suggestion-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser) return;
  const text = document.querySelector('#suggestion-text').value;
  suggestions.push({ member: `${currentUser.firstname} ${currentUser.lastname}`, text });
  document.querySelector('#suggestion-form').reset();
  updateSuggestionsList();
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
  }
});

document.querySelector('#add-activity-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const activity = {
    name: document.querySelector('#activity-name').value,
    description: document.querySelector('#activity-description').value,
    image: document.querySelector('#activity-file').files[0] ? URL.createObjectURL(document.querySelector('#activity-file').files[0]) : '',
    date: new Date().toISOString()
  };
  activities.push(activity);
  document.querySelector('#add-activity-form').reset();
  updateActivitiesList();
  updateActivitiesAdminList();
});

document.querySelector('#add-message-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const text = document.querySelector('#message-text').value;
  messages.push({ text, date: new Date().toISOString() });
  document.querySelector('#add-message-form').reset();
  updateMessagesList();
  updateMessagesAdminList();
});

document.querySelector('#add-note-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const theme = document.querySelector('#note-theme').value;
  const text = document.querySelector('#note-text').value;
  notes.push({ theme, text });
  document.querySelector('#add-note-form').reset();
  updateNotesList();
});

document.querySelector('#sensitive-files-auth').addEventListener('submit', (e) => {
  e.preventDefault();
  const password = document.querySelector('#sensitive-files-password').value;
  if (password === sensitiveFilesPassword) {
    document.querySelector('#sensitive-files-content').style.display = 'block';
    document.querySelector('#sensitive-files-search').style.display = 'block';
    updateSensitiveFilesList();
  } else {
    alert('Mot de passe incorrect');
  }
});

document.querySelector('#add-sensitive-file-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'president') return;
  const file = document.querySelector('#sensitive-file').files[0];
  if (file) {
    sensitiveFiles.push({ name: file.name, url: URL.createObjectURL(file) });
    document.querySelector('#add-sensitive-file-form').reset();
    updateSensitiveFilesList();
  }
});

document.querySelector('#add-internal-doc-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'admin') return;
  const file = document.querySelector('#internal-doc').files[0];
  if (file) {
    internalDocs.push({ name: file.name, url: URL.createObjectURL(file) });
    document.querySelector('#add-internal-doc-form').reset();
    updateInternalDocsList();
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

function updateContributionsList() {
  const search = document.querySelector('#contributions-search').value.toLowerCase();
  const list = document.querySelector('#contributions-list');
  list.innerHTML = contributions
    .filter(c => c.name.toLowerCase().includes(search))
    .map(c => `
      <div class="contribution-card">
        <p><strong>${c.name}</strong>: ${c.amount} FCFA</p>
      </div>
    `).join('');
}

function updateContributionsAdminList() {
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
            ${c.name === 'Mensuelle' ? `
              <select onchange="updateMonthlyPayment('${m.code}', this.value)">
                <option value="">Choisir un mois</option>
                <option value="0">Mois 1</option>
                <option value="1">Mois 2</option>
                <option value="2">Mois 3</option>
              </select>
              <p>Statut: ${m.contributions.find(cont => cont.name === c.name).paid.map(p => p ? 'Payé' : 'Non payé').join(', ')}</p>
            ` : `
              <input type="checkbox" ${m.contributions.find(cont => cont.name === c.name).paid ? 'checked' : ''} onchange="updatePayment('${m.code}', '${c.name}', this.checked)">
              <input type="number" placeholder="Montant partiel" value="${m.contributions.find(cont => cont.name === c.name).partial}" onchange="updatePartialPayment('${m.code}', '${c.name}', this.value)">
              <p>Statut: ${m.contributions.find(cont => cont.name === c.name).paid ? 'Payé' : `Non payé (${m.contributions.find(cont => cont.name === c.name).partial} FCFA)`}</p>
            `}
          </div>
        `).join('')}
      </div>
    `).join('');
}

function updateMonthlyPayment(memberCode, month) {
  if (!currentUser || currentUser.role !== 'tresorier') return;
  const member = members.find(m => m.code === memberCode);
  if (month) {
    member.contributions.find(c => c.name === 'Mensuelle').paid[parseInt(month)] = true;
  }
  updateContributionsAdminList();
  updatePersonalInfo();
  updateStats();
}

function updatePayment(memberCode, contributionName, paid) {
  if (!currentUser || currentUser.role !== 'tresorier') return;
  const member = members.find(m => m.code === memberCode);
  member.contributions.find(c => c.name === contributionName).paid = paid;
  if (paid) member.contributions.find(c => c.name === contributionName).partial = 0;
  updateContributionsAdminList();
  updatePersonalInfo();
  updateStats();
}

function updatePartialPayment(memberCode, contributionName, amount) {
  if (!currentUser || currentUser.role !== 'tresorier') return;
  const member = members.find(m => m.code === memberCode);
  member.contributions.find(c => c.name === contributionName).partial = parseInt(amount) || 0;
  updateContributionsAdminList();
  updatePersonalInfo();
  updateStats();
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
  document.querySelector('#new-member-age').value = member.age;
  document.querySelector('#new-member-dob').value = member.dob;
  document.querySelector('#new-member-birthplace').value = member.birthplace;
  document.querySelector('#new-member-email').value = member.email;
  document.querySelector('#new-member-activity').value = member.activity;
  document.querySelector('#new-member-address').value = member.address;
  document.querySelector('#new-member-phone').value = member.phone;
  document.querySelector('#new-member-residence').value = member.residence;
  document.querySelector('#new-member-role').value = member.role;
  document.querySelector('#new-member-status').value = member.status;
  showTab('add-member');
}

function deleteMember(code) {
  if (!currentUser || currentUser.role !== 'admin') return;
  document.querySelector('#delete-member-form').dataset.memberCode = code;
  document.querySelector('#delete-member-form').style.display = 'block';
}

function updateActivitiesList() {
  const search = document.querySelector('#activities-search').value.toLowerCase();
  const list = document.querySelector('#activities-list');
  list.innerHTML = activities
    .filter(a => a.name.toLowerCase().includes(search) || a.description.toLowerCase().includes(search))
    .map(a => `
      <div class="activity-card">
        <h4>${a.name}</h4>
        <p>${a.description}</p>
        ${a.image ? `<img src="${a.image}" alt="${a.name}" style="max-width: 100%; border-radius: 10px;">` : ''}
      </div>
    `).join('');
}

function updateActivitiesAdminList() {
  const search = document.querySelector('#activities-admin-search').value.toLowerCase();
  const list = document.querySelector('#activities-admin-list');
  list.innerHTML = activities
    .filter(a => a.name.toLowerCase().includes(search) || a.description.toLowerCase().includes(search))
    .map((a, index) => `
      <div class="activity-card">
        <h4>${a.name}</h4>
        <p>${a.description}</p>
        ${a.image ? `<img src="${a.image}" alt="${a.name}" style="max-width: 100%; border-radius: 10px;">` : ''}
        <button class="cta-button" onclick="deleteActivity(${index})">Supprimer</button>
      </div>
    `).join('');
}

function deleteActivity(index) {
  if (!currentUser || currentUser.role !== 'admin') return;
  activities.splice(index, 1);
  updateActivitiesList();
  updateActivitiesAdminList();
}

function updateGalleryContent() {
  const search = document.querySelector('#gallery-search').value.toLowerCase();
  const content = document.querySelector('#gallery-content');
  content.innerHTML = gallery
    .filter(g => g.name.toLowerCase().includes(search))
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

function deleteGalleryItem(index) {
  if (!currentUser || currentUser.role !== 'admin') return;
  gallery.splice(index, 1);
  updateGalleryContent();
  updateGalleryAdminList();
}

function updateMessagesList() {
  const search = document.querySelector('#messages-search').value.toLowerCase();
  const list = document.querySelector('#messages-list');
  list.innerHTML = messages
    .filter(m => m.text.toLowerCase().includes(search))
    .map(m => `
      <div class="message-card">
        <p>${m.text}</p>
        <p><small>${new Date(m.date).toLocaleString()}</small></p>
      </div>
    `).join('');
}

function updateMessagesAdminList() {
  const search = document.querySelector('#messages-admin-search').value.toLowerCase();
  const list = document.querySelector('#messages-admin-list');
  list.innerHTML = messages
    .filter(m => m.text.toLowerCase().includes(search))
    .map((m, index) => `
      <div class="message-card">
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

function deleteNote(index) {
  if (!currentUser || currentUser.role !== 'admin') return;
  notes.splice(index, 1);
  updateNotesList();
}

function updateSensitiveFilesList() {
  const search = document.querySelector('#sensitive-files-search').value.toLowerCase();
  const list = document.querySelector('#sensitive-files-list');
  list.innerHTML = sensitiveFiles
    .filter(f => f.name.toLowerCase().includes(search))
    .map((f, index) => `
      <div class="file-card">
        <a href="${f.url}" download>${f.name}</a>
        <button class="cta-button" onclick="deleteSensitiveFile(${index})">Supprimer</button>
      </div>
    `).join('');
}

function deleteSensitiveFile(index) {
  if (!currentUser || currentUser.role !== 'president') return;
  sensitiveFiles.splice(index, 1);
  updateSensitiveFilesList();
}

function updateInternalDocsList() {
  const search = document.querySelector('#internal-docs-search').value.toLowerCase();
  const list = document.querySelector('#internal-docs-list');
  list.innerHTML = internalDocs
    .filter(d => d.name.toLowerCase().includes(search))
    .map((d, index) => `
      <div class="file-card">
        <a href="${d.url}" download>${d.name}</a>
        <button class="cta-button" onclick="deleteInternalDoc(${index})">Supprimer</button>
      </div>
    `).join('');
}

function deleteInternalDoc(index) {
  if (!currentUser || currentUser.role !== 'admin') return;
  internalDocs.splice(index, 1);
  updateInternalDocsList();
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

function deleteSuggestion(index) {
  if (!currentUser || currentUser.role !== 'admin') return;
  suggestions.splice(index, 1);
  updateSuggestionsList();
}

function updateCoranContent() {
  const search = document.querySelector('#coran-search').value.toLowerCase();
  const content = document.querySelector('#coran-content');
  content.innerHTML = Array(30).fill()
    .map((_, i) => ({ juz: `Juz' ${i + 1}`, id: i + 1 }))
    .filter(j => j.juz.toLowerCase().includes(search))
    .map(j => `<p style="font-family: 'Amiri', serif; font-size: 1.2rem;">${j.juz}</p>`).join('');
}

function updatePersonalInfo() {
  if (!currentUser) return;
  const info = document.querySelector('#personal-info');
  const contributions = document.querySelector('#personal-contributions');
  info.innerHTML = `
    <img src="${currentUser.photo}" alt="${currentUser.firstname} ${currentUser.lastname}" style="width: 100px; border-radius: 50%;">
    <p><strong>Prénom :</strong> ${currentUser.firstname}</p>
    <p><strong>Nom :</strong> ${currentUser.lastname}</p>
    <p><strong>Âge :</strong> ${currentUser.age}</p>
    <p><strong>Date de naissance :</strong> ${currentUser.dob}</p>
    <p><strong>Lieu de naissance :</strong> ${currentUser.birthplace}</p>
    <p><strong>Email :</strong> ${currentUser.email}</p>
    <p><strong>Activité :</strong> ${currentUser.activity}</p>
    <p><strong>Adresse :</strong> ${currentUser.address}</p>
    <p><strong>Téléphone :</strong> ${currentUser.phone}</p>
    <p><strong>Résidence :</strong> ${currentUser.residence}</p>
    <p><strong>Rôle :</strong> ${currentUser.role}</p>
    <p><strong>Statut :</strong> ${currentUser.status}</p>
  `;
  contributions.innerHTML = currentUser.contributions.map(c => `
    <div class="contribution-card">
      <p><strong>${c.name}</strong>: ${c.amount} FCFA</p>
      <p>Statut: ${c.name === 'Mensuelle' ? c.paid.map(p => p ? 'Payé' : 'Non payé').join(', ') : c.paid ? 'Payé' : `Non payé (${c.partial} FCFA)`}</p>
    </div>
  `).join('');
}

function updateStats() {
  const totalAmount = members.reduce((sum, m) => sum + m.contributions.reduce((s, c) => s + (c.name === 'Mensuelle' ? c.paid.filter(p => p).length * c.amount : c.paid ? c.amount : c.partial), 0), 0);
  const membersCount = members.length;
  const activeMembers = members.filter(m => m.status === 'actif').length;
  const upToDateMembers = members.filter(m => m.contributions.every(c => c.name === 'Mensuelle' ? c.paid.every(p => p) : c.paid)).length;

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

function initVideoCall() {
  if (!currentUser || currentUser.role !== 'admin') {
    document.querySelector('#video-call-container').innerHTML = '<p>Accès réservé aux membres du bureau.</p>';
    return;
  }
  updateCallMembersList();
  document.querySelector('#video-call-container').innerHTML = '<p>Sélectionnez les membres à appeler ou utilisez "Appeler tout le monde".</p>';
}

function callAllMembers() {
  if (!currentUser || currentUser.role !== 'admin') return;
  selectedCallMembers = members.map(m => m.code);
  startCall('video');
}

function startSelectedCall(type) {
  if (!currentUser || currentUser.role !== 'admin') return;
  if (selectedCallMembers.length === 0) {
    alert('Veuillez sélectionner au moins un membre.');
    return;
  }
  startCall(type);
}

function startCall(type) {
  const roomId = `ansar-room-${Date.now()}`;
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmFwcGVhci5pbiIsImF1ZCI6Imh0dHBzOi8vYXBpLmFwcGVhci5pbi92MSIsImV4cCI6OTAwNzE5OTI1NDc0MDk5MSwiaWF0IjoxNzUyNzQzMzY5LCJvcmdhbml6YXRpb25JZCI6MzIwMzY3LCJqdGkiOiJmYzdmMjhiYS0xZTViLTRhYjAtOGQwZi1kZWNjNzAxYzkyNzAifQ.2WXwlPQj_-Da17X3IXJrVFYfiAsGlxzaRftPiG5oFWI';
  const videoCallContainer = document.querySelector('#video-call-container');
  const roomUrl = `https://ansar-almouyassar.whereby.com/${roomId}?token=${token}&${type === 'audio' ? 'audioOnly=true' : ''}&displayName=${currentUser.firstname} ${currentUser.lastname}`;
  videoCallContainer.innerHTML = `<whereby-embed room="${roomUrl}"></whereby-embed>`;
  alert(`${type === 'video' ? 'Appel vidéo' : 'Appel audio'} démarré avec ${selectedCallMembers.length} membre(s).`);
}

function payContribution() {
  window.open('https://wave.com', '_blank');
}

document.querySelector('#members-search').addEventListener('input', updateMembersList);
document.querySelector('#contributions-search').addEventListener('input', updateContributionsList);
document.querySelector('#activities-search').addEventListener('input', updateActivitiesList);
document.querySelector('#gallery-search').addEventListener('input', updateGalleryContent);
document.querySelector('#messages-search').addEventListener('input', updateMessagesList);
document.querySelector('#coran-search').addEventListener('input', updateCoranContent);
document.querySelector('#edit-member-search').addEventListener('input', updateEditMembersList);
document.querySelector('#contributions-admin-search').addEventListener('input', updateContributionsAdminList);
document.querySelector('#gallery-admin-search').addEventListener('input', updateGalleryAdminList);
document.querySelector('#activities-admin-search').addEventListener('input', updateActivitiesAdminList);
document.querySelector('#messages-admin-search').addEventListener('input', updateMessagesAdminList);
document.querySelector('#notes-search').addEventListener('input', updateNotesList);
document.querySelector('#sensitive-files-search').addEventListener('input', updateSensitiveFilesList);
document.querySelector('#internal-docs-search').addEventListener('input', updateInternalDocsList);
document.querySelector('#suggestions-search').addEventListener('input', updateSuggestionsList);
document.querySelector('#video-calls-search').addEventListener('input', updateCallMembersList);

updateMembersList();
updateContributionsList();
updateContributionsAdminList();
updateActivitiesList();
updateGalleryContent();
updateMessagesList();
updateNotesList();
updateSensitiveFilesList();
updateInternalDocsList();
updateSuggestionsList();
updateCoranContent();
updateStats();
