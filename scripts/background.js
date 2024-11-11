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
        const response = await fetch(`http://localhost:3000/ratings?url=${url}`, {
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
            if (warning) {
                chrome.storage.local.set({ "ratingResult": resultObject }, () => {
                    chrome.tabs.update(tab, { url: chrome.runtime.getURL("warning.html") });
                });
            }
          }
        } else {
          console.error("Error: ", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
    }
}