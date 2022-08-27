
function storeConfig() {
  const siteVal = document.querySelector("#site").value.trim();
  const storeSite = chrome.storage.local.set({ site: siteVal });
  storeSite.then();
}


function restoreConfig() {
  const storedSite = chrome.storage.local.get('site');
  storedSite.then((res) => {
    document.querySelector("#site").value = res.site || '';
  });
}

document.addEventListener('DOMContentLoaded', restoreConfig);
document.querySelector("form").addEventListener("submit", storeConfig);