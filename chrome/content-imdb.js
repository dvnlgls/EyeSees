function getTtile() {
  const element = document.querySelectorAll("[data-testid='hero-title-block__title']")[0];
  if (element) {
    return element.innerText;
  } else {
    return null;
  }
}

function getYear() {
  const element = document.querySelectorAll("[data-testid='hero-title-block__metadata']")[0];
  let year;
  try {
    if (element.firstChild.innerText === 'TV Series') {
      year = element.childNodes[1].firstChild.innerText;
      // check if year is a range, like 2010-2015
      if (year.lastIndexOf('–') !== -1) {
        year = year.split('–')[0];
      }
    } else {
      // movie page
      year = element.firstChild.firstChild.innerText;
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

chrome.runtime.onMessage.addListener(({ trigger }) => {
  let searchStr;
  console.log('trigger', trigger);

  if (trigger === 'getSearchStr') {
    searchStr = getSearchStr();
  }
  else if (trigger === 'getImdbId') {
    searchStr = getIMDBID();
  }

  const response = { data: searchStr }
  sendSearchStr(response);
  
  return true;
});
