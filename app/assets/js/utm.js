// Save UTM params on first page load
(function storeUTMParams() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('utm_source')) {
    localStorage.setItem('utm_source', urlParams.get('utm_source'));
    localStorage.setItem('utm_medium', urlParams.get('utm_medium'));
    localStorage.setItem('utm_campaign', urlParams.get('utm_campaign'));
  }
})();

document.addEventListener('contextmenu', function (event) {
  if (event.target && event.target.tagName === 'IMG') {
    event.preventDefault();
  }
});
