document.getElementById('child').addEventListener('click', function() {
    chrome.storage.local.set({
        mode: ['child']
    });
    window.location.href = 'childhelp.html';
});

document.getElementById('adult').addEventListener('click', function() {
    chrome.storage.local.set({
        mode: ['adult']
    });
    window.location.href = 'adulthelp.html';
});