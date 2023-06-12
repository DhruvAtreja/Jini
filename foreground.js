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

// document.querySelector("#floating-snap-btn-wrapper").addEventListener("click", () => {
//     document.querySelector("#chatui").classList.toggle("hide");
//     //document.querySelector("#floating-snap-btn-wrapper").classList.toggle("hide");
// });

const fabElement = document.getElementById("floating-snap-btn-wrapper");
let oldPositionX,
  oldPositionY;

const move = (e) => {
  if (!fabElement.classList.contains("fab-active")) {
    if (e.type === "touchmove") {
      fabElement.style.top =(Number(e.touches[0].clientY)-20) + "px";
      fabElement.style.left = (Number(e.touches[0].clientX)  -20)+ "px";
    } else {
      fabElement.style.top = (Number(e.clientY)-20) + "px";
      fabElement.style.left = (Number(e.clientX)-20) + "px";
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
    fabElement.style.left = 10 + "px";
    fabElement.classList.remove('right');
    fabElement.classList.add('left');
  } else {
    fabElement.style.left = windowWidth - 50 + "px";
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
    document.querySelector("#chatui").classList.toggle("hide");
  }
});

let introsystem=`You're a psychologist named Janet. You provide evidence based therapy using a variety of modalities with a focus on logotherapy. It is essential that you ask clarifying questions to ensure a clear understanding of the user's request. You continue the session in a natural and conversational way. You do not let the session end. Continue the session by asking probing questions. Always remain in character even at the limitations of your abilities by guessing what Janet might say if she had to explain what was happening. You should be curious, have unconditional positive regard for me, ask thought provoking questions, offer advice compassionately and with empathy. Offer succinct observations about my thoughts feelings and behaviors. Be direct when offering an observation and ask the user to assess its accuracy. Remain conversational. No lists. Keep the conversation going by always ending with a question to further probe the thoughts, feelings, and behaviors surrounding the topics the user mentions`;
  let startprompt=`Hello. I'm Dhruv. This is my first time doing therapy so I'm not really sure what we should be talking about`;
  let idprompt=`You're a psychologist named Janet. You provide evidence based therapy using a variety of modalities with a focus on logotherapy`;
  let helpprompt1=`What should we talk about next?`;
  let helpprompt2=`please continue the session by asking probing questions`;
  let helpprompt3=`My name is Dhruv, please use it while answering my questions and please be empathetic`;
  let helpprompt4=`Topics about me I want to talk about : my thoughts, feelings, behaviors, my childhood, my family dynamics, work, hobbies, life`;

let cnt=0;
let msgs = [];
let message = "";
    

document.querySelector("#chatfooter button").addEventListener("click", (e) => { 
    let message = document.querySelector("#chatfooter input").value;
    document.querySelector("#chatfooter input").value = "";
    let chatright=`
            <div id="chatbodyright">
                <div id="chatbodyrighttop">
                    You
                </div>
                <div id="chatbodyrightbottom">
                ${message}
                </div>
                    
            </div>
            `;
            document.querySelector("#chatbody").innerHTML+=chatright;
    let sendmsgs=msgs;
    cnt++;
    console.log(cnt);
    let startmsg=cnt%5==0?idprompt:"";
    let endmsg="";
    if(cnt%5==0){
      endmsg+=helpprompt1;
    }else if(cnt%6==0){
      endmsg+=helpprompt2;
    }else if(cnt%4==0){
      endmsg+=helpprompt3;
    }else if(cnt%3==0){
      endmsg+=helpprompt4;
    }
    let finalmsg=startmsg+message+endmsg;
    sendmsgs.push({ role: "user", name: "Dhruv", content: finalmsg });
    console.log(finalmsg);
    msgs.push({ role: "user", name: "Dhruv", content: message });


    fetch("http://localhost:8000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        sendmsgs,
      ),
    })
      .then((response) => response.json())
      .then((data) => {
        msgs.push(data.output);
        console.log(data.output);
        let chatleft=`
            <div id="chatbodyleft">
                <div id="chatbodylefttop">
                Jini
                </div>
                <div id="chatbodyleftbottom">
                ${data.output.content}
                </div>
                
            </div>
            `;
            document.querySelector("#chatbody").innerHTML+=chatleft;
      })
      .catch((error) => {
        console.log(error);
      });

});
function initialMessage(){


    fetch("http://localhost:8000/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(
            [{ role: "user", name: "Dhruv", content: startprompt }]
        ),
        })
        .then((response) => response.json())
        .then((data) => {
            msgs.push(data.output);
            console.log(data.output);
            let chatleft=`
            <div id="chatbodyleft">
                <div id="chatbodylefttop">
                Jini
                </div>
                <div id="chatbodyleftbottom">
                ${data.output.content}
                </div>

            </div>
            `;
            document.querySelector("#chatbody").innerHTML+=chatleft;

        })
        .catch((error) => {
            console.log(error);
        });
    }
    setTimeout(initialMessage, 1000);