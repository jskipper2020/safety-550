document.addEventListener('DOMContentLoaded', () => {
    const link = document.getElementById("proceedlink");
    chrome.storage.local.get("originalUrl", (result) => {
        link.href = result.originalUrl;
        const urlObj = new URL(result.originalUrl);
        link.addEventListener("click", stopPopup(urlObj.hostname));
    });

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

function stopPopup(url) {
    chrome.storage.local.get("mutedWebsites", (result) => {
        const mutedWebsites = result.mutedWebsites;
        if (!mutedWebsites.includes(url)) {
            mutedWebsites.push(url);
            chrome.storage.local.set({ mutedWebsites });
        }
    });
}