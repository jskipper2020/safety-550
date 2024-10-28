chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
});

chrome.action.onClicked.addListener(() => {
    chrome.storage.local.get("mode", (result) => {
      let url;
      if (result.mode === "child") {
        url = "popup_c.html";
        chrome.action.setPopup({ url });
        chrome.action.openPopup();
      } else if (result.mode === "adult") {
        url = "popup_a.html";
        chrome.action.setPopup({ url });
        chrome.action.openPopup();
      } else {
        url = "welcome.html";
        chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
      }
    });

  });