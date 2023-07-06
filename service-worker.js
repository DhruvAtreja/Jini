// This is the service worker script, which executes in its own context
// when the extension is installed or refreshed (or when you access its console).
// It would correspond to the background script in chrome extensions v2.

console.log("This prints to the console of the service worker (background script)")

// Importing and using functionality from external files is also possible.
importScripts('service-worker-utils.js')

// If you want to import a file that is deeper in the file hierarchy of your
// extension, simply do `importScripts('path/to/file.js')`.
// The path should be relative to the file `manifest.json`.
chrome.runtime.onInstalled.addListener(function(details){
    
    if(details.reason == "install"){
        console.log("This is a first install!");
        chrome.identity.getProfileUserInfo({ 'accountStatus': 'ANY' }, function (info) {
            let email = info.email;
            console.log(email);
            if (email == "") chrome.tabs.sendMessage(tab.id, { status: "noemail" });
            else {
                fetch("http://localhost:8000/email/" + email + "/")
                .then((response) => response.json())
                .catch((error) => {
                    console.log(error);
                });
            }});
        
    }else if(details.reason == "update"){
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
});