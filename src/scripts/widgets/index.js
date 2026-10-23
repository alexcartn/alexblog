/* Chaque widget n'est chargé que s'il est présent dans la page. */
const widgets = {
  '.wgt-wprime': () => import('./wprime.js'),
  '.wgt-respiration': () => import('./respiration.js'),
  '.wgt-pauses': () => import('./pauses.js'),
};
for (const [selector, load] of Object.entries(widgets)) {
  if (document.querySelector(selector)) load();
}
