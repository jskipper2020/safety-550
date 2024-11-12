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
    const url = new URL(tab[0].url);
    if (url.protocol != "http:" && url.protocol != "https:") {
        throwWarningA("This page cannot be rated.");
        return;
    }
    ratingSet['url'] = url.hostname;
    
    let allRated = true;
    document.querySelectorAll('.star-rating').forEach((rating) => {
        const ratingValue = rating.querySelector('#rating-value').textContent;
        const category = rating.querySelector('#category').textContent;

        if (ratingValue === "0") {
            allRated = false;
        }
        
        ratingSet[category] = parseInt(ratingValue);
    });

    // Check if all categories are rated
    if (!allRated) {
        throwWarningA("Please enter a rating for all categories.");
        return;
    }

    // Remove warning if it exists and all ratings are provided
    const existingWarning = document.getElementById('warning');
    if (existingWarning) {
        existingWarning.remove();
    }

    await addRating(ratingSet);
}

function throwWarningA(text) {
    const existingWarning = document.getElementById('warning');
    if (existingWarning && existingWarning.textContent != text) {
        warning.textContent = text;
    }
    if (!existingWarning) {
        const warning = document.createElement('p');
        warning.textContent = text;
        warning.id = 'warning';
        document.getElementById('submit').insertAdjacentElement('beforebegin', warning);
    }
}

async function addRating(ratingData) {
    try {
      const response = await fetch("https://s550backend-production.up.railway.app/add-rating", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(ratingData)
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log("Rating added successfully:", result);
      } else {
        console.error("Failed to add rating:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }