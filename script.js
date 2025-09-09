const gameEI = document.getElementById("game");
const binEI = document.getElementById("bin");
const levelEI = document.getElementById("level");
const recycleEI = document.getElementById("recycle");
const startBtn = document.getElementById("startBtn");

let level = 1;
let recycle = 0;
let audioCtx;
let trashInterval;

const foods = ["🍎","🍔","🍕","🥦","🍌","🌽","🍇","🍩"];

// Start Game
startBtn.addEventListener("click", () => {
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  startBtn.style.display = "none";
  createTrash(); // اولین غذا
  trashInterval = setInterval(createTrash, 1000); // هر ثانیه غذا
});

// صدا با Web Audio API
function playBeep(frequency = 440, duration = 150){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration/1000);
}

// بررسی برخورد غذا با سطل
function isOverlapping(el1, el2){
  const r1 = el1.getBoundingClientRect();
  const r2 = el2.getBoundingClientRect();
  const centerX = r1.left + r1.width/2;
  const centerY = r1.top + r1.height/2;
  return (centerX >= r2.left && centerX <= r2.right &&
          centerY >= r2.top && centerY <= r2.bottom);
}

// ایجاد غذا و Drag & Drop
function createTrash(){
  const trash = document.createElement("div");
  trash.className = "trash";
  trash.textContent = foods[Math.floor(Math.random()*foods.length)];
  trash.style.left = Math.random()*(gameEI.clientWidth-60) + "px";
  trash.style.top = Math.random()*50 + "px";
  gameEI.appendChild(trash);

  let offsetX=0, offsetY=0, dragging=false;

  trash.addEventListener("mousedown", startDrag);
  trash.addEventListener("touchstart", startDrag);

  function startDrag(e){
    dragging=true;
    const rect = trash.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;

    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchmove", drag, {passive:false});
    document.addEventListener("touchend", stopDrag);
  }

  function drag(e){
    if(!dragging) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    let x = clientX - offsetX - gameEI.getBoundingClientRect().left;
    let y = clientY - offsetY - gameEI.getBoundingClientRect().top;
    x = Math.max(0, Math.min(gameEI.clientWidth-60, x));
    y = Math.max(0, Math.min(gameEI.clientHeight-60, y));
    trash.style.left = x+"px";
    trash.style.top = y+"px";
  }

  function stopDrag(){
    dragging=false;
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", stopDrag);
    document.removeEventListener("touchmove", drag);
    document.removeEventListener("touchend", stopDrag);

    if(isOverlapping(trash, binEI)){
      trash.remove();
      recycle++;
      recycleEI.textContent = recycle;
      playBeep(600,150);
      if(recycle % 5 === 0){
        level++;
        levelEI.textContent = level;
        playBeep(900,300);
      }
      binEI.classList.add("active");
      setTimeout(()=>binEI.classList.remove("active"),300);
    }
  }

  trash.addEventListener("mouseup", stopDrag);
  trash.addEventListener("touchend", stopDrag);
}
