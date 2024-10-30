chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
});

chrome.action.onClicked.addListener(() => {
    chrome.storage.local.get("mode", (result) => {
      let url;
      if (result.mode[0] === "child") {
        url = "popup_c.html";
        chrome.action.setPopup({ popup: url });
        chrome.action.openPopup();
      } else if (result.mode[0] === "adult") {
        url = "popup_a.html";
        chrome.action.setPopup({ popup: url });
        chrome.action.openPopup();
      } else {
        url = "welcome.html";
        chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
      }
    });

  });