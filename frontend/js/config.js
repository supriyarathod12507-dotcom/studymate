// StudyMate Frontend Config
// In production, set window.STUDYMATE_API_URL before this script, or edit below.
(function () {
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:';

  // Default: same origin (when backend serves frontend) or localhost for dev
  window.API_BASE =
    window.STUDYMATE_API_URL ||
    (isLocal ? 'http://localhost:5000/api' : '/api');
})();
