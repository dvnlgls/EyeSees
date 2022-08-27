let searchStr = '';

/*-------------------------------------------------------
 methods
-------------------------------------------------------*/
function getSelectedText(event) {
    if (event.selectionText) {
        const searchStr = event.selectionText.trim().replaceAll(' ', '+');
        return searchStr;
    }
}

function openUrlToTheRight(url, currentTab) {
    const tabIndex = currentTab.index + 1;
    const createTab = chrome.tabs.create({
        url,
        active: false,
        index: tabIndex
    });
    createTab.then();
}

// receives a message (search string) from the content page
function setSearchStrFromPage(msg) {
    if (msg) {
        searchStr = msg.searchStr;
    } else searchStr = '';
}

// returns a promise
function getSiteFromConfig() {
    const storedSite = chrome.storage.local.get('site');
    return storedSite;
}

/*-------------------------------------------------------
 event listeners
-------------------------------------------------------*/
chrome.contextMenus.onClicked.addListener(async function (info, tab) {
    if (info.menuItemId === "one") {
        await chrome.tabs.sendMessage(tab.id, { trigger: 'getSearchStr' });
    }
    else if (info.menuItemId === "two") {
        searchStr = getSelectedText(info);
    }

    if (searchStr !== '') {
        getSiteFromConfig().then((res) => {
            const url = 'https://' + res.site + '/search.php?keywords=' + searchStr + '&sf=titleonly';
            openUrlToTheRight(url, tab);
        })
    }
});

chrome.runtime.onMessage.addListener(setSearchStrFromPage);

/*-------------------------------------------------------
 menus
-------------------------------------------------------*/
chrome.contextMenus.create({
    id: "one",
    title: "EyeSees - IMDb mode",
    documentUrlPatterns: ["*://*.imdb.com/title/*"],
    contexts: ["page"]
});

chrome.contextMenus.create({
    id: "two",
    title: "EyeSees",
    contexts: ["selection"]
});
