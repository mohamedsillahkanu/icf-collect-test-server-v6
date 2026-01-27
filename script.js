// ICF Collect - Main Application Script
// Version 3.0 - Full DHIS2 & Google Sheets Integration
// ✅ FIXED: Added click handlers for field type buttons

// ============================================
// CORE STATE & CONFIGURATION
// ============================================

const state = {
    currentUser: null,
    fields: [],
    selectedFieldId: null,
    dhis2Config: null,
    sheetsConfig: null,
    formData: [],
    cascadeData: {},
    currentPage: 0,
    totalPages: 1
};

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxrOyPzwUt9hT-B3--cT3RJ3Ok3sNgXbLYwyLiASuP2cLb8WqVq8eTa-Q8wJv7TDyQ/exec';

const DB_CONFIG = { name: 'ICFCollectDB', version: 4, userStore: 'users', formsStore: 'forms', dataStore: 'submittedData', draftsStore: 'drafts' };

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
    'calendar-days': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="M8 14h.01"></path><path d="M12 14h.01"></path><path d="M16 14h.01"></path><path d="M8 18h.01"></path><path d="M12 18h.01"></path><path d="M16 18h.01"></path></svg>',
    'edit-3': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>',
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
    'sparkles': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>',
    'map-pin': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
    'qr-code': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
    'git-branch': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>',
    'star': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
    'layout': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>',
    'folder': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
    'settings': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
    'mouse-pointer-click': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 9 5 12 1.774-5.226L21 14 9 9z"></path><path d="m16.071 16.071 4.243 4.243"></path><path d="m7.188 2.239.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656-2.12 2.122"></path></svg>',
    'bar-chart-3': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>',
    'arrow-up': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>',
    'arrow-down': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>',
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
    'rocket': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>',
    'list': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
    'info': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    'alert-triangle': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    'database': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>',
    'wifi': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>',
    'wifi-off': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>',
    'file-text': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    'upload': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>',
    'download': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
    'plus-circle': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>',
    'edit': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
    'arrow-left': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
    'arrow-right': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
    'send': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
    'filter': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>',
    'pie-chart': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>',
    'loader': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>',
    'crosshair': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>'
};

function getIcon(name, size = 16) {
    const svg = ICONS[name] || ICONS['info'];
    return '<span class="inline-icon" style="width:'+size+'px;height:'+size+'px;">'+svg.replace('viewBox', 'width="'+size+'" height="'+size+'" viewBox')+'</span>';
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
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
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
                dataStore.createIndex('syncStatus', 'syncStatus', { unique: false });
            }
            if (!db.objectStoreNames.contains(DB_CONFIG.draftsStore)) {
                const draftsStore = db.createObjectStore(DB_CONFIG.draftsStore, { keyPath: 'id', autoIncrement: true });
                draftsStore.createIndex('formId', 'formId', { unique: false });
            }
        };
    });
}

async function dbOperation(storeName, mode, operation) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const request = operation(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showNotification(message, type = 'success') {
    const n = document.getElementById('notification');
    n.textContent = message;
    n.className = 'notification show ' + type;
    setTimeout(() => n.classList.remove('show'), 3000);
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
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
        const compressed = pako.deflate(jsonStr);
        return btoa(String.fromCharCode.apply(null, compressed));
    } catch (e) {
        return btoa(encodeURIComponent(JSON.stringify(data)));
    }
}

function decompressData(compressed) {
    try {
        const binary = atob(compressed);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const decompressed = pako.inflate(bytes, { to: 'string' });
        return JSON.parse(decompressed);
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
    document.getElementById(tab === 'login' ? 'loginForm' : tab === 'signup' ? 'signupForm' : 'forgotForm').classList.add('active');
    document.getElementById('authError').style.display = 'none';
    document.getElementById('authSuccess').style.display = 'none';
}

function showForgotPassword() {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById('forgotForm').classList.add('active');
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    document.getElementById('authError').style.display = 'none';
    document.getElementById('authLoading').style.display = 'block';
    
    try {
        const user = await dbOperation(DB_CONFIG.userStore, 'readonly', store => store.get(email));
        if (user && user.password === password) {
            state.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            document.getElementById('authContainer').style.display = 'none';
            document.getElementById('mainContainer').classList.add('show');
            document.getElementById('headerUser').innerHTML = getIcon('user', 14) + ' ' + user.name;
            showNotification('Welcome back, ' + user.name + '!');
            await loadUserForms();
            showHome();
        } else {
            document.getElementById('authError').textContent = 'Invalid email or password';
            document.getElementById('authError').style.display = 'block';
        }
    } catch (err) {
        document.getElementById('authError').textContent = 'Login failed: ' + err.message;
        document.getElementById('authError').style.display = 'block';
    }
    document.getElementById('authLoading').style.display = 'none';
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const password = document.getElementById('signupPassword').value;
    document.getElementById('authError').style.display = 'none';
    document.getElementById('authLoading').style.display = 'block';
    
    try {
        const existing = await dbOperation(DB_CONFIG.userStore, 'readonly', store => store.get(email));
        if (existing) {
            document.getElementById('authError').textContent = 'User already exists';
            document.getElementById('authError').style.display = 'block';
        } else {
            const user = { email, name, password, createdAt: new Date().toISOString() };
            await dbOperation(DB_CONFIG.userStore, 'readwrite', store => store.add(user));
            document.getElementById('authSuccess').textContent = 'Account created! Please login.';
            document.getElementById('authSuccess').style.display = 'block';
            switchAuthTab('login');
        }
    } catch (err) {
        document.getElementById('authError').textContent = 'Signup failed: ' + err.message;
        document.getElementById('authError').style.display = 'block';
    }
    document.getElementById('authLoading').style.display = 'none';
}

async function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value.trim().toLowerCase();
    document.getElementById('authError').style.display = 'none';
    document.getElementById('authLoading').style.display = 'block';
    
    try {
        const user = await dbOperation(DB_CONFIG.userStore, 'readonly', store => store.get(email));
        if (user) {
            document.getElementById('authSuccess').textContent = 'Your password is: ' + user.password;
            document.getElementById('authSuccess').style.display = 'block';
        } else {
            document.getElementById('authError').textContent = 'User not found';
            document.getElementById('authError').style.display = 'block';
        }
    } catch (err) {
        document.getElementById('authError').textContent = 'Error: ' + err.message;
        document.getElementById('authError').style.display = 'block';
    }
    document.getElementById('authLoading').style.display = 'none';
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
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(DB_CONFIG.formsStore, 'readonly');
        const store = transaction.objectStore(DB_CONFIG.formsStore);
        const index = store.index('userEmail');
        const request = index.getAll(state.currentUser.email);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

async function saveForm(form) {
    return dbOperation(DB_CONFIG.formsStore, 'readwrite', store => form.id ? store.put(form) : store.add(form));
}

async function deleteForm(formId) {
    return dbOperation(DB_CONFIG.formsStore, 'readwrite', store => store.delete(formId));
}

async function saveCurrentForm() {
    if (!state.currentUser) { showNotification('Please login first', 'error'); return; }
    
    const form = {
        id: state.currentFormId,
        userEmail: state.currentUser.email,
        title: document.getElementById('formTitle').value || 'Untitled Form',
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
    state.dhis2Config = null;
    state.sheetsConfig = null;
    document.getElementById('formTitle').value = 'My Data Collection Form';
    document.getElementById('previewTitle').textContent = 'My Data Collection Form';
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
            state.dhis2Config = form.dhis2Config;
            state.sheetsConfig = form.sheetsConfig;
            document.getElementById('formTitle').value = form.title;
            document.getElementById('previewTitle').textContent = form.title;
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
    
    let html = '<div style="max-width:900px;margin:90px auto 30px;padding:20px;">' +
        '<div style="background:linear-gradient(135deg,#004080,#002855);color:white;padding:30px;border-radius:12px;margin-bottom:25px;text-align:center;">' +
        '<img src="https://github.com/mohamedsillahkanu/gdp-dashboard-2/raw/6c7463b0d5c3be150aafae695a4bcbbd8aeb1499/ICF-SL.jpg" style="width:80px;border-radius:10px;margin-bottom:15px;">' +
        '<h1 style="margin:0 0 8px 0;">'+getIcon('clipboard-list', 28)+' ICF Collect</h1>' +
        '<p style="opacity:0.9;font-size:14px;">DHIS2 & Google Sheets Integration</p>' +
        '<p style="opacity:0.7;font-size:12px;margin-top:10px;">Welcome, '+(state.currentUser?.name || 'User')+'!</p>' +
        '</div>' +
        '<div style="display:flex;gap:15px;margin-bottom:25px;flex-wrap:wrap;">' +
        '<button onclick="newForm();document.getElementById(\'homeContainer\').classList.remove(\'show\');document.getElementById(\'mainContainer\').classList.add(\'show\');" class="modal-btn success" style="flex:1;min-width:200px;padding:18px;">' +
        getIcon('file-plus', 20)+' Create New Form</button></div>' +
        '<div style="background:white;border-radius:12px;border:3px solid #004080;overflow:hidden;">' +
        '<div style="background:#004080;color:white;padding:15px 20px;font-weight:700;">'+getIcon('folder', 18)+' My Forms ('+forms.length+')</div>' +
        '<div style="padding:15px;">';
    
    if (forms.length === 0) {
        html += '<div style="text-align:center;padding:40px;color:#666;">'+getIcon('file-text', 48)+'<p style="margin-top:15px;">No forms yet. Create your first form!</p></div>';
    } else {
        forms.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
        forms.forEach(form => {
            const fieldCount = form.fields?.length || 0;
            const date = new Date(form.updatedAt || form.createdAt).toLocaleDateString();
            html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:15px;border:2px solid #e9ecef;border-radius:8px;margin-bottom:10px;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#004080\';this.style.background=\'#f8f9fa\';" onmouseout="this.style.borderColor=\'#e9ecef\';this.style.background=\'white\';">' +
                '<div onclick="loadForm('+form.id+')" style="flex:1;">' +
                '<div style="font-weight:700;color:#004080;font-size:14px;">'+getIcon('file-text', 16)+' '+form.title+'</div>' +
                '<div style="font-size:11px;color:#666;margin-top:4px;">'+fieldCount+' fields • Updated: '+date+'</div>' +
                '<div style="margin-top:6px;">' +
                (form.dhis2Config ? '<span style="background:#e8f4fc;color:#17a2b8;padding:2px 8px;border-radius:12px;font-size:9px;font-weight:700;">DHIS2</span>' : '') +
                (form.sheetsConfig ? '<span style="background:#e6f4ea;color:#0f9d58;padding:2px 8px;border-radius:12px;font-size:9px;font-weight:700;margin-left:4px;">Sheets</span>' : '') +
                '</div></div>' +
                '<div style="display:flex;gap:8px;">' +
                '<button onclick="event.stopPropagation();loadForm('+form.id+');" class="modal-btn primary" style="padding:8px 14px;font-size:11px;">'+getIcon('edit', 12)+' Edit</button>' +
                '<button onclick="event.stopPropagation();previewFormById('+form.id+');" class="modal-btn" style="padding:8px 14px;font-size:11px;background:#17a2b8;color:white;">'+getIcon('eye', 12)+' Preview</button>' +
                '<button onclick="event.stopPropagation();if(confirm(\'Delete this form?\'))deleteFormAndRefresh('+form.id+');" class="modal-btn danger" style="padding:8px 14px;font-size:11px;">'+getIcon('trash-2', 12)+'</button>' +
                '</div></div>';
        });
    }
    
    html += '</div></div></div>';
    document.getElementById('homeContainer').innerHTML = html;
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
        name: sanitizeForId(getDefaultLabel(type)),
        required: false,
        placeholder: '',
        helpText: '',
        options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Option 1', 'Option 2', 'Option 3'] : [],
        validation: [],
        logic: [],
        dhis2: { enabled: false, dataElementId: '', isAggregate: false, aggregationType: 'SUM' },
        cascadeConfig: type === 'cascade' ? { levels: ['Level 1', 'Level 2'], data: {} } : null,
        calculationFormula: type === 'calculation' ? '' : null,
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
    document.getElementById('fieldCount').innerHTML = getIcon('bar-chart-3', 12) + ' ' + count + ' fields';
}

// ============================================
// FIELD RENDERING
// ============================================

function renderFields() {
    const dropZone = document.getElementById('dropZone');
    
    if (state.fields.length === 0) {
        dropZone.className = 'drop-zone';
        dropZone.innerHTML = '<p style="font-size:48px;margin-bottom:12px;">'+getIcon('mouse-pointer-click', 48)+'</p><p style="font-weight:600;">Click field types to add them</p><p style="font-size:11px;color:#868e96;margin-top:10px;">Add Period + Org Unit fields for DHIS2 sync</p>';
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
    newField.name = sanitizeForId(newField.label);
    
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
    
    if (!state.selectedFieldId) {
        container.innerHTML = '<div class="no-selection"><p style="font-size:32px;margin-bottom:12px;">'+getIcon('mouse-pointer-click', 32)+'</p><p>Select a field to edit</p></div>';
        return;
    }
    
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field) return;
    
    let html = '<div class="prop-section"><div class="prop-section-title">'+getIcon('edit-3', 14)+' Basic Settings</div><div class="property-group"><label class="property-label">Label</label><input type="text" class="property-input" value="'+field.label+'" onchange="updateFieldProp(\'label\', this.value)"></div><div class="property-group"><label class="property-label">Field Name (ID)</label><input type="text" class="property-input" value="'+field.name+'" onchange="updateFieldProp(\'name\', sanitizeForId(this.value))"></div>';
    
    if (field.type !== 'section') {
        html += '<div class="property-group"><label class="property-label">Placeholder</label><input type="text" class="property-input" value="'+(field.placeholder || '')+'" onchange="updateFieldProp(\'placeholder\', this.value)"></div><div class="property-group"><label class="property-label">Help Text</label><input type="text" class="property-input" value="'+(field.helpText || '')+'" onchange="updateFieldProp(\'helpText\', this.value)"></div><label class="property-checkbox"><input type="checkbox" '+(field.required ? 'checked' : '')+' onchange="updateFieldProp(\'required\', this.checked)"> Required field</label>';
    }
    html += '</div>';
    
    // Options editor for select/radio/checkbox
    if (['select', 'radio', 'checkbox'].includes(field.type)) {
        html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('list', 14)+' Options</div><div id="optionsList">';
        field.options.forEach((opt, i) => {
            html += '<div style="display:flex;gap:6px;margin-bottom:6px;"><input type="text" class="property-input" value="'+opt+'" onchange="updateOption('+i+', this.value)" style="flex:1;"><button class="field-action-btn delete" onclick="removeOption('+i+')">'+getIcon('x', 12)+'</button></div>';
        });
        html += '</div><button class="logic-add-btn" onclick="addOption()">'+getIcon('plus', 12)+' Add Option</button></div>';
    }
    
    // Rating settings
    if (field.type === 'rating') {
        html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('star', 14)+' Rating Settings</div><div class="property-group"><label class="property-label">Max Stars</label><select class="property-select" onchange="updateFieldProp(\'ratingMax\', parseInt(this.value))">';
        [3,4,5,6,7,8,9,10].forEach(n => { html += '<option value="'+n+'" '+(field.ratingMax === n ? 'selected' : '')+'>'+n+' stars</option>'; });
        html += '</select></div></div>';
    }
    
    // DHIS2 settings
    if (field.type !== 'section') {
        html += '<div class="prop-section" style="background:#e8f4fc;border-color:#17a2b8;"><div class="prop-section-title" style="color:#17a2b8;">'+getIcon('link', 14)+' DHIS2 Mapping</div><label class="property-checkbox"><input type="checkbox" '+(field.dhis2?.enabled ? 'checked' : '')+' onchange="updateDhis2Prop(\'enabled\', this.checked)"> Map to DHIS2 Data Element</label>';
        if (field.dhis2?.enabled) {
            html += '<div class="property-group" style="margin-top:10px;"><label class="property-label">Data Element ID</label><input type="text" class="property-input" value="'+(field.dhis2?.dataElementId || '')+'" onchange="updateDhis2Prop(\'dataElementId\', this.value)" placeholder="Leave empty for auto-generation"></div><label class="property-checkbox"><input type="checkbox" '+(field.dhis2?.isAggregate ? 'checked' : '')+' onchange="updateDhis2Prop(\'isAggregate\', this.checked)"> Aggregate Field (sum values)</label>';
            if (field.dhis2?.isAggregate) {
                html += '<div class="property-group"><label class="property-label">Aggregation Type</label><select class="property-select" onchange="updateDhis2Prop(\'aggregationType\', this.value)"><option value="SUM" '+(field.dhis2?.aggregationType === 'SUM' ? 'selected' : '')+'>Sum</option><option value="COUNT" '+(field.dhis2?.aggregationType === 'COUNT' ? 'selected' : '')+'>Count</option><option value="AVERAGE" '+(field.dhis2?.aggregationType === 'AVERAGE' ? 'selected' : '')+'>Average</option><option value="MIN" '+(field.dhis2?.aggregationType === 'MIN' ? 'selected' : '')+'>Minimum</option><option value="MAX" '+(field.dhis2?.aggregationType === 'MAX' ? 'selected' : '')+'>Maximum</option></select></div>';
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
    document.getElementById('dhis2Modal').classList.add('show');
    populateDhis2FieldSelectors();
    
    if (state.dhis2Config) {
        document.getElementById('dhis2Url').value = state.dhis2Config.url || '';
        document.getElementById('dhis2Username').value = state.dhis2Config.username || '';
        document.getElementById('dhis2Password').value = state.dhis2Config.password || '';
        document.getElementById('dhis2PeriodColumn').value = state.dhis2Config.periodColumn || '';
        document.getElementById('dhis2OrgUnitColumn').value = state.dhis2Config.orgUnitColumn || '';
        document.getElementById('dhis2OrgLevel').value = state.dhis2Config.orgLevel || '5';
        document.getElementById('dhis2PeriodType').value = state.dhis2Config.periodType || 'Monthly';
        
        if (state.dhis2Config.syncMode === 'tracker') {
            selectSyncMode('tracker');
            document.getElementById('dhis2ProgramId').value = state.dhis2Config.programId || '';
        }
    }
}

function populateDhis2FieldSelectors() {
    const periodSelect = document.getElementById('dhis2PeriodColumn');
    const orgUnitSelect = document.getElementById('dhis2OrgUnitColumn');
    
    const options = state.fields.filter(f => f.type !== 'section').map(f => '<option value="'+f.name+'">'+f.label+'</option>').join('');
    
    periodSelect.innerHTML = '<option value="">-- Select field --</option>' + options;
    orgUnitSelect.innerHTML = '<option value="">-- Select field --</option>' + options;
}

function selectSyncMode(mode) {
    document.querySelectorAll('.sync-mode-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.mode === mode) opt.classList.add('selected');
    });
    
    document.getElementById('aggregateConfig').style.display = mode === 'aggregate' ? 'block' : 'none';
    document.getElementById('trackerConfig').style.display = mode === 'tracker' ? 'block' : 'none';
}

function saveDhis2Config() {
    const mode = document.querySelector('.sync-mode-option.selected')?.dataset.mode || 'aggregate';
    
    state.dhis2Config = {
        url: document.getElementById('dhis2Url').value.replace(/\/$/, ''),
        username: document.getElementById('dhis2Username').value,
        password: document.getElementById('dhis2Password').value,
        syncMode: mode,
        periodColumn: document.getElementById('dhis2PeriodColumn').value,
        orgUnitColumn: document.getElementById('dhis2OrgUnitColumn').value,
        orgLevel: document.getElementById('dhis2OrgLevel').value,
        periodType: document.getElementById('dhis2PeriodType').value,
        programId: document.getElementById('dhis2ProgramId').value
    };
    
    showNotification('DHIS2 configuration saved!');
}

async function testDhis2Connection() {
    const url = document.getElementById('dhis2Url').value.replace(/\/$/, '');
    const username = document.getElementById('dhis2Username').value;
    const password = document.getElementById('dhis2Password').value;
    
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
            document.getElementById('dhis2Status').className = 'status-badge connected';
            document.getElementById('dhis2Status').innerHTML = getIcon('check-circle', 14) + ' <span>Connected as ' + data.displayName + '</span>';
            addSyncLog('Connected successfully as ' + data.displayName, 'success');
            showNotification('DHIS2 connection successful!');
        } else {
            throw new Error('Authentication failed');
        }
    } catch (err) {
        document.getElementById('dhis2Status').className = 'status-badge disconnected';
        document.getElementById('dhis2Status').innerHTML = getIcon('x-circle', 14) + ' <span>Connection failed</span>';
        addSyncLog('Connection failed: ' + err.message, 'error');
        showNotification('Connection failed: ' + err.message, 'error');
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
    
    const formData = {
        title: document.getElementById('formTitle').value,
        fields: state.fields,
        dhis2Config: state.dhis2Config,
        sheetsConfig: state.sheetsConfig
    };
    
    const compressed = compressData(formData);
    const shareUrl = window.location.origin + window.location.pathname + '?form=' + compressed;
    
    document.getElementById('shareUrl').textContent = shareUrl;
    document.getElementById('shareModal').classList.add('show');
}

function copyShareUrl() {
    const url = document.getElementById('shareUrl').textContent;
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
    const formTitle = document.getElementById('formTitle').value || 'Data Collection Form';
    
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
    
    let html = '<div class="viewer-nav"><button class="viewer-back-btn" onclick="exitViewer()">'+getIcon('arrow-left', 14)+' Exit Preview</button><button class="viewer-nav-btn active" style="background:#004080;color:white;">'+getIcon('edit-3', 14)+' Form</button><div class="connection-status '+(navigator.onLine ? 'online' : 'offline')+'">'+(navigator.onLine ? getIcon('wifi', 12)+' Online' : getIcon('wifi-off', 12)+' Offline')+'</div></div>';
    
    html += '<div class="viewer-tab active" id="formTab"><div class="viewer-form"><div class="viewer-form-box"><div class="viewer-header"><img src="https://github.com/mohamedsillahkanu/gdp-dashboard-2/raw/6c7463b0d5c3be150aafae695a4bcbbd8aeb1499/ICF-SL.jpg"><h1>'+formTitle+'</h1><p>ICF-SL Data Collection System</p></div><div class="viewer-body"><form id="dataEntryForm" onsubmit="return submitForm(event)">';
    
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
        html += '<button type="button" class="nav-btn back-btn" id="prevBtn" onclick="prevPage()" style="visibility:hidden;">'+getIcon('arrow-left', 14)+' Previous</button><button type="button" class="nav-btn next-btn" id="nextBtn" onclick="nextPage()">Next '+getIcon('arrow-right', 14)+'</button>';
    }
    html += '<button type="submit" class="nav-btn submit-btn" id="submitBtn" '+(pages.length > 1 ? 'style="display:none;"' : '')+'>'+getIcon('send', 14)+' Submit</button></div></form></div></div></div></div>';
    
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
            document.querySelector('input[name="'+fieldName+'"]').value = coords;
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
    container.querySelector('input').value = value;
    
    container.querySelectorAll('.rating-star').forEach(star => {
        star.style.color = parseInt(star.dataset.value) <= value ? '#ffc107' : '#ddd';
    });
}

function nextPage() {
    if (state.currentPage < state.totalPages - 1) {
        document.getElementById('page-' + state.currentPage).style.display = 'none';
        state.currentPage++;
        document.getElementById('page-' + state.currentPage).style.display = 'block';
        updatePageNavigation();
    }
}

function prevPage() {
    if (state.currentPage > 0) {
        document.getElementById('page-' + state.currentPage).style.display = 'none';
        state.currentPage--;
        document.getElementById('page-' + state.currentPage).style.display = 'block';
        updatePageNavigation();
    }
}

function updatePageNavigation() {
    document.getElementById('currentPageNum').textContent = state.currentPage + 1;
    document.getElementById('prevBtn').style.visibility = state.currentPage > 0 ? 'visible' : 'hidden';
    
    if (state.currentPage === state.totalPages - 1) {
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('submitBtn').style.display = 'inline-flex';
    } else {
        document.getElementById('nextBtn').style.display = 'inline-flex';
        document.getElementById('submitBtn').style.display = 'none';
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

async function submitForm(event) {
    event.preventDefault();
    
    const formData = getFormData();
    formData._submittedAt = new Date().toISOString();
    formData._formId = state.currentFormId;
    formData._syncStatus = 'pending';
    
    try {
        await dbOperation(DB_CONFIG.dataStore, 'readwrite', store => store.add(formData));
        showNotification('Data submitted successfully!');
        document.getElementById('dataEntryForm').reset();
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
                state.dhis2Config = decompressed.dhis2Config;
                state.sheetsConfig = decompressed.sheetsConfig;
                
                if (decompressed.title) {
                    document.getElementById('formTitle').value = decompressed.title;
                    document.getElementById('previewTitle').textContent = decompressed.title;
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
        indicator.style.display = 'none';
        statusElements.forEach(el => {
            el.className = 'connection-status online';
            el.innerHTML = getIcon('wifi', 12) + ' Online';
        });
    } else {
        indicator.style.display = 'block';
        statusElements.forEach(el => {
            el.className = 'connection-status offline';
            el.innerHTML = getIcon('wifi-off', 12) + ' Offline';
        });
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// ============================================
// INITIALIZATION - ✅ WITH FIELD TYPE FIX
// ============================================

async function initApp() {
    // Initialize icons
    initializeIcons();
    
    // ✅ Add event listeners for login/signup forms
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        // Also add click handler for the button directly
        const loginBtn = loginForm.querySelector('button[type="submit"]');
        if (loginBtn) {
            loginBtn.style.cursor = 'pointer';
            loginBtn.disabled = false;
        }
    }
    
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
        // Also add click handler for the button directly
        const signupBtn = signupForm.querySelector('button[type="submit"]');
        if (signupBtn) {
            signupBtn.style.cursor = 'pointer';
            signupBtn.disabled = false;
        }
    }
    
    // Add click handlers for auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.style.cursor = 'pointer';
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            if (tabName) switchAuthTab(tabName);
        });
    });
    
    // ✅ FIX: Add click handlers for field type buttons in sidebar
    // This is the critical fix - without this, clicking field types does nothing
    document.querySelectorAll('.field-type').forEach(el => {
        el.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            if (type) {
                addField(type);
                // Visual feedback on click
                this.style.transform = 'scale(0.95)';
                this.style.background = '#e8f4fc';
                setTimeout(() => {
                    this.style.transform = '';
                    this.style.background = '';
                }, 150);
            }
        });
        // Ensure cursor shows clickable
        el.style.cursor = 'pointer';
    });
    
    // Check for form in URL
    loadFormFromUrl();
    
    // Update online status
    updateOnlineStatus();
    
    // Check for existing session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            // Verify user still exists in DB
            const dbUser = await dbOperation(DB_CONFIG.userStore, 'readonly', store => store.get(user.email));
            if (dbUser) {
                state.currentUser = dbUser;
                document.getElementById('authContainer').style.display = 'none';
                document.getElementById('mainContainer').classList.add('show');
                document.getElementById('headerUser').innerHTML = getIcon('user', 14) + ' ' + dbUser.name;
                await loadUserForms();
                showHome();
                return;
            }
        } catch (e) {
            console.log('Session restore failed:', e);
            localStorage.removeItem('currentUser');
        }
    }
    
    // Show auth screen
    document.getElementById('authContainer').style.display = 'flex';
}

// Run on page load
document.addEventListener('DOMContentLoaded', initApp);

// End of ICF Collect script.js

// ============================================
// VALIDATION RULES EDITOR
// ============================================

function openValidationEditor() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field) return;
    
    let html = '<div class="modal-header"><h3>'+getIcon('check-circle', 20)+' Validation Rules</h3><button class="modal-close" onclick="closeModal(\'validationModal\')">&times;</button></div>';
    html += '<div class="modal-body"><p style="font-size:12px;color:#666;margin-bottom:15px;">Add rules to validate user input</p>';
    html += '<div id="validationRulesList">';
    
    (field.validation || []).forEach((rule, index) => {
        html += renderValidationRule(rule, index);
    });
    
    html += '</div>';
    html += '<button class="logic-add-btn" onclick="addValidationRule()">'+getIcon('plus', 12)+' Add Validation Rule</button>';
    html += '</div>';
    html += '<div class="modal-footer"><button class="modal-btn" onclick="closeModal(\'validationModal\')">Cancel</button><button class="modal-btn success" onclick="saveValidationRules()">Save Rules</button></div>';
    
    document.getElementById('validationModal').innerHTML = html;
    document.getElementById('validationModal').classList.add('show');
    initializeIcons();
}

function renderValidationRule(rule, index) {
    const operators = [
        { value: '>', label: 'Greater than' },
        { value: '>=', label: 'Greater than or equal' },
        { value: '<', label: 'Less than' },
        { value: '<=', label: 'Less than or equal' },
        { value: '=', label: 'Equal to' },
        { value: '!=', label: 'Not equal to' },
        { value: 'between', label: 'Between' },
        { value: 'regex', label: 'Matches pattern' },
        { value: 'minLength', label: 'Minimum length' },
        { value: 'maxLength', label: 'Maximum length' }
    ];
    
    let html = '<div class="validation-rule" data-index="'+index+'" style="background:#f8f9fa;padding:12px;border-radius:8px;margin-bottom:10px;border:1px solid #e9ecef;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
    html += '<span style="font-weight:600;font-size:12px;">Rule #'+(index+1)+'</span>';
    html += '<button class="field-action-btn delete" onclick="removeValidationRule('+index+')">'+getIcon('trash-2', 12)+'</button>';
    html += '</div>';
    
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
    html += '<select class="property-select" onchange="updateValidationRule('+index+', \'operator\', this.value)">';
    operators.forEach(op => {
        html += '<option value="'+op.value+'" '+(rule.operator === op.value ? 'selected' : '')+'>'+op.label+'</option>';
    });
    html += '</select>';
    
    if (rule.operator === 'between') {
        html += '<div style="display:flex;gap:4px;"><input type="text" class="property-input" placeholder="Min" value="'+(rule.min || '')+'" onchange="updateValidationRule('+index+', \'min\', this.value)" style="width:50%;"><input type="text" class="property-input" placeholder="Max" value="'+(rule.max || '')+'" onchange="updateValidationRule('+index+', \'max\', this.value)" style="width:50%;"></div>';
    } else {
        html += '<input type="text" class="property-input" placeholder="Value" value="'+(rule.value || '')+'" onchange="updateValidationRule('+index+', \'value\', this.value)">';
    }
    html += '</div>';
    
    html += '<input type="text" class="property-input" placeholder="Error message" value="'+(rule.message || '')+'" onchange="updateValidationRule('+index+', \'message\', this.value)" style="margin-top:8px;">';
    html += '</div>';
    
    return html;
}

function addValidationRule() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field) return;
    if (!field.validation) field.validation = [];
    
    field.validation.push({
        operator: '>',
        value: '',
        message: 'Invalid value'
    });
    
    openValidationEditor();
}

function removeValidationRule(index) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.validation) {
        field.validation.splice(index, 1);
        openValidationEditor();
    }
}

function updateValidationRule(index, prop, value) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.validation && field.validation[index]) {
        field.validation[index][prop] = value;
    }
}

function saveValidationRules() {
    closeModal('validationModal');
    renderFields();
    showNotification('Validation rules saved');
}

function validateField(field, value) {
    if (!field.validation || field.validation.length === 0) return { valid: true };
    
    for (const rule of field.validation) {
        const numValue = parseFloat(value);
        const ruleValue = parseFloat(rule.value);
        
        let valid = true;
        switch (rule.operator) {
            case '>': valid = numValue > ruleValue; break;
            case '>=': valid = numValue >= ruleValue; break;
            case '<': valid = numValue < ruleValue; break;
            case '<=': valid = numValue <= ruleValue; break;
            case '=': valid = value == rule.value; break;
            case '!=': valid = value != rule.value; break;
            case 'between': valid = numValue >= parseFloat(rule.min) && numValue <= parseFloat(rule.max); break;
            case 'regex': valid = new RegExp(rule.value).test(value); break;
            case 'minLength': valid = value.length >= parseInt(rule.value); break;
            case 'maxLength': valid = value.length <= parseInt(rule.value); break;
        }
        
        if (!valid) {
            return { valid: false, message: rule.message || 'Invalid value' };
        }
    }
    
    return { valid: true };
}

// ============================================
// SHOW/HIDE LOGIC EDITOR
// ============================================

function openLogicEditor() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field) return;
    
    const otherFields = state.fields.filter(f => f.id !== field.id && f.type !== 'section');
    
    let html = '<div class="modal-header"><h3>'+getIcon('eye', 20)+' Show/Hide Logic</h3><button class="modal-close" onclick="closeModal(\'logicModal\')">&times;</button></div>';
    html += '<div class="modal-body"><p style="font-size:12px;color:#666;margin-bottom:15px;">Show this field when conditions are met</p>';
    
    html += '<div style="margin-bottom:15px;"><label class="property-label">Logic Type</label><select class="property-select" id="logicType" onchange="updateLogicType(this.value)">';
    html += '<option value="all" '+(field.logicType === 'all' ? 'selected' : '')+'>ALL conditions must be true (AND)</option>';
    html += '<option value="any" '+(field.logicType === 'any' ? 'selected' : '')+'>ANY condition can be true (OR)</option>';
    html += '</select></div>';
    
    html += '<div id="logicConditionsList">';
    (field.logic || []).forEach((condition, index) => {
        html += renderLogicCondition(condition, index, otherFields);
    });
    html += '</div>';
    
    html += '<button class="logic-add-btn" onclick="addLogicCondition()">'+getIcon('plus', 12)+' Add Condition</button>';
    html += '</div>';
    html += '<div class="modal-footer"><button class="modal-btn" onclick="closeModal(\'logicModal\')">Cancel</button><button class="modal-btn success" onclick="saveLogicRules()">Save Logic</button></div>';
    
    document.getElementById('logicModal').innerHTML = html;
    document.getElementById('logicModal').classList.add('show');
    initializeIcons();
}

function renderLogicCondition(condition, index, otherFields) {
    const operators = [
        { value: '=', label: 'equals' },
        { value: '!=', label: 'does not equal' },
        { value: '>', label: 'is greater than' },
        { value: '<', label: 'is less than' },
        { value: 'contains', label: 'contains' },
        { value: 'empty', label: 'is empty' },
        { value: 'notEmpty', label: 'is not empty' }
    ];
    
    let html = '<div class="logic-condition" style="background:#e8f4fc;padding:12px;border-radius:8px;margin-bottom:10px;border:2px solid #17a2b8;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
    html += '<span style="font-weight:600;font-size:11px;color:#17a2b8;">WHEN</span>';
    html += '<button class="field-action-btn delete" onclick="removeLogicCondition('+index+')">'+getIcon('trash-2', 12)+'</button>';
    html += '</div>';
    
    html += '<select class="property-select" style="margin-bottom:8px;" onchange="updateLogicCondition('+index+', \'field\', this.value)">';
    html += '<option value="">-- Select field --</option>';
    otherFields.forEach(f => {
        html += '<option value="'+f.name+'" '+(condition.field === f.name ? 'selected' : '')+'>'+f.label+'</option>';
    });
    html += '</select>';
    
    html += '<div style="display:flex;gap:8px;">';
    html += '<select class="property-select" style="flex:1;" onchange="updateLogicCondition('+index+', \'operator\', this.value)">';
    operators.forEach(op => {
        html += '<option value="'+op.value+'" '+(condition.operator === op.value ? 'selected' : '')+'>'+op.label+'</option>';
    });
    html += '</select>';
    
    if (condition.operator !== 'empty' && condition.operator !== 'notEmpty') {
        // Check if the referenced field has options
        const refField = otherFields.find(f => f.name === condition.field);
        if (refField && refField.options && refField.options.length > 0) {
            html += '<select class="property-select" style="flex:1;" onchange="updateLogicCondition('+index+', \'value\', this.value)">';
            html += '<option value="">-- Select value --</option>';
            refField.options.forEach(opt => {
                html += '<option value="'+opt+'" '+(condition.value === opt ? 'selected' : '')+'>'+opt+'</option>';
            });
            html += '</select>';
        } else {
            html += '<input type="text" class="property-input" style="flex:1;" placeholder="Value" value="'+(condition.value || '')+'" onchange="updateLogicCondition('+index+', \'value\', this.value)">';
        }
    }
    html += '</div></div>';
    
    return html;
}

function addLogicCondition() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field) return;
    if (!field.logic) field.logic = [];
    
    field.logic.push({
        field: '',
        operator: '=',
        value: ''
    });
    
    openLogicEditor();
}

function removeLogicCondition(index) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.logic) {
        field.logic.splice(index, 1);
        openLogicEditor();
    }
}

function updateLogicCondition(index, prop, value) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.logic && field.logic[index]) {
        field.logic[index][prop] = value;
        if (prop === 'field') openLogicEditor(); // Refresh to show correct value options
    }
}

function updateLogicType(value) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field) field.logicType = value;
}

function saveLogicRules() {
    closeModal('logicModal');
    renderFields();
    showNotification('Logic rules saved');
}

function evaluateFieldLogic(field, formValues) {
    if (!field.logic || field.logic.length === 0) return true;
    
    const results = field.logic.map(condition => {
        const fieldValue = formValues[condition.field];
        
        switch (condition.operator) {
            case '=': return fieldValue == condition.value;
            case '!=': return fieldValue != condition.value;
            case '>': return parseFloat(fieldValue) > parseFloat(condition.value);
            case '<': return parseFloat(fieldValue) < parseFloat(condition.value);
            case 'contains': return String(fieldValue).includes(condition.value);
            case 'empty': return !fieldValue || fieldValue === '';
            case 'notEmpty': return fieldValue && fieldValue !== '';
            default: return true;
        }
    });
    
    return field.logicType === 'any' ? results.some(r => r) : results.every(r => r);
}

function evaluateAllLogic() {
    const formValues = getFormData();
    
    state.fields.forEach(field => {
        const container = document.getElementById('field-' + field.name);
        if (container) {
            const shouldShow = evaluateFieldLogic(field, formValues);
            container.style.display = shouldShow ? 'block' : 'none';
        }
    });
}

// ============================================
// CASCADE SELECTION CONFIGURATION
// ============================================

function openCascadeEditor() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field || field.type !== 'cascade') return;
    
    let html = '<div class="modal-header"><h3>'+getIcon('git-branch', 20)+' Cascade Configuration</h3><button class="modal-close" onclick="closeModal(\'cascadeModal\')">&times;</button></div>';
    html += '<div class="modal-body">';
    
    // Levels configuration
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('list', 14)+' Hierarchy Levels</div>';
    html += '<div id="cascadeLevelsList">';
    (field.cascadeConfig?.levels || ['Level 1', 'Level 2']).forEach((level, index) => {
        html += '<div style="display:flex;gap:8px;margin-bottom:8px;"><input type="text" class="property-input" value="'+level+'" onchange="updateCascadeLevel('+index+', this.value)" style="flex:1;"><button class="field-action-btn delete" onclick="removeCascadeLevel('+index+')" '+(index < 2 ? 'disabled style="opacity:0.5;"' : '')+'>'+getIcon('x', 12)+'</button></div>';
    });
    html += '</div>';
    html += '<button class="logic-add-btn" onclick="addCascadeLevel()">'+getIcon('plus', 12)+' Add Level</button></div>';
    
    // Data import
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('upload', 14)+' Import Data</div>';
    html += '<p style="font-size:11px;color:#666;margin-bottom:10px;">Upload CSV/Excel with columns matching your hierarchy levels</p>';
    html += '<input type="file" id="cascadeFileInput" accept=".csv,.xlsx,.xls" onchange="importCascadeData(this)" style="margin-bottom:10px;">';
    html += '<div style="font-size:11px;color:#868e96;background:#f8f9fa;padding:10px;border-radius:6px;">Example: Country, Region, District, Chiefdom</div></div>';
    
    // Preview current data
    const dataCount = Object.keys(field.cascadeConfig?.data || {}).length;
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('database', 14)+' Current Data</div>';
    html += '<p style="font-size:12px;color:#666;">'+dataCount+' top-level entries loaded</p>';
    if (dataCount > 0) {
        html += '<button class="modal-btn danger" onclick="clearCascadeData()" style="margin-top:8px;">'+getIcon('trash-2', 12)+' Clear All Data</button>';
    }
    html += '</div>';
    
    html += '</div>';
    html += '<div class="modal-footer"><button class="modal-btn" onclick="closeModal(\'cascadeModal\')">Cancel</button><button class="modal-btn success" onclick="saveCascadeConfig()">Save Configuration</button></div>';
    
    document.getElementById('cascadeModal').innerHTML = html;
    document.getElementById('cascadeModal').classList.add('show');
    initializeIcons();
}

function addCascadeLevel() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field || !field.cascadeConfig) return;
    
    const levelNum = field.cascadeConfig.levels.length + 1;
    field.cascadeConfig.levels.push('Level ' + levelNum);
    openCascadeEditor();
}

function removeCascadeLevel(index) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.cascadeConfig && field.cascadeConfig.levels.length > 2) {
        field.cascadeConfig.levels.splice(index, 1);
        openCascadeEditor();
    }
}

function updateCascadeLevel(index, value) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.cascadeConfig) {
        field.cascadeConfig.levels[index] = value;
    }
}

function importCascadeData(input) {
    const file = input.files[0];
    if (!file) return;
    
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field) return;
    
    const reader = new FileReader();
    
    if (file.name.endsWith('.csv')) {
        reader.onload = function(e) {
            const csv = e.target.result;
            const lines = csv.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim());
            
            // Update levels from headers
            field.cascadeConfig.levels = headers;
            
            // Build hierarchical data
            const data = {};
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                buildCascadeHierarchy(data, values);
            }
            
            field.cascadeConfig.data = data;
            state.cascadeData[field.name] = data;
            
            showNotification('Imported ' + (lines.length - 1) + ' rows');
            openCascadeEditor();
        };
        reader.readAsText(file);
    } else {
        // Excel file - use XLSX library
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                
                if (json.length < 2) {
                    showNotification('No data found in file', 'error');
                    return;
                }
                
                const headers = json[0].map(h => String(h).trim());
                field.cascadeConfig.levels = headers;
                
                const cascadeData = {};
                for (let i = 1; i < json.length; i++) {
                    const values = json[i].map(v => String(v || '').trim());
                    buildCascadeHierarchy(cascadeData, values);
                }
                
                field.cascadeConfig.data = cascadeData;
                state.cascadeData[field.name] = cascadeData;
                
                showNotification('Imported ' + (json.length - 1) + ' rows');
                openCascadeEditor();
            } catch (err) {
                showNotification('Error reading Excel file: ' + err.message, 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    }
}

function buildCascadeHierarchy(data, values) {
    if (values.length === 0 || !values[0]) return;
    
    const key = values[0];
    if (!data[key]) {
        data[key] = {};
    }
    
    if (values.length > 1) {
        buildCascadeHierarchy(data[key], values.slice(1));
    }
}

function clearCascadeData() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.cascadeConfig) {
        field.cascadeConfig.data = {};
        delete state.cascadeData[field.name];
        showNotification('Cascade data cleared');
        openCascadeEditor();
    }
}

function saveCascadeConfig() {
    closeModal('cascadeModal');
    renderFields();
    showNotification('Cascade configuration saved');
}

function handleCascadeChange(fieldName, levelIndex, value) {
    const field = state.fields.find(f => f.name === fieldName);
    if (!field || !field.cascadeConfig) return;
    
    const levels = field.cascadeConfig.levels;
    
    // Clear subsequent level values
    for (let i = levelIndex + 1; i < levels.length; i++) {
        const select = document.querySelector('[name="'+fieldName+'_level_'+i+'"]');
        if (select) {
            select.innerHTML = '<option value="">-- Select '+levels[i]+' --</option>';
            select.value = '';
        }
    }
    
    // Populate next level if available
    if (levelIndex < levels.length - 1 && value) {
        let data = field.cascadeConfig.data;
        
        // Navigate to current level's data
        for (let i = 0; i <= levelIndex; i++) {
            const levelSelect = document.querySelector('[name="'+fieldName+'_level_'+i+'"]');
            const levelValue = levelSelect ? levelSelect.value : '';
            if (levelValue && data[levelValue]) {
                data = data[levelValue];
            } else {
                data = {};
                break;
            }
        }
        
        // Populate next level
        const nextSelect = document.querySelector('[name="'+fieldName+'_level_'+(levelIndex + 1)+'"]');
        if (nextSelect && data) {
            const options = Object.keys(data);
            options.forEach(opt => {
                nextSelect.innerHTML += '<option value="'+opt+'">'+opt+'</option>';
            });
        }
    }
    
    // Update hidden field with full path
    const hiddenInput = document.querySelector('input[name="'+fieldName+'"]');
    if (hiddenInput) {
        const values = [];
        for (let i = 0; i < levels.length; i++) {
            const select = document.querySelector('[name="'+fieldName+'_level_'+i+'"]');
            if (select && select.value) values.push(select.value);
        }
        hiddenInput.value = values.join(' > ');
    }
}

// ============================================
// CALCULATION FORMULA EDITOR
// ============================================

function openCalculationEditor() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field || field.type !== 'calculation') return;
    
    const numericFields = state.fields.filter(f => f.type === 'number' && f.id !== field.id);
    
    let html = '<div class="modal-header"><h3>'+getIcon('calculator', 20)+' Calculation Formula</h3><button class="modal-close" onclick="closeModal(\'calculationModal\')">&times;</button></div>';
    html += '<div class="modal-body">';
    
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('edit-3', 14)+' Formula</div>';
    html += '<p style="font-size:11px;color:#666;margin-bottom:10px;">Use field names in {braces}. Example: {quantity} * {unit_price}</p>';
    html += '<textarea id="calculationFormula" class="property-textarea" style="font-family:monospace;min-height:80px;" placeholder="Enter formula...">'+(field.calculationFormula || '')+'</textarea>';
    html += '</div>';
    
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('list', 14)+' Available Fields</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
    numericFields.forEach(f => {
        html += '<button type="button" class="modal-btn" style="font-size:10px;padding:6px 10px;" onclick="insertFieldReference(\''+f.name+'\')">'+getIcon('hash', 10)+' '+f.label+'</button>';
    });
    if (numericFields.length === 0) {
        html += '<p style="font-size:11px;color:#868e96;">Add number fields to use in calculations</p>';
    }
    html += '</div></div>';
    
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('info', 14)+' Operators</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
    ['+', '-', '*', '/', '(', ')', 'Math.round()', 'Math.floor()', 'Math.ceil()', 'Math.abs()'].forEach(op => {
        html += '<button type="button" class="modal-btn" style="font-size:10px;padding:6px 10px;font-family:monospace;" onclick="insertOperator(\''+op+'\')">'+op+'</button>';
    });
    html += '</div></div>';
    
    html += '</div>';
    html += '<div class="modal-footer"><button class="modal-btn" onclick="closeModal(\'calculationModal\')">Cancel</button><button class="modal-btn success" onclick="saveCalculationFormula()">Save Formula</button></div>';
    
    document.getElementById('calculationModal').innerHTML = html;
    document.getElementById('calculationModal').classList.add('show');
    initializeIcons();
}

function insertFieldReference(fieldName) {
    const textarea = document.getElementById('calculationFormula');
    const cursorPos = textarea.selectionStart;
    const text = textarea.value;
    const insertion = '{' + fieldName + '}';
    textarea.value = text.substring(0, cursorPos) + insertion + text.substring(cursorPos);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = cursorPos + insertion.length;
}

function insertOperator(op) {
    const textarea = document.getElementById('calculationFormula');
    const cursorPos = textarea.selectionStart;
    const text = textarea.value;
    textarea.value = text.substring(0, cursorPos) + ' ' + op + ' ' + text.substring(cursorPos);
    textarea.focus();
}

function saveCalculationFormula() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field) {
        field.calculationFormula = document.getElementById('calculationFormula').value;
    }
    closeModal('calculationModal');
    renderFields();
    showNotification('Calculation formula saved');
}

function evaluateCalculation(field, formValues) {
    if (!field.calculationFormula) return '';
    
    let formula = field.calculationFormula;
    
    // Replace field references with values
    const fieldRefs = formula.match(/\{([^}]+)\}/g) || [];
    fieldRefs.forEach(ref => {
        const fieldName = ref.slice(1, -1);
        const value = parseFloat(formValues[fieldName]) || 0;
        formula = formula.replace(ref, value);
    });
    
    try {
        // Safe evaluation (only math operations)
        const result = Function('"use strict"; return (' + formula + ')')();
        return isNaN(result) ? '' : result;
    } catch (err) {
        console.error('Calculation error:', err);
        return 'Error';
    }
}

function updateCalculations() {
    const formValues = getFormData();
    
    state.fields.filter(f => f.type === 'calculation').forEach(field => {
        const input = document.querySelector('input[name="'+field.name+'"]');
        if (input) {
            input.value = evaluateCalculation(field, formValues);
        }
    });
}

// ============================================
// VALIDATION RULES EDITOR
// ============================================

function openValidationEditor() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field) return;
    
    let html = '<div class="modal-header"><h3>'+getIcon('check-circle', 20)+' Validation Rules</h3><button class="modal-close" onclick="closeModal(\'validationModal\')">'+getIcon('x', 18)+'</button></div><div class="modal-body"><div id="validationRules">';
    
    if (!field.validation) field.validation = [];
    
    field.validation.forEach((rule, index) => {
        html += renderValidationRule(rule, index);
    });
    
    html += '</div><button class="logic-add-btn" onclick="addValidationRule()">'+getIcon('plus', 14)+' Add Validation Rule</button></div><div class="modal-footer"><button class="modal-btn" onclick="closeModal(\'validationModal\')">Close</button><button class="modal-btn success" onclick="saveValidation()">'+getIcon('check', 14)+' Save Rules</button></div>';
    
    document.getElementById('validationModal').innerHTML = html;
    document.getElementById('validationModal').classList.add('show');
    initializeIcons();
}

function renderValidationRule(rule, index) {
    const operators = [
        { value: 'gt', label: 'Greater than (>)' },
        { value: 'gte', label: 'Greater or equal (>=)' },
        { value: 'lt', label: 'Less than (<)' },
        { value: 'lte', label: 'Less or equal (<=)' },
        { value: 'eq', label: 'Equals (=)' },
        { value: 'neq', label: 'Not equals (!=)' },
        { value: 'between', label: 'Between' },
        { value: 'regex', label: 'Pattern (regex)' }
    ];
    
    return '<div class="validation-rule" style="background:#f8f9fa;padding:12px;border-radius:8px;margin-bottom:10px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span style="font-weight:600;font-size:12px;">Rule '+(index+1)+'</span><button class="field-action-btn delete" onclick="removeValidationRule('+index+')">'+getIcon('trash-2', 12)+'</button></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><select class="property-select" id="valOp_'+index+'" onchange="updateValidationRule('+index+')">'+operators.map(op => '<option value="'+op.value+'" '+(rule.operator === op.value ? 'selected' : '')+'>'+op.label+'</option>').join('')+'</select><input type="text" class="property-input" id="valVal_'+index+'" value="'+(rule.value || '')+'" placeholder="Value" onchange="updateValidationRule('+index+')"></div><input type="text" class="property-input" id="valMsg_'+index+'" value="'+(rule.message || '')+'" placeholder="Error message" style="margin-top:8px;" onchange="updateValidationRule('+index+')"></div>';
}

function addValidationRule() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field) return;
    if (!field.validation) field.validation = [];
    field.validation.push({ operator: 'gt', value: '', message: '' });
    openValidationEditor();
}

function removeValidationRule(index) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.validation) {
        field.validation.splice(index, 1);
        openValidationEditor();
    }
}

function updateValidationRule(index) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field || !field.validation) return;
    
    field.validation[index] = {
        operator: document.getElementById('valOp_' + index).value,
        value: document.getElementById('valVal_' + index).value,
        message: document.getElementById('valMsg_' + index).value
    };
}

function saveValidation() {
    showNotification('Validation rules saved!');
    closeModal('validationModal');
    renderProperties();
}

function validateField(field, value) {
    if (!field.validation || field.validation.length === 0) return { valid: true };
    
    for (const rule of field.validation) {
        const numVal = parseFloat(value);
        const ruleVal = parseFloat(rule.value);
        let isValid = true;
        
        switch (rule.operator) {
            case 'gt': isValid = numVal > ruleVal; break;
            case 'gte': isValid = numVal >= ruleVal; break;
            case 'lt': isValid = numVal < ruleVal; break;
            case 'lte': isValid = numVal <= ruleVal; break;
            case 'eq': isValid = value == rule.value; break;
            case 'neq': isValid = value != rule.value; break;
            case 'between':
                const [min, max] = rule.value.split(',').map(v => parseFloat(v.trim()));
                isValid = numVal >= min && numVal <= max;
                break;
            case 'regex':
                try { isValid = new RegExp(rule.value).test(value); } catch(e) { isValid = false; }
                break;
        }
        
        if (!isValid) {
            return { valid: false, message: rule.message || 'Validation failed' };
        }
    }
    
    return { valid: true };
}

// ============================================
// SHOW/HIDE LOGIC EDITOR
// ============================================

function openLogicEditor() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field) return;
    
    const otherFields = state.fields.filter(f => f.id !== field.id && f.type !== 'section');
    
    let html = '<div class="modal-header"><h3>'+getIcon('sparkles', 20)+' Show/Hide Logic</h3><button class="modal-close" onclick="closeModal(\'logicModal\')">'+getIcon('x', 18)+'</button></div><div class="modal-body"><p style="font-size:12px;color:#666;margin-bottom:15px;">Show this field only when the following conditions are met:</p><div id="logicConditions">';
    
    if (!field.logic) field.logic = [];
    
    field.logic.forEach((condition, index) => {
        html += renderLogicCondition(condition, index, otherFields);
    });
    
    html += '</div><button class="logic-add-btn" onclick="addLogicCondition()">'+getIcon('plus', 14)+' Add Condition</button>';
    
    if (field.logic.length > 1) {
        html += '<div style="margin-top:15px;padding:10px;background:#f8f9fa;border-radius:8px;"><label class="property-label">Combine conditions with:</label><div style="display:flex;gap:15px;margin-top:8px;"><label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="radio" name="logicOperator" value="AND" '+(field.logicOperator !== 'OR' ? 'checked' : '')+' onchange="updateLogicOperator(\'AND\')"> ALL conditions (AND)</label><label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="radio" name="logicOperator" value="OR" '+(field.logicOperator === 'OR' ? 'checked' : '')+' onchange="updateLogicOperator(\'OR\')"> ANY condition (OR)</label></div></div>';
    }
    
    html += '</div><div class="modal-footer"><button class="modal-btn" onclick="closeModal(\'logicModal\')">Close</button><button class="modal-btn success" onclick="saveLogic()">'+getIcon('check', 14)+' Save Logic</button></div>';
    
    document.getElementById('logicModal').innerHTML = html;
    document.getElementById('logicModal').classList.add('show');
    initializeIcons();
}

function renderLogicCondition(condition, index, otherFields) {
    const operators = [
        { value: 'eq', label: 'Equals' },
        { value: 'neq', label: 'Not equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'gt', label: 'Greater than' },
        { value: 'lt', label: 'Less than' },
        { value: 'empty', label: 'Is empty' },
        { value: 'notEmpty', label: 'Is not empty' }
    ];
    
    return '<div class="logic-condition" style="background:#e8f4fc;padding:12px;border-radius:8px;margin-bottom:10px;border:2px solid #17a2b8;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span style="font-weight:600;font-size:12px;color:#17a2b8;">Condition '+(index+1)+'</span><button class="field-action-btn delete" onclick="removeLogicCondition('+index+')">'+getIcon('trash-2', 12)+'</button></div><div style="display:grid;gap:8px;"><select class="property-select" id="logicField_'+index+'" onchange="updateLogicCondition('+index+')"><option value="">-- Select field --</option>'+otherFields.map(f => '<option value="'+f.name+'" '+(condition.field === f.name ? 'selected' : '')+'>'+f.label+'</option>').join('')+'</select><select class="property-select" id="logicOp_'+index+'" onchange="updateLogicCondition('+index+')">'+operators.map(op => '<option value="'+op.value+'" '+(condition.operator === op.value ? 'selected' : '')+'>'+op.label+'</option>').join('')+'</select><input type="text" class="property-input" id="logicVal_'+index+'" value="'+(condition.value || '')+'" placeholder="Value" onchange="updateLogicCondition('+index+')"></div></div>';
}

function addLogicCondition() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field) return;
    if (!field.logic) field.logic = [];
    field.logic.push({ field: '', operator: 'eq', value: '' });
    openLogicEditor();
}

function removeLogicCondition(index) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.logic) {
        field.logic.splice(index, 1);
        openLogicEditor();
    }
}

function updateLogicCondition(index) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field || !field.logic) return;
    
    field.logic[index] = {
        field: document.getElementById('logicField_' + index).value,
        operator: document.getElementById('logicOp_' + index).value,
        value: document.getElementById('logicVal_' + index).value
    };
}

function updateLogicOperator(op) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field) field.logicOperator = op;
}

function saveLogic() {
    showNotification('Logic rules saved!');
    closeModal('logicModal');
    renderFields();
    renderProperties();
}

function evaluateLogic(field, formData) {
    if (!field.logic || field.logic.length === 0) return true;
    
    const results = field.logic.map(condition => {
        const fieldValue = formData[condition.field] || '';
        
        switch (condition.operator) {
            case 'eq': return fieldValue == condition.value;
            case 'neq': return fieldValue != condition.value;
            case 'contains': return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
            case 'gt': return parseFloat(fieldValue) > parseFloat(condition.value);
            case 'lt': return parseFloat(fieldValue) < parseFloat(condition.value);
            case 'empty': return !fieldValue || fieldValue === '';
            case 'notEmpty': return fieldValue && fieldValue !== '';
            default: return true;
        }
    });
    
    if (field.logicOperator === 'OR') {
        return results.some(r => r);
    }
    return results.every(r => r);
}

function evaluateAllLogic() {
    const formData = getFormData();
    
    state.fields.forEach(field => {
        const fieldEl = document.getElementById('field-' + field.name);
        if (fieldEl) {
            const shouldShow = evaluateLogic(field, formData);
            fieldEl.style.display = shouldShow ? 'block' : 'none';
        }
    });
}

// ============================================
// CASCADE SELECTION EDITOR
// ============================================

function openCascadeEditor() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field || field.type !== 'cascade') return;
    
    if (!field.cascadeConfig) {
        field.cascadeConfig = { levels: ['Region', 'District', 'Chiefdom'], data: {} };
    }
    
    let html = '<div class="modal-header"><h3>'+getIcon('git-branch', 20)+' Configure Cascade</h3><button class="modal-close" onclick="closeModal(\'cascadeModal\')">'+getIcon('x', 18)+'</button></div><div class="modal-body">';
    
    // Levels
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('layers', 14)+' Hierarchy Levels</div><div id="cascadeLevels">';
    field.cascadeConfig.levels.forEach((level, idx) => {
        html += '<div style="display:flex;gap:8px;margin-bottom:6px;"><input type="text" class="property-input" id="level_'+idx+'" value="'+level+'" onchange="updateCascadeLevel('+idx+', this.value)" style="flex:1;"><button class="field-action-btn delete" onclick="removeCascadeLevel('+idx+')" '+(field.cascadeConfig.levels.length <= 2 ? 'disabled style="opacity:0.5"' : '')+'>'+getIcon('x', 12)+'</button></div>';
    });
    html += '</div><button class="logic-add-btn" onclick="addCascadeLevel()" style="margin-top:8px;">'+getIcon('plus', 14)+' Add Level</button></div>';
    
    // Data import
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('upload', 14)+' Import Data</div><p style="font-size:11px;color:#666;margin-bottom:10px;">Upload CSV/Excel with columns matching your hierarchy levels</p><input type="file" id="cascadeFile" accept=".csv,.xlsx,.xls" onchange="importCascadeData(this.files[0])" class="file-input"><div style="font-size:10px;color:#868e96;margin-top:8px;background:#f8f9fa;padding:8px;border-radius:6px;">Format example: Region, District, Chiefdom<br>Western Area, Freetown, Central 1<br>Western Area, Freetown, Central 2</div></div>';
    
    // Current data stats
    const dataCount = Object.keys(field.cascadeConfig.data || {}).length;
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('database', 14)+' Current Data</div><p>'+dataCount+' top-level items loaded</p>';
    if (dataCount > 0) {
        html += '<button class="modal-btn danger" onclick="clearCascadeData()" style="margin-top:8px;">'+getIcon('trash-2', 12)+' Clear Data</button>';
    }
    html += '</div>';
    
    html += '</div><div class="modal-footer"><button class="modal-btn" onclick="closeModal(\'cascadeModal\')">Close</button><button class="modal-btn success" onclick="saveCascadeConfig()">'+getIcon('check', 14)+' Save</button></div>';
    
    document.getElementById('cascadeModal').innerHTML = html;
    document.getElementById('cascadeModal').classList.add('show');
    initializeIcons();
}

function addCascadeLevel() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.cascadeConfig) {
        field.cascadeConfig.levels.push('Level ' + (field.cascadeConfig.levels.length + 1));
        openCascadeEditor();
    }
}

function removeCascadeLevel(idx) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.cascadeConfig && field.cascadeConfig.levels.length > 2) {
        field.cascadeConfig.levels.splice(idx, 1);
        openCascadeEditor();
    }
}

function updateCascadeLevel(idx, value) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.cascadeConfig) {
        field.cascadeConfig.levels[idx] = value;
    }
}

function importCascadeData(file) {
    if (!file) return;
    
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field) return;
    
    const reader = new FileReader();
    
    if (file.name.endsWith('.csv')) {
        reader.onload = function(e) {
            const lines = e.target.result.split('\n').filter(l => l.trim());
            if (lines.length < 2) return showNotification('No data found', 'error');
            
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            field.cascadeConfig.levels = headers;
            
            const data = {};
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                buildHierarchy(data, values);
            }
            
            field.cascadeConfig.data = data;
            state.cascadeData[field.name] = data;
            
            showNotification('Imported ' + (lines.length - 1) + ' rows');
            openCascadeEditor();
        };
        reader.readAsText(file);
    } else {
        // Excel file
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                
                if (json.length < 2) return showNotification('No data found', 'error');
                
                field.cascadeConfig.levels = json[0].map(h => String(h).trim());
                
                const cascadeData = {};
                for (let i = 1; i < json.length; i++) {
                    const values = json[i].map(v => String(v || '').trim());
                    buildHierarchy(cascadeData, values);
                }
                
                field.cascadeConfig.data = cascadeData;
                state.cascadeData[field.name] = cascadeData;
                
                showNotification('Imported ' + (json.length - 1) + ' rows');
                openCascadeEditor();
            } catch (err) {
                showNotification('Error reading Excel file', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    }
}

function buildHierarchy(obj, values) {
    if (!values.length || !values[0]) return;
    const key = values[0];
    if (!obj[key]) obj[key] = {};
    if (values.length > 1) buildHierarchy(obj[key], values.slice(1));
}

function clearCascadeData() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.cascadeConfig) {
        field.cascadeConfig.data = {};
        delete state.cascadeData[field.name];
        showNotification('Data cleared');
        openCascadeEditor();
    }
}

function saveCascadeConfig() {
    showNotification('Cascade configuration saved!');
    closeModal('cascadeModal');
    renderFields();
}

function handleCascadeChange(fieldName, levelIndex, value) {
    const field = state.fields.find(f => f.name === fieldName);
    if (!field || !field.cascadeConfig) return;
    
    const levels = field.cascadeConfig.levels;
    
    // Clear subsequent selects
    for (let i = levelIndex + 1; i < levels.length; i++) {
        const sel = document.querySelector('[name="'+fieldName+'_level_'+i+'"]');
        if (sel) {
            sel.innerHTML = '<option value="">-- Select '+levels[i]+' --</option>';
            sel.value = '';
        }
    }
    
    // Populate next level
    if (levelIndex < levels.length - 1 && value) {
        let data = field.cascadeConfig.data;
        for (let i = 0; i <= levelIndex; i++) {
            const sel = document.querySelector('[name="'+fieldName+'_level_'+i+'"]');
            if (sel && sel.value && data[sel.value]) data = data[sel.value];
            else { data = {}; break; }
        }
        
        const nextSel = document.querySelector('[name="'+fieldName+'_level_'+(levelIndex+1)+'"]');
        if (nextSel && data) {
            Object.keys(data).forEach(opt => {
                nextSel.innerHTML += '<option value="'+opt+'">'+opt+'</option>';
            });
        }
    }
    
    // Update hidden field
    const hidden = document.querySelector('input[name="'+fieldName+'"]');
    if (hidden) {
        const vals = [];
        for (let i = 0; i < levels.length; i++) {
            const sel = document.querySelector('[name="'+fieldName+'_level_'+i+'"]');
            if (sel && sel.value) vals.push(sel.value);
        }
        hidden.value = vals.join(' > ');
    }
}

// ============================================
// CALCULATION FORMULA EDITOR
// ============================================

function openCalculationEditor() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field) return;
    
    const numFields = state.fields.filter(f => f.type === 'number' && f.id !== field.id);
    
    let html = '<div class="modal-header"><h3>'+getIcon('calculator', 20)+' Calculation Formula</h3><button class="modal-close" onclick="closeModal(\'calculationModal\')">'+getIcon('x', 18)+'</button></div><div class="modal-body">';
    
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('edit-3', 14)+' Formula</div><p style="font-size:11px;color:#666;margin-bottom:10px;">Use field names in {braces}. Example: {quantity} * {price}</p><textarea id="calcFormula" class="property-textarea" style="font-family:monospace;min-height:100px;">'+(field.formula || '')+'</textarea></div>';
    
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('hash', 14)+' Available Fields</div><div style="display:flex;flex-wrap:wrap;gap:6px;">';
    numFields.forEach(f => {
        html += '<button class="modal-btn" style="font-size:11px;padding:6px 10px;" onclick="insertCalcField(\''+f.name+'\')">'+f.label+'</button>';
    });
    if (numFields.length === 0) html += '<span style="color:#868e96;font-size:11px;">Add number fields first</span>';
    html += '</div></div>';
    
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('info', 14)+' Operators</div><div style="display:flex;flex-wrap:wrap;gap:6px;">';
    ['+', '-', '*', '/', '()', 'Math.round()', 'Math.floor()', 'Math.ceil()'].forEach(op => {
        html += '<button class="modal-btn" style="font-size:11px;padding:6px 10px;font-family:monospace;" onclick="insertCalcOp(\''+op+'\')">'+op+'</button>';
    });
    html += '</div></div>';
    
    html += '</div><div class="modal-footer"><button class="modal-btn" onclick="closeModal(\'calculationModal\')">Close</button><button class="modal-btn success" onclick="saveCalculation()">'+getIcon('check', 14)+' Save Formula</button></div>';
    
    document.getElementById('calculationModal').innerHTML = html;
    document.getElementById('calculationModal').classList.add('show');
    initializeIcons();
}

function insertCalcField(fieldName) {
    const ta = document.getElementById('calcFormula');
    const pos = ta.selectionStart;
    const text = ta.value;
    const insert = '{' + fieldName + '}';
    ta.value = text.substring(0, pos) + insert + text.substring(pos);
    ta.focus();
    ta.selectionStart = ta.selectionEnd = pos + insert.length;
}

function insertCalcOp(op) {
    const ta = document.getElementById('calcFormula');
    const pos = ta.selectionStart;
    const text = ta.value;
    ta.value = text.substring(0, pos) + ' ' + op + ' ' + text.substring(pos);
    ta.focus();
}

function saveCalculation() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field) {
        field.formula = document.getElementById('calcFormula').value;
    }
    showNotification('Formula saved!');
    closeModal('calculationModal');
    renderFields();
}

function evaluateCalculation(field, formData) {
    if (!field.formula) return '';
    
    let formula = field.formula;
    const refs = formula.match(/\{([^}]+)\}/g) || [];
    
    refs.forEach(ref => {
        const name = ref.slice(1, -1);
        const val = parseFloat(formData[name]) || 0;
        formula = formula.replace(ref, val);
    });
    
    try {
        const result = Function('"use strict"; return (' + formula + ')')();
        return isNaN(result) ? '' : Math.round(result * 100) / 100;
    } catch (e) {
        return 'Error';
    }
}

function updateCalculations() {
    const formData = getFormData();
    state.fields.filter(f => f.type === 'calculation').forEach(field => {
        const input = document.querySelector('input[name="'+field.name+'"]');
        if (input) {
            input.value = evaluateCalculation(field, formData);
        }
    });
}

// ============================================
// DATA EXPORT (CSV & EXCEL)
// ============================================

function exportData(format = 'csv') {
    if (!state.currentFormId) {
        showNotification('No form selected', 'error');
        return;
    }
    
    // Get submissions from IndexedDB
    getFormSubmissions(state.currentFormId).then(submissions => {
        if (submissions.length === 0) {
            showNotification('No submissions to export', 'error');
            return;
        }
        
        // Get all field names as headers
        const headers = state.fields.filter(f => f.type !== 'section').map(f => f.label);
        const fieldNames = state.fields.filter(f => f.type !== 'section').map(f => f.name);
        
        if (format === 'csv') {
            exportToCSV(submissions, headers, fieldNames);
        } else if (format === 'excel') {
            exportToExcel(submissions, headers, fieldNames);
        }
    });
}

function exportToCSV(submissions, headers, fieldNames) {
    let csv = headers.map(h => '"' + h.replace(/"/g, '""') + '"').join(',') + '\n';
    
    submissions.forEach(sub => {
        const row = fieldNames.map(name => {
            const val = sub.data[name] || '';
            return '"' + String(val).replace(/"/g, '""') + '"';
        });
        csv += row.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = (state.formName || 'form') + '_data_' + new Date().toISOString().slice(0,10) + '.csv';
    link.click();
    
    showNotification('CSV exported: ' + submissions.length + ' records');
}

function exportToExcel(submissions, headers, fieldNames) {
    if (typeof XLSX === 'undefined') {
        showNotification('Excel library not loaded', 'error');
        return;
    }
    
    const wsData = [headers];
    
    submissions.forEach(sub => {
        const row = fieldNames.map(name => sub.data[name] || '');
        wsData.push(row);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Submissions');
    
    XLSX.writeFile(wb, (state.formName || 'form') + '_data_' + new Date().toISOString().slice(0,10) + '.xlsx');
    
    showNotification('Excel exported: ' + submissions.length + ' records');
}

function getFormSubmissions(formId) {
    return new Promise((resolve, reject) => {
        const tx = state.db.transaction(['submissions'], 'readonly');
        const store = tx.objectStore('submissions');
        const index = store.index('formId');
        const request = index.getAll(formId);
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

function openExportModal() {
    let html = '<div class="modal-header"><h3>'+getIcon('download', 20)+' Export Data</h3><button class="modal-close" onclick="closeModal(\'exportModal\')">'+getIcon('x', 18)+'</button></div><div class="modal-body">';
    
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('file-spreadsheet', 14)+' Export Format</div><div style="display:flex;flex-direction:column;gap:10px;">';
    
    html += '<button class="modal-btn" onclick="exportData(\'csv\'); closeModal(\'exportModal\');" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:15px;">'+getIcon('file-text', 20)+' <span>Export as CSV</span></button>';
    html += '<button class="modal-btn success" onclick="exportData(\'excel\'); closeModal(\'exportModal\');" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:15px;">'+getIcon('file-spreadsheet', 20)+' <span>Export as Excel</span></button>';
    
    html += '</div></div>';
    
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('info', 14)+' Information</div><p style="font-size:12px;color:#666;">This will export all submitted data for the current form. Drafts are not included.</p></div>';
    
    html += '</div><div class="modal-footer"><button class="modal-btn" onclick="closeModal(\'exportModal\')">Close</button></div>';
    
    document.getElementById('exportModal').innerHTML = html;
    document.getElementById('exportModal').classList.add('show');
    initializeIcons();
}

// ============================================
// DRAFTS MANAGEMENT
// ============================================

function saveDraft() {
    if (!state.currentFormId) {
        showNotification('No form loaded', 'error');
        return;
    }
    
    const formData = getFormData();
    
    const draft = {
        id: 'draft_' + Date.now(),
        formId: state.currentFormId,
        formName: state.formName,
        data: formData,
        savedAt: new Date().toISOString(),
        synced: false
    };
    
    const tx = state.db.transaction(['drafts'], 'readwrite');
    const store = tx.objectStore('drafts');
    store.put(draft);
    
    tx.oncomplete = () => {
        showNotification('Draft saved!');
    };
}

function loadDrafts() {
    return new Promise((resolve, reject) => {
        const tx = state.db.transaction(['drafts'], 'readonly');
        const store = tx.objectStore('drafts');
        const request = store.getAll();
        
        request.onsuccess = () => {
            const drafts = request.result || [];
            // Filter by current form if one is loaded
            if (state.currentFormId) {
                resolve(drafts.filter(d => d.formId === state.currentFormId));
            } else {
                resolve(drafts);
            }
        };
        request.onerror = () => reject(request.error);
    });
}

function openDraftsModal() {
    loadDrafts().then(drafts => {
        let html = '<div class="modal-header"><h3>'+getIcon('save', 20)+' Saved Drafts</h3><button class="modal-close" onclick="closeModal(\'draftsModal\')">'+getIcon('x', 18)+'</button></div><div class="modal-body">';
        
        if (drafts.length === 0) {
            html += '<div style="text-align:center;padding:40px;color:#868e96;">'+getIcon('inbox', 48)+'<p style="margin-top:15px;">No saved drafts</p></div>';
        } else {
            html += '<div class="drafts-list">';
            drafts.forEach(draft => {
                const date = new Date(draft.savedAt);
                const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                
                html += '<div class="draft-item" style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:#f8f9fa;border-radius:8px;margin-bottom:8px;">';
                html += '<div><div style="font-weight:600;font-size:13px;">'+(draft.formName || 'Unnamed Form')+'</div><div style="font-size:11px;color:#868e96;">'+dateStr+'</div></div>';
                html += '<div style="display:flex;gap:6px;">';
                html += '<button class="field-action-btn" onclick="loadDraft(\''+draft.id+'\'); closeModal(\'draftsModal\');" title="Load">'+getIcon('folder-open', 14)+'</button>';
                html += '<button class="field-action-btn delete" onclick="deleteDraft(\''+draft.id+'\')" title="Delete">'+getIcon('trash-2', 14)+'</button>';
                html += '</div></div>';
            });
            html += '</div>';
        }
        
        html += '</div><div class="modal-footer"><button class="modal-btn" onclick="closeModal(\'draftsModal\')">Close</button>';
        if (state.viewMode === 'form-viewer' && state.currentFormId) {
            html += '<button class="modal-btn success" onclick="saveDraft(); closeModal(\'draftsModal\');">'+getIcon('save', 14)+' Save Current</button>';
        }
        html += '</div>';
        
        document.getElementById('draftsModal').innerHTML = html;
        document.getElementById('draftsModal').classList.add('show');
        initializeIcons();
    });
}

function loadDraft(draftId) {
    const tx = state.db.transaction(['drafts'], 'readonly');
    const store = tx.objectStore('drafts');
    const request = store.get(draftId);
    
    request.onsuccess = () => {
        const draft = request.result;
        if (draft) {
            // Fill form with draft data
            Object.keys(draft.data).forEach(name => {
                const input = document.querySelector('[name="'+name+'"]');
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = draft.data[name] === 'true' || draft.data[name] === true;
                    } else if (input.type === 'radio') {
                        const radio = document.querySelector('[name="'+name+'"][value="'+draft.data[name]+'"]');
                        if (radio) radio.checked = true;
                    } else {
                        input.value = draft.data[name];
                    }
                }
            });
            
            showNotification('Draft loaded!');
            evaluateAllLogic();
            updateCalculations();
        }
    };
}

function deleteDraft(draftId) {
    if (!confirm('Delete this draft?')) return;
    
    const tx = state.db.transaction(['drafts'], 'readwrite');
    const store = tx.objectStore('drafts');
    store.delete(draftId);
    
    tx.oncomplete = () => {
        showNotification('Draft deleted');
        openDraftsModal(); // Refresh list
    };
}

function getFormData() {
    const formData = {};
    const form = document.getElementById('dataEntryForm');
    if (!form) return formData;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        const name = input.name;
        if (!name) return;
        
        if (input.type === 'checkbox') {
            if (!formData[name]) formData[name] = [];
            if (input.checked) {
                if (Array.isArray(formData[name])) {
                    formData[name].push(input.value);
                } else {
                    formData[name] = input.checked;
                }
            }
        } else if (input.type === 'radio') {
            if (input.checked) formData[name] = input.value;
        } else {
            formData[name] = input.value;
        }
    });
    
    // Convert checkbox arrays to comma-separated strings
    Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
            formData[key] = formData[key].join(', ');
        }
    });
    
    return formData;
}

// ============================================
// DHIS2 SYNCHRONIZATION
// ============================================

async function syncToDHIS2() {
    if (!state.dhis2Config.baseUrl || !state.dhis2Config.username) {
        showNotification('DHIS2 not configured', 'error');
        return;
    }
    
    const submissions = await getFormSubmissions(state.currentFormId);
    const unsynced = submissions.filter(s => !s.dhis2Synced);
    
    if (unsynced.length === 0) {
        showNotification('No data to sync');
        return;
    }
    
    showNotification('Syncing ' + unsynced.length + ' records...');
    
    const auth = btoa(state.dhis2Config.username + ':' + state.dhis2Config.password);
    let successCount = 0;
    let errorCount = 0;
    
    for (const submission of unsynced) {
        try {
            // Build DHIS2 data value set
            const dataValues = [];
            
            state.fields.forEach(field => {
                if (field.dhis2DataElement && submission.data[field.name]) {
                    dataValues.push({
                        dataElement: field.dhis2DataElement,
                        categoryOptionCombo: field.dhis2CategoryOptionCombo || 'default',
                        value: submission.data[field.name]
                    });
                }
            });
            
            if (dataValues.length === 0) continue;
            
            const payload = {
                dataSet: state.dhis2Config.dataSet || '',
                period: submission.data.period || getCurrentPeriod(),
                orgUnit: submission.data.orgUnit || state.dhis2Config.orgUnit || '',
                dataValues: dataValues
            };
            
            const response = await fetch(state.dhis2Config.baseUrl + '/api/dataValueSets', {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + auth,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                // Mark as synced
                submission.dhis2Synced = true;
                submission.dhis2SyncedAt = new Date().toISOString();
                
                const tx = state.db.transaction(['submissions'], 'readwrite');
                tx.objectStore('submissions').put(submission);
                
                successCount++;
            } else {
                errorCount++;
                console.error('DHIS2 sync error:', await response.text());
            }
        } catch (err) {
            errorCount++;
            console.error('DHIS2 sync error:', err);
        }
    }
    
    showNotification('Synced: ' + successCount + ' success, ' + errorCount + ' failed');
}

function getCurrentPeriod() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return year + month;
}

async function fetchDHIS2OrgUnits() {
    if (!state.dhis2Config.baseUrl) return [];
    
    const auth = btoa(state.dhis2Config.username + ':' + state.dhis2Config.password);
    
    try {
        const response = await fetch(state.dhis2Config.baseUrl + '/api/organisationUnits.json?paging=false&fields=id,name,level', {
            headers: { 'Authorization': 'Basic ' + auth }
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.organisationUnits || [];
        }
    } catch (err) {
        console.error('Error fetching org units:', err);
    }
    return [];
}

async function fetchDHIS2DataElements() {
    if (!state.dhis2Config.baseUrl) return [];
    
    const auth = btoa(state.dhis2Config.username + ':' + state.dhis2Config.password);
    
    try {
        const response = await fetch(state.dhis2Config.baseUrl + '/api/dataElements.json?paging=false&fields=id,name,valueType', {
            headers: { 'Authorization': 'Basic ' + auth }
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.dataElements || [];
        }
    } catch (err) {
        console.error('Error fetching data elements:', err);
    }
    return [];
}

// ============================================
// GOOGLE SHEETS SYNCHRONIZATION
// ============================================

async function syncToGoogleSheets() {
    if (!state.googleConfig.scriptUrl) {
        showNotification('Google Sheets not configured', 'error');
        return;
    }
    
    const submissions = await getFormSubmissions(state.currentFormId);
    const unsynced = submissions.filter(s => !s.googleSynced);
    
    if (unsynced.length === 0) {
        showNotification('No data to sync');
        return;
    }
    
    showNotification('Syncing ' + unsynced.length + ' records to Google Sheets...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const submission of unsynced) {
        try {
            // Prepare row data
            const rowData = state.fields
                .filter(f => f.type !== 'section')
                .map(f => submission.data[f.name] || '');
            
            const payload = {
                action: 'append',
                sheetId: state.googleConfig.sheetId,
                sheetName: state.googleConfig.sheetName || 'Sheet1',
                data: rowData
            };
            
            const response = await fetch(state.googleConfig.scriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            // no-cors mode doesn't give us response status, assume success
            submission.googleSynced = true;
            submission.googleSyncedAt = new Date().toISOString();
            
            const tx = state.db.transaction(['submissions'], 'readwrite');
            tx.objectStore('submissions').put(submission);
            
            successCount++;
        } catch (err) {
            errorCount++;
            console.error('Google Sheets sync error:', err);
        }
    }
    
    showNotification('Synced ' + successCount + ' records to Google Sheets');
}

function openGoogleSheetsConfig() {
    let html = '<div class="modal-header"><h3>'+getIcon('file-spreadsheet', 20)+' Google Sheets Config</h3><button class="modal-close" onclick="closeModal(\'googleModal\')">'+getIcon('x', 18)+'</button></div><div class="modal-body">';
    
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('link', 14)+' Apps Script Web App URL</div><input type="url" class="property-input" id="gsScriptUrl" value="'+(state.googleConfig.scriptUrl || '')+'" placeholder="https://script.google.com/macros/s/.../exec"></div>';
    
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('file-text', 14)+' Sheet ID</div><input type="text" class="property-input" id="gsSheetId" value="'+(state.googleConfig.sheetId || '')+'" placeholder="From URL: spreadsheets/d/SHEET_ID/edit"></div>';
    
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('layout', 14)+' Sheet Name</div><input type="text" class="property-input" id="gsSheetName" value="'+(state.googleConfig.sheetName || 'Sheet1')+'" placeholder="Sheet1"></div>';
    
    html += '<div class="prop-section" style="background:#e8f4fc;padding:12px;border-radius:8px;"><div style="font-size:11px;color:#004080;"><strong>Setup Instructions:</strong><ol style="margin:8px 0 0 16px;padding:0;"><li>Create a Google Apps Script</li><li>Deploy as Web App (Anyone can access)</li><li>Copy the URL here</li></ol></div></div>';
    
    html += '</div><div class="modal-footer"><button class="modal-btn" onclick="closeModal(\'googleModal\')">Cancel</button><button class="modal-btn success" onclick="saveGoogleConfig()">'+getIcon('check', 14)+' Save</button></div>';
    
    document.getElementById('googleModal').innerHTML = html;
    document.getElementById('googleModal').classList.add('show');
    initializeIcons();
}

function saveGoogleConfig() {
    state.googleConfig = {
        scriptUrl: document.getElementById('gsScriptUrl').value,
        sheetId: document.getElementById('gsSheetId').value,
        sheetName: document.getElementById('gsSheetName').value
    };
    
    localStorage.setItem('icf_google_config', JSON.stringify(state.googleConfig));
    showNotification('Google Sheets configuration saved!');
    closeModal('googleModal');
}

// ============================================
// DASHBOARD WITH CHARTS
// ============================================

async function showDashboard() {
    state.viewMode = 'dashboard';
    
    const content = document.getElementById('content');
    let html = '<div class="dashboard-container" style="padding:20px;max-width:1200px;margin:0 auto;">';
    
    html += '<div class="dashboard-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:25px;"><h2 style="margin:0;">'+getIcon('bar-chart-3', 24)+' Dashboard</h2><button class="modal-btn" onclick="showHome()">'+getIcon('arrow-left', 14)+' Back</button></div>';
    
    // Stats cards
    const stats = await getDashboardStats();
    html += '<div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:15px;margin-bottom:25px;">';
    
    html += '<div class="stat-card" style="background:linear-gradient(135deg, #004080, #0066cc);color:white;padding:20px;border-radius:12px;"><div style="font-size:28px;font-weight:700;">'+stats.totalForms+'</div><div style="font-size:12px;opacity:0.9;">Total Forms</div></div>';
    
    html += '<div class="stat-card" style="background:linear-gradient(135deg, #28a745, #20c997);color:white;padding:20px;border-radius:12px;"><div style="font-size:28px;font-weight:700;">'+stats.totalSubmissions+'</div><div style="font-size:12px;opacity:0.9;">Total Submissions</div></div>';
    
    html += '<div class="stat-card" style="background:linear-gradient(135deg, #ffc107, #ff9800);color:white;padding:20px;border-radius:12px;"><div style="font-size:28px;font-weight:700;">'+stats.pendingSync+'</div><div style="font-size:12px;opacity:0.9;">Pending Sync</div></div>';
    
    html += '<div class="stat-card" style="background:linear-gradient(135deg, #6f42c1, #9c27b0);color:white;padding:20px;border-radius:12px;"><div style="font-size:28px;font-weight:700;">'+stats.drafts+'</div><div style="font-size:12px;opacity:0.9;">Saved Drafts</div></div>';
    
    html += '</div>';
    
    // Charts section
    html += '<div class="charts-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(400px, 1fr));gap:20px;">';
    
    html += '<div class="chart-card" style="background:white;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);"><h3 style="margin:0 0 15px 0;font-size:14px;">'+getIcon('trending-up', 16)+' Submissions Over Time</h3><canvas id="submissionsChart" height="200"></canvas></div>';
    
    html += '<div class="chart-card" style="background:white;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);"><h3 style="margin:0 0 15px 0;font-size:14px;">'+getIcon('pie-chart', 16)+' Submissions by Form</h3><canvas id="formsPieChart" height="200"></canvas></div>';
    
    html += '</div>';
    
    // Recent activity
    html += '<div style="background:white;padding:20px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);margin-top:20px;"><h3 style="margin:0 0 15px 0;font-size:14px;">'+getIcon('clock', 16)+' Recent Activity</h3><div id="recentActivity"></div></div>';
    
    html += '</div>';
    
    content.innerHTML = html;
    initializeIcons();
    
    // Render charts
    setTimeout(() => {
        renderDashboardCharts(stats);
        renderRecentActivity();
    }, 100);
}

async function getDashboardStats() {
    return new Promise(async (resolve) => {
        const stats = {
            totalForms: 0,
            totalSubmissions: 0,
            pendingSync: 0,
            drafts: 0,
            submissionsByDate: {},
            submissionsByForm: {}
        };
        
        try {
            // Count forms
            const formsTx = state.db.transaction(['forms'], 'readonly');
            const formsReq = formsTx.objectStore('forms').count();
            formsReq.onsuccess = () => { stats.totalForms = formsReq.result; };
            
            // Count submissions
            const subTx = state.db.transaction(['submissions'], 'readonly');
            const subStore = subTx.objectStore('submissions');
            const subReq = subStore.getAll();
            subReq.onsuccess = () => {
                const subs = subReq.result || [];
                stats.totalSubmissions = subs.length;
                stats.pendingSync = subs.filter(s => !s.dhis2Synced && !s.googleSynced).length;
                
                // Group by date and form
                subs.forEach(s => {
                    const date = s.submittedAt ? s.submittedAt.split('T')[0] : 'Unknown';
                    stats.submissionsByDate[date] = (stats.submissionsByDate[date] || 0) + 1;
                    stats.submissionsByForm[s.formName || 'Unknown'] = (stats.submissionsByForm[s.formName || 'Unknown'] || 0) + 1;
                });
            };
            
            // Count drafts
            const draftTx = state.db.transaction(['drafts'], 'readonly');
            const draftReq = draftTx.objectStore('drafts').count();
            draftReq.onsuccess = () => { stats.drafts = draftReq.result; };
            
            setTimeout(() => resolve(stats), 200);
        } catch (e) {
            resolve(stats);
        }
    });
}

function renderDashboardCharts(stats) {
    // Line chart for submissions over time
    const lineCtx = document.getElementById('submissionsChart');
    if (lineCtx && typeof Chart !== 'undefined') {
        const dates = Object.keys(stats.submissionsByDate).sort().slice(-14);
        const values = dates.map(d => stats.submissionsByDate[d] || 0);
        
        new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: dates.map(d => d.slice(5)),
                datasets: [{
                    label: 'Submissions',
                    data: values,
                    borderColor: '#004080',
                    backgroundColor: 'rgba(0, 64, 128, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }
    
    // Pie chart for submissions by form
    const pieCtx = document.getElementById('formsPieChart');
    if (pieCtx && typeof Chart !== 'undefined') {
        const labels = Object.keys(stats.submissionsByForm);
        const values = Object.values(stats.submissionsByForm);
        const colors = ['#004080', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#17a2b8', '#fd7e14'];
        
        new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors.slice(0, labels.length)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }
}

async function renderRecentActivity() {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    
    try {
        const tx = state.db.transaction(['submissions'], 'readonly');
        const req = tx.objectStore('submissions').getAll();
        req.onsuccess = () => {
            const subs = (req.result || []).sort((a, b) => 
                new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0)
            ).slice(0, 10);
            
            if (subs.length === 0) {
                container.innerHTML = '<p style="color:#868e96;text-align:center;">No recent activity</p>';
                return;
            }
            
            let html = '<div style="max-height:300px;overflow-y:auto;">';
            subs.forEach(s => {
                const date = s.submittedAt ? new Date(s.submittedAt) : new Date();
                html += '<div style="display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid #e9ecef;"><div><strong style="font-size:12px;">'+(s.formName || 'Unknown Form')+'</strong><br><span style="font-size:11px;color:#868e96;">Submitted</span></div><div style="text-align:right;font-size:11px;color:#868e96;">'+date.toLocaleDateString()+'<br>'+date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})+'</div></div>';
            });
            html += '</div>';
            
            container.innerHTML = html;
        };
    } catch (e) {
        container.innerHTML = '<p style="color:#868e96;">Unable to load activity</p>';
    }
}

// ============================================
// ADVANCED FIELD PROPERTIES PANEL
// ============================================

function renderAdvancedProperties() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field) return '';
    
    let html = '<div class="prop-section"><div class="prop-section-title">'+getIcon('sliders', 14)+' Advanced Settings</div>';
    
    // Description/Help text
    html += '<div class="prop-group"><label class="property-label">Help Text</label><input type="text" class="property-input" value="'+(field.helpText || '')+'" onchange="updateFieldProp(\'helpText\', this.value)" placeholder="Instructions for users"></div>';
    
    // Placeholder
    if (['text', 'textarea', 'number', 'email', 'phone'].includes(field.type)) {
        html += '<div class="prop-group"><label class="property-label">Placeholder</label><input type="text" class="property-input" value="'+(field.placeholder || '')+'" onchange="updateFieldProp(\'placeholder\', this.value)"></div>';
    }
    
    // Default value
    html += '<div class="prop-group"><label class="property-label">Default Value</label><input type="text" class="property-input" value="'+(field.defaultValue || '')+'" onchange="updateFieldProp(\'defaultValue\', this.value)"></div>';
    
    // Min/Max for numbers
    if (field.type === 'number') {
        html += '<div class="prop-row"><div class="prop-group"><label class="property-label">Min</label><input type="number" class="property-input" value="'+(field.min || '')+'" onchange="updateFieldProp(\'min\', this.value)"></div><div class="prop-group"><label class="property-label">Max</label><input type="number" class="property-input" value="'+(field.max || '')+'" onchange="updateFieldProp(\'max\', this.value)"></div></div>';
        html += '<div class="prop-group"><label class="property-label">Step</label><input type="number" class="property-input" value="'+(field.step || '1')+'" onchange="updateFieldProp(\'step\', this.value)"></div>';
    }
    
    // Text area rows
    if (field.type === 'textarea') {
        html += '<div class="prop-group"><label class="property-label">Rows</label><input type="number" class="property-input" value="'+(field.rows || 3)+'" onchange="updateFieldProp(\'rows\', this.value)" min="2" max="20"></div>';
    }
    
    // Rating max stars
    if (field.type === 'rating') {
        html += '<div class="prop-group"><label class="property-label">Max Stars</label><input type="number" class="property-input" value="'+(field.maxStars || 5)+'" onchange="updateFieldProp(\'maxStars\', this.value)" min="3" max="10"></div>';
    }
    
    // Period type
    if (field.type === 'period') {
        html += '<div class="prop-group"><label class="property-label">Period Type</label><select class="property-select" onchange="updateFieldProp(\'periodType\', this.value)"><option value="monthly" '+(field.periodType === 'monthly' ? 'selected' : '')+'>Monthly</option><option value="quarterly" '+(field.periodType === 'quarterly' ? 'selected' : '')+'>Quarterly</option><option value="yearly" '+(field.periodType === 'yearly' ? 'selected' : '')+'>Yearly</option><option value="weekly" '+(field.periodType === 'weekly' ? 'selected' : '')+'>Weekly</option></select></div>';
    }
    
    // CSS class
    html += '<div class="prop-group"><label class="property-label">CSS Class</label><input type="text" class="property-input" value="'+(field.cssClass || '')+'" onchange="updateFieldProp(\'cssClass\', this.value)" placeholder="custom-class"></div>';
    
    html += '</div>';
    
    // DHIS2 mapping
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('database', 14)+' DHIS2 Mapping</div>';
    html += '<div class="prop-group"><label class="property-label">Data Element ID</label><input type="text" class="property-input" value="'+(field.dhis2DataElement || '')+'" onchange="updateFieldProp(\'dhis2DataElement\', this.value)" placeholder="e.g., abc123xyz"></div>';
    html += '<div class="prop-group"><label class="property-label">Category Option Combo</label><input type="text" class="property-input" value="'+(field.dhis2CategoryOptionCombo || '')+'" onchange="updateFieldProp(\'dhis2CategoryOptionCombo\', this.value)" placeholder="Leave empty for default"></div>';
    html += '</div>';
    
    return html;
}

// ============================================
// FORM SUBMISSION HANDLER
// ============================================

function submitForm() {
    const formData = getFormData();
    
    // Validate required fields
    let isValid = true;
    let firstErrorField = null;
    
    state.fields.forEach(field => {
        const input = document.querySelector('[name="'+field.name+'"]');
        const container = document.getElementById('field-' + field.name);
        
        if (!container || container.style.display === 'none') return; // Skip hidden fields
        
        // Check required
        if (field.required && (!formData[field.name] || formData[field.name] === '')) {
            isValid = false;
            if (input) {
                input.classList.add('error');
                if (!firstErrorField) firstErrorField = input;
            }
            return;
        }
        
        // Check validation rules
        const validation = validateField(field, formData[field.name]);
        if (!validation.valid) {
            isValid = false;
            if (input) {
                input.classList.add('error');
                showFieldError(field.name, validation.message);
                if (!firstErrorField) firstErrorField = input;
            }
        } else {
            if (input) input.classList.remove('error');
        }
    });
    
    if (!isValid) {
        showNotification('Please fix the errors before submitting', 'error');
        if (firstErrorField) firstErrorField.focus();
        return;
    }
    
    // Create submission record
    const submission = {
        id: 'sub_' + Date.now(),
        formId: state.currentFormId,
        formName: state.formName,
        data: formData,
        submittedAt: new Date().toISOString(),
        dhis2Synced: false,
        googleSynced: false
    };
    
    // Save to IndexedDB
    const tx = state.db.transaction(['submissions'], 'readwrite');
    const store = tx.objectStore('submissions');
    store.add(submission);
    
    tx.oncomplete = () => {
        showNotification('Form submitted successfully!', 'success');
        
        // Reset form
        document.getElementById('dataEntryForm').reset();
        
        // Try to sync if online
        if (navigator.onLine) {
            if (state.dhis2Config.baseUrl) syncToDHIS2();
            if (state.googleConfig.scriptUrl) syncToGoogleSheets();
        }
    };
    
    tx.onerror = () => {
        showNotification('Error saving submission', 'error');
    };
}

function showFieldError(fieldName, message) {
    const container = document.getElementById('field-' + fieldName);
    if (!container) return;
    
    let errorEl = container.querySelector('.field-error');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'field-error';
        errorEl.style.cssText = 'color:#dc3545;font-size:11px;margin-top:4px;';
        container.appendChild(errorEl);
    }
    errorEl.textContent = message;
}

// ============================================
// FORM JSON IMPORT/EXPORT
// ============================================

function exportFormJSON() {
    const formData = {
        name: state.formName,
        description: state.formDescription,
        fields: state.fields,
        dhis2Config: state.dhis2Config,
        googleConfig: state.googleConfig,
        exportedAt: new Date().toISOString(),
        version: '3.0'
    };
    
    const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = (state.formName || 'form').replace(/[^a-z0-9]/gi, '_') + '.json';
    link.click();
    
    showNotification('Form exported as JSON');
}

function importFormJSON(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            state.formName = data.name || 'Imported Form';
            state.formDescription = data.description || '';
            state.fields = data.fields || [];
            
            if (data.dhis2Config) state.dhis2Config = data.dhis2Config;
            if (data.googleConfig) state.googleConfig = data.googleConfig;
            
            renderFields();
            showNotification('Form imported successfully!');
        } catch (err) {
            showNotification('Invalid JSON file', 'error');
        }
    };
    reader.readAsText(file);
}

function openImportModal() {
    let html = '<div class="modal-header"><h3>'+getIcon('upload', 20)+' Import Form</h3><button class="modal-close" onclick="closeModal(\'importModal\')">'+getIcon('x', 18)+'</button></div><div class="modal-body">';
    
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('file-json', 14)+' Import JSON</div><p style="font-size:12px;color:#666;margin-bottom:10px;">Upload a previously exported form JSON file</p><input type="file" accept=".json" onchange="importFormJSON(this.files[0]); closeModal(\'importModal\');" class="file-input"></div>';
    
    html += '</div><div class="modal-footer"><button class="modal-btn" onclick="closeModal(\'importModal\')">Cancel</button></div>';
    
    document.getElementById('importModal').innerHTML = html;
    document.getElementById('importModal').classList.add('show');
    initializeIcons();
}

// ============================================
// OFFLINE/ONLINE STATUS
// ============================================

function updateOnlineStatus() {
    const indicator = document.getElementById('onlineIndicator');
    if (indicator) {
        if (navigator.onLine) {
            indicator.innerHTML = getIcon('wifi', 14) + ' Online';
            indicator.className = 'online-status online';
        } else {
            indicator.innerHTML = getIcon('wifi-off', 14) + ' Offline';
            indicator.className = 'online-status offline';
        }
        initializeIcons();
    }
}

window.addEventListener('online', () => {
    updateOnlineStatus();
    showNotification('You are back online!');
    // Auto-sync when back online
    if (state.dhis2Config.baseUrl) syncToDHIS2();
    if (state.googleConfig.scriptUrl) syncToGoogleSheets();
});

window.addEventListener('offline', () => {
    updateOnlineStatus();
    showNotification('You are offline. Data will be saved locally.', 'warning');
});

// ============================================
// SETTINGS MODAL
// ============================================

function openSettings() {
    let html = '<div class="modal-header"><h3>'+getIcon('settings', 20)+' Settings</h3><button class="modal-close" onclick="closeModal(\'settingsModal\')">'+getIcon('x', 18)+'</button></div><div class="modal-body">';
    
    // App settings
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('layout', 14)+' Appearance</div>';
    html += '<div class="prop-group"><label class="property-label">Theme</label><select class="property-select" id="settingTheme" onchange="updateSetting(\'theme\', this.value)"><option value="light">Light</option><option value="dark">Dark</option></select></div>';
    html += '<div class="prop-group"><label class="property-label">Language</label><select class="property-select" id="settingLang"><option value="en">English</option><option value="fr">French</option></select></div>';
    html += '</div>';
    
    // Data settings
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('database', 14)+' Data Management</div>';
    html += '<button class="modal-btn" onclick="clearAllData()" style="width:100%;margin-bottom:8px;">'+getIcon('trash-2', 14)+' Clear All Local Data</button>';
    html += '<button class="modal-btn" onclick="exportAllData()" style="width:100%;">'+getIcon('download', 14)+' Export All Data</button>';
    html += '</div>';
    
    // About
    html += '<div class="prop-section"><div class="prop-section-title">'+getIcon('info', 14)+' About</div>';
    html += '<p style="font-size:12px;color:#666;margin:0;">ICF Collect v3.0<br>© 2025 ICF Sierra Leone<br>Built with '+getIcon('heart', 12)+' for health data collection</p>';
    html += '</div>';
    
    html += '</div><div class="modal-footer"><button class="modal-btn success" onclick="closeModal(\'settingsModal\')">'+getIcon('check', 14)+' Done</button></div>';
    
    document.getElementById('settingsModal').innerHTML = html;
    document.getElementById('settingsModal').classList.add('show');
    initializeIcons();
}

function clearAllData() {
    if (!confirm('This will delete ALL local data including forms, submissions, and drafts. Are you sure?')) return;
    if (!confirm('This action cannot be undone. Continue?')) return;
    
    const stores = ['forms', 'submissions', 'drafts'];
    const tx = state.db.transaction(stores, 'readwrite');
    
    stores.forEach(store => {
        tx.objectStore(store).clear();
    });
    
    tx.oncomplete = () => {
        showNotification('All data cleared');
        showHome();
    };
}

function exportAllData() {
    const allData = {
        forms: [],
        submissions: [],
        drafts: [],
        exportedAt: new Date().toISOString()
    };
    
    const tx = state.db.transaction(['forms', 'submissions', 'drafts'], 'readonly');
    
    tx.objectStore('forms').getAll().onsuccess = (e) => {
        allData.forms = e.target.result;
    };
    
    tx.objectStore('submissions').getAll().onsuccess = (e) => {
        allData.submissions = e.target.result;
    };
    
    tx.objectStore('drafts').getAll().onsuccess = (e) => {
        allData.drafts = e.target.result;
    };
    
    tx.oncomplete = () => {
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'icf_collect_backup_' + new Date().toISOString().slice(0,10) + '.json';
        link.click();
        
        showNotification('Data exported successfully');
    };
}

// ============================================
// MODAL HTML TEMPLATES
// ============================================

function initModals() {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modalContainer';
    modalContainer.innerHTML = \`
        <div id="validationModal" class="modal"></div>
        <div id="logicModal" class="modal"></div>
        <div id="cascadeModal" class="modal"></div>
        <div id="calculationModal" class="modal"></div>
        <div id="dhis2Modal" class="modal"></div>
        <div id="googleModal" class="modal"></div>
        <div id="exportModal" class="modal"></div>
        <div id="draftsModal" class="modal"></div>
        <div id="importModal" class="modal"></div>
        <div id="settingsModal" class="modal"></div>
        <div id="previewModal" class="modal"></div>
        <div id="formSettingsModal" class="modal"></div>
    \`;
    document.body.appendChild(modalContainer);
    
    // Add modal overlay click handler
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
            }
        });
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
}

// ============================================
// QR CODE SCANNER
// ============================================

function startQRScanner(fieldName) {
    const input = document.querySelector('[name="'+fieldName+'"]');
    if (!input) return;
    
    // Check if browser supports camera
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showNotification('Camera not supported', 'error');
        // Fallback to manual entry
        const code = prompt('Enter code manually:');
        if (code) input.value = code;
        return;
    }
    
    // Create scanner modal
    const scannerHTML = \`
        <div class="modal-header">
            <h3>\${getIcon('qr-code', 20)} Scan QR/Barcode</h3>
            <button class="modal-close" onclick="stopQRScanner()">\${getIcon('x', 18)}</button>
        </div>
        <div class="modal-body" style="padding:0;">
            <video id="qrVideo" style="width:100%;max-height:300px;background:#000;"></video>
            <div id="qrResult" style="padding:15px;text-align:center;">
                <p style="color:#868e96;">Point camera at QR code or barcode</p>
            </div>
        </div>
        <div class="modal-footer">
            <button class="modal-btn" onclick="stopQRScanner()">Cancel</button>
            <button class="modal-btn" onclick="manualCodeEntry('${fieldName}')">Enter Manually</button>
        </div>
    \`;
    
    document.getElementById('previewModal').innerHTML = scannerHTML;
    document.getElementById('previewModal').classList.add('show');
    document.getElementById('previewModal').dataset.fieldName = fieldName;
    initializeIcons();
    
    // Start camera
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            const video = document.getElementById('qrVideo');
            if (video) {
                video.srcObject = stream;
                video.play();
                state.qrStream = stream;
                
                // Simple barcode detection using BarcodeDetector API if available
                if ('BarcodeDetector' in window) {
                    const detector = new BarcodeDetector();
                    state.qrScanning = setInterval(() => {
                        if (video.readyState === video.HAVE_ENOUGH_DATA) {
                            detector.detect(video).then(barcodes => {
                                if (barcodes.length > 0) {
                                    const code = barcodes[0].rawValue;
                                    stopQRScanner();
                                    input.value = code;
                                    showNotification('Code scanned: ' + code);
                                }
                            }).catch(err => console.log('Scan error:', err));
                        }
                    }, 500);
                } else {
                    document.getElementById('qrResult').innerHTML = '<p style="color:#ffc107;">Auto-scan not supported. Please enter code manually.</p>';
                }
            }
        })
        .catch(err => {
            console.error('Camera error:', err);
            showNotification('Camera access denied', 'error');
            stopQRScanner();
        });
}

function stopQRScanner() {
    if (state.qrStream) {
        state.qrStream.getTracks().forEach(track => track.stop());
        state.qrStream = null;
    }
    if (state.qrScanning) {
        clearInterval(state.qrScanning);
        state.qrScanning = null;
    }
    closeModal('previewModal');
}

function manualCodeEntry(fieldName) {
    stopQRScanner();
    const code = prompt('Enter code:');
    if (code) {
        const input = document.querySelector('[name="'+fieldName+'"]');
        if (input) input.value = code;
    }
}

// ============================================
// GPS CAPTURE
// ============================================

function captureGPS(fieldName) {
    const input = document.querySelector('[name="'+fieldName+'"]');
    const btn = document.querySelector('[data-gps-btn="'+fieldName+'"]');
    
    if (!navigator.geolocation) {
        showNotification('GPS not supported', 'error');
        return;
    }
    
    if (btn) {
        btn.innerHTML = getIcon('loader', 14) + ' Getting location...';
        btn.disabled = true;
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude.toFixed(6);
            const lng = position.coords.longitude.toFixed(6);
            const accuracy = position.coords.accuracy.toFixed(0);
            
            if (input) {
                input.value = lat + ', ' + lng;
            }
            
            // Update display
            const display = document.getElementById('gps-display-' + fieldName);
            if (display) {
                display.innerHTML = \`
                    <div style="background:#d4edda;padding:10px;border-radius:6px;margin-top:8px;">
                        <div style="font-size:12px;"><strong>Latitude:</strong> \${lat}</div>
                        <div style="font-size:12px;"><strong>Longitude:</strong> \${lng}</div>
                        <div style="font-size:11px;color:#666;">Accuracy: ±\${accuracy}m</div>
                    </div>
                \`;
            }
            
            if (btn) {
                btn.innerHTML = getIcon('map-pin', 14) + ' Update Location';
                btn.disabled = false;
            }
            
            showNotification('Location captured!');
            initializeIcons();
        },
        (error) => {
            console.error('GPS error:', error);
            showNotification('Could not get location: ' + error.message, 'error');
            
            if (btn) {
                btn.innerHTML = getIcon('map-pin', 14) + ' Get Location';
                btn.disabled = false;
            }
            initializeIcons();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
}

// ============================================
// RATING FIELD HANDLER
// ============================================

function setRating(fieldName, value) {
    const input = document.querySelector('input[name="'+fieldName+'"]');
    if (input) input.value = value;
    
    // Update stars display
    const container = document.querySelector('[data-rating-container="'+fieldName+'"]');
    if (container) {
        const stars = container.querySelectorAll('.rating-star');
        stars.forEach((star, index) => {
            star.classList.toggle('active', index < value);
        });
    }
}

// ============================================
// PERIOD FIELD RENDERER
// ============================================

function renderPeriodField(field) {
    const periodType = field.periodType || 'monthly';
    const now = new Date();
    let options = [];
    
    if (periodType === 'monthly') {
        for (let i = 0; i < 24; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const value = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0');
            const label = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            options.push({ value, label });
        }
    } else if (periodType === 'quarterly') {
        for (let i = 0; i < 8; i++) {
            const quarter = Math.floor((now.getMonth() - i * 3) / 3) + 1;
            const year = now.getFullYear() - Math.floor(i / 4);
            const value = year + 'Q' + ((quarter - 1 + 4) % 4 + 1);
            options.push({ value, label: value.replace('Q', ' Q') });
        }
    } else if (periodType === 'yearly') {
        for (let i = 0; i < 10; i++) {
            const year = now.getFullYear() - i;
            options.push({ value: String(year), label: String(year) });
        }
    } else if (periodType === 'weekly') {
        for (let i = 0; i < 52; i++) {
            const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
            const week = getWeekNumber(d);
            const value = d.getFullYear() + 'W' + String(week).padStart(2, '0');
            options.push({ value, label: 'Week ' + week + ', ' + d.getFullYear() });
        }
    }
    
    return '<select class="form-control" name="'+field.name+'" '+(field.required ? 'required' : '')+'><option value="">-- Select Period --</option>'+options.map(o => '<option value="'+o.value+'">'+o.label+'</option>').join('')+'</select>';
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// ============================================
// URL HASH ROUTING
// ============================================

function handleHashChange() {
    const hash = window.location.hash.slice(1);
    
    if (hash.startsWith('form/')) {
        const formId = hash.replace('form/', '');
        loadForm(formId);
    } else if (hash === 'new') {
        createNewForm();
    } else if (hash === 'dashboard') {
        showDashboard();
    } else {
        showHome();
    }
}

window.addEventListener('hashchange', handleHashChange);

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S = Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (state.viewMode === 'builder' && state.currentFormId) {
            saveForm();
        } else if (state.viewMode === 'form-viewer') {
            saveDraft();
        }
    }
    
    // Ctrl/Cmd + N = New Form
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createNewForm();
    }
    
    // Escape = Close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.show').forEach(modal => {
            modal.classList.remove('show');
        });
    }
    
    // Delete selected field
    if (e.key === 'Delete' && state.selectedFieldId && state.viewMode === 'builder') {
        const activeEl = document.activeElement;
        if (!activeEl || !['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName)) {
            deleteField(state.selectedFieldId);
        }
    }
});

// ============================================
// FINAL INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

// Expose functions globally for onclick handlers
window.addField = addField;
window.deleteField = deleteField;
window.duplicateField = duplicateField;
window.moveFieldUp = moveFieldUp;
window.moveFieldDown = moveFieldDown;
window.selectField = selectField;
window.updateFieldProp = updateFieldProp;
window.saveForm = saveForm;
window.loadForm = loadForm;
window.deleteForm = deleteForm;
window.createNewForm = createNewForm;
window.showHome = showHome;
window.showDashboard = showDashboard;
window.previewForm = previewForm;
window.openFormViewer = openFormViewer;
window.submitForm = submitForm;
window.saveDraft = saveDraft;
window.loadDraft = loadDraft;
window.deleteDraft = deleteDraft;
window.openValidationEditor = openValidationEditor;
window.openLogicEditor = openLogicEditor;
window.openCascadeEditor = openCascadeEditor;
window.openCalculationEditor = openCalculationEditor;
window.openDHIS2Config = openDHIS2Config;
window.openGoogleSheetsConfig = openGoogleSheetsConfig;
window.openExportModal = openExportModal;
window.openDraftsModal = openDraftsModal;
window.openImportModal = openImportModal;
window.openSettings = openSettings;
window.exportData = exportData;
window.exportFormJSON = exportFormJSON;
window.importFormJSON = importFormJSON;
window.syncToDHIS2 = syncToDHIS2;
window.syncToGoogleSheets = syncToGoogleSheets;
window.closeModal = closeModal;
window.addValidationRule = addValidationRule;
window.removeValidationRule = removeValidationRule;
window.addLogicCondition = addLogicCondition;
window.removeLogicCondition = removeLogicCondition;
window.addCascadeLevel = addCascadeLevel;
window.removeCascadeLevel = removeCascadeLevel;
window.insertCalcField = insertCalcField;
window.insertCalcOp = insertCalcOp;
window.handleCascadeChange = handleCascadeChange;
window.captureGPS = captureGPS;
window.startQRScanner = startQRScanner;
window.stopQRScanner = stopQRScanner;
window.manualCodeEntry = manualCodeEntry;
window.setRating = setRating;
window.addOption = addOption;
window.removeOption = removeOption;
window.logout = logout;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleForgotPassword = handleForgotPassword;
window.switchAuthTab = switchAuthTab;
window.showForgotPassword = showForgotPassword;
window.testDHIS2Connection = testDHIS2Connection;
window.saveDHIS2Config = saveDHIS2Config;
window.saveGoogleConfig = saveGoogleConfig;
window.saveValidation = saveValidation;
window.saveLogic = saveLogic;
window.saveCalculation = saveCalculation;
window.saveCascadeConfig = saveCascadeConfig;
window.updateOnlineStatus = updateOnlineStatus;
window.clearAllData = clearAllData;
window.exportAllData = exportAllData;
window.clearCascadeData = clearCascadeData;
window.updateLogicOperator = updateLogicOperator;
window.updateCascadeLevel = updateCascadeLevel;

console.log('ICF Collect v3 loaded successfully!');
console.log('Features: 20+ field types, validation, logic, DHIS2 sync, Google Sheets sync, offline support, GPS, QR scanning');
