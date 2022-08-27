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
  let searchStr = '';

  if (title) {
    searchStr = title.trim().replaceAll(' ', '+');
  }
  if (year) {
    searchStr += '+' + year.trim();
  }
  return searchStr;
}

function sendSearchStr() {
  const searchStr = getSearchStr();
  browser.runtime.sendMessage({ "searchStr": searchStr });
}

browser.runtime.onMessage.addListener(({ trigger }) => {
  if (trigger === 'getSearchStr') {
    sendSearchStr();
  }
});