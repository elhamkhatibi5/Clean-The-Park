const gameEI = document.getElementById("game");
const binEI = document.getElementById("bin");
const levelEI = document.getElementById("level");
const recycleEI = document.getElementById("recycle");
const startBtn = document.getElementById("startBtn");

let level = 1;
let recycle = 0;
let audioCtx;
let trashFallInterval;

const foods = ["🍎","🍔","🍕","🥦","🍌","🌽","🍇","🍩"];

startBtn.addEventListener("click", () => {
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  startBtn.style.display = "none";
  spawnTrash();
  trashFallInterval = setInterval(spawnTrash, 1500); // هر 1.5 ثانیه غذا جدید
});

function playBeep(freq=440, duration=150){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  osc.start();
  osc.stop(audioCtx.currentTime + duration/1000);
}

function checkTrashInBin(trash){
  const tLeft = parseFloat(trash.style.left);
  const tTop = parseFloat(trash.style.top);
  const tCenterX = tLeft + trash.offsetWidth/2;
  const tCenterY = tTop + trash.offsetHeight/2;

  const bLeft = binEI.offsetLeft;
  const bTop = binEI.offsetTop;
  const bCenterX = bLeft + binEI.offsetWidth/2;
  const bCenterY = bTop + binEI.offsetHeight/2;

  const distance = Math.hypot(tCenterX-bCenterX, tCenterY-bCenterY);

  if(distance < binEI.offsetWidth/2){
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

// --- ایجاد غذا و Drag & Drop + سقوط ---
function spawnTrash(){
  const trash = document.createElement("div");
  trash.className="trash";
  trash.textContent = foods[Math.floor(Math.random()*foods.length)];
  trash.style.left = Math.random()*(gameEI.clientWidth-50)+"px";
  trash.style.top = "0px";
  gameEI.appendChild(trash);

  // Drag & Drop
  let dragging=false, offsetX=0, offsetY=0;
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

    const gameRect = gameEI.getBoundingClientRect();
    let x = clientX - offsetX - gameRect.left;
    let y = clientY - offsetY - gameRect.top;
    x = Math.max(0, Math.min(gameEI.clientWidth-50, x));
    y = Math.max(0, Math.min(gameEI.clientHeight-50, y));
    trash.style.left = x+"px";
    trash.style.top = y+"px";

    const tCenterX = x + trash.offsetWidth/2;
    const tCenterY = y + trash.offsetHeight/2;
    const bCenterX = binEI.offsetLeft + binEI.offsetWidth/2;
    const bCenterY = binEI.offsetTop + binEI.offsetHeight/2;
    const dist = Math.hypot(tCenterX-bCenterX, tCenterY-bCenterY);
    if(dist < 100){
      binEI.classList.add("glow");
    } else {
      binEI.classList.remove("glow");
    }
  }

  function stopDrag(){
    dragging=false;
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", stopDrag);
    document.removeEventListener("touchmove", drag);
    document.removeEventListener("touchend", stopDrag);
    checkTrashInBin(trash);
    binEI.classList.remove("glow");
  }

  trash.addEventListener("mouseup", stopDrag);
  trash.addEventListener("touchend", stopDrag);

  // --- Falling animation ---
  let fallSpeed = 1 + level*0.5;
  function fall(){
    if(dragging) { requestAnimationFrame(fall); return; }
    let top = parseFloat(trash.style.top);
    top += fallSpeed;
    trash.style.top = top + "px";

    checkTrashInBin(trash);

    if(top < gameEI.clientHeight-50) requestAnimationFrame(fall);
    else trash.remove();
  }
  requestAnimationFrame(fall);
}
