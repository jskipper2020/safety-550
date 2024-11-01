document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get("mode", (result) => {
        const contentDiv = document.getElementById('content');
        let url;

        if (result.mode) {
            if (result.mode[0] === "child") {
                url = "popup_c.html";
            } else {
                url = "popup_a.html";
            }
        } else {
            chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
            return;
        }

        // Load the content based on the mode
        fetch(chrome.runtime.getURL(url))
            .then(response => response.text())
            .then(html => {
                contentDiv.innerHTML = html;
                stars();
            })
            .catch(error => {
                console.error('Error loading content:', error);
            });
    });
});

function stars() {
    const stars = document.querySelectorAll('.star');
    const ratingValue = document.getElementById('rating-value');
    console.log("It reaches here");
    stars.forEach((star) => {
        star.addEventListener('click', function () {
        const rating = this.getAttribute('data-value');
        console.log(rating);
        ratingValue.textContent = rating;
        
        stars.forEach(s => s.classList.remove('selected'));

        this.classList.add('selected');
        let previousStar = this.previousElementSibling;
        while (previousStar) {
            previousStar.classList.add('selected');
            previousStar = previousStar.previousElementSibling;
        }
        });
    });
}
