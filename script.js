let percent = 0;
let started = false;

/* Soft vibration helper */
function vibrateSoft(){
  if(navigator.vibrate){
    try{ navigator.vibrate([30,40,30]); }catch(e){}
  }
}

/* Play love song with fade-in */
function playLoveSong(){
  const loveSong = document.getElementById("loveSong");
  if(!loveSong) return;
  try{
    loveSong.volume = 0;
    loveSong.currentTime = 0;
    loveSong.play().catch(()=>{});
  }catch(e){}
  let vol = 0;
  const fade = setInterval(()=>{
    vol = Math.min(1, vol + 0.05);
    loveSong.volume = vol;
    if(vol >= 1) clearInterval(fade);
  },200);
}

function startLove(){
  if(started) return;
  started = true;

  const heart = document.getElementById("heart");
  const percentText = document.getElementById("percent");
  const loadingBar = document.getElementById("loadingBar");
  const bgMusic = document.getElementById("bgMusic");
  const heartbeat = document.getElementById("heartbeat");
  const popSound = document.getElementById("popSound");
  const loveSong = document.getElementById("loveSong");

  // vibrate on initial tap for tactile feedback
  vibrateSoft();

  // Try to play background music; many browsers require a user gesture (we have one)
  if(bgMusic){
    bgMusic.currentTime = 0;
    bgMusic.volume = 0.7;
    bgMusic.play().catch(()=>{ /* ignore play errors */ });
  }

  // start heartbeat looped sound during loading
  if(heartbeat){
    heartbeat.currentTime = 0;
    heartbeat.volume = 0.5;
    heartbeat.play().catch(()=>{});
  }

  // gentle pulse
  heart.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(1.03)' },
    { transform: 'scale(1)' }
  ], { duration: 700, iterations: Infinity });

  const interval = setInterval(()=>{
    percent = Math.min(100, percent + (percent < 60 ? 1 : 0.6)); // smooth easing
    const display = Math.floor(percent);
    percentText.innerText = display + "%";
    loadingBar.style.width = percent + "%";
    // gradient fill grows from bottom to top visually — use linear-gradient with percent
    heart.style.background = `linear-gradient(to top, var(--pink-2) ${percent}%, white ${percent}%)`;

    // make love song follow percent volume while loading (if available)
    if(loveSong){
      try{
        loveSong.volume = Math.min(0.95, percent/100);
      }catch(e){}
    }

    if(percent >= 100){
      clearInterval(interval);

      // stop heartbeat immediately
      if(heartbeat){
        try{
          heartbeat.pause();
          heartbeat.currentTime = 0;
        }catch(e){}
      }

      // vibrate softly at completion
      vibrateSoft();

      // make number float up
      percentText.classList.add("float-up");

      // add glow pulse so it's visible while pieces burst
      heart.classList.add("glow");

      // burst heart into pieces (vibrate inside)
      heartBurst();

      // slight delay to let burst start, then play pop sound
      setTimeout(()=>{
        popSound.currentTime = 0;
        popSound.volume = 0.9;
        popSound.play().catch(()=>{});
      },120);

      // start love song fade-in once pop triggers
      setTimeout(()=>{
        playLoveSong();
      },200);

      // after visual sequence, proceed to cinematic blur & reveal
      setTimeout(()=>{
        showReveal();
      },900);
    }
  },25);
}

/* Reveal transition with cinematic blur and typing kick-off */
function showReveal(){
  const hero = document.getElementById("hero");
  const reveal = document.getElementById("reveal");

  // add blur + gentle scale
  hero.classList.add("blur");

  // start fading out shortly after blur begins
  setTimeout(()=>{
    hero.style.opacity = 0;
  },400);

  // after cinematic blur + fade, hide hero and show reveal, then type
  setTimeout(()=>{
    hero.style.display = "none";
    reveal.style.opacity = 1;
    reveal.style.pointerEvents = "auto";
    reveal.setAttribute('aria-hidden', 'false');

    // reveal typing text
    typingEffect(
      "ตั้งแต่มีฟางเข้ามาโลกของพีมก็ดูอบอุ่นขึ้นมากๆเลย พีมไม่รู้ว่าอนาคตจะเขียนว่ายังไง แต่ถ้าเลือกได้…พีมอยากมีฟางอยู่ในทุกบทของมันนะครับ 💖",
      "typingText",
      40
    );

    // show the floating music player (if initialized) so user sees and can control the song
    if(window.__showMusicPlayer){
      try{ window.__showMusicPlayer(); }catch(e){}
    }
  },1200);
}

/* Typing effect */
function typingEffect(text, elementId, speed=50){
  let i = 0;
  const element = document.getElementById(elementId);
  if(!element) return;
  element.innerHTML = "";
  const typing = setInterval(()=>{
    element.innerHTML += text.charAt(i);
    i++;
    if(i >= text.length){
      clearInterval(typing);
    }
  }, speed);
}

/* Petals + Sparkles */
setInterval(()=>{
  const petal = document.createElement("div");
  petal.classList.add("petal");
  petal.innerText = "🌸";
  petal.style.left = Math.random()*100 + "vw";
  petal.style.fontSize = (12 + Math.random()*18) + "px";
  petal.style.animationDuration = (4 + Math.random()*3) + "s";
  petal.style.opacity = 0.95;
  petal.style.transform = `rotate(${Math.random()*360}deg)`;

  document.getElementById("petal-container").appendChild(petal);

  // ensure removal after animation
  setTimeout(()=> petal.remove(), 8000);
},500);

/* Heart burst pieces */
function heartBurst(){
  const container = document.getElementById("burst-container");
  if(!container) return;

  // small vibration on burst for extra tactile feedback
  vibrateSoft();

  for(let i=0;i<18;i++){
    const piece = document.createElement("div");
    piece.classList.add("petal-burst");

    // position at heart center (approx)
    const heartRect = document.getElementById("heart").getBoundingClientRect();
    const parentRect = document.body.getBoundingClientRect();
    const startLeft = heartRect.left + heartRect.width / 2 - parentRect.left;
    const startTop = heartRect.top + heartRect.height / 2 - parentRect.top;

    piece.style.left = startLeft + "px";
    piece.style.top = startTop + "px";

    const angle = Math.random()*2*Math.PI;
    const distance = 60 + Math.random()*60;

    const x = Math.cos(angle)*distance + "px";
    const y = Math.sin(angle)*distance + "px";

    piece.style.setProperty("--x", x);
    piece.style.setProperty("--y", y);

    container.appendChild(piece);

    // remove after animation completes
    setTimeout(()=> {
      try{ piece.remove(); }catch(e){}
    },1100);
  }
}

/* tactile vibrate when tapping the heart (additional feedback) */
document.addEventListener("DOMContentLoaded", ()=>{
  const heart = document.getElementById("heart");
  if(heart){
    heart.addEventListener("click", ()=>{
      vibrateSoft();
    }, {passive:true});
  }

  // Music player controls init
  const musicPlayer = document.getElementById("musicPlayer");
  const musicDisc = document.getElementById("musicDisc");
  const songTitle = document.getElementById("songTitle");
  const loveSong = document.getElementById("loveSong");

  if(musicPlayer && musicDisc && loveSong){
    // toggle play/pause on click or keyboard activation
    const toggleMusic = ()=>{
      if(loveSong.paused){
        loveSong.play().catch(()=>{});
        musicDisc.classList.add("spin");
      }else{
        loveSong.pause();
        musicDisc.classList.remove("spin");
      }
    };
    musicPlayer.addEventListener("click", toggleMusic);
    musicPlayer.addEventListener("keydown", (e)=>{
      if(e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleMusic();
      }
    });

    // When the reveal shows, expose the music player and start spin (play already started by sequence)
    // Attach a short helper so showReveal() can pick it up if needed
    window.__showMusicPlayer = ()=>{
      musicPlayer.style.display = "flex";
      // if the song is already playing, spin; if not, still start spinning to indicate available control
      if(!loveSong.paused){
        musicDisc.classList.add("spin");
      }
    };
  }
});