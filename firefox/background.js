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

// receives a message from the content page
function getSearchStrFromPage(msg) {
    searchStr = msg;
}

// returns a promise
function getSiteFromConfig() {
    const storedSite = browser.storage.local.get('site');
    return storedSite;
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
browser.menus.onClicked.addListener(async function (info, tab) {
    let mode = 'normal';

    if (info.menuItemId === "one") {
        await browser.tabs.sendMessage(tab.id, { trigger: 'getSearchStr' });

        if (searchStr.data.title.length <= 2) {
            await browser.tabs.sendMessage(tab.id, { trigger: 'getImdbId' });
            searchStr = searchStr.data;
            mode = 'advanced';
        } else {
            // normal mode. i.e.: name is long enough to perform a normal search.
            const { title, year } = searchStr.data;
            // test for url breaking symbols https://stackoverflow.com/a/66765539/336431
            
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
        getSiteFromConfig().then((res) => {
            const url = getSearchURL(res.site, searchStr, mode);
            openUrlToTheRight(url, tab);
        })
    }
});

browser.runtime.onMessage.addListener(getSearchStrFromPage);

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
