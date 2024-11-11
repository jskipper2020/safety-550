document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get("ratingResult", (result) => {
        const keys = result["ratingResult"];
        console.log(keys);
        const categories = document.getElementById('categories');
        const ul = document.createElement('ul');
        for (const key in keys) {
            console.log(key);
            if (keys[key] < 4) {
                const li = document.createElement('li');
                li.textContent = `${key}`;
                ul.appendChild(li);
            }
        }
        categories.appendChild(ul);
    });
});