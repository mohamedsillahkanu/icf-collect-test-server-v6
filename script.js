// ICF Collect - Main Application Script
// Version 3.0 - Full DHIS2 & Google Sheets Integration

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
    return `<span class="inline-icon" style="width:${size}px;height:${size}px;">${svg.replace('viewBox', `width="${size}" height="${size}" viewBox`)}</span>`;
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
        console.error('Compression error:', e);
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
        console.error('Decompression error:', e);
        try {
            return JSON.parse(decodeURIComponent(atob(compressed)));
        } catch (e2) {
            return null;
        }
    }
}

function addSyncLog(message, type = 'info') {
    const log = document.getElementById('syncLog');
    const entry = document.createElement('div');
    entry.className = 'log-entry ' + type;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

// ============================================
// AUTHENTICATION
// ============================================

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.querySelector(`.auth-tab[data-tab="${tab}"]`)?.classList.add('active');
    document.getElementById(tab === 'login' ? 'loginForm' : tab === 'signup' ? 'signupForm' : 'forgotForm')?.classList.add('active');
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
    return dbOperation(DB_CONFIG.formsStore, 'readwrite', store => {
        if (form.id) {
            return store.put(form);
        } else {
            return store.add(form);
        }
    });
}

async function deleteForm(formId) {
    return dbOperation(DB_CONFIG.formsStore, 'readwrite', store => store.delete(formId));
}

async function saveCurrentForm() {
    if (!state.currentUser) {
        showNotification('Please login first', 'error');
        return;
    }
    
    const form = {
        id: state.currentFormId,
        userEmail: state.currentUser.email,
        title: document.getElementById('formTitle').value || 'Untitled Form',
        fields: state.fields,
        dhis2Config: state.dhis2Config,
        sheetsConfig: state.sheetsConfig,
        updatedAt: new Date().toISOString()
    };
    
    if (!form.id) {
        form.createdAt = new Date().toISOString();
    }
    
    try {
        const id = await saveForm(form);
        if (!state.currentFormId) state.currentFormId = id;
        showNotification('Form saved successfully!');
    } catch (err) {
        showNotification('Failed to save form: ' + err.message, 'error');
    }
}

function newForm() {
    if (state.fields.length > 0) {
        if (!confirm('Create a new form? Unsaved changes will be lost.')) return;
    }
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
    
    let html = `
        <div style="max-width:900px;margin:90px auto 30px;padding:20px;">
            <div style="background:linear-gradient(135deg,#004080,#002855);color:white;padding:30px;border-radius:12px;margin-bottom:25px;text-align:center;">
                <img src="https://github.com/mohamedsillahkanu/gdp-dashboard-2/raw/6c7463b0d5c3be150aafae695a4bcbbd8aeb1499/ICF-SL.jpg" style="width:80px;border-radius:10px;margin-bottom:15px;">
                <h1 style="margin:0 0 8px 0;">${getIcon('clipboard-list', 28)} ICF Collect</h1>
                <p style="opacity:0.9;font-size:14px;">DHIS2 & Google Sheets Integration</p>
                <p style="opacity:0.7;font-size:12px;margin-top:10px;">Welcome, ${state.currentUser?.name || 'User'}!</p>
            </div>
            
            <div style="display:flex;gap:15px;margin-bottom:25px;flex-wrap:wrap;">
                <button onclick="newForm();document.getElementById('homeContainer').classList.remove('show');document.getElementById('mainContainer').classList.add('show');" class="modal-btn success" style="flex:1;min-width:200px;padding:18px;">
                    ${getIcon('file-plus', 20)} Create New Form
                </button>
            </div>
            
            <div style="background:white;border-radius:12px;border:3px solid #004080;overflow:hidden;">
                <div style="background:#004080;color:white;padding:15px 20px;font-weight:700;">
                    ${getIcon('folder', 18)} My Forms (${forms.length})
                </div>
                <div style="padding:15px;">
    `;
    
    if (forms.length === 0) {
        html += `
            <div style="text-align:center;padding:40px;color:#666;">
                ${getIcon('file-text', 48)}
                <p style="margin-top:15px;">No forms yet. Create your first form!</p>
            </div>
        `;
    } else {
        forms.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
        forms.forEach(form => {
            const fieldCount = form.fields?.length || 0;
            const date = new Date(form.updatedAt || form.createdAt).toLocaleDateString();
            html += `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:15px;border:2px solid #e9ecef;border-radius:8px;margin-bottom:10px;cursor:pointer;transition:all 0.2s;" 
                     onmouseover="this.style.borderColor='#004080';this.style.background='#f8f9fa';" 
                     onmouseout="this.style.borderColor='#e9ecef';this.style.background='white';">
                    <div onclick="loadForm(${form.id})" style="flex:1;">
                        <div style="font-weight:700;color:#004080;font-size:14px;">${getIcon('file-text', 16)} ${form.title}</div>
                        <div style="font-size:11px;color:#666;margin-top:4px;">${fieldCount} fields • Updated: ${date}</div>
                        <div style="margin-top:6px;">
                            ${form.dhis2Config ? `<span style="background:#e8f4fc;color:#17a2b8;padding:2px 8px;border-radius:12px;font-size:9px;font-weight:700;">DHIS2</span>` : ''}
                            ${form.sheetsConfig ? `<span style="background:#e6f4ea;color:#0f9d58;padding:2px 8px;border-radius:12px;font-size:9px;font-weight:700;margin-left:4px;">Sheets</span>` : ''}
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button onclick="event.stopPropagation();loadForm(${form.id});" class="modal-btn primary" style="padding:8px 14px;font-size:11px;">${getIcon('edit', 12)} Edit</button>
                        <button onclick="event.stopPropagation();previewFormById(${form.id});" class="modal-btn" style="padding:8px 14px;font-size:11px;background:#17a2b8;color:white;">${getIcon('eye', 12)} Preview</button>
                        <button onclick="event.stopPropagation();if(confirm('Delete this form?'))deleteFormAndRefresh(${form.id});" class="modal-btn danger" style="padding:8px 14px;font-size:11px;">${getIcon('trash-2', 12)}</button>
                    </div>
                </div>
            `;
        });
    }
    
    html += `</div></div></div>`;
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
}

function getDefaultLabel(type) {
    const labels = {
        'text': 'Text Field',
        'number': 'Number Field',
        'calculation': 'Calculated Field',
        'date': 'Date Field',
        'time': 'Time Field',
        'email': 'Email Address',
        'phone': 'Phone Number',
        'textarea': 'Long Text',
        'select': 'Dropdown Selection',
        'radio': 'Radio Selection',
        'checkbox': 'Checkbox Selection',
        'yesno': 'Yes/No Question',
        'gps': 'GPS Location',
        'qrcode': 'QR/Barcode Scanner',
        'cascade': 'Cascading Selection',
        'rating': 'Rating',
        'section': 'New Section',
        'period': 'Reporting Period'
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
        dropZone.innerHTML = `
            <p style="font-size:48px;margin-bottom:12px;">${getIcon('mouse-pointer-click', 48)}</p>
            <p style="font-weight:600;">Click field types to add them</p>
            <p style="font-size:11px;color:#868e96;margin-top:10px;">Add Period + Org Unit fields for DHIS2 sync</p>
        `;
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
    return `
        <div class="section-divider ${isSelected ? 'selected' : ''}" onclick="selectField('${field.id}')">
            <span>${getIcon('folder', 16)} ${field.label}</span>
            <div style="display:flex;gap:4px;">
                ${index > 0 ? `<button class="field-action-btn" onclick="event.stopPropagation();moveField(${index}, -1)" title="Move Up">${getIcon('arrow-up', 12)}</button>` : ''}
                ${index < state.fields.length - 1 ? `<button class="field-action-btn" onclick="event.stopPropagation();moveField(${index}, 1)" title="Move Down">${getIcon('arrow-down', 12)}</button>` : ''}
                <button class="field-action-btn delete" onclick="event.stopPropagation();deleteField('${field.id}')">${getIcon('trash-2', 12)}</button>
            </div>
        </div>
    `;
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
    
    return `
        <div class="${fieldClass}" onclick="selectField('${field.id}')">
            <div class="form-field-header">
                <span class="form-field-label">${field.label} ${badges}</span>
                <div class="form-field-actions">
                    <button class="field-action-btn" onclick="event.stopPropagation();duplicateField('${field.id}')" title="Duplicate">${getIcon('copy', 12)}</button>
                    ${index > 0 ? `<button class="field-action-btn" onclick="event.stopPropagation();moveField(${index}, -1)" title="Move Up">${getIcon('arrow-up', 12)}</button>` : ''}
                    ${index < state.fields.length - 1 ? `<button class="field-action-btn" onclick="event.stopPropagation();moveField(${index}, 1)" title="Move Down">${getIcon('arrow-down', 12)}</button>` : ''}
                    <button class="field-action-btn delete" onclick="event.stopPropagation();deleteField('${field.id}')">${getIcon('trash-2', 12)}</button>
                </div>
            </div>
            ${renderFieldPreview(field)}
        </div>
    `;
}

function renderFieldPreview(field) {
    const placeholder = field.placeholder || '';
    
    switch (field.type) {
        case 'text':
        case 'email':
        case 'phone':
            return `<input type="text" class="property-input" placeholder="${placeholder}" disabled>`;
        case 'number':
            return `<input type="number" class="property-input" placeholder="${placeholder}" disabled>`;
        case 'calculation':
            return `<input type="text" class="property-input" placeholder="Auto-calculated" disabled style="background:#fff3cd;">`;
        case 'date':
            return `<input type="date" class="property-input" disabled>`;
        case 'time':
            return `<input type="time" class="property-input" disabled>`;
        case 'textarea':
            return `<textarea class="property-textarea" placeholder="${placeholder}" disabled></textarea>`;
        case 'select':
            return `<select class="property-select" disabled><option>${field.options[0] || 'Select...'}</option></select>`;
        case 'radio':
            return field.options.slice(0, 2).map(opt => `
                <label style="display:flex;align-items:center;gap:6px;font-size:11px;padding:4px 0;">
                    <input type="radio" disabled> ${opt}
                </label>
            `).join('');
        case 'checkbox':
            return field.options.slice(0, 2).map(opt => `
                <label style="display:flex;align-items:center;gap:6px;font-size:11px;padding:4px 0;">
                    <input type="checkbox" disabled> ${opt}
                </label>
            `).join('');
        case 'yesno':
            return `
                <div style="display:flex;gap:10px;">
                    <label style="display:flex;align-items:center;gap:4px;font-size:11px;"><input type="radio" disabled> Yes</label>
                    <label style="display:flex;align-items:center;gap:4px;font-size:11px;"><input type="radio" disabled> No</label>
                </div>
            `;
        case 'gps':
            return `<div style="background:#e8f4fc;padding:10px;border-radius:6px;font-size:11px;text-align:center;">${getIcon('map-pin', 16)} Click to capture GPS coordinates</div>`;
        case 'qrcode':
            return `<div style="background:#f8f9fa;padding:10px;border-radius:6px;font-size:11px;text-align:center;">${getIcon('qr-code', 16)} Click to scan QR/Barcode</div>`;
        case 'cascade':
            return `<div style="background:#e8f4fc;padding:10px;border-radius:6px;font-size:11px;">${getIcon('git-branch', 14)} Cascading: ${field.cascadeConfig?.levels?.join(' → ') || 'Not configured'}</div>`;
        case 'rating':
            return `<div style="font-size:20px;color:#ffc107;">${'★'.repeat(field.ratingMax || 5)}</div>`;
        case 'period':
            return `<input type="month" class="property-input" disabled>`;
        default:
            return `<input type="text" class="property-input" disabled>`;
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
        container.innerHTML = `
            <div class="no-selection">
                <p style="font-size:32px;margin-bottom:12px;">${getIcon('mouse-pointer-click', 32)}</p>
                <p>Select a field to edit</p>
            </div>
        `;
        return;
    }
    
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field) return;
    
    let html = `
        <div class="prop-section">
            <div class="prop-section-title">${getIcon('edit-3', 14)} Basic Settings</div>
            <div class="property-group">
                <label class="property-label">Label</label>
                <input type="text" class="property-input" value="${field.label}" onchange="updateFieldProp('label', this.value)">
            </div>
            <div class="property-group">
                <label class="property-label">Field Name (ID)</label>
                <input type="text" class="property-input" value="${field.name}" onchange="updateFieldProp('name', sanitizeForId(this.value))">
            </div>
            ${field.type !== 'section' ? `
                <div class="property-group">
                    <label class="property-label">Placeholder</label>
                    <input type="text" class="property-input" value="${field.placeholder || ''}" onchange="updateFieldProp('placeholder', this.value)">
                </div>
                <div class="property-group">
                    <label class="property-label">Help Text</label>
                    <input type="text" class="property-input" value="${field.helpText || ''}" onchange="updateFieldProp('helpText', this.value)">
                </div>
                <label class="property-checkbox">
                    <input type="checkbox" ${field.required ? 'checked' : ''} onchange="updateFieldProp('required', this.checked)">
                    Required field
                </label>
            ` : ''}
        </div>
    `;
    
    // Options for select/radio/checkbox
    if (['select', 'radio', 'checkbox'].includes(field.type)) {
        html += renderOptionsEditor(field);
    }
    
    // Rating settings
    if (field.type === 'rating') {
        html += `
            <div class="prop-section">
                <div class="prop-section-title">${getIcon('star', 14)} Rating Settings</div>
                <div class="property-group">
                    <label class="property-label">Max Stars</label>
                    <select class="property-select" onchange="updateFieldProp('ratingMax', parseInt(this.value))">
                        ${[3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option value="${n}" ${field.ratingMax === n ? 'selected' : ''}>${n} stars</option>`).join('')}
                    </select>
                </div>
            </div>
        `;
    }
    
    // Calculation settings
    if (field.type === 'calculation') {
        html += renderCalculationEditor(field);
    }
    
    // Cascade settings
    if (field.type === 'cascade') {
        html += renderCascadeEditor(field);
    }
    
    // Validation for numeric fields
    if (['number', 'text'].includes(field.type)) {
        html += renderValidationEditor(field);
    }
    
    // Logic rules
    if (field.type !== 'section') {
        html += renderLogicEditor(field);
    }
    
    // DHIS2 settings
    if (field.type !== 'section') {
        html += renderDhis2Settings(field);
    }
    
    container.innerHTML = html;
    initializeIcons();
}

function renderOptionsEditor(field) {
    return `
        <div class="prop-section">
            <div class="prop-section-title">${getIcon('list', 14)} Options</div>
            <div id="optionsList">
                ${field.options.map((opt, i) => `
                    <div style="display:flex;gap:6px;margin-bottom:6px;">
                        <input type="text" class="property-input" value="${opt}" 
                               onchange="updateOption(${i}, this.value)" style="flex:1;">
                        <button class="field-action-btn delete" onclick="removeOption(${i})">${getIcon('x', 12)}</button>
                    </div>
                `).join('')}
            </div>
            <button class="logic-add-btn" onclick="addOption()">${getIcon('plus', 12)} Add Option</button>
        </div>
    `;
}

function renderCalculationEditor(field) {
    const numericFields = state.fields.filter(f => f.type === 'number' && f.id !== field.id);
    
    return `
        <div class="prop-section">
            <div class="prop-section-title">${getIcon('calculator', 14)} Calculation Formula</div>
            <div class="property-group">
                <label class="property-label">Formula</label>
                <input type="text" class="property-input" id="calcFormula" 
                       value="${field.calculationFormula || ''}" 
                       onchange="updateFieldProp('calculationFormula', this.value)"
                       placeholder="e.g., {field1} + {field2}">
                <p class="help-text">Use {field_name} to reference other fields</p>
            </div>
            <div style="margin-top:10px;">
                <label class="property-label">Insert Field</label>
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;">
                    ${numericFields.map(f => `
                        <button class="calc-num-btn" onclick="insertCalcField('${f.name}')">{${f.name}}</button>
                    `).join('') || '<span style="font-size:11px;color:#666;">No numeric fields available</span>'}
                </div>
            </div>
            <div style="margin-top:10px;">
                <label class="property-label">Operators</label>
                <div style="display:flex;gap:6px;margin-top:6px;">
                    <button class="calc-op-btn" onclick="insertCalcOp('+')">+</button>
                    <button class="calc-op-btn" onclick="insertCalcOp('-')">−</button>
                    <button class="calc-op-btn" onclick="insertCalcOp('*')">×</button>
                    <button class="calc-op-btn" onclick="insertCalcOp('/')">÷</button>
                    <button class="calc-op-btn" onclick="insertCalcOp('(')">(</button>
                    <button class="calc-op-btn" onclick="insertCalcOp(')')">)</button>
                </div>
            </div>
        </div>
    `;
}

function insertCalcField(fieldName) {
    const input = document.getElementById('calcFormula');
    const cursorPos = input.selectionStart;
    const before = input.value.substring(0, cursorPos);
    const after = input.value.substring(cursorPos);
    input.value = before + '{' + fieldName + '}' + after;
    updateFieldProp('calculationFormula', input.value);
    input.focus();
}

function insertCalcOp(op) {
    const input = document.getElementById('calcFormula');
    const cursorPos = input.selectionStart;
    const before = input.value.substring(0, cursorPos);
    const after = input.value.substring(cursorPos);
    input.value = before + ' ' + op + ' ' + after;
    updateFieldProp('calculationFormula', input.value);
    input.focus();
}

function renderCascadeEditor(field) {
    const config = field.cascadeConfig || { levels: ['Level 1', 'Level 2'], data: {} };
    
    return `
        <div class="prop-section">
            <div class="prop-section-title">${getIcon('git-branch', 14)} Cascade Configuration</div>
            <div class="property-group">
                <label class="property-label">Level Names</label>
                ${config.levels.map((level, i) => `
                    <div style="display:flex;gap:6px;margin-bottom:6px;">
                        <input type="text" class="property-input" value="${level}" 
                               onchange="updateCascadeLevel(${i}, this.value)" style="flex:1;"
                               placeholder="Level ${i + 1} name">
                        ${config.levels.length > 2 ? `<button class="field-action-btn delete" onclick="removeCascadeLevel(${i})">${getIcon('x', 12)}</button>` : ''}
                    </div>
                `).join('')}
                <button class="logic-add-btn" onclick="addCascadeLevel()">${getIcon('plus', 12)} Add Level</button>
            </div>
            <div class="property-group" style="margin-top:15px;">
                <label class="property-label">Data Source</label>
                <p class="help-text">Upload CSV with columns: ${config.levels.join(', ')}</p>
                <input type="file" accept=".csv,.xlsx" onchange="loadCascadeData(this.files[0])" style="margin-top:8px;">
            </div>
            <div id="cascadePreview" style="margin-top:10px;font-size:11px;color:#666;">
                ${Object.keys(config.data || {}).length > 0 ? `✓ ${Object.keys(config.data).length} top-level items loaded` : 'No data loaded'}
            </div>
        </div>
    `;
}

function updateCascadeLevel(index, value) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.cascadeConfig) {
        field.cascadeConfig.levels[index] = value;
        renderFields();
    }
}

function addCascadeLevel() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.cascadeConfig) {
        field.cascadeConfig.levels.push('Level ' + (field.cascadeConfig.levels.length + 1));
        renderProperties();
    }
}

function removeCascadeLevel(index) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.cascadeConfig && field.cascadeConfig.levels.length > 2) {
        field.cascadeConfig.levels.splice(index, 1);
        renderProperties();
    }
}

async function loadCascadeData(file) {
    if (!file) return;
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field || !field.cascadeConfig) return;
    
    try {
        let data;
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            data = XLSX.utils.sheet_to_json(sheet);
        } else {
            const text = await file.text();
            data = parseCSV(text);
        }
        
        const cascadeData = buildCascadeTree(data, field.cascadeConfig.levels);
        field.cascadeConfig.data = cascadeData;
        
        document.getElementById('cascadePreview').innerHTML = `✓ ${Object.keys(cascadeData).length} top-level items loaded`;
        showNotification('Cascade data loaded successfully!');
    } catch (err) {
        showNotification('Failed to load cascade data: ' + err.message, 'error');
    }
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((h, i) => obj[h] = values[i] || '');
        return obj;
    });
}

function buildCascadeTree(data, levels) {
    const tree = {};
    
    data.forEach(row => {
        let current = tree;
        levels.forEach((level, i) => {
            const value = row[level] || '';
            if (!value) return;
            
            if (i === levels.length - 1) {
                if (!current[value]) current[value] = {};
            } else {
                if (!current[value]) current[value] = {};
                current = current[value];
            }
        });
    });
    
    return tree;
}

// ============================================
// VALIDATION EDITOR
// ============================================

function renderValidationEditor(field) {
    const rules = field.validation || [];
    
    return `
        <div class="prop-section">
            <div class="prop-section-title">${getIcon('check-circle', 14)} Validation Rules</div>
            <div id="validationRules">
                ${rules.map((rule, i) => renderValidationRule(rule, i, field)).join('')}
            </div>
            <button class="logic-add-btn" onclick="addValidationRule()">${getIcon('plus', 12)} Add Rule</button>
        </div>
    `;
}

function renderValidationRule(rule, index, field) {
    const numericFields = state.fields.filter(f => f.type === 'number' && f.id !== field.id);
    const isFieldCompare = rule.compareType === 'field';
    
    return `
        <div class="validation-rule">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <span style="font-size:10px;font-weight:700;color:#856404;">Rule ${index + 1}</span>
                <button class="logic-rule-delete" onclick="removeValidationRule(${index})">${getIcon('x', 12)}</button>
            </div>
            <div class="logic-rule-row">
                <select class="logic-select" onchange="updateValidationRule(${index}, 'operator', this.value)">
                    <option value=">" ${rule.operator === '>' ? 'selected' : ''}>Greater than (>)</option>
                    <option value=">=" ${rule.operator === '>=' ? 'selected' : ''}>Greater or equal (>=)</option>
                    <option value="<" ${rule.operator === '<' ? 'selected' : ''}>Less than (<)</option>
                    <option value="<=" ${rule.operator === '<=' ? 'selected' : ''}>Less or equal (<=)</option>
                    <option value="=" ${rule.operator === '=' ? 'selected' : ''}>Equal to (=)</option>
                    <option value="!=" ${rule.operator === '!=' ? 'selected' : ''}>Not equal (!=)</option>
                    <option value="between" ${rule.operator === 'between' ? 'selected' : ''}>Between</option>
                </select>
                ${rule.operator !== 'between' ? `
                    <select class="logic-select" onchange="updateValidationRule(${index}, 'compareType', this.value)" style="width:80px;">
                        <option value="value" ${!isFieldCompare ? 'selected' : ''}>Value</option>
                        <option value="field" ${isFieldCompare ? 'selected' : ''}>Field</option>
                    </select>
                    ${isFieldCompare ? `
                        <select class="logic-select" onchange="updateValidationRule(${index}, 'compareField', this.value)" style="flex:1;">
                            <option value="">-- Select field --</option>
                            ${numericFields.map(f => `<option value="${f.name}" ${rule.compareField === f.name ? 'selected' : ''}>${f.label}</option>`).join('')}
                        </select>
                    ` : `
                        <input type="number" class="logic-input" value="${rule.value || ''}" 
                               onchange="updateValidationRule(${index}, 'value', this.value)" placeholder="Value">
                    `}
                ` : `
                    <input type="number" class="logic-input" value="${rule.min || ''}" 
                           onchange="updateValidationRule(${index}, 'min', this.value)" placeholder="Min">
                    <span style="font-size:11px;">and</span>
                    <input type="number" class="logic-input" value="${rule.max || ''}" 
                           onchange="updateValidationRule(${index}, 'max', this.value)" placeholder="Max">
                `}
            </div>
            <div class="validation-msg">
                <input type="text" class="property-input" value="${rule.message || ''}" 
                       onchange="updateValidationRule(${index}, 'message', this.value)" 
                       placeholder="Custom error message (optional)">
            </div>
        </div>
    `;
}

function addValidationRule() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field) return;
    
    if (!field.validation) field.validation = [];
    field.validation.push({ operator: '>=', compareType: 'value', value: 0 });
    renderProperties();
}

function removeValidationRule(index) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.validation) {
        field.validation.splice(index, 1);
        renderProperties();
    }
}

function updateValidationRule(index, prop, value) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.validation && field.validation[index]) {
        field.validation[index][prop] = value;
        
        // Reset when switching compare type
        if (prop === 'compareType') {
            if (value === 'field') {
                delete field.validation[index].value;
            } else {
                delete field.validation[index].compareField;
            }
        }
        
        // Reset to value mode for 'between' operator
        if (prop === 'operator' && value === 'between') {
            field.validation[index].compareType = 'value';
            delete field.validation[index].compareField;
        }
        
        renderProperties();
    }
}

function validateField(field, value, formData = {}) {
    if (!field.validation || field.validation.length === 0) return { valid: true };
    if (value === '' || value === null || value === undefined) return { valid: true };
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return { valid: true };
    
    for (const rule of field.validation) {
        let compareValue;
        let compareLabel = '';
        
        if (rule.compareType === 'field' && rule.compareField) {
            const compareFieldValue = formData[rule.compareField];
            if (compareFieldValue === '' || compareFieldValue === null || compareFieldValue === undefined) {
                continue; // Skip if comparison field is empty
            }
            compareValue = parseFloat(compareFieldValue);
            if (isNaN(compareValue)) continue;
            
            // Find the label for the comparison field
            const compareFieldObj = state.fields.find(f => f.name === rule.compareField);
            compareLabel = compareFieldObj ? compareFieldObj.label : rule.compareField;
        } else {
            compareValue = parseFloat(rule.value);
        }
        
        let valid = true;
        let defaultMessage = '';
        
        switch (rule.operator) {
            case '>':
                valid = numValue > compareValue;
                defaultMessage = rule.compareType === 'field' 
                    ? `Value must be > ${compareLabel}` 
                    : `Value must be > ${compareValue}`;
                break;
            case '>=':
                valid = numValue >= compareValue;
                defaultMessage = rule.compareType === 'field'
                    ? `Value must be >= ${compareLabel}`
                    : `Value must be >= ${compareValue}`;
                break;
            case '<':
                valid = numValue < compareValue;
                defaultMessage = rule.compareType === 'field'
                    ? `Value must be < ${compareLabel}`
                    : `Value must be < ${compareValue}`;
                break;
            case '<=':
                valid = numValue <= compareValue;
                defaultMessage = rule.compareType === 'field'
                    ? `Value must be <= ${compareLabel}`
                    : `Value must be <= ${compareValue}`;
                break;
            case '=':
                valid = numValue === compareValue;
                defaultMessage = rule.compareType === 'field'
                    ? `Value must equal ${compareLabel}`
                    : `Value must equal ${compareValue}`;
                break;
            case '!=':
                valid = numValue !== compareValue;
                defaultMessage = rule.compareType === 'field'
                    ? `Value must not equal ${compareLabel}`
                    : `Value must not equal ${compareValue}`;
                break;
            case 'between':
                const min = parseFloat(rule.min);
                const max = parseFloat(rule.max);
                valid = numValue >= min && numValue <= max;
                defaultMessage = `Value must be between ${min} and ${max}`;
                break;
        }
        
        if (!valid) {
            return { valid: false, message: rule.message || defaultMessage };
        }
    }
    
    return { valid: true };
}

// ============================================
// LOGIC RULES EDITOR
// ============================================

function renderLogicEditor(field) {
    const rules = field.logic || [];
    const otherFields = state.fields.filter(f => f.id !== field.id && f.type !== 'section');
    
    return `
        <div class="prop-section">
            <div class="prop-section-title">${getIcon('git-branch', 14)} Show/Hide Logic</div>
            <div id="logicRules">
                ${rules.map((rule, i) => renderLogicRule(rule, i, otherFields)).join('')}
            </div>
            <button class="logic-add-btn" onclick="addLogicRule()">${getIcon('plus', 12)} Add Rule</button>
        </div>
    `;
}

function renderLogicRule(rule, index, otherFields) {
    return `
        <div class="logic-rule ${rule.action}">
            <div class="logic-rule-header">
                <span class="logic-rule-type ${rule.action}">${rule.action === 'show' ? 'SHOW' : 'HIDE'} this field</span>
                <button class="logic-rule-delete" onclick="removeLogicRule(${index})">${getIcon('x', 12)}</button>
            </div>
            ${rule.conditions.map((cond, ci) => `
                ${ci > 0 ? `<div style="text-align:center;"><span class="logic-connector">${rule.connector || 'AND'}</span></div>` : ''}
                <div class="logic-rule-row">
                    <span style="font-size:10px;font-weight:600;">When</span>
                    <select class="logic-select" onchange="updateLogicCondition(${index}, ${ci}, 'field', this.value)">
                        <option value="">-- Select field --</option>
                        ${otherFields.map(f => `<option value="${f.name}" ${cond.field === f.name ? 'selected' : ''}>${f.label}</option>`).join('')}
                    </select>
                    <select class="logic-select" onchange="updateLogicCondition(${index}, ${ci}, 'operator', this.value)">
                        <option value="=" ${cond.operator === '=' ? 'selected' : ''}>equals</option>
                        <option value="!=" ${cond.operator === '!=' ? 'selected' : ''}>not equals</option>
                        <option value="contains" ${cond.operator === 'contains' ? 'selected' : ''}>contains</option>
                        <option value=">" ${cond.operator === '>' ? 'selected' : ''}>greater than</option>
                        <option value="<" ${cond.operator === '<' ? 'selected' : ''}>less than</option>
                        <option value="empty" ${cond.operator === 'empty' ? 'selected' : ''}>is empty</option>
                        <option value="notEmpty" ${cond.operator === 'notEmpty' ? 'selected' : ''}>is not empty</option>
                    </select>
                    ${!['empty', 'notEmpty'].includes(cond.operator) ? `
                        <input type="text" class="logic-input" value="${cond.value || ''}" 
                               onchange="updateLogicCondition(${index}, ${ci}, 'value', this.value)" 
                               placeholder="Value" style="width:80px;">
                    ` : ''}
                    ${rule.conditions.length > 1 ? `
                        <button class="logic-rule-delete" onclick="removeLogicCondition(${index}, ${ci})">${getIcon('x', 10)}</button>
                    ` : ''}
                </div>
            `).join('')}
            <div style="display:flex;gap:8px;margin-top:8px;">
                <button class="logic-add-condition" onclick="addLogicCondition(${index})">${getIcon('plus', 10)} Add Condition</button>
                <select class="logic-select" onchange="updateLogicRule(${index}, 'connector', this.value)" style="font-size:9px;">
                    <option value="AND" ${rule.connector === 'AND' ? 'selected' : ''}>AND</option>
                    <option value="OR" ${rule.connector === 'OR' ? 'selected' : ''}>OR</option>
                </select>
                <select class="logic-select" onchange="updateLogicRule(${index}, 'action', this.value)" style="font-size:9px;">
                    <option value="show" ${rule.action === 'show' ? 'selected' : ''}>Show</option>
                    <option value="hide" ${rule.action === 'hide' ? 'selected' : ''}>Hide</option>
                </select>
            </div>
        </div>
    `;
}

function addLogicRule() {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (!field) return;
    
    if (!field.logic) field.logic = [];
    field.logic.push({
        action: 'show',
        connector: 'AND',
        conditions: [{ field: '', operator: '=', value: '' }]
    });
    renderProperties();
}

function removeLogicRule(index) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.logic) {
        field.logic.splice(index, 1);
        renderProperties();
    }
}

function updateLogicRule(ruleIndex, prop, value) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.logic && field.logic[ruleIndex]) {
        field.logic[ruleIndex][prop] = value;
        renderProperties();
    }
}

function addLogicCondition(ruleIndex) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.logic && field.logic[ruleIndex]) {
        field.logic[ruleIndex].conditions.push({ field: '', operator: '=', value: '' });
        renderProperties();
    }
}

function removeLogicCondition(ruleIndex, condIndex) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.logic && field.logic[ruleIndex] && field.logic[ruleIndex].conditions.length > 1) {
        field.logic[ruleIndex].conditions.splice(condIndex, 1);
        renderProperties();
    }
}

function updateLogicCondition(ruleIndex, condIndex, prop, value) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.logic && field.logic[ruleIndex] && field.logic[ruleIndex].conditions[condIndex]) {
        field.logic[ruleIndex].conditions[condIndex][prop] = value;
    }
}

// ============================================
// DHIS2 FIELD SETTINGS
// ============================================

function renderDhis2Settings(field) {
    return `
        <div class="prop-section" style="background:#e8f4fc;border-color:#17a2b8;">
            <div class="prop-section-title" style="color:#17a2b8;">${getIcon('link', 14)} DHIS2 Mapping</div>
            <label class="property-checkbox">
                <input type="checkbox" ${field.dhis2?.enabled ? 'checked' : ''} 
                       onchange="updateDhis2Prop('enabled', this.checked)">
                Map to DHIS2 Data Element
            </label>
            ${field.dhis2?.enabled ? `
                <div class="property-group" style="margin-top:10px;">
                    <label class="property-label">Data Element ID</label>
                    <input type="text" class="property-input" value="${field.dhis2?.dataElementId || ''}" 
                           onchange="updateDhis2Prop('dataElementId', this.value)"
                           placeholder="Leave empty for auto-generation">
                </div>
                <label class="property-checkbox">
                    <input type="checkbox" ${field.dhis2?.isAggregate ? 'checked' : ''} 
                           onchange="updateDhis2Prop('isAggregate', this.checked)">
                    Aggregate Field (sum values)
                </label>
                ${field.dhis2?.isAggregate ? `
                    <div class="property-group">
                        <label class="property-label">Aggregation Type</label>
                        <select class="property-select" onchange="updateDhis2Prop('aggregationType', this.value)">
                            <option value="SUM" ${field.dhis2?.aggregationType === 'SUM' ? 'selected' : ''}>Sum</option>
                            <option value="COUNT" ${field.dhis2?.aggregationType === 'COUNT' ? 'selected' : ''}>Count</option>
                            <option value="AVERAGE" ${field.dhis2?.aggregationType === 'AVERAGE' ? 'selected' : ''}>Average</option>
                            <option value="MIN" ${field.dhis2?.aggregationType === 'MIN' ? 'selected' : ''}>Minimum</option>
                            <option value="MAX" ${field.dhis2?.aggregationType === 'MAX' ? 'selected' : ''}>Maximum</option>
                        </select>
                    </div>
                ` : ''}
            ` : ''}
        </div>
    `;
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
// FIELD PROPERTY UPDATES
// ============================================

function updateFieldProp(prop, value) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field) {
        field[prop] = value;
        if (prop === 'label') {
            document.getElementById('previewTitle').textContent = document.getElementById('formTitle').value;
        }
        renderFields();
    }
}

function updateOption(index, value) {
    const field = state.fields.find(f => f.id === state.selectedFieldId);
    if (field && field.options) {
        field.options[index] = value;
    }
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

// ============================================
// DHIS2 CONFIGURATION
// ============================================

function openDhis2Config() {
    document.getElementById('dhis2Modal').classList.add('show');
    populateDhis2FieldSelectors();
    
    // Load saved config
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
    
    const options = state.fields
        .filter(f => f.type !== 'section')
        .map(f => `<option value="${f.name}">${f.label}</option>`)
        .join('');
    
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
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password)
            }
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
    if (!state.dhis2Config || !state.dhis2Config.url) {
        showNotification('Please configure and save DHIS2 settings first', 'error');
        return;
    }
    
    const url = state.dhis2Config.url;
    const auth = 'Basic ' + btoa(state.dhis2Config.username + ':' + state.dhis2Config.password);
    const formTitle = document.getElementById('formTitle').value || 'ICF Form';
    
    addSyncLog('Starting DHIS2 setup...', 'info');
    
    try {
        // Get data elements to create
        const dataElements = state.fields
            .filter(f => f.type !== 'section' && f.dhis2?.enabled)
            .map(f => ({
                name: f.label.substring(0, 230),
                shortName: f.name.substring(0, 50),
                code: f.name.toUpperCase(),
                valueType: getDhis2ValueType(f.type),
                domainType: 'AGGREGATE',
                aggregationType: f.dhis2?.aggregationType || 'SUM'
            }));
        
        if (dataElements.length === 0) {
            showNotification('No fields mapped to DHIS2. Enable DHIS2 mapping for fields first.', 'warning');
            return;
        }
        
        addSyncLog('Creating ' + dataElements.length + ' data elements...', 'info');
        
        // Create data elements
        for (const de of dataElements) {
            const response = await fetch(url + '/api/dataElements', {
                method: 'POST',
                headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
                body: JSON.stringify(de)
            });
            
            if (response.ok) {
                const result = await response.json();
                const field = state.fields.find(f => f.name.toUpperCase() === de.code);
                if (field) field.dhis2.dataElementId = result.response?.uid;
                addSyncLog('Created: ' + de.name, 'success');
            } else {
                const err = await response.text();
                addSyncLog('Failed to create ' + de.name + ': ' + err, 'error');
            }
        }
        
        // Create dataset if aggregate mode
        if (state.dhis2Config.syncMode === 'aggregate') {
            addSyncLog('Creating dataset...', 'info');
            
            const dataset = {
                name: formTitle,
                shortName: formTitle.substring(0, 50),
                periodType: state.dhis2Config.periodType || 'Monthly',
                dataSetElements: state.fields
                    .filter(f => f.dhis2?.dataElementId)
                    .map(f => ({ dataElement: { id: f.dhis2.dataElementId } }))
            };
            
            const dsResponse = await fetch(url + '/api/dataSets', {
                method: 'POST',
                headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
                body: JSON.stringify(dataset)
            });
            
            if (dsResponse.ok) {
                const result = await dsResponse.json();
                state.dhis2Config.datasetId = result.response?.uid;
                addSyncLog('Dataset created: ' + state.dhis2Config.datasetId, 'success');
            }
        }
        
        addSyncLog('DHIS2 setup completed!', 'success');
        showNotification('DHIS2 setup completed!');
        
    } catch (err) {
        addSyncLog('Setup failed: ' + err.message, 'error');
        showNotification('Setup failed: ' + err.message, 'error');
    }
}

function getDhis2ValueType(fieldType) {
    const typeMap = {
        'text': 'TEXT',
        'number': 'NUMBER',
        'calculation': 'NUMBER',
        'date': 'DATE',
        'time': 'TIME',
        'email': 'EMAIL',
        'phone': 'PHONE_NUMBER',
        'textarea': 'LONG_TEXT',
        'select': 'TEXT',
        'radio': 'TEXT',
        'checkbox': 'TEXT',
        'yesno': 'BOOLEAN',
        'gps': 'COORDINATE',
        'rating': 'INTEGER',
        'period': 'TEXT'
    };
    return typeMap[fieldType] || 'TEXT';
}

async function syncCaseBased() {
    showNotification('Case-based sync - Feature in development', 'info');
    addSyncLog('Case-based sync not yet implemented', 'warning');
}

async function syncAggregate() {
    showNotification('Aggregate sync - Feature in development', 'info');
    addSyncLog('Aggregate sync not yet implemented', 'warning');
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

function renderFormViewer() {
    const container = document.getElementById('viewerContainer');
    const formTitle = document.getElementById('formTitle').value || 'Data Collection Form';
    
    // Split fields into pages by sections
    const pages = [];
    let currentPage = { title: 'Page 1', fields: [] };
    
    state.fields.forEach(field => {
        if (field.type === 'section') {
            if (currentPage.fields.length > 0) {
                pages.push(currentPage);
            }
            currentPage = { title: field.label, fields: [] };
        } else {
            currentPage.fields.push(field);
        }
    });
    
    if (currentPage.fields.length > 0) {
        pages.push(currentPage);
    }
    
    state.totalPages = pages.length;
    state.currentPage = 0;
    
    let html = `
        <div class="viewer-nav">
            <button class="viewer-back-btn" onclick="exitViewer()">${getIcon('arrow-left', 14)} Exit Preview</button>
            <button class="viewer-nav-btn active" style="background:#004080;color:white;" onclick="showViewerTab('form')">${getIcon('edit-3', 14)} Form</button>
            <button class="viewer-nav-btn" style="background:#28a745;color:white;" onclick="showViewerTab('data')">${getIcon('database', 14)} Data</button>
            <button class="viewer-nav-btn" style="background:#17a2b8;color:white;" onclick="showViewerTab('dashboard')">${getIcon('pie-chart', 14)} Dashboard</button>
            <div class="connection-status ${navigator.onLine ? 'online' : 'offline'}">
                ${navigator.onLine ? getIcon('wifi', 12) + ' Online' : getIcon('wifi-off', 12) + ' Offline'}
            </div>
        </div>
        
        <div class="viewer-tab active" id="formTab">
            <div class="viewer-form">
                <div class="viewer-form-box">
                    <div class="viewer-header">
                        <img src="https://github.com/mohamedsillahkanu/gdp-dashboard-2/raw/6c7463b0d5c3be150aafae695a4bcbbd8aeb1499/ICF-SL.jpg">
                        <h1>${formTitle}</h1>
                        <p>ICF-SL Data Collection System</p>
                    </div>
                    <div class="viewer-body">
                        <form id="dataEntryForm" onsubmit="return submitForm(event)">
                            ${pages.length > 1 ? `
                                <div class="page-header">
                                    <span class="page-indicator">Page <span id="currentPageNum">1</span> of ${pages.length}</span>
                                    <h3 class="page-title" id="pageTitle">${pages[0].title}</h3>
                                </div>
                            ` : ''}
                            
                            ${pages.map((page, pageIndex) => `
                                <div class="form-page" id="page-${pageIndex}" style="${pageIndex > 0 ? 'display:none;' : ''}">
                                    ${page.fields.map(field => renderViewerField(field)).join('')}
                                </div>
                            `).join('')}
                            
                            <div class="page-navigation">
                                ${pages.length > 1 ? `
                                    <button type="button" class="nav-btn back-btn" id="prevBtn" onclick="prevPage()" style="visibility:hidden;">
                                        ${getIcon('arrow-left', 14)} Previous
                                    </button>
                                    <button type="button" class="nav-btn next-btn" id="nextBtn" onclick="nextPage()">
                                        Next ${getIcon('arrow-right', 14)}
                                    </button>
                                ` : ''}
                                <button type="submit" class="nav-btn submit-btn" id="submitBtn" ${pages.length > 1 ? 'style="display:none;"' : ''}>
                                    ${getIcon('send', 14)} Submit
                                </button>
                            </div>
                        </form>
                        
                        <div class="draft-actions-bar">
                            <button type="button" class="draft-save-btn" onclick="saveDraft()">
                                ${getIcon('save', 14)} Save Draft
                            </button>
                            <button type="button" class="draft-toggle-btn" onclick="toggleDraftsPanel()">
                                ${getIcon('folder', 14)} My Drafts
                            </button>
                        </div>
                        <div class="drafts-panel-wrapper" id="draftsPanel" style="display:none;">
                            <div class="drafts-panel-header">
                                <span>${getIcon('folder', 14)} Saved Drafts</span>
                                <button onclick="toggleDraftsPanel()" style="background:none;border:none;color:white;cursor:pointer;">${getIcon('x', 14)}</button>
                            </div>
                            <div class="drafts-list" id="draftsList"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="viewer-tab" id="dataTab">
            ${renderDataTab()}
        </div>
        
        <div class="viewer-tab" id="dashboardTab">
            ${renderDashboardTab()}
        </div>
    `;
    
    container.innerHTML = html;
    initializeIcons();
    loadDrafts();
    loadSubmittedData();
    
    // Apply form logic
    setTimeout(() => applyFormLogic(), 100);
}

function renderViewerField(field) {
    const required = field.required ? '<span style="color:#dc3545;">*</span>' : '';
    const helpText = field.helpText ? `<p style="font-size:10px;color:#666;margin-top:4px;">${field.helpText}</p>` : '';
    
    let inputHtml = '';
    
    switch (field.type) {
        case 'text':
            inputHtml = `<input type="text" class="viewer-input" name="${field.name}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>`;
            break;
        case 'number':
            inputHtml = `<input type="number" class="viewer-input" name="${field.name}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} step="any">`;
            break;
        case 'calculation':
            inputHtml = `<input type="text" class="viewer-input" name="${field.name}" readonly style="background:#fff3cd;" data-formula="${field.calculationFormula || ''}">`;
            break;
        case 'date':
            inputHtml = `<input type="date" class="viewer-input" name="${field.name}" ${field.required ? 'required' : ''}>`;
            break;
        case 'time':
            inputHtml = `<input type="time" class="viewer-input" name="${field.name}" ${field.required ? 'required' : ''}>`;
            break;
        case 'email':
            inputHtml = `<input type="email" class="viewer-input" name="${field.name}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>`;
            break;
        case 'phone':
            inputHtml = `<input type="tel" class="viewer-input" name="${field.name}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>`;
            break;
        case 'textarea':
            inputHtml = `<textarea class="viewer-input" name="${field.name}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} rows="4"></textarea>`;
            break;
        case 'select':
            inputHtml = `
                <select class="viewer-input" name="${field.name}" ${field.required ? 'required' : ''}>
                    <option value="">-- Select --</option>
                    ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                </select>
            `;
            break;
        case 'radio':
            inputHtml = `
                <div class="viewer-radio-group">
                    ${field.options.map(opt => `
                        <label class="viewer-radio-option">
                            <input type="radio" name="${field.name}" value="${opt}" ${field.required ? 'required' : ''}> ${opt}
                        </label>
                    `).join('')}
                </div>
            `;
            break;
        case 'checkbox':
            inputHtml = `
                <div class="viewer-radio-group">
                    ${field.options.map(opt => `
                        <label class="viewer-radio-option">
                            <input type="checkbox" name="${field.name}" value="${opt}"> ${opt}
                        </label>
                    `).join('')}
                </div>
            `;
            break;
        case 'yesno':
            inputHtml = `
                <div class="viewer-radio-group" style="flex-direction:row;">
                    <label class="viewer-radio-option" style="flex:1;">
                        <input type="radio" name="${field.name}" value="Yes" ${field.required ? 'required' : ''}> Yes
                    </label>
                    <label class="viewer-radio-option" style="flex:1;">
                        <input type="radio" name="${field.name}" value="No"> No
                    </label>
                </div>
            `;
            break;
        case 'gps':
            inputHtml = `
                <div style="display:flex;gap:8px;">
                    <input type="text" class="viewer-input" name="${field.name}" readonly placeholder="Click to capture GPS" style="flex:1;">
                    <button type="button" class="modal-btn primary" onclick="captureGPS('${field.name}')" style="padding:10px 16px;">
                        ${getIcon('crosshair', 14)}
                    </button>
                </div>
            `;
            break;
        case 'qrcode':
            inputHtml = `
                <div style="display:flex;gap:8px;">
                    <input type="text" class="viewer-input" name="${field.name}" placeholder="Scan or enter code" style="flex:1;">
                    <button type="button" class="modal-btn" style="padding:10px 16px;background:#6c757d;color:white;" onclick="showNotification('QR scanner requires camera access', 'info')">
                        ${getIcon('qr-code', 14)}
                    </button>
                </div>
            `;
            break;
        case 'cascade':
            inputHtml = renderCascadeField(field);
            break;
        case 'rating':
            inputHtml = `
                <div class="rating-input" data-field="${field.name}">
                    <input type="hidden" name="${field.name}" value="">
                    ${Array(field.ratingMax || 5).fill(0).map((_, i) => `
                        <span class="rating-star" data-value="${i + 1}" onclick="setRating('${field.name}', ${i + 1})" 
                              style="font-size:28px;cursor:pointer;color:#ddd;">★</span>
                    `).join('')}
                </div>
            `;
            break;
        case 'period':
            inputHtml = `<input type="month" class="viewer-input" name="${field.name}" ${field.required ? 'required' : ''}>`;
            break;
        default:
            inputHtml = `<input type="text" class="viewer-input" name="${field.name}" placeholder="${field.placeholder || ''}">`;
    }
    
    return `
        <div class="viewer-field" id="field-${field.name}" data-field-id="${field.id}">
            <label class="viewer-field-label">${field.label} ${required}</label>
            ${inputHtml}
            ${helpText}
            <div class="field-error-msg" style="display:none;"></div>
        </div>
    `;
}

function renderCascadeField(field) {
    const config = field.cascadeConfig || { levels: ['Level 1', 'Level 2'], data: {} };
    
    return `
        <div class="cascade-container" data-field="${field.name}" data-config='${JSON.stringify(config)}'>
            ${config.levels.map((level, i) => `
                <div class="cascade-level">
                    <label class="cascade-label">${level}</label>
                    <select class="viewer-input cascade-select" name="${field.name}_${i}" 
                            data-level="${i}" ${i > 0 ? 'disabled' : ''} 
                            onchange="handleCascadeChange('${field.name}', ${i}, this.value)">
                        <option value="">-- Select ${level} --</option>
                        ${i === 0 ? Object.keys(config.data || {}).map(opt => `<option value="${opt}">${opt}</option>`).join('') : ''}
                    </select>
                </div>
            `).join('')}
            <input type="hidden" name="${field.name}" value="">
        </div>
    `;
}

function handleCascadeChange(fieldName, level, value) {
    const container = document.querySelector(`.cascade-container[data-field="${fieldName}"]`);
    const config = JSON.parse(container.dataset.config);
    const selects = container.querySelectorAll('.cascade-select');
    
    // Clear and disable subsequent levels
    for (let i = level + 1; i < selects.length; i++) {
        selects[i].innerHTML = `<option value="">-- Select ${config.levels[i]} --</option>`;
        selects[i].disabled = true;
        selects[i].value = '';
    }
    
    if (!value) return;
    
    // Get options for next level
    let data = config.data;
    for (let i = 0; i <= level; i++) {
        const selectedValue = selects[i].value;
        if (data[selectedValue]) {
            data = data[selectedValue];
        }
    }
    
    // Populate next level
    if (level + 1 < selects.length && typeof data === 'object') {
        const nextSelect = selects[level + 1];
        const options = Object.keys(data);
        nextSelect.innerHTML = `<option value="">-- Select ${config.levels[level + 1]} --</option>` +
            options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
        nextSelect.disabled = false;
    }
    
    // Update hidden field with full path
    const values = Array.from(selects).map(s => s.value).filter(v => v);
    container.querySelector('input[type="hidden"]').value = values.join(' > ');
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
            document.querySelector(`input[name="${fieldName}"]`).value = coords;
            showNotification('GPS captured: ' + coords);
        },
        (error) => {
            showNotification('GPS error: ' + error.message, 'error');
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

function setRating(fieldName, value) {
    const container = document.querySelector(`.rating-input[data-field="${fieldName}"]`);
    container.querySelector('input').value = value;
    
    container.querySelectorAll('.rating-star').forEach(star => {
        star.style.color = parseInt(star.dataset.value) <= value ? '#ffc107' : '#ddd';
    });
}
