// creating and inporting all the interactables 
const playBtn = document.querySelector('.playbtn');
const screens = document.querySelectorAll('.screen');
const colorBox = document.querySelector('.showColor');
const colorName = document.querySelector('#color');
const replayBtn = document.querySelector('#replayBtn');
const nextBtn = document.querySelector('#nextBtn');
const selectionBlocks = document.querySelectorAll('.selection');
const musicBtn = document.querySelector(".music");
const bgAudio = document.querySelector(".bgAudio");
const ruleBook = document.querySelector('.openRules');
const rulesMenu = document.querySelector('#rulesMenu');
const menuCloseBtn = document.querySelectorAll('.closeRulesBtn');

// window.addEventListener("beforeunload",(event)=>{
//     event.preventDefault();
// });

//render one screen and set display none to other's  
function renderScreen(screenId) {
    screens.forEach((scr) => {
        scr.style.display = "none";
    })
    // selected screen will be displayed as block 
    document.querySelector(`#${screenId}`).style.display = "block";
    console.log(`rendered ${screenId}`)
    return 0;
}
let mute = false;
musicBtn.addEventListener('click',()=>{
    bgAudio.defaultMuted = false;
    bgAudio.muted = false;
    bgAudio.paused = false;
    console.dir(bgAudio);
    if(mute){
        //mute
        bgAudio.volume = 0;
        musicBtn.src = "/images/unmute.png";
        mute = false;
    }else{
        //unmute 
        bgAudio.volume = 1;
        musicBtn.src = "/images/mute.png";
        mute = true;
    }
});

ruleBook.addEventListener('click',()=>{
    rulesMenu.style.display = "flex";
})
menuCloseBtn.forEach((btn)=>{
    btn.addEventListener('click',()=>{
        rulesMenu.style.display = "none";
    })
})
// initialise with start 
renderScreen('start');

//all colors in js
const allColors = [
    "gray",
    "red",
    "orange",
    "yellow",
    "green",
    "teal",
    "cyan",
    "blue",
    "indigo",
    "purple",
    "pink"
];

// collecting all the colors in a array 
let wins = 0;
let currentwins = 0;
let currentSequence = [];
let canReplay = 3;

//generate sequence
function generateSequence() {
    //k is the no of wins -- giving us the no of chances played 
    let k = 0;
    if (wins === 0){
        k = 4;
    } else if (wins === 1){
        k = 3;
    } else if(wins === 2){
        k = 2;
    }else{
        k = 1;
    }
    for (let i = 0; i < k; i++) {
        currentSequence.push(allColors[Math.floor(Math.random() * allColors.length)])
    }
    return k;
}

// function to show sequence - old (used in replay to replay the same sequence if its olr - i.e replay - generally  not)
function showSequence(old = false) {
    // render the sequence screen  
    let k;
    renderScreen('sequence');
    if (!(old)) {
        //generate sequence based on the wins --> the i'th no of game
        k = generateSequence();
    }
    // FCP - for coding purposes 
    console.log(currentSequence)
    // change inner text so that replay dosnt show last color at first 
    if(wins>0){
        colorName.innerText = `${k} More!`;
    }else{
        colorName.innerText = 'Remember';
    }
    // change color and name of color at time interval 
    function changeColor(i, t) {
        //this queues a leaving the thread empty for other tasks 
        setTimeout(() => {
            colorBox.style.backgroundColor = `${currentSequence[i]}`;
            colorName.innerText = `${i + 1} ${currentSequence[i]}`;
            console.dir(i, colorName)
            console.log('changed to ', colorBox.style.backgroundColor, "at time", t)
        }, t)
        return;
    }
    let t = 1200;
    for (let i = 0; i < currentSequence.length; i++) {
        changeColor(i, t)
        t += 1200;
    }
    setTimeout(() => {
        if(wins>2 && canReplay>0){
            renderScreen('replay');
        }else{
            renderScreen("playScr");
            inputValiadation();
        }
    }, 1200*(currentSequence.length + 1))
}

//play the sequence - activate
playBtn.addEventListener("click", () => {
    showSequence();
})
//replay the sequence - activate 
replayBtn.addEventListener('click', () => {
    t = 0;
    canReplay -=1;
    replayBtn.innerText = `🔁 Replay - ${canReplay} left!`;
    showSequence(true);
})

let mainBlock = null;

// score calculation and reset wins
function showScore(){
    let score = 0;
    //score calculation
    // {
    //     score:
    //     round 1 : 100 -- 4 color's 
    //     round 2 : 150 -- 7 color's 
    //     round 3 : 200 -- 9 color's 
    //     round 4 + : 100 for each color!! -- 10+ color's
    //     --50 points for each correct color in any rounds sequence.
    //         Note : if you loose in between you get only 50 points for each color.But on win you get 100 points for each color!
    // }
    if(wins>3){
        score = 50*currentwins;
        let noOfColors = 9;
        for(let i=0;i<wins-3;i++){
            noOfColors +=1
            score += 100*noOfColors;
        }
    }
    else if(wins === 3){
        score = 450 + 50*currentwins;
    }else if(wins === 2){
        score = 250 + 50*currentwins;
    }else if(wins === 1){
        score = 100 + 50*currentwins;
    }else{
        score = 50*currentwins;
    }
    // updating the DOM with new score
    console.log("updating score");
    document.querySelector(".finalScore").innerText = `${score}`;
    if(document.querySelector(".highScore").innerText <= score){
        console.log("checking for high score!");
        document.querySelector(".highScore").innerText = `${score}`;
    }
    console.log("process finished");
    // restart game !
    document.querySelector('#restartBtn').addEventListener("click", ()=>{
        console.log("restarting")
        currentwins = 0;
        wins = 0;
        currentSequence = [];
        renderScreen("sequence");
        showSequence();
    })
}

// adding event listener to all blocks 
selectionBlocks.forEach((block) => {
    block.addEventListener('click', () => {
        console.log(`selected block - ${block.id}`)
        //wrong selecton case 
        if (block.id !== mainBlock.id) {
            console.log(`wrong block selected - ${block.id}. ${mainBlock.id} to be selected`);
            console.log(wins,currentwins)
            showScore();
            renderScreen('result');
            wins = 0;
            currentwins = 0;
        }
        //correct selection case
        else {
            console.log('correct color selected');
            currentwins += 1;
            console.log(currentwins);
            console.log('')
            inputValiadation();
        }
    })
})

// analysing the input
function inputValiadation() {
    // base case 
    if (currentwins == currentSequence.length) {
        console.log('you won!');
        currentwins = 0;
        wins += 1;
        console.log("wins + 1");
        renderScreen("sequence");
        showSequence();
        return;
    }
    // main block selection
    mainBlock = [selectionBlocks][0][Math.floor(Math.random() * selectionBlocks.length)];
    console.dir(`main block - ${mainBlock.id}`)
    // changing color's -------
    // all blocks 
    selectionBlocks.forEach((block) => {
        let bgColor = Math.floor(Math.random() * (allColors.length));
        if (allColors[bgColor] == currentSequence[currentwins] && bgColor > 1) {
            block.style.backgroundColor = `${allColors[bgColor - 1]}`;
        } else if (allColors[bgColor] == currentSequence[currentwins] && bgColor <= 1) {
            block.style.backgroundColor = `${allColors[bgColor + 1]}`;
        } else {
            block.style.backgroundColor = `${allColors[bgColor]}`;
        }
    })
    console.log('changed color of all blocks');
    // main block - color change 
    mainBlock.style.backgroundColor = currentSequence[currentwins];
    console.log("changed color of main block");
    // interaction handeling -- 
    console.log(`main block - ${mainBlock.id}`)

}
// play the real game - activate
nextBtn.addEventListener('click', () => {
    renderScreen('playScr');
    inputValiadation();
})
