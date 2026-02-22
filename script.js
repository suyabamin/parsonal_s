// Global knowledge base to store all data
window.knowledgeBase = {
    notes: [],
    links: [],
    pdfs: [],
    images: [],
    videos: []
};

// Theme management
let isDarkMode = true;

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const chatToggle = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const closeChat = document.getElementById('close-chat');
const chatInput = document.getElementById('chat-input');
const sendMessageBtn = document.getElementById('send-message');
const chatMessages = document.getElementById('chat-messages');

// Feature page elements
const homepage = document.getElementById('homepage');
const notesPage = document.getElementById('notes-page');
const linksPage = document.getElementById('links-page');
const pdfsPage = document.getElementById('pdfs-page');
const imagesPage = document.getElementById('images-page');
const videosPage = document.getElementById('videos-page');

// Back buttons
const backToHomeNotes = document.getElementById('back-to-home-notes');
const backToHomeLinks = document.getElementById('back-to-home-links');
const backToHomePdfs = document.getElementById('back-to-home-pdfs');
const backToHomeImages = document.getElementById('back-to-home-images');
const backToHomeVideos = document.getElementById('back-to-home-videos');

// Feature cards
const featureCards = document.querySelectorAll('.feature-card');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadStoredData();
    setupEventListeners();
    applyTheme();
});

// Apply current theme to the body
function applyTheme() {
    if (isDarkMode) {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Chat functionality
    chatToggle.addEventListener('click', toggleChat);
    closeChat.addEventListener('click', toggleChat);
    sendMessageBtn.addEventListener('click', processChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processChatMessage();
        }
    });
    
    // Feature card navigation
    featureCards.forEach(card => {
        card.addEventListener('click', () => showFeaturePage(card.dataset.feature));
    });
    
    // Back to home buttons
    backToHomeNotes.addEventListener('click', () => showHomepage());
    backToHomeLinks.addEventListener('click', () => showHomepage());
    backToHomePdfs.addEventListener('click', () => showHomepage());
    backToHomeImages.addEventListener('click', () => showHomepage());
    backToHomeVideos.addEventListener('click', () => showHomepage());
    
    // Notes functionality
    setupNotesEvents();
    
    // Links functionality
    setupLinksEvents();
    
    // File vaults functionality
    setupFileVaultsEvents();
    
    // Global search functionality
    setupGlobalSearch();
}

// Setup notes-specific events
function setupNotesEvents() {
    const noteContent = document.getElementById('note-content');
    const saveNoteBtn = document.getElementById('save-note');
    const boldBtn = document.getElementById('bold-btn');
    const italicBtn = document.getElementById('italic-btn');
    const listBtn = document.getElementById('list-btn');
    const notesSearch = document.getElementById('notes-search');
    
    saveNoteBtn.addEventListener('click', saveNote);
    boldBtn.addEventListener('click', () => formatText('bold'));
    italicBtn.addEventListener('click', () => formatText('italic'));
    listBtn.addEventListener('click', () => formatText('insertUnorderedList'));
    notesSearch.addEventListener('input', filterNotes);
}

// Setup links-specific events
function setupLinksEvents() {
    const saveLinkBtn = document.getElementById('save-link');
    const linksSearch = document.getElementById('links-search');
    
    saveLinkBtn.addEventListener('click', saveLink);
    linksSearch.addEventListener('input', filterLinks);
}

// Setup file vaults events
function setupFileVaultsEvents() {
    // PDF events
    const uploadPdfBtn = document.getElementById('upload-pdf-btn');
    const pdfUploadInput = document.getElementById('pdf-upload');
    const pdfsSearch = document.getElementById('pdfs-search');
    
    uploadPdfBtn.addEventListener('click', () => pdfUploadInput.click());
    pdfUploadInput.addEventListener('change', handlePdfUpload);
    pdfsSearch.addEventListener('input', filterPdfs);
    
    // Image events
    const uploadImageBtn = document.getElementById('upload-image-btn');
    const imageUploadInput = document.getElementById('image-upload');
    const imagesSearch = document.getElementById('images-search');
    
    uploadImageBtn.addEventListener('click', () => imageUploadInput.click());
    imageUploadInput.addEventListener('change', handleImageUpload);
    imagesSearch.addEventListener('input', filterImages);
    
    // Video events
    const uploadVideoBtn = document.getElementById('upload-video-btn');
    const videoUploadInput = document.getElementById('video-upload');
    const videosSearch = document.getElementById('videos-search');
    
    uploadVideoBtn.addEventListener('click', () => videoUploadInput.click());
    videoUploadInput.addEventListener('change', handleVideoUpload);
    videosSearch.addEventListener('input', filterVideos);
    
    // Lightbox events
    const lightboxModal = document.getElementById('lightbox-modal');
    const closeLightbox = document.getElementById('close-lightbox');
    closeLightbox.addEventListener('click', () => lightboxModal.classList.add('hidden'));
    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
            lightboxModal.classList.add('hidden');
        }
    });
    
    // Video modal events
    const videoModal = document.getElementById('video-modal');
    const closeVideo = document.getElementById('close-video');
    closeVideo.addEventListener('click', () => videoModal.classList.add('hidden'));
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            videoModal.classList.add('hidden');
        }
    });
}

// Setup global search
function setupGlobalSearch() {
    const globalSearch = document.getElementById('global-search');
    globalSearch.addEventListener('input', performGlobalSearch);
}

// Perform global search across all data types
function performGlobalSearch() {
    const searchTerm = document.getElementById('global-search').value.toLowerCase();
    
    // Navigate to homepage to show search results
    showHomepage();
    
    // Temporarily show all feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.classList.remove('hidden');
    });
    
    // If search term is empty, show all cards
    if (!searchTerm) {
        return;
    }
    
    // Check each data type for matches
    let hasResults = false;
    
    // Check notes
    const matchingNotes = window.knowledgeBase.notes.filter(note => 
        note.content.toLowerCase().includes(searchTerm) || 
        note.preview.toLowerCase().includes(searchTerm)
    );
    
    // Check links
    const matchingLinks = window.knowledgeBase.links.filter(link => 
        link.name.toLowerCase().includes(searchTerm) || 
        link.url.toLowerCase().includes(searchTerm)
    );
    
    // Check PDFs
    const matchingPdfs = window.knowledgeBase.pdfs.filter(pdf => 
        pdf.name.toLowerCase().includes(searchTerm)
    );
    
    // Check images
    const matchingImages = window.knowledgeBase.images.filter(image => 
        image.name.toLowerCase().includes(searchTerm)
    );
    
    // Check videos
    const matchingVideos = window.knowledgeBase.videos.filter(video => 
        video.name.toLowerCase().includes(searchTerm)
    );
    
    // Show/hide feature cards based on search results
    if (matchingNotes.length > 0) {
        document.querySelector('[data-feature="notes"]').classList.remove('hidden');
        hasResults = true;
    } else {
        document.querySelector('[data-feature="notes"]').classList.add('hidden');
    }
    
    if (matchingLinks.length > 0) {
        document.querySelector('[data-feature="links"]').classList.remove('hidden');
        hasResults = true;
    } else {
        document.querySelector('[data-feature="links"]').classList.add('hidden');
    }
    
    if (matchingPdfs.length > 0) {
        document.querySelector('[data-feature="pdfs"]').classList.remove('hidden');
        hasResults = true;
    } else {
        document.querySelector('[data-feature="pdfs"]').classList.add('hidden');
    }
    
    if (matchingImages.length > 0) {
        document.querySelector('[data-feature="images"]').classList.remove('hidden');
        hasResults = true;
    } else {
        document.querySelector('[data-feature="images"]').classList.add('hidden');
    }
    
    if (matchingVideos.length > 0) {
        document.querySelector('[data-feature="videos"]').classList.remove('hidden');
        hasResults = true;
    } else {
        document.querySelector('[data-feature="videos"]').classList.add('hidden');
    }
    
    // If no results found, show a message
    if (!hasResults) {
        const homepageSection = document.getElementById('homepage');
        homepageSection.innerHTML = `<p class="text-gray-500 dark:text-gray-400 col-span-full text-center py-8 text-xl">No results found for "${searchTerm}"</p>`;
    }
}

// Format text in the notes editor
function formatText(command) {
    document.getElementById('note-content').focus();
    document.execCommand(command, false, null);
}

// Save a new note
async function saveNote() {
    const noteContent = document.getElementById('note-content').value.trim();
    if (!noteContent) {
        alert('Please enter some content for your note');
        return;
    }
    
    // Create note object
    const note = {
        id: Date.now(),
        content: noteContent,
        preview: noteContent.substring(0, 50) + (noteContent.length > 50 ? '...' : ''),
        timestamp: new Date().toLocaleString()
    };
    
    try {
        // Simulate saving to Google Sheets
        await window.api.saveToSheet(note, 'notes');
        
        // Add to knowledge base
        window.knowledgeBase.notes.unshift(note);
        
        // Save to localStorage
        saveData();
        
        // Clear the editor
        document.getElementById('note-content').value = '';
        
        // Re-render notes
        renderNotes();
        
        // Show success message
        showMessage('Note saved successfully!');
    } catch (error) {
        console.error('Error saving note:', error);
        showMessage('Error saving note. Please try again.', 'error');
    }
}

// Render all notes
function renderNotes() {
    const container = document.getElementById('notes-container');
    container.innerHTML = '';
    
    if (window.knowledgeBase.notes.length === 0) {
        container.innerHTML = '<p class="text-gray-500 dark:text-gray-400 col-span-full text-center py-8">No notes yet. Create your first note!</p>';
        return;
    }
    
    window.knowledgeBase.notes.forEach(note => {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card bg-white/20 dark:bg-gray-800/30 p-4 flex flex-col';
        noteCard.innerHTML = `
            <div class="flex-grow">
                <h3 class="font-semibold text-gray-800 dark:text-white mb-2">${note.preview}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">${truncateText(note.content, 100)}</p>
            </div>
            <div class="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>${note.timestamp}</span>
                <div>
                    <button class="edit-note-btn text-blue-500 hover:text-blue-700 mr-2" data-id="${note.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-note-btn text-red-500 hover:text-red-700" data-id="${note.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(noteCard);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-note-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.edit-note-btn').dataset.id);
            editNote(id);
        });
    });
    
    document.querySelectorAll('.delete-note-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.delete-note-btn').dataset.id);
            deleteNote(id);
        });
    });
}

// Edit an existing note
function editNote(id) {
    const note = window.knowledgeBase.notes.find(n => n.id === id);
    if (note) {
        document.getElementById('note-content').value = note.content;
        // Remove the note from the array temporarily
        window.knowledgeBase.notes = window.knowledgeBase.notes.filter(n => n.id !== id);
        renderNotes();
    }
}

// Delete a note
async function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        try {
            // In a real app, we would call the API to delete from Google Sheets
            // For now, just remove from our local knowledge base
            window.knowledgeBase.notes = window.knowledgeBase.notes.filter(note => note.id !== id);
            saveData();
            renderNotes();
            showMessage('Note deleted successfully!');
        } catch (error) {
            console.error('Error deleting note:', error);
            showMessage('Error deleting note. Please try again.', 'error');
        }
    }
}

// Filter notes based on search input
function filterNotes() {
    const searchTerm = document.getElementById('notes-search').value.toLowerCase();
    const noteCards = document.querySelectorAll('#notes-container > div');
    
    noteCards.forEach(card => {
        const notePreview = card.querySelector('h3').textContent.toLowerCase();
        const noteContent = card.querySelector('p').textContent.toLowerCase();
        
        if (notePreview.includes(searchTerm) || noteContent.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Truncate text to specified length
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Show temporary message
function showMessage(text, type = 'success') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } transition-opacity duration-300 fade-in`;
    messageEl.textContent = text;
    
    document.body.appendChild(messageEl);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageEl.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(messageEl);
        }, 300);
    }, 3000);
}

// Save a new link
async function saveLink() {
    const siteName = document.getElementById('site-name').value.trim();
    const siteUrl = document.getElementById('site-url').value.trim();
    
    if (!siteName || !siteUrl) {
        alert('Please enter both site name and URL');
        return;
    }
    
    // Validate URL format
    try {
        new URL(siteUrl);
    } catch (e) {
        alert('Please enter a valid URL (e.g., https://example.com)');
        return;
    }
    
    // Create link object
    const link = {
        id: Date.now(),
        name: siteName,
        url: siteUrl,
        timestamp: new Date().toLocaleString()
    };
    
    try {
        // Simulate saving to Google Sheets
        await window.api.saveToSheet(link, 'links');
        
        // Add to knowledge base
        window.knowledgeBase.links.unshift(link);
        
        // Save to localStorage
        saveData();
        
        // Clear the form
        document.getElementById('site-name').value = '';
        document.getElementById('site-url').value = '';
        
        // Re-render links
        renderLinks();
        
        // Show success message
        showMessage('Link saved successfully!');
    } catch (error) {
        console.error('Error saving link:', error);
        showMessage('Error saving link. Please try again.', 'error');
    }
}

// Render all links
function renderLinks() {
    const container = document.getElementById('links-container');
    container.innerHTML = '';
    
    if (window.knowledgeBase.links.length === 0) {
        container.innerHTML = '<p class="text-gray-500 dark:text-gray-400 col-span-full text-center py-8">No links yet. Add your first link!</p>';
        return;
    }
    
    window.knowledgeBase.links.forEach(link => {
        const linkCard = document.createElement('div');
        linkCard.className = 'link-card bg-white/20 dark:bg-gray-800/30 flex justify-between items-center';
        linkCard.innerHTML = `
            <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-800 dark:text-white truncate">${link.name}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 truncate">${link.url}</p>
            </div>
            <div class="flex items-center space-x-2 ml-2">
                <button class="open-link-btn text-blue-500 hover:text-blue-700" data-url="${link.url}">
                    <i class="fas fa-external-link-alt"></i>
                </button>
                <button class="edit-link-btn text-blue-500 hover:text-blue-700 mr-2" data-id="${link.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-link-btn text-red-500 hover:text-red-700" data-id="${link.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(linkCard);
    });
    
    // Add event listeners to open, edit and delete buttons
    document.querySelectorAll('.open-link-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const url = e.target.closest('.open-link-btn').dataset.url;
            window.open(url, '_blank');
        });
    });
    
    document.querySelectorAll('.edit-link-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.edit-link-btn').dataset.id);
            editLink(id);
        });
    });
    
    document.querySelectorAll('.delete-link-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.delete-link-btn').dataset.id);
            deleteLink(id);
        });
    });
}

// Edit an existing link
function editLink(id) {
    const link = window.knowledgeBase.links.find(l => l.id === id);
    if (link) {
        document.getElementById('site-name').value = link.name;
        document.getElementById('site-url').value = link.url;
        // Remove the link from the array temporarily
        window.knowledgeBase.links = window.knowledgeBase.links.filter(l => l.id !== id);
        renderLinks();
    }
}

// Delete a link
async function deleteLink(id) {
    if (confirm('Are you sure you want to delete this link?')) {
        try {
            // In a real app, we would call the API to delete from Google Sheets
            // For now, just remove from our local knowledge base
            window.knowledgeBase.links = window.knowledgeBase.links.filter(link => link.id !== id);
            saveData();
            renderLinks();
            showMessage('Link deleted successfully!');
        } catch (error) {
            console.error('Error deleting link:', error);
            showMessage('Error deleting link. Please try again.', 'error');
        }
    }
}

// Filter links based on search input
function filterLinks() {
    const searchTerm = document.getElementById('links-search').value.toLowerCase();
    const linkCards = document.querySelectorAll('#links-container > div');
    
    linkCards.forEach(card => {
        const linkName = card.querySelector('h3').textContent.toLowerCase();
        const linkUrl = card.querySelector('p').textContent.toLowerCase();
        
        if (linkName.includes(searchTerm) || linkUrl.includes(searchTerm)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Handle PDF upload
function handlePdfUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.includes('pdf')) {
        alert('Please upload a PDF file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        const fileData = e.target.result;
        
        try {
            // Simulate saving to Google Drive
            const driveResponse = await window.api.saveToDrive(fileData, file.name, 'pdf');
            
            // Create PDF object
            const pdf = {
                id: Date.now(),
                name: file.name,
                dataUrl: fileData,
                size: formatFileSize(file.size),
                timestamp: new Date().toLocaleString()
            };
            
            // Add to knowledge base
            window.knowledgeBase.pdfs.unshift(pdf);
            
            // Save to localStorage
            saveData();
            
            // Re-render PDFs
            renderPdfs();
            
            // Clear the input
            event.target.value = '';
            
            // Show success message
            showMessage('PDF uploaded successfully!');
        } catch (error) {
            console.error('Error uploading PDF:', error);
            showMessage('Error uploading PDF. Please try again.', 'error');
        }
    };
    reader.readAsDataURL(file);
}

// Render all PDFs
function renderPdfs() {
    const container = document.getElementById('pdfs-container');
    container.innerHTML = '';
    
    if (window.knowledgeBase.pdfs.length === 0) {
        container.innerHTML = '<p class="text-gray-500 dark:text-gray-400 col-span-full text-center py-8">No PDFs yet. Upload your first PDF!</p>';
        return;
    }
    
    window.knowledgeBase.pdfs.forEach(pdf => {
        const pdfCard = document.createElement('div');
        pdfCard.className = 'file-card bg-white/20 dark:bg-gray-800/30 flex flex-col items-center';
        pdfCard.innerHTML = `
            <div class="flex flex-col items-center justify-center w-full h-32 mb-3">
                <i class="fas fa-file-pdf text-4xl text-red-500 mb-2"></i>
                <h3 class="font-semibold text-gray-800 dark:text-white text-center">${pdf.name}</h3>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">${pdf.size} • ${pdf.timestamp}</div>
            <div class="flex justify-center space-x-2">
                <button class="view-pdf-btn text-blue-500 hover:text-blue-700" data-id="${pdf.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="download-pdf-btn text-green-500 hover:text-green-700" data-id="${pdf.id}">
                    <i class="fas fa-download"></i>
                </button>
                <button class="delete-pdf-btn text-red-500 hover:text-red-700" data-id="${pdf.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(pdfCard);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.view-pdf-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.view-pdf-btn').dataset.id);
            viewPdf(id);
        });
    });
    
    document.querySelectorAll('.download-pdf-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.download-pdf-btn').dataset.id);
            downloadPdf(id);
        });
    });
    
    document.querySelectorAll('.delete-pdf-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.delete-pdf-btn').dataset.id);
            deletePdf(id);
        });
    });
}

// View PDF (in new tab)
function viewPdf(id) {
    const pdf = window.knowledgeBase.pdfs.find(p => p.id === id);
    if (pdf) {
        // Create a blob from the data URL and open in new tab
        const byteCharacters = atob(pdf.dataUrl.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {type: 'application/pdf'});
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    }
}

// Download PDF
function downloadPdf(id) {
    const pdf = window.knowledgeBase.pdfs.find(p => p.id === id);
    if (pdf) {
        const link = document.createElement('a');
        link.href = pdf.dataUrl;
        link.download = pdf.name;
        link.click();
    }
}

// Delete PDF
async function deletePdf(id) {
    if (confirm('Are you sure you want to delete this PDF?')) {
        try {
            // Remove from knowledge base
            window.knowledgeBase.pdfs = window.knowledgeBase.pdfs.filter(pdf => pdf.id !== id);
            saveData();
            renderPdfs();
            showMessage('PDF deleted successfully!');
        } catch (error) {
            console.error('Error deleting PDF:', error);
            showMessage('Error deleting PDF. Please try again.', 'error');
        }
    }
}

// Filter PDFs based on search input
function filterPdfs() {
    const searchTerm = document.getElementById('pdfs-search').value.toLowerCase();
    const pdfCards = document.querySelectorAll('#pdfs-container > div');
    
    pdfCards.forEach(card => {
        const pdfName = card.querySelector('h3').textContent.toLowerCase();
        
        if (pdfName.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Handle Image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        const fileData = e.target.result;
        
        try {
            // Simulate saving to Google Drive
            const driveResponse = await window.api.saveToDrive(fileData, file.name, 'image');
            
            // Create image object
            const image = {
                id: Date.now(),
                name: file.name,
                dataUrl: fileData,
                size: formatFileSize(file.size),
                timestamp: new Date().toLocaleString()
            };
            
            // Add to knowledge base
            window.knowledgeBase.images.unshift(image);
            
            // Save to localStorage
            saveData();
            
            // Re-render images
            renderImages();
            
            // Clear the input
            event.target.value = '';
            
            // Show success message
            showMessage('Image uploaded successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            showMessage('Error uploading image. Please try again.', 'error');
        }
    };
    reader.readAsDataURL(file);
}

// Render all images
function renderImages() {
    const container = document.getElementById('images-container');
    container.innerHTML = '';
    
    if (window.knowledgeBase.images.length === 0) {
        container.innerHTML = '<p class="text-gray-500 dark:text-gray-400 col-span-full text-center py-8">No images yet. Upload your first image!</p>';
        return;
    }
    
    window.knowledgeBase.images.forEach(image => {
        const imageCard = document.createElement('div');
        imageCard.className = 'file-card bg-white/20 dark:bg-gray-800/30 flex flex-col items-center overflow-hidden';
        imageCard.innerHTML = `
            <div class="w-full h-32 overflow-hidden flex items-center justify-center">
                <img src="${image.dataUrl}" alt="${image.name}" class="object-cover w-full h-full cursor-pointer view-image-btn" data-id="${image.id}">
            </div>
            <div class="w-full p-2">
                <h3 class="font-semibold text-gray-800 dark:text-white text-sm truncate">${image.name}</h3>
                <div class="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                    <span>${image.size}</span>
                    <span>${image.timestamp}</span>
                </div>
                <div class="flex justify-center space-x-2 mt-2">
                    <button class="download-image-btn text-green-500 hover:text-green-700" data-id="${image.id}">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="delete-image-btn text-red-500 hover:text-red-700" data-id="${image.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(imageCard);
    });
    
    // Add event listeners to image thumbnails and buttons
    document.querySelectorAll('.view-image-btn').forEach(img => {
        img.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            viewImage(id);
        });
    });
    
    document.querySelectorAll('.download-image-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.download-image-btn').dataset.id);
            downloadImage(id);
        });
    });
    
    document.querySelectorAll('.delete-image-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.delete-image-btn').dataset.id);
            deleteImage(id);
        });
    });
}

// View image in lightbox
function viewImage(id) {
    const image = window.knowledgeBase.images.find(i => i.id === id);
    if (image) {
        const lightboxImg = document.getElementById('lightbox-img');
        lightboxImg.src = image.dataUrl;
        const lightboxModal = document.getElementById('lightbox-modal');
        lightboxModal.classList.remove('hidden');
    }
}

// Download image
function downloadImage(id) {
    const image = window.knowledgeBase.images.find(i => i.id === id);
    if (image) {
        const link = document.createElement('a');
        link.href = image.dataUrl;
        link.download = image.name;
        link.click();
    }
}

// Delete image
async function deleteImage(id) {
    if (confirm('Are you sure you want to delete this image?')) {
        try {
            // Remove from knowledge base
            window.knowledgeBase.images = window.knowledgeBase.images.filter(image => image.id !== id);
            saveData();
            renderImages();
            showMessage('Image deleted successfully!');
        } catch (error) {
            console.error('Error deleting image:', error);
            showMessage('Error deleting image. Please try again.', 'error');
        }
    }
}

// Filter images based on search input
function filterImages() {
    const searchTerm = document.getElementById('images-search').value.toLowerCase();
    const imageCards = document.querySelectorAll('#images-container > div');
    
    imageCards.forEach(card => {
        const imageName = card.querySelector('h3').textContent.toLowerCase();
        
        if (imageName.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Handle Video upload
function handleVideoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
        alert('Please upload a video file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        const fileData = e.target.result;
        
        try {
            // Simulate saving to Google Drive
            const driveResponse = await window.api.saveToDrive(fileData, file.name, 'video');
            
            // Create video object
            const video = {
                id: Date.now(),
                name: file.name,
                dataUrl: fileData,
                size: formatFileSize(file.size),
                timestamp: new Date().toLocaleString()
            };
            
            // Add to knowledge base
            window.knowledgeBase.videos.unshift(video);
            
            // Save to localStorage
            saveData();
            
            // Re-render videos
            renderVideos();
            
            // Clear the input
            event.target.value = '';
            
            // Show success message
            showMessage('Video uploaded successfully!');
        } catch (error) {
            console.error('Error uploading video:', error);
            showMessage('Error uploading video. Please try again.', 'error');
        }
    };
    reader.readAsDataURL(file);
}

// Render all videos
function renderVideos() {
    const container = document.getElementById('videos-container');
    container.innerHTML = '';
    
    if (window.knowledgeBase.videos.length === 0) {
        container.innerHTML = '<p class="text-gray-500 dark:text-gray-400 col-span-full text-center py-8">No videos yet. Upload your first video!</p>';
        return;
    }
    
    window.knowledgeBase.videos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'file-card bg-white/20 dark:bg-gray-800/30 flex flex-col items-center';
        videoCard.innerHTML = `
            <div class="w-full h-32 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg mb-3">
                <i class="fas fa-video text-4xl text-yellow-500"></i>
            </div>
            <h3 class="font-semibold text-gray-800 dark:text-white text-center mb-2">${video.name}</h3>
            <div class="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">${video.size} • ${video.timestamp}</div>
            <div class="flex justify-center space-x-2">
                <button class="play-video-btn text-blue-500 hover:text-blue-700" data-id="${video.id}">
                    <i class="fas fa-play-circle"></i>
                </button>
                <button class="download-video-btn text-green-500 hover:text-green-700" data-id="${video.id}">
                    <i class="fas fa-download"></i>
                </button>
                <button class="delete-video-btn text-red-500 hover:text-red-700" data-id="${video.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(videoCard);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.play-video-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.play-video-btn').dataset.id);
            playVideo(id);
        });
    });
    
    document.querySelectorAll('.download-video-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.download-video-btn').dataset.id);
            downloadVideo(id);
        });
    });
    
    document.querySelectorAll('.delete-video-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.delete-video-btn').dataset.id);
            deleteVideo(id);
        });
    });
}

// Play video in modal
function playVideo(id) {
    const video = window.knowledgeBase.videos.find(v => v.id === id);
    if (video) {
        const videoPlayer = document.getElementById('video-player');
        videoPlayer.src = video.dataUrl;
        const videoModal = document.getElementById('video-modal');
        videoModal.classList.remove('hidden');
    }
}

// Download video
function downloadVideo(id) {
    const video = window.knowledgeBase.videos.find(v => v.id === id);
    if (video) {
        const link = document.createElement('a');
        link.href = video.dataUrl;
        link.download = video.name;
        link.click();
    }
}

// Delete video
async function deleteVideo(id) {
    if (confirm('Are you sure you want to delete this video?')) {
        try {
            // Remove from knowledge base
            window.knowledgeBase.videos = window.knowledgeBase.videos.filter(video => video.id !== id);
            saveData();
            renderVideos();
            showMessage('Video deleted successfully!');
        } catch (error) {
            console.error('Error deleting video:', error);
            showMessage('Error deleting video. Please try again.', 'error');
        }
    }
}

// Filter videos based on search input
function filterVideos() {
    const searchTerm = document.getElementById('videos-search').value.toLowerCase();
    const videoCards = document.querySelectorAll('#videos-container > div');
    
    videoCards.forEach(card => {
        const videoName = card.querySelector('h3').textContent.toLowerCase();
        
        if (videoName.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Toggle dark/light mode
function toggleTheme() {
    isDarkMode = !isDarkMode;
    applyTheme();
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

// Load stored data from localStorage
function loadStoredData() {
    const storedData = localStorage.getItem('knowledgeBase');
    if (storedData) {
        window.knowledgeBase = JSON.parse(storedData);
    }
    
    // Load theme preference
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
        isDarkMode = storedTheme === 'dark';
    }
    
    // Render all data
    renderNotes();
    renderLinks();
    renderPdfs();
    renderImages();
    renderVideos();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('knowledgeBase', JSON.stringify(window.knowledgeBase));
}

// Toggle chat window visibility
function toggleChat() {
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) {
        chatInput.focus();
    }
}

// Process chat messages
function processChatMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    chatInput.value = '';
    
    // Process the message and generate response
    setTimeout(() => {
        const response = generateBotResponse(message);
        addMessageToChat(response, 'bot');
    }, 500);
}

// Add message to chat window
function addMessageToChat(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message mb-4`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = `message-content ${
        sender === 'bot' 
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200' 
            : 'bg-blue-500 text-white'
    }`;
    contentDiv.textContent = text;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Generate bot response based on user query
function generateBotResponse(message) {
    const lowerMsg = message.toLowerCase();
    
    // Check for note-related queries
    if (lowerMsg.includes('note') || lowerMsg.includes('thought')) {
        const notes = window.knowledgeBase.notes;
        if (notes.length === 0) {
            return "You don't have any notes saved yet. Would you like to create one?";
        }
        
        const relevantNotes = notes.filter(note => 
            note.content.toLowerCase().includes(lowerMsg.replace('find me the note about', '').trim()) ||
            note.preview.toLowerCase().includes(lowerMsg.replace('find me the note about', '').trim())
        );
        
        if (relevantNotes.length > 0) {
            return `I found ${relevantNotes.length} note(s) related to "${lowerMsg.replace('find me the note about', '').trim()}". You can view them on the Notes page.`;
        } else {
            return `I couldn't find any notes related to "${lowerMsg.replace('find me the note about', '').trim()}". You have ${notes.length} notes in total.`;
        }
    }
    
    // Check for link-related queries
    else if (lowerMsg.includes('link') || lowerMsg.includes('url') || lowerMsg.includes('website')) {
        const links = window.knowledgeBase.links;
        if (links.length === 0) {
            return "You don't have any links saved yet. Would you like to add one?";
        }
        
        const relevantLinks = links.filter(link => 
            link.name.toLowerCase().includes(lowerMsg.replace('show me the link to', '').trim()) ||
            link.url.toLowerCase().includes(lowerMsg.replace('show me the link to', '').trim())
        );
        
        if (relevantLinks.length > 0) {
            return `I found ${relevantLinks.length} link(s) related to "${lowerMsg.replace('show me the link to', '').trim()}". You can view them on the Links page.`;
        } else {
            return `I couldn't find any links related to "${lowerMsg.replace('show me the link to', '').trim()}". You have ${links.length} links in total.`;
        }
    }
    
    // Check for file-related queries
    else if (lowerMsg.includes('file') || lowerMsg.includes('pdf') || lowerMsg.includes('image') || lowerMsg.includes('video')) {
        let totalFiles = 0;
        let fileType = '';
        
        if (lowerMsg.includes('pdf')) {
            totalFiles = window.knowledgeBase.pdfs.length;
            fileType = 'PDF';
        } else if (lowerMsg.includes('image')) {
            totalFiles = window.knowledgeBase.images.length;
            fileType = 'image';
        } else if (lowerMsg.includes('video')) {
            totalFiles = window.knowledgeBase.videos.length;
            fileType = 'video';
        } else {
            totalFiles = window.knowledgeBase.pdfs.length + window.knowledgeBase.images.length + window.knowledgeBase.videos.length;
            fileType = 'file';
        }
        
        if (totalFiles === 0) {
            return `You don't have any ${fileType}s saved yet. Would you like to upload one?`;
        }
        
        return `You have ${totalFiles} ${fileType}${totalFiles > 1 ? 's' : ''} in your vault. You can view them on the respective pages.`;
    }
    
    // Default response
    else {
        return "I'm your knowledge assistant. I can help you find notes, links, and files. Try asking me something like 'Find me the note about project X' or 'Show me the link to YouTube'.";
    }
}

// Show specific feature page
function showFeaturePage(feature) {
    homepage.classList.add('hidden');
    
    // Hide all feature pages first
    notesPage.classList.add('hidden');
    linksPage.classList.add('hidden');
    pdfsPage.classList.add('hidden');
    imagesPage.classList.add('hidden');
    videosPage.classList.add('hidden');
    
    // Show the requested feature page
    switch(feature) {
        case 'notes':
            notesPage.classList.remove('hidden');
            break;
        case 'links':
            linksPage.classList.remove('hidden');
            break;
        case 'pdfs':
            pdfsPage.classList.remove('hidden');
            break;
        case 'images':
            imagesPage.classList.remove('hidden');
            break;
        case 'videos':
            videosPage.classList.remove('hidden');
            break;
        default:
            homepage.classList.remove('hidden');
    }
}

// Show homepage
function showHomepage() {
    homepage.classList.remove('hidden');
    
    // Hide all feature pages
    notesPage.classList.add('hidden');
    linksPage.classList.add('hidden');
    pdfsPage.classList.add('hidden');
    imagesPage.classList.add('hidden');
    videosPage.classList.add('hidden');
}

// Google Apps Script API functions
const api = {
    // Save to Google Sheet via Apps Script
    saveToSheet: async (data, sheetType) => {
        try {
            const response = await fetch('https://script.google.com/macros/s/AKfycbyt83zzd9MvrnfTBdFdZh8MaYLneA-5cKYKTcallFpANOTC8yLV2-5We-_1FR0zr0Abvw/exec', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'saveToSheet',
                    data: data,
                    sheetType: sheetType
                })
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error saving to sheet:', error);
            throw error;
        }
    },
    
    // Read from Google Sheet via Apps Script
    readFromSheet: async (sheetType) => {
        try {
            const response = await fetch('https://script.google.com/macros/s/AKfycbyt83zzd9MvrnfTBdFdZh8MaYLneA-5cKYKTcallFpANOTC8yLV2-5We-_1FR0zr0Abvw/exec', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'readFromSheet',
                    sheetType: sheetType
                })
            });
            
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error reading from sheet:', error);
            throw error;
        }
    },
    
    // Save to Google Drive via Apps Script
    saveToDrive: async (fileData, fileName, fileType) => {
        try {
            const response = await fetch('https://script.google.com/macros/s/AKfycbyt83zzd9MvrnfTBdFdZh8MaYLneA-5cKYKTcallFpANOTC8yLV2-5We-_1FR0zr0Abvw/exec', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'saveToDrive',
                    fileData: fileData,
                    fileName: fileName,
                    fileType: fileType
                })
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error saving to drive:', error);
            throw error;
        }
    },
    
    // Read from Google Drive via Apps Script
    readFromDrive: async (fileId) => {
        try {
            const response = await fetch('https://script.google.com/macros/s/AKfycbyt83zzd9MvrnfTBdFdZh8MaYLneA-5cKYKTcallFpANOTC8yLV2-5We-_1FR0zr0Abvw/exec', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'readFromDrive',
                    fileId: fileId
                })
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error reading from drive:', error);
            throw error;
        }
    }
};

// Export the API for use in other modules
window.api = api;