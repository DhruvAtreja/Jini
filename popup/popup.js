

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
    document.querySelector('#jinidonatebtn').addEventListener('click', function() {
        chrome.storage.local.set({ jinidonateopen: "true" }).then(() => {
            setTimeout(() => {
                chrome.storage.local.set({ jinidonateopen: "false" }).then(() => {});
            }, 3000);
        });
    });
    document.querySelector('#jinisubscribe').addEventListener('click', function() {
        window.open("https://bmc.link/jinichat", "_blank");
    });
    document.querySelector('#jinicontactbtn').addEventListener('click', function() {
        window.open("mailto:jinichatcontact@gmail.com", "_blank");
    });

    const jinilogo = document.createElement("img");
    jinilogo.id = "jinilogo";
    let jinilogopath = chrome.runtime.getURL("rectangle.png")
    jinilogo.src = jinilogopath;
    document.querySelector("#jinipopupheader").append(jinilogo);
})