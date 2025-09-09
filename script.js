const gameEI = document.getElementById("game");
const binEI = document.getElementById("bin");
const levelEI = document.getElementById("level");
const recycleEI = document.getElementById("recycle");
const startBtn = document.getElementById("startBtn");

let level = 1;
let recycle = 0;
let audioCtx;

const foods = ["🍎","🍔","🍕","🥦","🍌","🌽","🍇","🍩"];

// شروع بازی
startBtn.addEventListener("click", () => {
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  startBtn.style.display = "none";
  spawnTrash(); // اولین غذا
});

// تابع صدا بدون فایل
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

// بررسی برخورد غذا با سطل
function checkTrashInBin(trash){
  const tRect = trash.getBoundingClientRect();
  const bRect = binEI.getBoundingClientRect();

  const trashCenterX = tRect.left + tRect.width/2;
  const trashCenterY = tRect.top + tRect.height/2;
  const binCenterX = bRect.left + bRect.width/2;
  const binCenterY = bRect.top + bRect.height/2;

  const distance = Math.hypot(trashCenterX-binCenterX, trashCenterY-binCenterY);

  if(distance < bRect.width/2){
    // غذا داخل سطل
    trash.remove();
    recycle++;
    recycleEI.textContent = recycle; // نمایش امتیاز
    playBeep(600,150);

    // هر 5 غذا Level افزایش می‌یابد
    if(recycle % 5 === 0){
      level++;
      levelEI.textContent = level;
      playBeep(900,300);
    }

    binEI.classList.add("active");
    setTimeout(()=>binEI.classList.remove("active"),300);

    // یک غذا جدید بساز
    spawnTrash();
  }
}

// ایجاد غذا و Drag & Drop
function spawnTrash(){
  const trash = document.createElement("div");
  trash.className="trash";
  trash.textContent = foods[Math.floor(Math.random()*foods.length)];
  trash.style.left = Math.random()*(gameEI.clientWidth-50)+"px";
  trash.style.top = Math.random()*50+"px";
  gameEI.appendChild(trash);

  let dragging=false, offsetX=0, offsetY=0;

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
    x = Math.max(0, Math.min(gameEI.clientWidth-50, x));
    y = Math.max(0, Math.min(gameEI.clientHeight-50, y));
    trash.style.left = x+"px";
    trash.style.top = y+"px";

    // حلقه نورانی نزدیک سطل
    const tRect = trash.getBoundingClientRect();
    const bRect = binEI.getBoundingClientRect();
    const dx = (tRect.left+tRect.width/2) - (bRect.left+bRect.width/2);
    const dy = (tRect.top+tRect.height/2) - (bRect.top+bRect.height/2);
    const dist = Math.hypot(dx, dy);
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

  trash.addEventListener("mousedown", startDrag);
  trash.addEventListener("touchstart", startDrag);
  trash.addEventListener("mouseup", stopDrag);
  trash.addEventListener("touchend", stopDrag);
}
