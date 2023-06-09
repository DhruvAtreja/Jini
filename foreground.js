// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.

console.log("This prints to the console of the page (injected only if the page url matched)")

let chatui = document.createElement("div");
chatui.setAttribute("id", "chatui");
chatui.innerHTML=`
<div id="chatheader">
    <div id="chatheaderleft">Jini</div>
    <div id="chatheaderright">
        <button>Meditate</button>
        <button>Journal</button>
        <span id="minmaxbtn">v</span>
    </div>
</div>
<div id="chatbody">
    <div id="chatbodyleft">
        <div id="chatbodylefttop">
            Jini
        </div>
        <div id="chatbodyleftbottom">
            Message
        </div>
    </div>
    <div id="chatbodyright">
        <div id="chatbodyrighttop">
            You
        </div>
        <div id="chatbodyrightbottom">
            Message
        </div>
    </div>
</div>
<div id="chatfooter">
    <input type="text" placeholder="How do you feel?">
    <button>Send</button>
</div>
`;
document.querySelector("html").append(chatui);