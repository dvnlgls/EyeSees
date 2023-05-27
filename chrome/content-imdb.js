function getTtile() {
  //hero__pageTitle
  try {
    const element = document.querySelectorAll("[data-testid='hero__pageTitle']")[0];
    const title = element.getElementsByTagName('span')[0].innerText;
    return title;
  } catch (error) {
    console.log('EyeSees: Possible DOM change. Check title retrieval logic.')
    return null;
  }
}

function getYear() {
  const element = document.querySelectorAll("[data-testid='hero__pageTitle']")[0];
  let year;
  try {
    if (element.nextSibling.firstChild.innerText === 'TV Series') {
      year = element.nextSibling.childNodes[1].innerText;
      // check if year is a range, like 2010-2015
      if (year.lastIndexOf('–') !== -1) {
        year = year.split('–')[0];
      }
    } else {
      // movie page
      year = element.nextSibling.childNodes[0].innerText;
    }
    return year;
  } catch (e) {
    return null;
  }
}

function getSearchStr() {
  const title = getTtile();
  const year = getYear();
  let searchStr = { title, year };

  return searchStr;
}

function sendSearchStr(searchStr) {
  chrome.runtime.sendMessage(searchStr);
}

function getIMDBID() {
  const imdbId = document.querySelector('meta[property="imdb:pageConst"][content]').content || '';
  return imdbId;
}

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    let payload;

    if (request.data === "getSearchTerm") {
      payload = getSearchStr();
    } else if (request.data === 'getImdbId') {
      payload = getIMDBID();
    }

    const response = { data: payload }
    sendResponse(response);
  }
);
