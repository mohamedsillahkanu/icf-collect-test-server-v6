// ICF Collect - Main Application Script
// Version 3.1 - Fixed Authentication & Field Handlers

// ============================================
// CORE STATE & CONFIGURATION
// ============================================

const state = {
    currentUser: null,
    fields: [],
    selectedFieldId: null,
    dhis2Config: {},
    sheetsConfig: {},
    googleConfig: {},
    formData: [],
    cascadeData: {},
    currentPage: 0,
    totalPages: 1,
    currentFormId: null,
    formName: '',
    db: null,
    viewMode: 'home'
};

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxrOyPzwUt9hT-B3--cT3RJ3Ok3sNgXbLYwyLiASuP2cLb8WqVq8eTa-Q8wJv7TDyQ/exec';

const DB_CONFIG = { 
    name: 'ICFCollectDB', 
    version: 5, 
    userStore: 'users', 
    formsStore: 'forms', 
    dataStore: 'submissions', 
    draftsStore: 'drafts' 
};

// ============================================
// ICON SYSTEM
// ============================================

const ICONS = {
    'clipboard-list': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>',
    'user': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    'user-plus': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>',
    'unlock': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>',
    'home': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
    'file-plus': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>',
    'save': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>',
    'eye': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    'link': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',
    'share-2': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>',
    'log-out': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
    'calendar-days': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    'type': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>',
    'hash': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>',
    'calculator': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="8" y1="10" x2="8" y2="10.01"></line><line x1="12" y1="10" x2="12" y2="10.01"></line><line x1="16" y1="10" x2="16" y2="10.01"></line><line x1="8" y1="14" x2="8" y2="14.01"></line><line x1="12" y1="14" x2="12" y2="14.01"></line><line x1="16" y1="14" x2="16" y2="14.01"></line><line x1="8" y1="18" x2="8" y2="18.01"></line><line x1="12" y1="18" x2="12" y2="18.01"></line><line x1="16" y1="18" x2="16" y2="18.01"></line></svg>',
    'calendar': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    'clock': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    'mail': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
    'phone': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
    'align-left': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>',
    'check-square': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>',
    'chevron-down-square': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="8 10 12 14 16 10"></polyline></svg>',
    'circle-dot': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3" fill="currentColor"></circle></svg>',
    'toggle-left': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect><circle cx="8" cy="12" r="3"></circle></svg>',
    'map-pin': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
    'qr-code': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
    'git-branch': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>',
    'star': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
    'folder': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
    'settings': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
    'mouse-pointer-click': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 9 5 12 1.774-5.226L21 14 9 9z"></path><path d="m16.071 16.071 4.243 4.243"></path><path d="m7.188 2.239.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656-2.12 2.122"></path></svg>',
    'bar-chart-3': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>',
    'arrow-up': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>',
    'arrow-down': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>',
    'arrow-left': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
    'arrow-right': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
    'trash-2': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',
    'copy': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
    'plus': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
    'x': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    'x-circle': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    'check': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    'check-circle': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    'search': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
    'globe': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
    'refresh-cw': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>',
    'send': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
    'edit': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
    'edit-3': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>',
    'file-text': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    'sparkles': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>',
    'layout': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>',
    'info': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    'alert-triangle': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    'wifi': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>',
    'wifi-off': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>',
    'crosshair': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>',
    'rocket': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>',
    'list': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
    'database': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>'
};

function getIcon(name, size = 16) {
    const svg = ICONS[name] || ICONS['info'];
    return '<span class="inline-icon" style="width:'+size+'px;height:'+size+'px;display:inline-flex;align-items:center;">'+svg.replace('viewBox', 'width="'+size+'" height="'+size+'" viewBox')+'</span>';
}

function initializeIcons() {
    document.querySelectorAll('[data-icon]').forEach(el => {
        const icon = el.getAttribute('data-icon');
        const size = el.getAttribute('data-size') || 16;
        el.innerHTML = getIcon(icon, size);
    });
}

// ============================================
// INDEXED DB OPERATIONS
// ============================================

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);
        
        request.onerror = () => {
            console.error('Database error:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            state.db = request.result;
            resolve(request.result);
        };
        
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            
            if (!db.objectStoreNames.contains(DB_CONFIG.userStore)) {
                db.createObjectStore(DB_CONFIG.userStore, { keyPath: 'email' });
            }
            if (!db.objectStoreNames.contains(DB_CONFIG.formsStore)) {
                const formsStore = db.createObjectStore(DB_CONFIG.formsStore, { keyPath: 'id', autoIncrement: true });
                formsStore.createIndex('userEmail', 'userEmail', { unique: false });
            }
            if (!db.objectStoreNames.contains(DB_CONFIG.dataStore)) {
                const dataStore = db.createObjectStore(DB_CONFIG.dataStore, { keyPath: 'id', autoIncrement: true });
                dataStore.createIndex('formId', 'formId', { unique: false });
            }
            if (!db.objectStoreNames.contains(DB_CONFIG.draftsStore)) {
                const draftsStore = db.createObjectStore(DB_CONFIG.draftsStore, { keyPath: 'id', autoIncrement: true });
                draftsStore.createIndex('formId', 'formId', { unique: false });
            }
        };
    });
}

async function dbOperation(storeName, mode, operation) {
    if (!state.db) {
        await openDB();
    }
    return new Promise((resolve, reject) => {
        try {
            const transaction = state.db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);
            const request = operation(store);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        } catch (err) {
            reject(err);
        }
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showNotification(message, type = 'success') {
    const n = document.getElementById('notification');
    if (!n) return;
    n.textContent = message;
    n.className = 'notification show ' + type;
    setTimeout(() => n.classList.remove('show'), 3000);
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('show');
}

function generateId() {
    return 'field_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function sanitizeForId(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').substring(0, 50) || 'field';
}

function compressData(data) {
    try {
        const jsonStr = JSON.stringify(data);
        if (typeof pako !== 'undefined') {
            const compressed = pako.deflate(jsonStr);
            return btoa(String.fromCharCode.apply(null, compressed));
        }
        return btoa(encodeURIComponent(jsonStr));
    } catch (e) {
        return btoa(encodeURIComponent(JSON.stringify(data)));
    }
}

function decompressData(compressed) {
    try {
        const binary = atob(compressed);
        if (typeof pako !== 'undefined') {
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            const decompressed = pako.inflate(bytes, { to: 'string' });
            return JSON.parse(decompressed);
        }
        return JSON.parse(decodeURIComponent(binary));
    } catch (e) {
        try { return JSON.parse(decodeURIComponent(atob(compressed))); } catch (e2) { return null; }
    }
}

function addSyncLog(message, type = 'info') {
    const log = document.getElementById('syncLog');
    if (!log) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry ' + type;
    entry.textContent = '[' + new Date().toLocaleTimeString() + '] ' + message;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

// ============================================
// AUTHENTICATION
// ============================================

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    const tabEl = document.querySelector('.auth-tab[data-tab="'+tab+'"]');
    if (tabEl) tabEl.classList.add('active');
    
    const formId = tab === 'login' ? 'loginForm' : tab === 'signup' ? 'signupForm' : 'forgotForm';
    const form = document.getElementById(formId);
    if (form) form.classList.add('active');
    
    // Clear messages
    const error = document.getElementById('authError');
    const success = document.getElementById('authSuccess');
    if (error) error.style.display = 'none';
    if (success) success.style.display = 'none';
}

function showForgotPassword() {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById('forgotForm').classList.add('active');
}

async function handleLogin(e) {
    if (e) e.preventDefault();
    
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const errorEl = document.getElementById('authError');
    const loadingEl = document.getElementById('authLoading');
    
    if (!emailInput || !passwordInput) {
        console.error('Login inputs not found');
        return false;
    }
    
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    
    if (!email || !password) {
        if (errorEl) {
            errorEl.textContent = 'Please enter email and password';
            errorEl.style.display = 'block';
        }
        return false;
    }
    
    if (errorEl) errorEl.style.display = 'none';
    if (loadingEl) loadingEl.style.display = 'block';
    
    try {
        await openDB();
        const user = await dbOperation(DB_CONFIG.userStore, 'readonly', store => store.get(email));
        
        if (user && user.password === password) {
            state.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            document.getElementById('authContainer').style.display = 'none';
            document.getElementById('mainContainer').classList.add('show');
            document.getElementById('headerUser').innerHTML = getIcon('user', 14) + ' ' + user.name;
            
            showNotification('Welcome back, ' + user.name + '!');
            initializeIcons();
            showHome();
        } else {
            if (errorEl) {
                errorEl.textContent = 'Invalid email/username or password';
                errorEl.style.display = 'block';
            }
        }
    } catch (err) {
        console.error('Login error:', err);
        if (errorEl) {
            errorEl.textContent = 'Login failed: ' + err.message;
            errorEl.style.display = 'block';
        }
    }
    
    if (loadingEl) loadingEl.style.display = 'none';
    return false;
}

async function handleSignup(e) {
    if (e) e.preventDefault();
    
    const nameInput = document.getElementById('signupName');
    const emailInput = document.getElementById('signupEmail');
    const passwordInput = document.getElementById('signupPassword');
    const errorEl = document.getElementById('authError');
    const successEl = document.getElementById('authSuccess');
    const loadingEl = document.getElementById('authLoading');
    
    if (!nameInput || !emailInput || !passwordInput) {
        console.error('Signup inputs not found');
        return false;
    }
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    
    if (!name || !email || !password) {
        if (errorEl) {
            errorEl.textContent = 'Please fill in all fields';
            errorEl.style.display = 'block';
        }
        return false;
    }
    
    if (password.length < 6) {
        if (errorEl) {
            errorEl.textContent = 'Password must be at least 6 characters';
            errorEl.style.display = 'block';
        }
        return false;
    }
    
    if (errorEl) errorEl.style.display = 'none';
    if (loadingEl) loadingEl.style.display = 'block';
    
    try {
        await openDB();
        const existing = await dbOperation(DB_CONFIG.userStore, 'readonly', store => store.get(email));
        
        if (existing) {
            if (errorEl) {
                errorEl.textContent = 'User already exists with this email/username';
                errorEl.style.display = 'block';
            }
        } else {
            const user = { email, name, password, createdAt: new Date().toISOString() };
            await dbOperation(DB_CONFIG.userStore, 'readwrite', store => store.add(user));
            
            if (successEl) {
                successEl.textContent = 'Account created successfully! Please login.';
                successEl.style.display = 'block';
            }
            
            // Clear form and switch to login
            nameInput.value = '';
            emailInput.value = '';
            passwordInput.value = '';
            
            setTimeout(() => switchAuthTab('login'), 1500);
        }
    } catch (err) {
        console.error('Signup error:', err);
        if (errorEl) {
            errorEl.textContent = 'Signup failed: ' + err.message;
            errorEl.style.display = 'block';
        }
    }
    
    if (loadingEl) loadingEl.style.display = 'none';
    return false;
}

async function handleForgotPassword(e) {
    if (e) e.preventDefault();
    
    const emailInput = document.getElementById('forgotEmail');
    const errorEl = document.getElementById('authError');
    const successEl = document.getElementById('authSuccess');
    const loadingEl = document.getElementById('authLoading');
    
    if (!emailInput) return false;
    
    const email = emailInput.value.trim().toLowerCase();
    
    if (!email) {
        if (errorEl) {
            errorEl.textContent = 'Please enter your email/username';
            errorEl.style.display = 'block';
        }
        return false;
    }
    
    if (errorEl) errorEl.style.display = 'none';
    if (loadingEl) loadingEl.style.display = 'block';
    
    try {
        await openDB();
        const user = await dbOperation(DB_CONFIG.userStore, 'readonly', store => store.get(email));
        
        if (user) {
            if (successEl) {
                successEl.textContent = 'Your password is: ' + user.password;
                successEl.style.display = 'block';
            }
        } else {
            if (errorEl) {
                errorEl.textContent = 'User not found';
                errorEl.style.display = 'block';
            }
        }
    } catch (err) {
        if (errorEl) {
            errorEl.textContent = 'Error: ' + err.message;
            errorEl.style.display = 'block';
        }
    }
    
    if (loadingEl) loadingEl.style.display = 'none';
    return false;
}

function logout() {
    state.currentUser = null;
    state.fields = [];
    state.selectedFieldId = null;
    state.currentFormId = null;
    localStorage.removeItem('currentUser');
    
    document.getElementById('mainContainer').classList.remove('show');
    document.getElementById('viewerContainer').classList.remove('show');
    document.getElementById('homeContainer').classList.remove('show');
    document.getElementById('authContainer').style.display = 'flex';
    
    showNotification('Logged out successfully', 'info');
}

// ============================================
// FORM MANAGEMENT
// ============================================

async function loadUserForms() {
    if (!state.currentUser) return [];
    
    try {
        await openDB();
        const transaction = state.db.transaction(DB_CONFIG.formsStore, 'readonly');
        const store = transaction.objectStore(DB_CONFIG.formsStore);
        const index = store.index('userEmail');
        
        return new Promise((resolve, reject) => {
            const request = index.getAll(state.currentUser.email);
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.error('Error loading forms:', err);
        return [];
    }
}

async function saveForm(form) {
    return dbOperation(DB_CONFIG.formsStore, 'readwrite', store => form.id ? store.put(form) : store.add(form));
}

async function deleteForm(formId) {
    return dbOperation(DB_CONFIG.formsStore, 'readwrite', store => store.delete(formId));
}

async function saveCurrentForm() {
    if (!state.currentUser) { 
        showNotification('Please login first', 'error'); 
        return; 
    }
    
    const titleInput = document.getElementById('formTitle');
    const form = {
        id: state.currentFormId,
        userEmail: state.currentUser.email,
        title: titleInput ? titleInput.value : 'Untitled Form',
        fields: state.fields,
        dhis2Config: state.dhis2Config,
        sheetsConfig: state.sheetsConfig,
        updatedAt: new Date().toISOString()
    };
    
    if (!form.id) form.createdAt = new Date().toISOString();
    
    try {
        const id = await saveForm(form);
        if (!state.currentFormId) state.currentFormId = id;
        showNotification('Form saved successfully!');
    } catch (err) {
        showNotification('Failed to save form: ' + err.message, 'error');
    }
}

function newForm() {
    if (state.fields.length > 0 && !confirm('Create a new form? Unsaved changes will be lost.')) return;
    
    state.fields = [];
    state.selectedFieldId = null;
    state.currentFormId = null;
    state.dhis2Config = {};
    state.sheetsConfig = {};
    state.formName = 'My Data Collection Form';
    
    const titleInput = document.getElementById('formTitle');
    const previewTitle = document.getElementById('previewTitle');
    
    if (titleInput) titleInput.value = 'My Data Collection Form';
    if (previewTitle) previewTitle.textContent = 'My Data Collection Form';
    
    renderFields();
    renderProperties();
    showNotification('New form created', 'info');
}

async function loadForm(formId) {
    try {
        const form = await dbOperation(DB_CONFIG.formsStore, 'readonly', store => store.get(formId));
        
        if (form) {
            state.currentFormId = form.id;
            state.fields = form.fields || [];
            state.formName = form.title;
            state.dhis2Config = form.dhis2Config || {};
            state.sheetsConfig = form.sheetsConfig || {};
            
            const titleInput = document.getElementById('formTitle');
            const previewTitle = document.getElementById('previewTitle');
            
            if (titleInput) titleInput.value = form.title;
            if (previewTitle) previewTitle.textContent = form.title;
            
            renderFields();
            renderProperties();
            
            document.getElementById('homeContainer').classList.remove('show');
            document.getElementById('viewerContainer').classList.remove('show');
            document.getElementById('mainContainer').classList.add('show');
            
            showNotification('Form loaded: ' + form.title);
        }
    } catch (err) {
        showNotification('Failed to load form: ' + err.message, 'error');
    }
}

// ============================================
// HOME VIEW
// ============================================

async function showHome() {
    document.getElementById('mainContainer').classList.remove('show');
    document.getElementById('viewerContainer').classList.remove('show');
    document.getElementById('homeContainer').classList.add('show');
    
    const forms = await loadUserForms();
    const homeContainer = document.getElementById('homeContainer');
    
    let html = '<div style="max-width:900px;margin:90px auto 30px;padding:20px;">';
    html += '<div style="background:linear-gradient(135deg,#004080,#002855);color:white;padding:30px;border-radius:12px;margin-bottom:25px;text-align:center;">';
    html += '<img src="https://github.com/mohamedsillahkanu/gdp-dashboard-2/raw/6c7463b0d5c3be150aafae695a4bcbbd8aeb1499/ICF-SL.jpg" style="width:80px;border-radius:10px;margin-bottom:15px;">';
    html += '<h1 style="margin:0 0 8px 0;">'+getIcon('clipboard-list', 28)+' ICF Collect</h1>';
    html += '<p style="opacity:0.9;font-size:14px;">DHIS2 & Google Sheets Integration</p>';
    html += '<p style="opacity:0.7;font-size:12px;margin-top:10px;">Welcome, '+(state.currentUser?.name || 'User')+'!</p>';
    html += '</div>';
    
    html += '<div style="display:flex;gap:15px;margin-bottom:25px;flex-wrap:wrap;">';
    html += '<button onclick="newForm();document.getElementById(\'homeContainer\').classList.remove(\'show\');document.getElementById(\'mainContainer\').classList.add(\'show\');" class="modal-btn success" style="flex:1;min-width:200px;padding:18px;">';
    html += getIcon('file-plus', 20)+' Create New Form</button></div>';
    
    html += '<div style="background:white;border-radius:12px;border:3px solid #004080;overflow:hidden;">';
    html += '<div style="background:#004080;color:white;padding:15px 20px;font-weight:700;">'+getIcon('folder', 18)+' My Forms ('+forms.length+')</div>';
    html += '<div style="padding:15px;">';
    
    if (forms.length === 0) {
        html += '<div style="text-align:center;padding:40px;color:#666;">'+getIcon('file-text', 48)+'<p style="margin-top:15px;">No forms yet. Create your first form!</p></div>';
    } else {
        forms.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
        forms.forEach(form => {
            const fieldCount = form.fields?.length || 0;
            const date = new Date(form.updatedAt || form.createdAt).toLocaleDateString();
            
            html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:15px;border:2px solid #e9ecef;border-radius:8px;margin-bottom:10px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#004080\';this.style.background=\'#f8f9fa\';" onmouseout="this.style.borderColor=\'#e9ecef\';this.style.background=\'white\';">';
            html += '<div onclick="loadForm('+form.id+')" style="flex:1;">';
            html += '<div style="font-weight:700;color:#004080;font-size:14px;">'+getIcon('file-text', 16)+' '+form.title+'</div>';
            html += '<div style="font-size:11px;color:#666;margin-top:4px;">'+fieldCount+' fields • Updated: '+date+'</div>';
            html += '<div style="margin-top:6px;">';
            if (form.dhis2Config && form.dhis2Config.url) html += '<span style="background:#e8f4fc;color:#17a2b8;padding:2px 8px;border-radius:12px;font-size:9px;font-weight:700;">DHIS2</span>';
            if (form.sheetsConfig) html += '<span style="background:#e6f4ea;color:#0f9d58;padding:2px 8px;border-radius:12px;font-size:9px;font-weight:700;margin-left:4px;">Sheets</span>';
            html += '</div></div>';
            html += '<div style="display:flex;gap:8px;">';
            html += '<button onclick="event.stopPropagation();loadForm('+form.id+');" class="modal-btn primary" style="padding:8px 14px;font-size:11px;">'+getIcon('edit', 12)+' Edit</button>';
            html += '<button onclick="event.stopPropagation();previewFormById('+form.id+');" class="modal-btn" style="padding:8px 14px;font-size:11px;background:#17a2b8;color:white;">'+getIcon('eye', 12)+' Preview</button>';
            html += '<button onclick="event.stopPropagation();if(confirm(\'Delete this form?\'))deleteFormAndRefresh('+form.id+');" class="modal-btn danger" style="padding:8px 14px;font-size:11px;">'+getIcon('trash-2', 12)+'</button>';
            html += '</div></div>';
        });
    }
    
    html += '</div></div></div>';
    homeContainer.innerHTML = html;
    initializeIcons();
}

async function previewFormById(formId) {
    await loadForm(formId);
    previewForm();
}

async function deleteFormAndRefresh(formId) {
    try {
        await deleteForm(formId);
        showNotification('Form deleted');
        showHome();
    } catch (err) {
        showNotification('Failed to delete form', 'error');
    }
}

// ============================================
// FIELD BUILDER
// ============================================

function addField(type) {
    const field = {
        id: generateId(),
        type: type,
        label: getDefaultLabel(type),
        name: sanitizeForId(getDefaultLabel(type)) + '_' + Date.now(),
        required: false,
        placeholder: '',
        helpText: '',
        options: ['select', 'radio', 'checkbox'].includes(type) ? ['Option 1', 'Option 2', 'Option 3'] : [],
        validation: [],
        logic: [],
        dhis2: { enabled: false, dataElementId: '', isAggregate: false, aggregationType: 'SUM' },
        cascadeConfig: type === 'cascade' ? { levels: ['Level 1', 'Level 2'], data: {} } : null,
        formula: type === 'calculation' ? '' : null,
        ratingMax: type === 'rating' ? 5 : null
    };
    
    state.fields.push(field);
    state.selectedFieldId = field.id;
    
    renderFields();
    renderProperties();
    updateFieldCount();
    
    showNotification('Added: ' + field.label, 'success');
}

function getDefaultLabel(type) {
    const labels = {
        'text': 'Text Field', 'number': 'Number Field', 'calculation': 'Calculated Field',
        'date': 'Date Field', 'time': 'Time Field', 'email': 'Email Address',
        'phone': 'Phone Number', 'textarea': 'Long Text', 'select': 'Dropdown Selection',
        'radio': 'Radio Selection', 'checkbox': 'Checkbox Selection', 'yesno': 'Yes/No Question',
        'gps': 'GPS Location', 'qrcode': 'QR/Barcode Scanner', 'cascade': 'Cascading Selection',
        'rating': 'Rating', 'section': 'New Section', 'period': 'Reporting Period'
    };
    return labels[type] || 'Field';
}

function updateFieldCount() {
    const count = state.fields.filter(f => f.type !== 'section').length;
    const el = document.getElementById('fieldCount');
    if (el) el.innerHTML = getIcon('bar-chart-3', 12) + ' ' + count + ' fields';
}

// ============================================
// FIELD RENDERING
// ============================================

function renderFields() {
    const dropZone = document.getElementById('dropZone');
    if (!dropZone) return;
    
    if (state.fields.length === 0) {
        dropZone.className = 'drop-zone';
        dropZone.innerHTML = '<p style="font-size:48px;margin-bottom:12px;">'+getIcon('mouse-pointer-click', 48)+'</p><p style="font-weight:600;">Click field types to add them</p><p style="font-size:11px;color:#868e96;margin-top:10px;">Add Period + Org Unit fields for DHIS2 sync</p>';
        initializeIcons();
        return;
    }
    
    dropZone.className = 'drop-zone has-fields';
    let html = '';
    
    state.fields.forEach((field, index) => {
        if (field.type === 'section') {
            html += renderSection(field, index);
        } else {
            html += renderFormField(field, index);
        }
    });
    
    dropZone.innerHTML = html;
    initializeIcons();
}

function renderSection(field, index) {
    const isSelected = state.selectedFieldId === field.id;
    return '<div class="section-divider '+(isSelected ? 'selected' : '')+'" onclick="selectField(\''+field.id+'\')"><span>'+getIcon('folder', 16)+' '+field.label+'</span><div style="display:flex;gap:4px;">'+(index > 0 ? '<button class="field-action-btn" onclick="event.stopPropagation();moveField('+index+', -1)" title="Move Up">'+getIcon('arrow-up', 12)+'</button>' : '')+(index < state.fields.length - 1 ? '<button class="field-action-btn" onclick="event.stopPropagation();moveField('+index+', 1)" title="Move Down">'+getIcon('arrow-down', 12)+'</button>' : '')+'<button class="field-action-btn delete" onclick="event.stopPropagation();deleteField(\''+field.id+'\')">'+getIcon('trash-2', 12)+'</button></div></div>';
}

function renderFormField(field, index) {
    const isSelected = state.selectedFieldId === field.id;
    let badges = '';
    
    if (field.required) badges += '<span class="field-badge required">Required</span>';
    if (field.dhis2?.enabled) badges += '<span class="field-badge dhis2">DHIS2</span>';
    if (field.dhis2?.isAggregate) badges += '<span class="field-badge aggregate">Aggregate</span>';
    if (field.type === 'cascade') badges += '<span class="field-badge cascade">Cascade</span>';
    if (field.type === 'calculation') badges += '<span class="field-badge calc">Calculated</span>';
    
    let fieldClass = 'form-field';
    if (isSelected) fieldClass += ' selected';
    if (field.dhis2?.enabled) fieldClass += ' dhis2-field';
    if (field.type === 'cascade') fieldClass += ' cascade-field';
    
    return '<div class="'+fieldClass+'" onclick="selectField(\''+field.id+'\')"><div class="form-field-header"><span class="form-field-label">'+field.label+' '+badges+'</span><div class="form-field-actions"><button class="field-action-btn" onclick="event.stopPropagation();duplicateField(\''+field.id+'\')" title="Duplicate">'+getIcon('copy', 12)+'</button>'+(index > 0 ? '<button class="field-action-btn" onclick="event.stopPropagation();moveField('+index+', -1)" title="Move Up">'+getIcon('arrow-up', 12)+'</button>' : '')+(index < state.fields.length - 1 ? '<button class="field-action-btn" onclick="event.stopPropagation();moveField('+index+', 1)" title="Move Down">'+getIcon('arrow-down', 12)+'</button>' : '')+'<button class="field-action-btn delete" onclick="event.stopPropagation();deleteField(\''+field.id+'\')">'+getIcon('trash-2', 12)+'</button></div></div>'+renderFieldPreview(field)+'</div>';
}

function renderFieldPreview(field) {
    const placeholder = field.placeholder || '';
    switch (field.type) {
        case 'text': case 'email': case 'phone':
            return '<input type="text" class="property-input" placeholder="'+placeholder+'" disabled>';
        case 'number':
            return '<input type="number" class="property-input" placeholder="'+placeholder+'" disabled>';
        case 'calculation':
            return '<input type="text" class="property-input" placeholder="Auto-calculated" disabled style="background:#fff3cd;">';
        case 'date':
            return '<input type="date" class="property-input" disabled>';
        case 'time':
            return '<input type="time" class="property-input" disabled>';
        case 'textarea':
            return '<textarea class="property-textarea" placeholder="'+placeholder+'" disabled></textarea>';
        case 'select':
            return '<select class="property-select" disabled><option>'+(field.options[0] || 'Select...')+'</option></select>';
        case 'radio':
            return field.options.slice(0, 2).map(opt => '<label style="display:flex;align-items:center;gap:6px;font-size:11px;padding:4px 0;"><input type="radio" disabled> '+opt+'</label>').join('');
        case 'checkbox':
            return field.options.slice(0, 2).map(opt => '<label style="display:flex;align-items:center;gap:6px;font-size:11px;padding:4px 0;"><input type="checkbox" disabled> '+opt+'</label>').join('');
        case 'yesno':
            return '<div style="display:flex;gap:10px;"><label style="display:flex;align-items:center;gap:4px;font-size:11px;"><input type="radio" disabled> Yes</label><label style="display:flex;align-items:center;gap:4px;font-size:11px;"><input type="radio" disabled> No</label></div>';
        case 'gps':
            return '<div style="background:#e8f4fc;padding:10px;border-radius:6px;font-size:11px;text-align:center;">'+getIcon('map-pin', 16)+' Click to capture GPS coordinates</div>';
        case 'qrcode':
            return '<div style="background:#f8f9fa;padding:10px;border-radius:6px;font-size:11px;text-align:center;">'+getIcon('qr-code', 16)+' Click to scan QR/Barcode</div>';
        case 'cascade':
            return '<div style="background:#e8f4fc;padding:10px;border-radius:6px;font-size:11px;">'+getIcon('git-branch', 14)+' Cascading: '+(field.cascadeConfig?.levels?.join(' → ') || 'Not configured')+'</div>';
        case 'rating':
            var stars = '';
            for (var i = 0; i < (field.ratingMax || 5); i++) stars += '★';
            return '<div style="font-size:20px;color:#ffc107;">'+stars+'</div>';
        case 'period':
            return '<input type="month" class="property-input" disabled>';
        default:
            return '<input type="text" class="property-input" disabled>';
    }
}

// ============================================
// FIELD OPERATIONS
// ============================================

function selectField(id) {
    state.selectedFieldId = id;
    renderFields();
    renderProperties();
}

function deleteField(id) {
    state.fields = state.fields.filter(f => f.id !== id);
    if (state.selectedFieldId === id) state.selectedFieldId = null;
    renderFields();
    renderProperties();
    updateFieldCount();
}

function duplicateField(id) {
    const field = state.fields.find(f => f.id === id);
    if (!field) return;
    
    const newField = JSON.parse(JSON.stringify(field));
    newField.id = generateId();
    newField.label = field.label + ' (Copy)';
    newField.name = sanitizeForId(newField.label) + '_' + Date.now();
    
    const index = state.fields.findIndex(f => f.id === id);
    state.fields.splice(index + 1, 0, newField);
    state.selectedFieldId = newField.id;
    
    renderFields();
    renderProperties();
    updateFieldCount();
}

function moveField(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= state.fields.length) return;
    
    const field = state.fields.splice(index, 1)[0];
    state.fields.splice(newIndex, 0, field);
    renderFields();
}

// ============================================
// PROPERTIES PANEL
// ============================================

function renderProperties() {
    const container = document.getElementById('propertiesContent');
    if (!container) return;
    
    if (!state.selectedFieldId) {
        container.innerHTML = '<div class="no-selection"><p style="font-size:32px;margin-bottom:12px;">'+getIcon('mouse-pointer-click', 32)+'</p><p>Select a field to edit</p></div>';
        initializeIcons();
        return;
    }
    
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field) return;
    
    let html = '<div class="prop-section"><div class="prop-section-title">'+getIcon('edit-3', 14)+' Basic Settings</div>';
    html += '<div class="property-group"><label class="property-label">Label</label><input type="text" class="property-input" value="'+field.label+'" onchange="updateFieldProp(\'label\', this.value)"></div>';
    html += '<div class="property-group"><label class="property-label">Field Name (ID)</label><input type="text" class="property-input" value="'+field.name+'" onchange="updateFieldProp(\'name\', sanitizeForId(this.value))"></div>';
    
    if (field.type !== 'section') {
        html += '<div class="property-group"><label class="property-label">Placeholder</label><input type="text" class="property-input" value="'+(field.placeholder || '')+'" onchange="updateFieldProp(\'placeholder\', this.value)"></div>';
        html += '<div class="property-group"><label class="property-label">Help Text</label><input type="text" class="property-input" value="'+(field.helpText || '')+'" onchange="updateFieldProp(\'helpText\', this.value)"></div>';
        html += '<label class="property-checkbox"><input type="checkbox" '+(field.required ? 'checked' : '')+' onchange="updateFieldProp(\'required\', this.checked)"> Required field</label>';
    }
    html += '</div>';
    
    // Options editor
    if (['select', 'radio', 'checkbox'].includes(field.type)) {
        html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('list', 14)+' Options</div><div id="optionsList">';
        field.options.forEach((opt, i) => {
            html += '<div style="display:flex;gap:6px;margin-bottom:6px;"><input type="text" class="property-input" value="'+opt+'" onchange="updateOption('+i+', this.value)" style="flex:1;"><button class="field-action-btn delete" onclick="removeOption('+i+')">'+getIcon('x', 12)+'</button></div>';
        });
        html += '</div><button class="logic-add-btn" onclick="addOption()">'+getIcon('plus', 12)+' Add Option</button></div>';
    }
    
    // Rating settings
    if (field.type === 'rating') {
        html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('star', 14)+' Rating Settings</div>';
        html += '<div class="property-group"><label class="property-label">Max Stars</label><select class="property-select" onchange="updateFieldProp(\'ratingMax\', parseInt(this.value))">';
        [3,4,5,6,7,8,9,10].forEach(n => { html += '<option value="'+n+'" '+(field.ratingMax === n ? 'selected' : '')+'>'+n+' stars</option>'; });
        html += '</select></div></div>';
    }
    
    // DHIS2 settings
    if (field.type !== 'section') {
        html += '<div class="prop-section" style="background:#e8f4fc;border-color:#17a2b8;"><div class="prop-section-title" style="color:#17a2b8;">'+getIcon('link', 14)+' DHIS2 Mapping</div>';
        html += '<label class="property-checkbox"><input type="checkbox" '+(field.dhis2?.enabled ? 'checked' : '')+' onchange="updateDhis2Prop(\'enabled\', this.checked)"> Map to DHIS2 Data Element</label>';
        if (field.dhis2?.enabled) {
            html += '<div class="property-group" style="margin-top:10px;"><label class="property-label">Data Element ID</label><input type="text" class="property-input" value="'+(field.dhis2?.dataElementId || '')+'" onchange="updateDhis2Prop(\'dataElementId\', this.value)" placeholder="Leave empty for auto-generation"></div>';
            html += '<label class="property-checkbox"><input type="checkbox" '+(field.dhis2?.isAggregate ? 'checked' : '')+' onchange="updateDhis2Prop(\'isAggregate\', this.checked)"> Aggregate Field (sum values)</label>';
            if (field.dhis2?.isAggregate) {
                html += '<div class="property-group"><label class="property-label">Aggregation Type</label><select class="property-select" onchange="updateDhis2Prop(\'aggregationType\', this.value)">';
                html += '<option value="SUM" '+(field.dhis2?.aggregationType === 'SUM' ? 'selected' : '')+'>Sum</option>';
                html += '<option value="COUNT" '+(field.dhis2?.aggregationType === 'COUNT' ? 'selected' : '')+'>Count</option>';
                html += '<option value="AVERAGE" '+(field.dhis2?.aggregationType === 'AVERAGE' ? 'selected' : '')+'>Average</option>';
                html += '</select></div>';
            }
        }
        html += '</div>';
    }
    
    container.innerHTML = html;
    initializeIcons();
}

function updateFieldProp(prop, value) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field) {
        field[prop] = value;
        renderFields();
    }
}

function updateOption(index, value) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.options) field.options[index] = value;
}

function addOption() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.options) {
        field.options.push('Option ' + (field.options.length + 1));
        renderProperties();
    }
}

function removeOption(index) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.options && field.options.length > 1) {
        field.options.splice(index, 1);
        renderProperties();
    }
}

function updateDhis2Prop(prop, value) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field) return;
    if (!field.dhis2) field.dhis2 = { enabled: false, dataElementId: '', isAggregate: false, aggregationType: 'SUM' };
    field.dhis2[prop] = value;
    renderFields();
    renderProperties();
}

// ============================================
// DHIS2 CONFIGURATION
// ============================================

function openDhis2Config() {
    const modal = document.getElementById('dhis2Modal');
    if (modal) modal.classList.add('show');
    populateDhis2FieldSelectors();
    
    if (state.dhis2Config && state.dhis2Config.url) {
        document.getElementById('dhis2Url').value = state.dhis2Config.url || '';
        document.getElementById('dhis2Username').value = state.dhis2Config.username || '';
        document.getElementById('dhis2Password').value = state.dhis2Config.password || '';
    }
}

function populateDhis2FieldSelectors() {
    const periodSelect = document.getElementById('dhis2PeriodColumn');
    const orgUnitSelect = document.getElementById('dhis2OrgUnitColumn');
    
    if (!periodSelect || !orgUnitSelect) return;
    
    const options = state.fields.filter(f => f.type !== 'section').map(f => '<option value="'+f.name+'">'+f.label+'</option>').join('');
    
    periodSelect.innerHTML = '<option value="">-- Select field --</option>' + options;
    orgUnitSelect.innerHTML = '<option value="">-- Select field --</option>' + options;
    
    if (state.dhis2Config) {
        periodSelect.value = state.dhis2Config.periodColumn || '';
        orgUnitSelect.value = state.dhis2Config.orgUnitColumn || '';
    }
}

function selectSyncMode(mode) {
    document.querySelectorAll('.sync-mode-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.mode === mode) opt.classList.add('selected');
    });
    
    const aggregateConfig = document.getElementById('aggregateConfig');
    const trackerConfig = document.getElementById('trackerConfig');
    
    if (aggregateConfig) aggregateConfig.style.display = mode === 'aggregate' ? 'block' : 'none';
    if (trackerConfig) trackerConfig.style.display = mode === 'tracker' ? 'block' : 'none';
}

function saveDhis2Config() {
    const mode = document.querySelector('.sync-mode-option.selected')?.dataset.mode || 'aggregate';
    
    state.dhis2Config = {
        url: document.getElementById('dhis2Url')?.value.replace(/\/$/, '') || '',
        username: document.getElementById('dhis2Username')?.value || '',
        password: document.getElementById('dhis2Password')?.value || '',
        syncMode: mode,
        periodColumn: document.getElementById('dhis2PeriodColumn')?.value || '',
        orgUnitColumn: document.getElementById('dhis2OrgUnitColumn')?.value || '',
        orgLevel: document.getElementById('dhis2OrgLevel')?.value || '5',
        periodType: document.getElementById('dhis2PeriodType')?.value || 'Monthly',
        programId: document.getElementById('dhis2ProgramId')?.value || ''
    };
    
    showNotification('DHIS2 configuration saved!');
}

async function testDhis2Connection() {
    const url = document.getElementById('dhis2Url')?.value.replace(/\/$/, '');
    const username = document.getElementById('dhis2Username')?.value;
    const password = document.getElementById('dhis2Password')?.value;
    
    if (!url || !username || !password) {
        showNotification('Please fill in all connection details', 'error');
        return;
    }
    
    addSyncLog('Testing connection to ' + url + '...', 'info');
    
    try {
        const response = await fetch(url + '/api/me', {
            headers: { 'Authorization': 'Basic ' + btoa(username + ':' + password) }
        });
        
        if (response.ok) {
            const data = await response.json();
            const statusEl = document.getElementById('dhis2Status');
            if (statusEl) {
                statusEl.className = 'status-badge connected';
                statusEl.innerHTML = getIcon('check-circle', 14) + ' <span>Connected as ' + data.displayName + '</span>';
            }
            addSyncLog('Connected successfully as ' + data.displayName, 'success');
            showNotification('DHIS2 connection successful!');
            initializeIcons();
        } else {
            throw new Error('Authentication failed');
        }
    } catch (err) {
        const statusEl = document.getElementById('dhis2Status');
        if (statusEl) {
            statusEl.className = 'status-badge disconnected';
            statusEl.innerHTML = getIcon('x-circle', 14) + ' <span>Connection failed</span>';
        }
        addSyncLog('Connection failed: ' + err.message, 'error');
        showNotification('Connection failed: ' + err.message, 'error');
        initializeIcons();
    }
}

async function setupDhis2() {
    showNotification('DHIS2 setup - Feature in development', 'info');
    addSyncLog('DHIS2 setup not yet fully implemented', 'warning');
}

async function syncCaseBased() {
    showNotification('Case-based sync - Feature in development', 'info');
}

async function syncAggregate() {
    showNotification('Aggregate sync - Feature in development', 'info');
}

// ============================================
// SHARE FORM
// ============================================

function shareForm() {
    if (state.fields.length === 0) {
        showNotification('Add some fields first', 'warning');
        return;
    }
    
    const titleInput = document.getElementById('formTitle');
    const formData = {
        title: titleInput ? titleInput.value : 'Form',
        fields: state.fields,
        dhis2Config: state.dhis2Config,
        sheetsConfig: state.sheetsConfig
    };
    
    const compressed = compressData(formData);
    const shareUrl = window.location.origin + window.location.pathname + '?form=' + compressed;
    
    const shareUrlEl = document.getElementById('shareUrl');
    if (shareUrlEl) shareUrlEl.textContent = shareUrl;
    
    const modal = document.getElementById('shareModal');
    if (modal) modal.classList.add('show');
}

function copyShareUrl() {
    const shareUrlEl = document.getElementById('shareUrl');
    if (!shareUrlEl) return;
    
    const url = shareUrlEl.textContent;
    navigator.clipboard.writeText(url).then(() => {
        showNotification('URL copied to clipboard!');
    }).catch(() => {
        showNotification('Failed to copy URL', 'error');
    });
}

// ============================================
// FORM PREVIEW / VIEWER
// ============================================

function previewForm() {
    if (state.fields.length === 0) {
        showNotification('Add some fields first', 'warning');
        return;
    }
    
    document.getElementById('mainContainer').classList.remove('show');
    document.getElementById('homeContainer').classList.remove('show');
    document.getElementById('viewerContainer').classList.add('show');
    
    renderFormViewer();
}

function exitViewer() {
    document.getElementById('viewerContainer').classList.remove('show');
    document.getElementById('mainContainer').classList.add('show');
}

function renderFormViewer() {
    const container = document.getElementById('viewerContainer');
    if (!container) return;
    
    const titleInput = document.getElementById('formTitle');
    const formTitle = titleInput ? titleInput.value : 'Data Collection Form';
    
    // Build pages from sections
    const pages = [];
    let currentPage = { title: 'Page 1', fields: [] };
    
    state.fields.forEach(field => {
        if (field.type === 'section') {
            if (currentPage.fields.length > 0) pages.push(currentPage);
            currentPage = { title: field.label, fields: [] };
        } else {
            currentPage.fields.push(field);
        }
    });
    if (currentPage.fields.length > 0) pages.push(currentPage);
    
    state.totalPages = pages.length;
    state.currentPage = 0;
    
    let html = '<div class="viewer-nav">';
    html += '<button class="viewer-back-btn" onclick="exitViewer()">'+getIcon('arrow-left', 14)+' Exit Preview</button>';
    html += '<button class="viewer-nav-btn active" style="background:#004080;color:white;">'+getIcon('edit-3', 14)+' Form</button>';
    html += '<div class="connection-status '+(navigator.onLine ? 'online' : 'offline')+'">'+(navigator.onLine ? getIcon('wifi', 12)+' Online' : getIcon('wifi-off', 12)+' Offline')+'</div>';
    html += '</div>';
    
    html += '<div class="viewer-tab active" id="formTab"><div class="viewer-form"><div class="viewer-form-box">';
    html += '<div class="viewer-header"><img src="https://github.com/mohamedsillahkanu/gdp-dashboard-2/raw/6c7463b0d5c3be150aafae695a4bcbbd8aeb1499/ICF-SL.jpg"><h1>'+formTitle+'</h1><p>ICF-SL Data Collection System</p></div>';
    html += '<div class="viewer-body"><form id="dataEntryForm" onsubmit="return submitViewerForm(event)">';
    
    if (pages.length > 1) {
        html += '<div class="page-header"><span class="page-indicator">Page <span id="currentPageNum">1</span> of '+pages.length+'</span><h3 class="page-title" id="pageTitle">'+pages[0].title+'</h3></div>';
    }
    
    pages.forEach((page, pageIndex) => {
        html += '<div class="form-page" id="page-'+pageIndex+'" style="'+(pageIndex > 0 ? 'display:none;' : '')+'">';
        page.fields.forEach(field => {
            html += renderViewerField(field);
        });
        html += '</div>';
    });
    
    html += '<div class="page-navigation">';
    if (pages.length > 1) {
        html += '<button type="button" class="nav-btn back-btn" id="prevBtn" onclick="prevPage()" style="visibility:hidden;">'+getIcon('arrow-left', 14)+' Previous</button>';
        html += '<button type="button" class="nav-btn next-btn" id="nextBtn" onclick="nextPage()">Next '+getIcon('arrow-right', 14)+'</button>';
    }
    html += '<button type="submit" class="nav-btn submit-btn" id="submitBtn" '+(pages.length > 1 ? 'style="display:none;"' : '')+'>'+getIcon('send', 14)+' Submit</button>';
    html += '</div></form></div></div></div></div>';
    
    container.innerHTML = html;
    initializeIcons();
}

function renderViewerField(field) {
    const required = field.required ? '<span style="color:#dc3545;">*</span>' : '';
    const helpText = field.helpText ? '<p style="font-size:10px;color:#666;margin-top:4px;">'+field.helpText+'</p>' : '';
    
    let inputHtml = '';
    
    switch (field.type) {
        case 'text':
            inputHtml = '<input type="text" class="viewer-input" name="'+field.name+'" placeholder="'+(field.placeholder || '')+'" '+(field.required ? 'required' : '')+'>';
            break;
        case 'number':
            inputHtml = '<input type="number" class="viewer-input" name="'+field.name+'" placeholder="'+(field.placeholder || '')+'" '+(field.required ? 'required' : '')+' step="any">';
            break;
        case 'date':
            inputHtml = '<input type="date" class="viewer-input" name="'+field.name+'" '+(field.required ? 'required' : '')+'>';
            break;
        case 'time':
            inputHtml = '<input type="time" class="viewer-input" name="'+field.name+'" '+(field.required ? 'required' : '')+'>';
            break;
        case 'email':
            inputHtml = '<input type="email" class="viewer-input" name="'+field.name+'" placeholder="'+(field.placeholder || '')+'" '+(field.required ? 'required' : '')+'>';
            break;
        case 'phone':
            inputHtml = '<input type="tel" class="viewer-input" name="'+field.name+'" placeholder="'+(field.placeholder || '')+'" '+(field.required ? 'required' : '')+'>';
            break;
        case 'textarea':
            inputHtml = '<textarea class="viewer-input" name="'+field.name+'" placeholder="'+(field.placeholder || '')+'" '+(field.required ? 'required' : '')+' rows="4"></textarea>';
            break;
        case 'select':
            inputHtml = '<select class="viewer-input" name="'+field.name+'" '+(field.required ? 'required' : '')+'><option value="">-- Select --</option>'+field.options.map(opt => '<option value="'+opt+'">'+opt+'</option>').join('')+'</select>';
            break;
        case 'radio':
            inputHtml = '<div class="viewer-radio-group">'+field.options.map(opt => '<label class="viewer-radio-option"><input type="radio" name="'+field.name+'" value="'+opt+'" '+(field.required ? 'required' : '')+'> '+opt+'</label>').join('')+'</div>';
            break;
        case 'checkbox':
            inputHtml = '<div class="viewer-radio-group">'+field.options.map(opt => '<label class="viewer-radio-option"><input type="checkbox" name="'+field.name+'" value="'+opt+'"> '+opt+'</label>').join('')+'</div>';
            break;
        case 'yesno':
            inputHtml = '<div class="viewer-radio-group" style="flex-direction:row;"><label class="viewer-radio-option" style="flex:1;"><input type="radio" name="'+field.name+'" value="Yes" '+(field.required ? 'required' : '')+'> Yes</label><label class="viewer-radio-option" style="flex:1;"><input type="radio" name="'+field.name+'" value="No"> No</label></div>';
            break;
        case 'gps':
            inputHtml = '<div style="display:flex;gap:8px;"><input type="text" class="viewer-input" name="'+field.name+'" readonly placeholder="Click to capture GPS" style="flex:1;"><button type="button" class="modal-btn primary" onclick="captureGPS(\''+field.name+'\')" style="padding:10px 16px;">'+getIcon('crosshair', 14)+'</button></div>';
            break;
        case 'rating':
            var stars = '';
            for (var i = 1; i <= (field.ratingMax || 5); i++) {
                stars += '<span class="rating-star" data-value="'+i+'" onclick="setRating(\''+field.name+'\', '+i+')" style="font-size:28px;cursor:pointer;color:#ddd;">★</span>';
            }
            inputHtml = '<div class="rating-input" data-field="'+field.name+'"><input type="hidden" name="'+field.name+'" value="">'+stars+'</div>';
            break;
        case 'period':
            inputHtml = '<input type="month" class="viewer-input" name="'+field.name+'" '+(field.required ? 'required' : '')+'>';
            break;
        default:
            inputHtml = '<input type="text" class="viewer-input" name="'+field.name+'" placeholder="'+(field.placeholder || '')+'">';
    }
    
    return '<div class="viewer-field" id="field-'+field.name+'" data-field-id="'+field.id+'"><label class="viewer-field-label">'+field.label+' '+required+'</label>'+inputHtml+helpText+'</div>';
}

function captureGPS(fieldName) {
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported', 'error');
        return;
    }
    
    showNotification('Capturing GPS...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const coords = position.coords.latitude.toFixed(6) + ', ' + position.coords.longitude.toFixed(6);
            const input = document.querySelector('input[name="'+fieldName+'"]');
            if (input) input.value = coords;
            showNotification('GPS captured: ' + coords);
        },
        (error) => {
            showNotification('GPS error: ' + error.message, 'error');
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

function setRating(fieldName, value) {
    const container = document.querySelector('.rating-input[data-field="'+fieldName+'"]');
    if (!container) return;
    
    const input = container.querySelector('input');
    if (input) input.value = value;
    
    container.querySelectorAll('.rating-star').forEach(star => {
        star.style.color = parseInt(star.dataset.value) <= value ? '#ffc107' : '#ddd';
    });
}

function nextPage() {
    if (state.currentPage < state.totalPages - 1) {
        const currentEl = document.getElementById('page-' + state.currentPage);
        if (currentEl) currentEl.style.display = 'none';
        
        state.currentPage++;
        
        const nextEl = document.getElementById('page-' + state.currentPage);
        if (nextEl) nextEl.style.display = 'block';
        
        updatePageNavigation();
    }
}

function prevPage() {
    if (state.currentPage > 0) {
        const currentEl = document.getElementById('page-' + state.currentPage);
        if (currentEl) currentEl.style.display = 'none';
        
        state.currentPage--;
        
        const prevEl = document.getElementById('page-' + state.currentPage);
        if (prevEl) prevEl.style.display = 'block';
        
        updatePageNavigation();
    }
}

function updatePageNavigation() {
    const pageNumEl = document.getElementById('currentPageNum');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (pageNumEl) pageNumEl.textContent = state.currentPage + 1;
    if (prevBtn) prevBtn.style.visibility = state.currentPage > 0 ? 'visible' : 'hidden';
    
    if (state.currentPage === state.totalPages - 1) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'inline-flex';
    } else {
        if (nextBtn) nextBtn.style.display = 'inline-flex';
        if (submitBtn) submitBtn.style.display = 'none';
    }
}

function getFormData() {
    const form = document.getElementById('dataEntryForm');
    if (!form) return {};
    
    const formData = {};
    const data = new FormData(form);
    
    for (let [key, value] of data.entries()) {
        if (formData[key]) {
            if (Array.isArray(formData[key])) {
                formData[key].push(value);
            } else {
                formData[key] = [formData[key], value];
            }
        } else {
            formData[key] = value;
        }
    }
    
    return formData;
}

async function submitViewerForm(event) {
    if (event) event.preventDefault();
    
    const formData = getFormData();
    formData._submittedAt = new Date().toISOString();
    formData._formId = state.currentFormId;
    formData._syncStatus = 'pending';
    
    try {
        await dbOperation(DB_CONFIG.dataStore, 'readwrite', store => store.add(formData));
        showNotification('Data submitted successfully!');
        
        const form = document.getElementById('dataEntryForm');
        if (form) form.reset();
    } catch (err) {
        showNotification('Failed to save data: ' + err.message, 'error');
    }
    
    return false;
}

// ============================================
// URL HANDLING & ONLINE STATUS
// ============================================

function loadFormFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const formData = params.get('form');
    
    if (formData) {
        try {
            const decompressed = decompressData(formData);
            if (decompressed) {
                state.fields = decompressed.fields || [];
                state.dhis2Config = decompressed.dhis2Config || {};
                state.sheetsConfig = decompressed.sheetsConfig || {};
                
                const titleInput = document.getElementById('formTitle');
                const previewTitle = document.getElementById('previewTitle');
                
                if (decompressed.title) {
                    if (titleInput) titleInput.value = decompressed.title;
                    if (previewTitle) previewTitle.textContent = decompressed.title;
                }
                
                renderFields();
                renderProperties();
                updateFieldCount();
                
                showNotification('Form loaded from shared link!');
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (err) {
            console.error('Failed to load form from URL:', err);
        }
    }
}

function updateOnlineStatus() {
    const indicator = document.getElementById('offlineIndicator');
    const statusElements = document.querySelectorAll('.connection-status');
    
    if (navigator.onLine) {
        if (indicator) indicator.style.display = 'none';
        statusElements.forEach(el => {
            el.className = 'connection-status online';
            el.innerHTML = getIcon('wifi', 12) + ' Online';
        });
    } else {
        if (indicator) indicator.style.display = 'block';
        statusElements.forEach(el => {
            el.className = 'connection-status offline';
            el.innerHTML = getIcon('wifi-off', 12) + ' Offline';
        });
    }
    initializeIcons();
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// ============================================
// INITIALIZATION
// ============================================

async function initApp() {
    console.log('ICF Collect initializing...');
    
    try {
        // Initialize database
        await openDB();
        console.log('Database initialized');
    } catch (err) {
        console.error('Database init failed:', err);
    }
    
    // Initialize icons
    initializeIcons();
    
    // Set up form submit handlers
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.onsubmit = handleLogin;
    }
    
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.onsubmit = handleSignup;
    }
    
    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.onsubmit = handleForgotPassword;
    }
    
    // Set up auth tab click handlers
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.style.cursor = 'pointer';
        tab.onclick = function() {
            const tabName = this.getAttribute('data-tab');
            if (tabName) switchAuthTab(tabName);
        };
    });
    
    // Set up field type click handlers
    document.querySelectorAll('.field-type').forEach(el => {
        el.style.cursor = 'pointer';
        el.onclick = function() {
            const type = this.getAttribute('data-type');
            if (type) {
                addField(type);
                // Visual feedback
                this.style.transform = 'scale(0.95)';
                this.style.background = '#e8f4fc';
                setTimeout(() => {
                    this.style.transform = '';
                    this.style.background = '';
                }, 150);
            }
        };
    });
    
    // Form title sync
    const formTitle = document.getElementById('formTitle');
    const previewTitle = document.getElementById('previewTitle');
    if (formTitle && previewTitle) {
        formTitle.oninput = function() {
            previewTitle.textContent = this.value || 'My Data Collection Form';
        };
    }
    
    // Check for form in URL
    loadFormFromUrl();
    
    // Update online status
    updateOnlineStatus();
    
    // Check for existing session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            const dbUser = await dbOperation(DB_CONFIG.userStore, 'readonly', store => store.get(user.email));
            
            if (dbUser) {
                state.currentUser = dbUser;
                document.getElementById('authContainer').style.display = 'none';
                document.getElementById('mainContainer').classList.add('show');
                document.getElementById('headerUser').innerHTML = getIcon('user', 14) + ' ' + dbUser.name;
                initializeIcons();
                showHome();
                console.log('Session restored for:', dbUser.name);
                return;
            }
        } catch (e) {
            console.log('Session restore failed:', e);
            localStorage.removeItem('currentUser');
        }
    }
    
    // Show auth screen
    document.getElementById('authContainer').style.display = 'flex';
    console.log('ICF Collect ready!');
}

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Global exports
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleForgotPassword = handleForgotPassword;
window.switchAuthTab = switchAuthTab;
window.showForgotPassword = showForgotPassword;
window.logout = logout;
window.showHome = showHome;
window.newForm = newForm;
window.saveCurrentForm = saveCurrentForm;
window.previewForm = previewForm;
window.exitViewer = exitViewer;
window.loadForm = loadForm;
window.deleteFormAndRefresh = deleteFormAndRefresh;
window.previewFormById = previewFormById;
window.addField = addField;
window.selectField = selectField;
window.deleteField = deleteField;
window.duplicateField = duplicateField;
window.moveField = moveField;
window.updateFieldProp = updateFieldProp;
window.updateDhis2Prop = updateDhis2Prop;
window.addOption = addOption;
window.removeOption = removeOption;
window.updateOption = updateOption;
window.openDhis2Config = openDhis2Config;
window.testDhis2Connection = testDhis2Connection;
window.saveDhis2Config = saveDhis2Config;
window.selectSyncMode = selectSyncMode;
window.setupDhis2 = setupDhis2;
window.syncCaseBased = syncCaseBased;
window.syncAggregate = syncAggregate;
window.shareForm = shareForm;
window.copyShareUrl = copyShareUrl;
window.closeModal = closeModal;
window.captureGPS = captureGPS;
window.setRating = setRating;
window.nextPage = nextPage;
window.prevPage = prevPage;
window.submitViewerForm = submitViewerForm;
window.sanitizeForId = sanitizeForId;

console.log('ICF Collect v3.1 loaded');
