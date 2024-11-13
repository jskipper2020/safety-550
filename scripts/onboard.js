document.getElementById('child').addEventListener('click', function() {
    chrome.storage.local.set({
        mode: ['child'],
        mutedWebsites: []
    });
    window.location.href = 'childhelp.html';
});

document.getElementById('adult').addEventListener('click', function() {
    chrome.storage.local.set({
        mode: ['adult']
    });
    window.location.href = 'adulthelp.html';
});