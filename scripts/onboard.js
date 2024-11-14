// runs on the welcome page, sends user to child or adult help page and stores their mode

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