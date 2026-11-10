// One icon set for the build templates and the stay sheet. 24px grid, 1.5 stroke, currentColor.
const s=(d,extra='')=>`<svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
export const icons={
 massage:s('<path d="M3 17h18"/><path d="M5 17v3M19 17v3"/><path d="M6 13c2-2.5 5-3 8-2.5 2 .3 3.5 1 5 2.5"/><circle cx="6.5" cy="9.5" r="1.8"/><path d="M11 6.5c.8-1 .8-2 0-3M14.5 6.5c.8-1 .8-2 0-3"/>'),
 spa:s('<path d="M3 15c1.5 1.2 3 1.2 4.5 0s3-1.2 4.5 0 3 1.2 4.5 0 3-1.2 4.5 0"/><path d="M3 19c1.5 1.2 3 1.2 4.5 0s3-1.2 4.5 0 3 1.2 4.5 0 3-1.2 4.5 0"/><path d="M8 11c.9-1.2.9-2.4 0-3.6M12 11c.9-1.2.9-2.4 0-3.6M16 11c.9-1.2.9-2.4 0-3.6"/>'),
 floating:s('<path d="M3 14h18"/><path d="M6 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M5 18h14M9 21h6"/><circle cx="12" cy="5" r=".6" fill="currentColor"/>'),
 dinner:s('<path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10"/><path d="M17 3c-1.7 1.5-2.5 3.5-2.5 6 0 1.5.9 2.5 2.5 2.5V21"/>'),
 package:s('<path d="M4 9h16v11H4z"/><path d="M3 6h18v3H3zM12 6v14"/><path d="M12 6c-1.5-3-5-3-5-1s3.5 1 5 1zm0 0c1.5-3 5-3 5-1s-3.5 1-5 1z"/>'),
 bed:s('<path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6"/><path d="M3 15h18M3 18v2M21 18v2"/><path d="M6 10V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3"/>'),
 calendar:s('<rect x="4" y="5" width="16" height="15"/><path d="M4 10h16M8 3v4M16 3v4"/>'),
 guests:s('<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.5c1.8.9 3 2.9 3 5.5"/>'),
 moon:s('<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>'),
 plus:s('<path d="M12 5v14M5 12h14"/>'),minus:s('<path d="M5 12h14"/>'),
 close:s('<path d="M6 6l12 12M18 6L6 18"/>'),check:s('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
 arrow:s('<path d="M4 12h16M14 6l6 6-6 6"/>'),back:s('<path d="M20 12H4M10 6l-6 6 6 6"/>'),
 prev:s('<path d="M15 5l-7 7 7 7"/>'),next:s('<path d="M9 5l7 7-7 7"/>'),
 pin:s('<path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
 phone:s('<path d="M5 4h4l1.5 4.5-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2L20 15v4a1 1 0 0 1-1 1C10.7 20 4 13.3 4 5a1 1 0 0 1 1-1z"/>'),
 mail:s('<rect x="3" y="5" width="18" height="14"/><path d="M3 7l9 6 9-6"/>'),
 clock:s('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>')
};
