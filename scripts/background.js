chrome.runtime.onInstalled.addListener(() => { // open welcome page on installation so user can select adult/child
    chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
});

// runs the ratings check for child users when a navigation is committed, meaning entering a URL or clicking a link
// likely the source of the split second issue
chrome.webNavigation.onCommitted.addListener((details) => {
    // details.frameId === 0 ensures this is the main frame (not an iframe) to avoid duplicate calls
    chrome.storage.local.get("mode", (result) => {
        if (result.mode) {
            if (details.frameId === 0 && result.mode[0] === "child") {
                const warningPageUrl = chrome.runtime.getURL("warning.html");
                if (details.url != warningPageUrl) { // don't check the ratings of the warning page, that opens the door to infinite tabs opening
                    const currUrl = new URL(details.url);
                    let hostname = currUrl.hostname.replace(/^www\./, '');
                    checkRatings(details.tabId, hostname);
                }
            }
        }
    });
});

// look up the ratings of a specific website in the database, and open warning if any category's average is below the threshold
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
          if (result.length > 0) { // if there are any reviews, they will be in an object inside an array; if not, the object won't be there
            const resultObject = result[0];
            let warning = false;
            for (const key in resultObject) {
                if (typeof resultObject[key] != "number") { // remove the url field so numbers can be checked here and in the warning code
                    delete resultObject[key];
                } else if (resultObject[key] < 4 && !warning) { // warning will come up if any category is below the threshold (4)
                    warning = true;
                }
            }

            // replace what is coming up in the current tab with the warning if necessary
            const tabToReplace = await chrome.tabs.query({active: true, currentWindow: true});

            // a warning is necessary if the warning flag is true and the webpage being accessed doesn't have warnings muted
            chrome.storage.local.get("mutedWebsites", (result) => {
                const mutedWebsites = result.mutedWebsites || [];
                console.log("Muted: ", mutedWebsites);
                // some() is a way of saying "there exists some entry that meets a criteria"
                if (warning && !mutedWebsites.some(entry => entry.url === url)) {
                    const replacedUrl = new URL(tabToReplace[0].url);
                    // save the results and the original webpage because the warning needs both
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

// when a webpage has been muted for roughly 24 hours, unmute it
function cleanupMutedWebsites() {
    const oneDay = 86400000; // 24 hours in milliseconds
    const now = Date.now();

    chrome.storage.local.get({ mutedWebsites: [] }, (data) => {
        // filter() filters out anything not meeting the criteria
        const updatedMutedWebsites = data.mutedWebsites.filter(entry => now - entry.timestamp < oneDay);
        chrome.storage.local.set({ mutedWebsites: updatedMutedWebsites });
    });
}

// run cleanup every hour
setInterval(cleanupMutedWebsites, 60 * 60 * 1000);