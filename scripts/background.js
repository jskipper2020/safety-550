chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
});

chrome.webNavigation.onCommitted.addListener((details) => {
    // Ensure this is the main frame (not an iframe) to avoid duplicate calls
    chrome.storage.local.get("mode", (result) => {
        if (result.mode) {
            if (details.frameId === 0 && result.mode[0] === "child") {
                const warningPageUrl = chrome.runtime.getURL("warning.html");
                if (details.url !== warningPageUrl) {
                    const domain = new URL(details.url);
                    checkRatings(details.tabId, domain.hostname);
                }
            }
        }
    });
});

async function checkRatings(tab, url) {
    try {
        const response = await fetch(`https://s550backend-production.up.railway.app/ratings?url=${url}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
    
        if (response.ok) {
          const result = await response.json();
          if (result.length > 0) {
            const resultObject = result[0];
            let warning = false;
            for (const key in resultObject) {
                if (typeof resultObject[key] != "number") {
                    delete resultObject[key];
                } else if (resultObject[key] < 4 && !warning) {
                    warning = true;
                }
            }

            const tabToReplace = await chrome.tabs.query({active: true, currentWindow: true});

            chrome.storage.local.get("mutedWebsites", (result) => {
                const mutedWebsites = result.mutedWebsites || [];
                console.log("Muted: ", mutedWebsites);
                if (warning && !mutedWebsites.includes(url)) {
                    const replacedUrl = new URL(tabToReplace[0].url);
                    chrome.storage.local.set({ "ratingResult": resultObject, "originalUrl": replacedUrl.href }, () => {
                        chrome.tabs.update(tab, { url: chrome.runtime.getURL("warning.html") });
                    });
                }
            })
          }
        } else {
          console.error("Error: ", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
    }
}