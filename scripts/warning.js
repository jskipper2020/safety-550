document.addEventListener('DOMContentLoaded', () => {
    // set the link that the child proceeds with to the webpage they wanted to access
    const link = document.getElementById("proceedlink");
    chrome.storage.local.get("originalUrl", (result) => {
        link.href = result.originalUrl;
        const urlObj = new URL(result.originalUrl);
        link.addEventListener("click", stopPopup(urlObj.hostname)); // mute warnings for the webpage for roughly 24 hours
    });

    // add every category that the rating average was under the threshold in to a list on the warning
    // this explains to the child why the webpage may be dangerous
    chrome.storage.local.get("ratingResult", (result) => {
        const keys = result["ratingResult"];
        const categories = document.getElementById('categories');
        const ul = document.createElement('ul');
        for (const key in keys) {
            if (keys[key] < 4) {
                const li = document.createElement('li');
                li.textContent = `${key}`;
                ul.appendChild(li);
            }
        }
        categories.appendChild(ul);
    });
});

// adds webpage to the list of muted webpages and starts its 24 hour timer
function stopPopup(url) {
    chrome.storage.local.get("mutedWebsites", (result) => {
        const timestamp = Date.now();
        const mutedWebsites = result.mutedWebsites;
        if ((!mutedWebsites.some(entry => entry.url === url))) {
            mutedWebsites.push({url, timestamp});
            chrome.storage.local.set({ mutedWebsites });
        }
    });
}