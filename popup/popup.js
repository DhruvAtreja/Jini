

document.addEventListener('DOMContentLoaded',()=>{
    document.querySelector('#jiniorange').addEventListener('click', function() {
        chrome.storage.local.set({ jinicolor: "orange" }).then(() => {
            console.log("Value is orange");
          });
    });
    document.querySelector('#jinipink').addEventListener('click', function() {
        chrome.storage.local.set({ jinicolor: "pink" }).then(() => {
            console.log("Value is pink");
          });
    });
    document.querySelector('#jiniblue').addEventListener('click', function() {
        chrome.storage.local.set({ jinicolor: "blue" }).then(() => {
            console.log("Value is blue");
          });
    });
})