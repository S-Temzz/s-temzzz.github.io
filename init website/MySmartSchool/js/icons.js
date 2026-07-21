// Small inline-SVG icon set (feather-style outline icons) so the app never
// relies on emoji as functional icons.
const PATHS = {
  "book-open": '<path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"></path><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"></path>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="3"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
  clipboard: '<rect x="4" y="4" width="16" height="18" rx="2"></rect><path d="M9 3h6a1 1 0 0 1 1 1v2H8V4a1 1 0 0 1 1-1z"></path><line x1="8" y1="11" x2="16" y2="11"></line><line x1="8" y1="15" x2="16" y2="15"></line>',
  clock: '<circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 16 14"></polyline>',
  "graduation-cap": '<path d="M2 9 12 4l10 5-10 5-10-5z"></path><path d="M6 11.5V17c0 1.5 3 3 6 3s6-1.5 6-3v-5.5"></path><line x1="22" y1="9" x2="22" y2="15"></line>',
  layers: '<polygon points="12 3 2 9 12 15 22 9 12 3"></polygon><polyline points="2 14 12 20 22 14"></polyline>',
  code: '<polyline points="8 6 2 12 8 18"></polyline><polyline points="16 6 22 12 16 18"></polyline>',
  globe: '<circle cx="12" cy="12" r="9"></circle><line x1="3" y1="12" x2="21" y2="12"></line><path d="M12 3c2.5 2.7 4 6 4 9s-1.5 6.3-4 9c-2.5-2.7-4-6-4-9s1.5-6.3 4-9z"></path>',
  sparkles: '<path d="M12 3 13.5 8.5 19 10 13.5 11.5 12 17 10.5 11.5 5 10 10.5 8.5 12 3z"></path><path d="M19 3v3"></path><path d="M17.5 4.5h3"></path>',
  "message-circle": '<path d="M21 11.5a8.5 8.5 0 0 1-11.9 7.8L3 21l1.7-6.1A8.5 8.5 0 1 1 21 11.5z"></path>',
  heart: '<path d="M12 21s-7-4.4-9.7-8.9C.6 8.6 2 5 5.4 5 7.6 5 9.2 6.2 12 9c2.8-2.8 4.4-4 6.6-4 3.4 0 4.8 3.6 3.1 7.1C19 16.6 12 21 12 21z"></path>',
  newspaper: '<rect x="3" y="5" width="14" height="16" rx="2"></rect><line x1="7" y1="9" x2="13" y2="9"></line><line x1="7" y1="13" x2="13" y2="13"></line><line x1="7" y1="17" x2="10" y2="17"></line><path d="M17 8h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8"></path>',
  trophy: '<path d="M8 4h8v4a4 4 0 0 1-8 0V4z"></path><path d="M6 4H4a2 2 0 0 0 0 4h2M18 4h2a2 2 0 0 1 0 4h-2"></path><path d="M9 15h6l1 5H8l1-5z"></path><line x1="12" y1="12" x2="12" y2="15"></line>',
  menu: '<line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line>',
  x: '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
  "chevron-down": '<polyline points="6 9 12 15 18 9"></polyline>',
  check: '<polyline points="20 6 9 17 4 12"></polyline>',
  "trash-2": '<polyline points="3 6 5 6 21 6"></polyline><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>',
  send: '<line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"></rect><polyline points="2 6 12 13 22 6"></polyline>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path>',
  user: '<circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"></path>',
  "log-out": '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>',
  "arrow-left": '<line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>',
  "external-link": '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>',
  bookmark: '<path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"></path>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"></path><path d="M10 21a2 2 0 0 0 4 0"></path>',
};

export function iconMarkup(name) {
  const inner = PATHS[name] || PATHS["sparkles"];
  return `<svg class="icon" viewBox="0 0 24 24">${inner}</svg>`;
}

export function icon(name, className = "icon") {
  const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  el.setAttribute("viewBox", "0 0 24 24");
  el.setAttribute("class", className);
  el.innerHTML = PATHS[name] || PATHS["sparkles"];
  return el;
}
