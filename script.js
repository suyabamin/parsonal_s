// Configuration - Replace with your deployed Web App URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxzmhFKHJVsQIvrOrpIE7TE7_1-5TiflN9BxlJ3ev_9wBkN9qj0hY1MQkW3Mu7SJ4anXQ/exec';

// Global State
window.knowledgeBase = {
    notes: JSON.parse(localStorage.getItem('vault_notes')) || [],
    links: JSON.parse(localStorage.getItem('vault_links')) || [],
    pdfs: JSON.parse(localStorage.getItem('vault_pdfs')) || [],
    images: JSON.parse(localStorage.getItem('vault_images')) || [],
    videos: JSON.parse(localStorage.getItem('vault_videos')) || []
};

// --- API Wrapper ---
window.api = {
    async call(payload) {
        try {
            // Mode 'no-cors' allows writing to Google but blocks reading the response.
            // We use it here to ensure the data reaches your Sheets/Drive.
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                cache: 'no-cache',
                body: JSON.stringify(payload)
            });
            return { success: true };
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, error: error.message };
        }
    },
    async saveToSheet(data, sheetType) { return await this.call({ action: 'saveToSheet', sheetType, data }); },
    async saveToDrive(fileData, fileName, fileType) { return await this.call({ action: 'saveToDrive', fileData, fileName, fileType }); },
    async testConnection() { return await this.call({ action: 'testConnection' }); }
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    applyTheme();
    renderAll();
    testConnectionAndUpdateStatus();
});

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('click', () => showFeaturePage(card.dataset.feature));
    });

    ['notes', 'links', 'pdfs', 'images', 'videos'].forEach(type => {
        const btn = document.getElementById(`back-to-home-${type}`);
        if (btn) btn.addEventListener('click', showHomepage);
    });

    // Save Actions
    document.getElementById('save-note').addEventListener('click', saveNote);
    document.getElementById('save-link').addEventListener('click', saveLink);

    // Upload Bridges
    setupUploadBridge('pdf-upload', 'upload-pdf-btn', 'pdf');
    setupUploadBridge('image-upload', 'upload-image-btn', 'image');
    setupUploadBridge('video-upload', 'upload-video-btn', 'video');

    // Chat Bot Listeners
    document.getElementById('chat-toggle').addEventListener('click', () => document.getElementById('chat-window').classList.toggle('hidden'));
    document.getElementById('close-chat').addEventListener('click', () => document.getElementById('chat-window').classList.add('hidden'));
    document.getElementById('send-message').addEventListener('click', handleChat);
    document.getElementById('chat-input').addEventListener('keypress', (e) => { if(e.key === 'Enter') handleChat(); });
}

function setupUploadBridge(inputId, buttonId, type) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    if (input && button) {
        button.addEventListener('click', () => input.click());
        input.addEventListener('change', (e) => { if (e.target.files[0]) handleFileUpload(e.target.files[0], type); });
    }
}

// --- Core Functions ---

async function saveNote() {
    const textarea = document.getElementById('note-content');
    if (!textarea.value.trim()) return;

    const note = { id: Date.now(), content: textarea.value, timestamp: new Date().toLocaleString() };
    window.knowledgeBase.notes.unshift(note);
    saveAndRender('notes');
    textarea.value = '';
    await window.api.saveToSheet(note, 'notes');
}

async function saveLink() {
    const n = document.getElementById('site-name'), u = document.getElementById('site-url');
    if (!n.value || !u.value) return;

    const link = { id: Date.now(), name: n.value, url: u.value, timestamp: new Date().toLocaleString() };
    window.knowledgeBase.links.unshift(link);
    saveAndRender('links');
    n.value = ''; u.value = '';
    await window.api.saveToSheet(link, 'links');
}

async function handleFileUpload(file, type) {
    showMessage(`Uploading ${file.name}...`, 'info');
    const reader = new FileReader();
    reader.onload = async (e) => {
        const fileData = e.target.result;
        const item = { id: Date.now(), name: file.name, url: fileData, timestamp: new Date().toLocaleString() };
        window.knowledgeBase[type + 's'].unshift(item);
        saveAndRender(type + 's');
        showMessage(`${file.name} saved!`, 'success');
        await window.api.saveToDrive(fileData, file.name, type);
    };
    reader.readAsDataURL(file);
}

// --- Chat Bot Logic ---
function handleChat() {
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    if (!input.value.trim()) return;

    const userMsg = input.value.toLowerCase();
    messages.innerHTML += `<div class="user-message mb-2 text-right"><span class="bg-blue-600 p-2 rounded-lg text-sm">${input.value}</span></div>`;
    
    let reply = "I'm not sure about that. Try asking 'how many notes do I have?'";
    if (userMsg.includes('notes')) reply = `You have ${window.knowledgeBase.notes.length} notes saved.`;
    if (userMsg.includes('links')) reply = `You have ${window.knowledgeBase.links.length} links in your vault.`;
    if (userMsg.includes('hello')) reply = "Hello! How can I help you manage your knowledge today?";

    setTimeout(() => {
        messages.innerHTML += `<div class="bot-message mb-2"><span class="bg-gray-700 p-2 rounded-lg text-sm">${reply}</span></div>`;
        messages.scrollTop = messages.scrollHeight;
    }, 500);
    input.value = '';
}

// --- UI Helpers ---

function deleteItem(type, id) {
    window.knowledgeBase[type] = window.knowledgeBase[type].filter(item => item.id !== id);
    saveAndRender(type);
}

function saveAndRender(type) {
    localStorage.setItem(`vault_${type}`, JSON.stringify(window.knowledgeBase[type]));
    renderAll();
}

function renderAll() {
    renderList('notes', 'notes-container', n => `
        <div class="note-card p-4 relative group">
            <button onclick="deleteItem('notes', ${n.id})" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500"><i class="fas fa-trash"></i></button>
            <p class="text-sm">${n.content}</p>
        </div>
    `);
    renderList('links', 'links-container', l => `
        <div class="link-card flex justify-between items-center p-3">
            <a href="${l.url}" target="_blank" class="text-blue-400 truncate">${l.name}</a>
            <button onclick="deleteItem('links', ${l.id})" class="text-red-500 text-xs"><i class="fas fa-trash"></i></button>
        </div>
    `);
    renderFiles('pdfs', 'pdfs-container', 'fa-file-pdf', 'text-red-500');
    renderFiles('images', 'images-container', 'fa-image', 'text-purple-500');
    renderFiles('videos', 'videos-container', 'fa-video', 'text-yellow-500');
}

function renderList(type, containerId, templateFn) {
    const container = document.getElementById(containerId);
    if(container) container.innerHTML = window.knowledgeBase[type].map(templateFn).join('');
}

function renderFiles(type, containerId, icon, colorClass) {
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = window.knowledgeBase[type].map(f => `
        <div class="file-card p-4 text-center relative group">
            <button onclick="deleteItem('${type}', ${f.id})" class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-500 text-xs"><i class="fas fa-trash"></i></button>
            <i class="fas ${icon} ${colorClass} text-2xl mb-2"></i>
            <p class="text-[10px] truncate mb-2">${f.name}</p>
            <a href="${f.url}" download="${f.name}" class="text-[10px] bg-white/10 px-2 py-1 rounded hover:bg-white/20">Download</a>
        </div>
    `).join('');
}

function showFeaturePage(f) {
    document.getElementById('homepage').classList.add('hidden');
    document.getElementById(`${f}-page`).classList.remove('hidden');
}

function showHomepage() {
    ['notes-page', 'links-page', 'pdfs-page', 'images-page', 'videos-page'].forEach(p => document.getElementById(p).classList.add('hidden'));
    document.getElementById('homepage').classList.remove('hidden');
}

function applyTheme() { document.body.classList.add('dark'); }

function showMessage(msg, type) {
    const el = document.getElementById('status-indicator');
    el.textContent = msg;
    const colors = { success: 'bg-green-600', info: 'bg-blue-600' };
    el.className = `px-3 py-1 rounded-full text-xs text-white ${colors[type] || 'bg-gray-600'}`;
}

async function testConnectionAndUpdateStatus() {
    const res = await window.api.testConnection();
    if (res.success) showMessage('Drive Connected', 'success');
}