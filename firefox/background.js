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
    const createTab = browser.tabs.create({
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
    const storedSite = browser.storage.local.get('site');
    return storedSite;
}

/*-------------------------------------------------------
 event listeners
-------------------------------------------------------*/
browser.menus.onClicked.addListener(async function (info, tab) {
    if (info.menuItemId === "one") {
        await browser.tabs.sendMessage(tab.id, { trigger: 'getSearchStr' });
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

browser.runtime.onMessage.addListener(setSearchStrFromPage);

/*-------------------------------------------------------
 menus
-------------------------------------------------------*/
browser.menus.create({
    id: "one",
    title: "EyeSees - IMDb mode",
    documentUrlPatterns: ["*://*.imdb.com/title/*"],
    contexts: ["page"]
});

browser.menus.create({
    id: "two",
    title: "EyeSees",
    contexts: ["selection"]
});
