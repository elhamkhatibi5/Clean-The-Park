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

// 🎮 Start Game
startBtn.addEventListener("click", () => {
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  startBtn.style.display = "none";
  createTrash();
  trashInterval = setInterval(createTrash, 1500); // هر ۱.۵ ثانیه یک غذا
});

// 🎵 صدا با Web Audio API
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

// 🗑️ بررسی اینکه آیا غذا داخل سطل افتاده؟
function checkTrashInBin(trash){
  const trashRect = trash.getBoundingClientRect();
  const binRect = binEI.getBoundingClientRect();
  const trashCenterX = trashRect.left + trashRect.width/2;
  const trashCenterY = trashRect.top + trashRect.height/2;

  if(trashCenterX >= binRect.left && trashCenterX <= binRect.right &&
     trashCenterY >= binRect.top && trashCenterY <= binRect.bottom){
    
    trash.remove(); // حذف غذا
    recycle++;
    recycleEI.textContent = recycle;

    playBeep(600,150); // صدای امتیاز
    
    if(recycle % 5 === 0){
      level++;
      levelEI.textContent = level;
      playBeep(900,300); // صدای تغییر لول
    }

    // افکت سطل
    binEI.classList.add("active");
    setTimeout(()=>binEI.classList.remove("active"),300);

    return true;
  }
  return false;
}

// 🍎 ساخت غذا و Drag & Drop
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

    // نزدیک شدن → سطل روشن شه
    const trashRect = trash.getBoundingClientRect();
    const binRect = binEI.getBoundingClientRect();
    const dx = (trashRect.left + trashRect.width/2) - (binRect.left + binRect.width/2);
    const dy = (trashRect.top + trashRect.height/2) - (binRect.top + binRect.height/2);
    const distance = Math.sqrt(dx*dx + dy*dy);

    if(distance < 100){
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

    // فقط اگر انداخته شد → حذف و امتیاز
    checkTrashInBin(trash);

    binEI.classList.remove("glow");
  }
}
