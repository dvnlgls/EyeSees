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

/*-------------------------------------------------------
 event listeners
-------------------------------------------------------*/
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    let mode = '';

    if (info.menuItemId === "one") {
        //imdb mode
        
        // callback hell can be avoided by delegating constructing the search term to the content
        // page but it's not done for 2 reasons: a) to maintain similarity with FF codebase. 
        // b) to preserve current single responsibility nature of the content page.
        // This whole nonsense could be avoided if Chrome manages to fix the promise bug for sendMessage :(
        
        chrome.tabs.sendMessage(tab.id, { data: 'getSearchTerm' }, (response) => {
            const obj = response.data;

            if (obj.title.length <= 2) {
                // search term less than 3 char long
                chrome.tabs.sendMessage(tab.id, { data: 'getImdbId' }, (response) => {
                    const id = response.data;
                    mode = 'advanced';
                    openUrl(id, mode, tab);
                });
            } else {
                let searchStr = '';
                mode = 'normal';

                const { title, year } = obj;
                if (title) {
                    searchStr = title.trim().replaceAll(' ', '+');
                }
                if (year) {
                    searchStr += '+' + year.trim();
                }
                openUrl(searchStr, mode, tab)
            }
        });
    }
    else if (info.menuItemId === "two") {
        // text selection mode
        let searchStr = getSelectedText(info);
        let mode = 'normal';
        openUrl(searchStr, mode, tab)
    }
});

function openUrl(searchStr, mode, tab) {
    chrome.storage.local.get('site', (res) => {
        if(!searchStr) return;

        const url = getSearchURL(res.site, searchStr, mode);
        openUrlToTheRight(url, tab);
    })
}

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
