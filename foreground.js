// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.
let jinicolor="orange";

console.log("This prints to the console of the page (injected only if the page url matched)")

let chatui = document.createElement("div");
chatui.setAttribute("id", "chatui");
chatui.setAttribute("class", "hide");
chatui.innerHTML=`
<div id="chatheader">
    <div id="chatheaderleft">Jini</div>
    <div id="chatheaderright">
        <button id="meditateopen">Meditate</button>
        <button id="clearbtnjini">Clear</button>
        <span id="minmaxbtn">v</span>
    </div>
</div>
<div id="chatbody">
    
</div>
<div id="chatfooter">
    <input type="text" placeholder="How do you feel?">
    <button>Send</button>
</div>
`;
document.querySelector("html").append(chatui);
document.querySelector("#clearbtnjini").addEventListener("click", () => {
  restartconversation();
});

document.querySelector("#minmaxbtn").addEventListener("click", () => {
    document.querySelector("#chatui").classList.toggle("hide");
});

document.querySelector("#meditateopen").addEventListener("click", () => {
    document.querySelector("#meditatemodal").style.display="block";
    document.querySelector("#chatui").classList.toggle("hide");
});

const floatingbtn = document.createElement("div");
floatingbtn.setAttribute("id", "floating-snap-btn-wrapper");
floatingbtn.innerHTML=`
    <div class="fab-btn">
      Jini
       
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
    chrome.storage.local.get("jinidonate").then((result) => {
      console.log(result.jinidonate);
      if(document.querySelector("#chatui").style.display=="block"){
        document.querySelector("#chatui").classList.toggle("hide");
        return;
      }else{
        if((!result.jinidonate)&&Math.random()<0.33){
          document.querySelector("#donatemodal").style.display="block";
        }else{
          document.querySelector("#chatui").classList.toggle("hide");
        }
      }

    });
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
let usermessages = idprompt+helpprompt3+ helpprompt4; //usermessages except last 10;
let usermessagessummary = usermessages;
let lastcnt=0;    
function getSummary(){
  let sendsummary=[{ role: "user", name: "Dhruv", content: "Summarise the following: " + usermessages }]
  lastcnt=cnt-20;
  fetch("http://localhost:8000/summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        sendsummary,
      ),
    })
      .then((response) => response.json())
      .then((data) => {
        usermessages=data.output.content;
        usermessagessummary = usermessages;
        console.log(usermessages);
        
      })
      .catch((error) => {
        console.log(error);
      });

}

setInterval(function(){
    if(usermessages!=usermessagessummary && cnt>20){
        getSummary();
    }
}, 120000);

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
    setcolorfast(jinicolor);
    document.querySelector("#chatbody").scrollTo(0,1000000);
    
    let sendmsgs = JSON.parse(JSON.stringify(msgs));
    cnt++;
    console.log(cnt);
    let startmsg=cnt%5==0?idprompt:"";
    let endmsg="";
    if(cnt%5==0){
      //endmsg+=helpprompt1;
    }else if(cnt%6==0){
      endmsg+=helpprompt2;
    }else if(cnt%4==0){
      //endmsg+=helpprompt3;
    }else if(cnt%3==0){
      //endmsg+=helpprompt4;
    }
    let finalmsg=startmsg+message+endmsg;
    sendmsgs.push({ role: "user", name: "Dhruv", content: finalmsg });
    console.log(finalmsg);
    msgs.push({ role: "user", name: "Dhruv", content: message });
    console.log(sendmsgs);
    if(msgs.length>16){
        if(msgs[0].role=="assistant"){
            msgs.shift();
            sendmsgs.shift();
        }
        let initialmsg=msgs.shift();
        usermessages+= " " + initialmsg.content;
        msgs.shift();
        sendmsgs.splice(0,2);
        sendmsgs[0].content=usermessages+ " " + sendmsgs[0].content;
        console.log(sendmsgs);
        
    }
    chrome.storage.local.set({ jinimsgs: msgs }).then(() => {
        console.log("Value is set");
      });
      

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
            setcolorfast(jinicolor);
            
            document.querySelector("#chatbody").scrollTo(0,1000000)
            chrome.storage.local.set({ jinimsgs: msgs }).then(() => {
                console.log("Value is set");
              });
              
      })
      .catch((error) => {
        console.log(error);
      });

});
function initialMessage(){
    chrome.storage.local.get("jinimsgs").then((result) => {
        if(result.jinimsgs&&result.jinimsgs.length>0){
            return;
        }
        else{
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
                    setcolorfast(jinicolor);
                    chrome.storage.local.set({ jinimsgs: msgs }).then(() => {
                        console.log("Value is set");
                      });
                      
        
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    });

    }
    setTimeout(initialMessage, 100);

    setInterval(function(){
        chrome.storage.local.get(["jinimsgs"]).then((result) => {
            if(result.jinimsgs&&JSON.stringify(result.jinimsgs)!=JSON.stringify(msgs)){
                console.log("changed");
                console.log(result.jinimsgs);
                console.log(msgs);
                msgs=result.jinimsgs;
                document.querySelector("#chatbody").innerHTML="";
                msgs.forEach(msg => {
                    if(msg.role=="user"){
                        let chatright=`
                        <div id="chatbodyright">
                            <div id="chatbodyrighttop">
                                You
                            </div>
                            <div id="chatbodyrightbottom">
                            ${msg.content}
                            </div>
                                
                        </div>
                        `;
                        document.querySelector("#chatbody").innerHTML+=chatright;
                        setcolorfast(jinicolor);
                    }else{
                        let chatleft=`
                        <div id="chatbodyleft">
                            <div id="chatbodylefttop">
                            Jini
                            </div>
                            <div id="chatbodyleftbottom">
                            ${msg.content}
                            </div>
                            
                        </div>
                        `;
                        document.querySelector("#chatbody").innerHTML+=chatleft;
                        setcolorfast(jinicolor);
                    }
                });
                if(msgs.length>16){
                    document.querySelector("#chatleft").display="none";
                    document.querySelector("#chatright").display="none";
                }
                document.querySelector("#chatbody").scrollTo(0,1000000);
            }
          })
    },5000);


    let meditateelement=document.createElement("div");
    meditateelement.id="meditatemodal";
    meditateelement.innerHTML=`
    <div id="meditateheader">
    </div>
        <div id="meditatebody">
            <span id="meditatebodytext" class="topmeditatetext">I want to meditate for:</span>
            <input  id="meditatebodyinput" placeholder="10">
            <span id="meditatebodytext">minutes</span>
        </div>
        <div id="meditatefooter">
            <button id="meditatefooterbutton">Start</button>
            <button id="meditatefootercancel">Cancel</button>
        </div>
    `;
    document.querySelector("html").appendChild(meditateelement);

    document.querySelector("#meditatefootercancel").addEventListener("click",function(){
        document.querySelector("#meditatemodal").style.display="none";
        document.querySelector("#chatui").classList.toggle("hide");
    });
    document.querySelector("#meditatefooterbutton").addEventListener("click",function(){
        document.querySelector("#meditatemodal").style.display="none";
        document.querySelector("#meditatetimer").style.display="block";
        meditatingdone=false;
        startTimer((document.querySelector("#meditatebodyinput").value||10)*60,document.querySelector("#meditatetimerbodytime"));
    });

    let intervalidmeditate;
    let meditatingdone=true;
    function startTimer(duration, display) {
        let timer = duration, minutes, seconds;
        intervalidmeditate=setInterval(function () {
            if(meditatingdone){
                    clearInterval(intervalidmeditate);
                    document.querySelector("#meditatetimer").style.display="none";
                    document.querySelector("#chatui").classList.toggle("hide");
            }
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);
    
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
    
            display.innerText = minutes + ":" + seconds;
    
            if (--timer < 0) {
                finishsound();
                finishsound();
                timer = duration;
                meditatingdone=true;
            }
        }, 1000);
    }

    let meditatetimer=document.createElement("div");
    meditatetimer.id="meditatetimer";
    meditatetimer.innerHTML=`
    <div id="meditatetimerbody">
        <span id="meditatetimerbodytime">00:00</span>
    </div>
    <div id="meditatetimerfooter">
        <button id="meditatetimerfooterbutton">Close</button>
    </div>
    `;

    document.querySelector("html").appendChild(meditatetimer);
    document.querySelector("#meditatetimerfooterbutton").addEventListener("click",function(){
        document.querySelector("#meditatetimer").style.display="none";
        document.querySelector("#chatui").classList.toggle("hide");
        clearInterval(intervalidmeditate);
    });

    
   function finishsound() {
        let url = chrome.runtime.getURL('note.mp3')
        console.log(url)
    
        let a = new Audio(url)
        a.play()
    };


    function restartconversation(){
      msgs=[];
      chrome.storage.local.set({ jinimsgs: msgs }).then(() => {
        console.log("Restarted");
        document.querySelector("#chatbody").innerHTML="";
        initialMessage();
      });
    }

    function setcolorfast(color){
      if(color=="orange"){
        document.querySelector(".fab-btn").style.backgroundColor="orange";
        document.querySelector("#chatui").style.backgroundColor="orange";
        document.querySelector("#chatbody").style.backgroundColor="#FFEEDB";  
        document.querySelectorAll("#chatbodyleft").forEach(element => {
          element.style.backgroundColor="orange";
        });
        document.querySelectorAll("#chatbodyright").forEach(element => {
          element.style.backgroundColor="orange";
        });
      }else if(color=="blue"){
        document.querySelector(".fab-btn").style.backgroundColor="#22b3ff";
        document.querySelector("#chatui").style.backgroundColor="#22b3ff";
        document.querySelector("#chatbody").style.backgroundColor="#e9f5fd";
        document.querySelectorAll("#chatbodyleft").forEach(element => {
          element.style.backgroundColor="#22b3ff";
        });
        document.querySelectorAll("#chatbodyright").forEach(element => {
          element.style.backgroundColor="#22b3ff";
        });
      }
      else if(color=="pink"){
        document.querySelector(".fab-btn").style.backgroundColor="#ff8da1";     
        document.querySelector("#chatui").style.backgroundColor="#ff8da1";
        document.querySelector("#chatbody").style.backgroundColor="#ffe5ea";
        document.querySelectorAll("#chatbodyleft").forEach(element => {
          element.style.backgroundColor="#ff8da1";
        });
        document.querySelectorAll("#chatbodyright").forEach(element => {
          element.style.backgroundColor="#ff8da1";
        });
      }
    }

    function setcolor(){
      chrome.storage.local.get("jinidonateopen").then((result) => {
        if(result.jinidonateopen=="true"){
          document.querySelector("#donatemodal").style.display="block";
        }
      });
      chrome.storage.local.get("jinicolor").then((result) => {
        console.log(result.jinicolor);
        jinicolor=result.jinicolor;
        if(result.jinicolor=="orange"){
          document.querySelector(".fab-btn").style.backgroundColor="orange";
          document.querySelector("#chatui").style.backgroundColor="orange";
          document.querySelector("#chatbody").style.backgroundColor="#FFEEDB";  
          document.querySelectorAll("#chatbodyleft").forEach(element => {
            element.style.backgroundColor="orange";
          });
          document.querySelectorAll("#chatbodyright").forEach(element => {
            element.style.backgroundColor="orange";
          });
        }else if(result.jinicolor=="blue"){
          document.querySelector(".fab-btn").style.backgroundColor="#22b3ff";
          document.querySelector("#chatui").style.backgroundColor="#22b3ff";
          document.querySelector("#chatbody").style.backgroundColor="#e9f5fd";
          document.querySelectorAll("#chatbodyleft").forEach(element => {
            element.style.backgroundColor="#22b3ff";
          });
          document.querySelectorAll("#chatbodyright").forEach(element => {
            element.style.backgroundColor="#22b3ff";
          });
        }
        else if(result.jinicolor=="pink"){
          document.querySelector(".fab-btn").style.backgroundColor="#ff8da1";        
          document.querySelector("#chatui").style.backgroundColor="#ff8da1";
          document.querySelector("#chatbody").style.backgroundColor="#ffe5ea";
          document.querySelectorAll("#chatbodyleft").forEach(element => {
            element.style.backgroundColor="#ff8da1";
          });
          document.querySelectorAll("#chatbodyright").forEach(element => {
            element.style.backgroundColor="#ff8da1";
          });
        }

  });
}

setInterval(setcolor,1000);


const donatemodal = document.createElement("div");
donatemodal.id = "donatemodal";
const holdImg = document.createElement("img");
holdImg.id = "holdImg";
let imgPath = chrome.runtime.getURL("donatefirst.jpg")
holdImg.src = imgPath;
// donatemodal.appendChild(holdImg);
document.querySelector("html").appendChild(donatemodal);
donatemodal.style.backgroundImage = "url(" + imgPath + ")";
let toggledonate=1;
setInterval(() => {
  if(toggledonate){
    imgPath=chrome.runtime.getURL("donatesecond.jpg");
    document.querySelector("#donatemodal").style.backgroundImage = "url(" + imgPath + ")";
    
  }
  else{
    imgPath=chrome.runtime.getURL("donatefirst.jpg");
    document.querySelector("#donatemodal").style.backgroundImage = "url(" + imgPath + ")";
   
  }
  toggledonate=!toggledonate;
}, 5000);
setTimeout(() => {
  donatemodal.innerHTML=`
<div id="donatemodalheader">
  JiniCares: Feeding and Schooling Children of War Torn Countries
</div>
<div id="donatemodalbody">
 We are a non-profit organization, help us feed and educate orphaned children of countries like Syria, Congo, Ukraine. It'll only take a minute and you can change a child's life forever. 
</div>
<div id="donatemodalbuttons">
  <button id="donatemodalbutton1">Donate Once</button>
  <button id="donatemodalbutton2">Donate a Bit Monthly</button>
  <button id="donatemodalbutton3">Ask me later</button>
  <button id="donatemodalbutton4">Never Ask Again</button>

</div>
`;

document.querySelector("#donatemodalbutton1").addEventListener("click",function(){
  window.open("https://buy.stripe.com/cN27t2d8p1zidGwcMM","_blank");
  document.querySelector("#donatemodal").style.display="none";
  document.querySelector("#chatui").classList.toggle("hide");
});
document.querySelector("#donatemodalbutton2").addEventListener("click",function(){
  window.open("https://buy.stripe.com/00g3cM0lDb9S7i8289","_blank");
  document.querySelector("#donatemodal").style.display="none";
  document.querySelector("#chatui").classList.toggle("hide");
});
document.querySelector("#donatemodalbutton3").addEventListener("click",function(){
  document.querySelector("#donatemodal").style.display="none";
  document.querySelector("#chatui").classList.toggle("hide");
});

document.querySelector("#donatemodalbutton4").addEventListener("click",function(){
  document.querySelector("#donatemodal").style.display="none";
  document.querySelector("#chatui").classList.toggle("hide");
  chrome.storage.local.set({ jinidonate: "hide" }).then(() => {
    console.log("Don't ask again");
  });
});

}, 2000);
chrome.storage.local.get("jinicolor").then((result) => {
  if(!result.jinicolor){
    chrome.storage.local.set({ jinicolor: "orange" }).then(() => {
      console.log("Color set");
    });
  }
});





