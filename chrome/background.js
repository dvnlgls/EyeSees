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

function getSearchURL(domain, searchTerm, mode) {
    if (!searchTerm || !domain) return;

    let searchUrl = '';
    if (mode === 'advanced') {
        searchUrl = 'https://' + domain + '/search.php?keywords=' + searchTerm + '&terms=all&author=&sc=1&sf=all&sr=topics&sk=t&sd=d&st=0&ch=300&t=0&submit=Search';
    } else if (mode === 'normal') {
        searchUrl = 'https://' + domain + '/search.php?keywords=' + searchTerm + '&sf=titleonly';
    }

    return searchUrl;
}

// receives a message from the content page
function getSearchStrFromPage(msg) {
    console.log('msg from page', msg);
    searchStr = msg;
}


/*-------------------------------------------------------
 event listeners
-------------------------------------------------------*/
function sendMessageToTab(tabId, message) {
    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tabId, message, resolve)
    })
}
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    let mode = 'normal';

    (async () => {
        if (info.menuItemId === "one") {
            // await chrome.tabs.sendMessage(tab.id, { trigger: 'getSearchStr' });
            await sendMessageToTab(tab.id, { trigger: 'getSearchStr' })

            console.log('1st srch term', searchStr);

            if (searchStr.data.title.length <= 2) {
                // await chrome.tabs.sendMessage(tab.id, { trigger: 'getImdbId' });
                await sendMessageToTab(tab.id, { trigger: 'getImdbId'})

                searchStr = searchStr.data;

                console.log('2nd srch term', searchStr);

                mode = 'advanced';
            } else {
                // normal mode. i.e.: name is long enough to perform a normal search.
                const { title, year } = searchStr.data;
                if (title) {
                    searchStr = title.trim().replaceAll(' ', '+');
                }
                if (year) {
                    searchStr += '+' + year.trim();
                }
            }
        }
        else if (info.menuItemId === "two") {
            searchStr = getSelectedText(info);
        }

        if (searchStr !== '') {
            chrome.storage.local.get('site', (res) => {
                const url = getSearchURL(res.site, searchStr, mode);
                console.log('url', url);
                openUrlToTheRight(url, tab);
            })
        }
    })();
});

chrome.runtime.onMessage.addListener(getSearchStrFromPage);

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
