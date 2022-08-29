
function storeConfig() {
  const siteVal = document.querySelector("#site").value.trim();
  chrome.storage.local.set({ site: siteVal });
}


function restoreConfig() {
  chrome.storage.local.get('site', (res) => {
    document.querySelector("#site").value = res.site || '';
  });
}

document.addEventListener('DOMContentLoaded', restoreConfig);
document.querySelector("form").addEventListener("submit", storeConfig);