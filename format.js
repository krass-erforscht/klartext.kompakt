// Format für den heutigen Post: node format.js <ja|nein>
// Seit 2026-11-16 (Entscheidung des Nutzers, wie bei krass.erforscht): immer ein erzähltes Video mit Sprecherstimme als Reel im Feed.
// „nein“ heißt: es gibt kein passendes echtes Video – dann aus guten Fotos mit bilder-video.js oder clips.js ein Video bauen.
if (process.argv[2] !== 'ja') console.error('Kein echtes Video: aus Fotos mit bilder-video.js oder clips.js ein Video bauen, dann Format video.');
console.log('video');
