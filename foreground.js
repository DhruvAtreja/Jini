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

document.querySelector("#minmaxbtn").addEventListener("click", () => {
    document.querySelector("#chatui").classList.toggle("hide");
});

const floatingbtn = document.createElement("div");
floatingbtn.setAttribute("id", "floating-snap-btn-wrapper");
floatingbtn.innerHTML=`
    <div class="fab-btn">
       <ion-icon name="share-social"></ion-icon>
    </div>
`;
document.querySelector("html").append(floatingbtn);

document.querySelector("#floating-snap-btn-wrapper").addEventListener("click", () => {
    document.querySelector("#chatui").classList.toggle("hide");
    //document.querySelector("#floating-snap-btn-wrapper").classList.toggle("hide");
});

const fabElement = document.getElementById("floating-snap-btn-wrapper");
let oldPositionX,
  oldPositionY;

const move = (e) => {
  if (!fabElement.classList.contains("fab-active")) {
    if (e.type === "touchmove") {
      fabElement.style.top = e.touches[0].clientY + "px";
      fabElement.style.left = e.touches[0].clientX + "px";
    } else {
      fabElement.style.top = e.clientY + "px";
      fabElement.style.left = e.clientX + "px";
    }
  }
};

const mouseDown = (e) => {
  console.log("mouse down ");
  oldPositionY = fabElement.style.top;
  oldPositionX = fabElement.style.left;
  if (e.type === "mousedown") {
    window.addEventListener("mousemove", move);
  } else {
    window.addEventListener("touchmove", move);
  }

  fabElement.style.transition = "none";
};

const mouseUp = (e) => {
  console.log("mouse up");
  if (e.type === "mouseup") {
    window.removeEventListener("mousemove", move);
  } else {
    window.removeEventListener("touchmove", move);
  }
  snapToSide(e);
  fabElement.style.transition = "0.3s ease-in-out left";
};

const snapToSide = (e) => {
  const wrapperElement = document.querySelector("body");
  const windowWidth = window.innerWidth;
  let currPositionX, currPositionY;
  if (e.type === "touchend") {
    currPositionX = e.changedTouches[0].clientX;
    currPositionY = e.changedTouches[0].clientY;
  } else {
    currPositionX = e.clientX;
    currPositionY = e.clientY;
  }
  if(currPositionY < 50) {
   fabElement.style.top = 50 + "px"; 
  }
  if(currPositionY > wrapperElement.clientHeight - 50) {
    fabElement.style.top = (wrapperElement.clientHeight - 50) + "px"; 
  }
  if (currPositionX < windowWidth / 2) {
    fabElement.style.left = 30 + "px";
    fabElement.classList.remove('right');
    fabElement.classList.add('left');
  } else {
    fabElement.style.left = windowWidth - 30 + "px";
    fabElement.classList.remove('left');
    fabElement.classList.add('right');
  }
};

fabElement.addEventListener("mousedown", mouseDown);

fabElement.addEventListener("mouseup", mouseUp);

fabElement.addEventListener("touchstart", mouseDown);

fabElement.addEventListener("touchend", mouseUp);

fabElement.addEventListener("click", (e) => {
  if (
    oldPositionY === fabElement.style.top &&
    oldPositionX === fabElement.style.left
  ) {
    fabElement.classList.toggle("fab-active");
  }
});
