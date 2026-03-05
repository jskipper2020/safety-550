// this is code for both popups, but the popup for children doesn't have anything yet so there's nothing there for them

// works by loading a main popup.html and moving to a different popup page based on mode
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get("mode", (result) => {
        const contentDiv = document.getElementById('content'); // replace original popup.html with the respective popup using this
        let url;

        if (result.mode) {
            if (result.mode[0] === "child") {
                url = "popup_c.html";
            } else if (result.mode[0] === "adult") {
                url = "popup_a.html";
            } else {
                url = "popup_ai.html";
            }
        } else { // if the user didn't pick adult/child, send them back to welcome page
            chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
            return;
        }

        // load the content based on the mode
        fetch(chrome.runtime.getURL(url))
            .then(response => response.text())
            .then(html => {
                contentDiv.innerHTML = html;
                if (url === "popup_a.html") {
                    setUpStars();
                    document.getElementById("submit").addEventListener("click", function() {submitRating()});
                } else if (url === "popup_ai.html") {
                    obtainAIRating();
                    // document.getElementById("correct").addEventListener("click", function() {correctAIRating()});
                }
            })
            .catch(error => {
                console.error('Error loading content:', error);
            });
    });
});

async function obtainAIRating() {
    const tab = await chrome.tabs.query({active: true, currentWindow: true});
    const url = new URL(tab[0].url); // URL object organizes a URL into its useful properties
    if (url.protocol != "http:" && url.protocol != "https:") { // anything that isn't on http or https isn't a webpage
        throwWarningB("This page cannot be rated.");
        return;
    }
    let domain = url.hostname.replace(/^www\./, ''); // strip the saved URL's hostname of any "www." so there aren't two sets of ratings for one webpage
    try {
        const response = await fetch(`https://seashell-app-irlrr.ondigitalocean.app/aiRating?url=${domain}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        });
        if (response.ok) {
            const result = await response.json();
            /*
            try { // validate ai-generated json
                JSON.parse(result);
            } catch (error) {
                const aiError = document.getElementById('aierror');
                aiError.hidden = false;
                return;
            }
            */
            
            const ratingElement = document.getElementById('rating');
            ratingElement.hidden = false;
            ratingElement.querySelectorAll('.star-rating').forEach((rating) => {
                const category = rating.querySelector('p').textContent;
                const stars = rating.querySelectorAll('.star');
                const ratingValue = rating.querySelector('#rating-value');
                ratingValue.textContent = result[category];

                stars.forEach((star) => {
                    if (star.getAttribute('data-value') === ratingValue.textContent) {
                        star.classList.add('selected');
                        let previousStar = star.previousElementSibling;
                        while (previousStar) {
                            previousStar.classList.add('selected');
                            previousStar = previousStar.previousElementSibling;
                        }
                    }
                })
            });
        } else {
            const aiError = document.getElementById('aierror');
            aiError.hidden = false;
            return;
        };
    } catch (error) {
        throwWarningB("Error connecting to database");
    };
}

function setUpStars() { // this enables the rating functionality for each category's set of stars
    document.querySelectorAll('.star-rating').forEach((rating) => {
        const stars = rating.querySelectorAll('.star');
        const ratingValue = rating.querySelector('#rating-value');
        
        stars.forEach((star) => { // how the star that's clicked on and every star before it is considered selected
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
    const ratingSet = {}; // object storing the rating
    const tab = await chrome.tabs.query({active: true, currentWindow: true});
    const url = new URL(tab[0].url); // URL object organizes a URL into its useful properties
    if (url.protocol != "http:" && url.protocol != "https:") { // anything that isn't on http or https isn't a webpage
        throwWarningA("This page cannot be rated.");
        return;
    }
    let domain = url.hostname.replace(/^www\./, ''); // strip the saved URL's hostname of any "www." so there aren't two sets of ratings for one webpage
    ratingSet['url'] = domain;
    
    let allRated = true;
    document.querySelectorAll('.star-rating').forEach((rating) => {
        const ratingValue = rating.querySelector('#rating-value').textContent;
        const category = rating.querySelector('#category').textContent;

        if (ratingValue === "0") { // a 0 value means a rating has not been selected for that category
            allRated = false;
        }
        
        ratingSet[category] = parseInt(ratingValue);
    });

    // check if all categories are rated
    if (!allRated) {
        throwWarningA("Please enter a rating for all categories.");
        return;
    }

    // remove warning if it exists and all ratings are provided
    const existingWarning = document.getElementById('warning');
    if (existingWarning) {
        existingWarning.remove();
    }

    await addRating(ratingSet);
}

function throwWarningA(text) { // for alerting an adult user of any errors on their part or the program's
    const existingWarning = document.getElementById('warning'); // don't let warnings stack on each other
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

function throwWarningB(text) { // for alerting an adult user of any errors on their part or the program's
    const existingWarning = document.getElementById('warning'); // don't let warnings stack on each other
    if (existingWarning && existingWarning.textContent != text) {
        warning.textContent = text;
    }
    if (!existingWarning) {
        const warning = document.createElement('p');
        warning.textContent = text;
        warning.id = 'warning';
        document.getElementById('correct').insertAdjacentElement('beforebegin', warning);
    }
}

async function addRating(ratingData) {
    try { // send rating to the database through the backend server
      const response = await fetch("https://seashell-app-irlrr.ondigitalocean.app/add-rating", {
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