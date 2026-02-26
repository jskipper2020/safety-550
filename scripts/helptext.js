welcomeMessages = {
    child: `Hello! This Google Chrome extension is designed to help you gain a better idea of 
        how to safely browse the Internet by giving you information about the websites you visit. 
        This information comes from website reviews provided by adult users from all around; the 
        adult(s) that installed this for you may even add some reviews themselves!
        
        Based on the reviews for each website, this extension can go into detail about what 
        makes the website you are going on safe or unsafe. When adults agree that a website is 
        unsafe, this extension will warn you when you try to go to it and show the reason(s) why.`,
    adult: `Placeholder`,
    child_ai: `Hello! This Google Chrome extension is designed to help you gain a better idea of 
        how to safely browse the Internet by giving you information about the websites you visit. 
        This information comes from website reviews provided by ChatGPT and checked by parents from all around; the 
        adult(s) that installed this for you may even check some reviews themselves!
        
        Based on the reviews for each website, this extension can go into detail about what 
        makes the website you are going on safe or unsafe. When ChatGPT and adults agree that a website is 
        unsafe, this extension will warn you when you try to go to it and show the reason(s) why.`,
    adult_ai: `Placeholder`
}
// change help text based on ai or no ai
document.addEventListener("DOMContentLoaded", async () => {
    chrome.storage.local.get("mode", result => {
        const paragraph = document.getElementById("welcometext");
        paragraph.textContent = welcomeMessages[result["mode"]];
    });
});