// runs on the welcome page, sends user to child or adult help page and stores their mode

chrome.storage.local.set({ // storage for the crawler, will need time sensitivity like the pop ups
    crawledURLs: []
})

document.getElementById('child').addEventListener('click', function() {
    chrome.storage.local.set({
        mode: ['child'],
        mutedWebsites: [] // only necessary for children because adults are never blocked
    });
    window.location.href = 'childhelp.html';
});

document.getElementById('adult').addEventListener('click', function() {
    chrome.storage.local.set({
        mode: ['adult']
    });
    window.location.href = 'adulthelp.html';
});

document.getElementById('child_ai').addEventListener('click', function() {
    chrome.storage.local.set({
        mode: ['child_ai'],
        mutedWebsites: []
    });
    window.location.href = 'childhelp.html';
});

document.getElementById('adult_ai').addEventListener('click', function() {
    chrome.storage.local.set({
        mode: ['adult_ai']
    });
    window.location.href = 'adulthelp.html';
});