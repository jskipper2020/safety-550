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
                if (url === "popup_a.html") {
                    setUpStars();
                    document.getElementById("submit").addEventListener("click", function() {submitRating()});
                }
            })
            .catch(error => {
                console.error('Error loading content:', error);
            });
    });
});

function setUpStars() {
    document.querySelectorAll('.star-rating').forEach((rating) => {
        const stars = rating.querySelectorAll('.star');
        const ratingValue = rating.querySelector('#rating-value');
        
        stars.forEach((star) => {
            star.addEventListener('click', function () {
                const rating = this.getAttribute('data-value');
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
    });
}

async function submitRating() {
    const ratingSet = {};
    const tab = await chrome.tabs.query({active: true, currentWindow: true});
    console.log(tab[0].url);
    //ratingSet['url'] = tab['url'];
    document.querySelectorAll('.star-rating').forEach((rating) => {
        const ratingValue = rating.querySelector('#rating-value');
        const category = rating.querySelector('#category').textContent;
        ratingSet[category] = ratingValue;
    });
    console.log(JSON.stringify(ratingSet));
}
