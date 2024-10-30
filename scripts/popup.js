document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get("mode", (result) => {
        const contentDiv = document.getElementById('content');
        let url;

        if (result.mode[0] === "child") {
            url = "popup_c.html";
        } else if (result.mode[0] === "adult") {
            url = "popup_a.html";
        } else {
            url = "welcome.html";
        }

        // Load the content based on the mode
        fetch(chrome.runtime.getURL(url))
            .then(response => response.text())
            .then(html => {
                contentDiv.innerHTML = html;
            })
            .catch(error => {
                console.error('Error loading content:', error);
            });
    });
});