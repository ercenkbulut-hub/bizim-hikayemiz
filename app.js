/**
 * 2. AY HEDİYESİ - ROMANTİK WEB SİTESİ
 * Birliktelik Başlangıcı: 8 Eylül 2026
 */

document.addEventListener('DOMContentLoaded', () => {
  initLoveCounter();
  initMusicPlayer();
  initLetterModal();
  initHeartCanvas();
  initCelebration();
});

/* ==========================================================================
   1. CANLI AŞK SAYACI (8 EYLÜL 2026'DAN İTİBAREN)
   ========================================================================== */
function initLoveCounter() {
  // 8 Eylül 2026 00:00:00
  const startDate = new Date(2026, 8, 8, 0, 0, 0); // Ay indeksi 0 tabanlıdır (8 = Eylül)

  const countDaysEl = document.getElementById('countDays');
  const countHoursEl = document.getElementById('countHours');
  const countMinutesEl = document.getElementById('countMinutes');
  const countSecondsEl = document.getElementById('countSeconds');
  const totalHoursStatEl = document.getElementById('totalHoursStat');
  const totalSecondsStatEl = document.getElementById('totalSecondsStat');

  function updateCounter() {
    const now = new Date();
    let diffMs = now - startDate;

    if (diffMs < 0) {
      diffMs = Math.abs(diffMs);
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const days = Math.floor(totalHours / 24);

    const hours = totalHours % 24;
    const minutes = totalMinutes % 60;
    const seconds = totalSeconds % 60;

    if (countDaysEl) countDaysEl.textContent = String(days).padStart(2, '0');
    if (countHoursEl) countHoursEl.textContent = String(hours).padStart(2, '0');
    if (countMinutesEl) countMinutesEl.textContent = String(minutes).padStart(2, '0');
    if (countSecondsEl) countSecondsEl.textContent = String(seconds).padStart(2, '0');

    if (totalHoursStatEl) {
      totalHoursStatEl.textContent = `${totalHours.toLocaleString('tr-TR')} saat`;
    }
    if (totalSecondsStatEl) {
      totalSecondsStatEl.textContent = `${totalSeconds.toLocaleString('tr-TR')} saniye`;
    }
  }

  updateCounter();
  setInterval(updateCounter, 1000);
}

/* ==========================================================================
   2. BİZİM ŞARKIMIZ - VİNTAGE PİKAP & MÜZİK OYNATICI ALTYAPISI
   ========================================================================== */
function initMusicPlayer() {
  const audioEl = document.getElementById('romanticAudio');
  const vinylDisc = document.getElementById('vinylDisc');
  const toneArm = document.getElementById('toneArm');
  const soundWave = document.getElementById('soundWave');
  const mainPlayBtn = document.getElementById('mainPlayBtn');
  const playIcon = document.getElementById('playIcon');
  const quickMusicBtn = document.getElementById('quickMusicBtn');
  const musicStatusPill = document.getElementById('musicStatusPill');
  const volumeSlider = document.getElementById('volumeSlider');
  const progressBarBg = document.getElementById('progressBarBg');
  const progressFill = document.getElementById('progressFill');
  const currentTimeLabel = document.getElementById('currentTimeLabel');
  const durationTimeLabel = document.getElementById('durationTimeLabel');

  let isPlaying = false;
  let useFallbackSynth = false;
  let audioContext = null;
  let synthInterval = null;
  let synthCurrentTime = 0;
  const synthDuration = 210; // 3:30 dakika

  // Romantik Akor Notaları (Yedek Melodi)
  const romanticMelodyNotes = [
    261.63, 329.63, 392.00, 493.88,
    220.00, 261.63, 329.63, 392.00,
    174.61, 220.00, 261.63, 329.63,
    196.00, 246.94, 293.66, 392.00
  ];

  function playSynthNote(freq, time, duration = 1.2) {
    if (!audioContext) return;
    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      const vol = (volumeSlider ? parseFloat(volumeSlider.value) : 0.75) * 0.22;
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(vol, time + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start(time);
      osc.stop(time + duration);
    } catch (e) {
      console.warn('Synth error', e);
    }
  }

  function startSynthesizer() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioCtx();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    let noteIdx = 0;
    synthInterval = setInterval(() => {
      if (!isPlaying) return;
      const now = audioContext.currentTime;
      const note = romanticMelodyNotes[noteIdx % romanticMelodyNotes.length];
      
      playSynthNote(note, now, 1.4);
      if (noteIdx % 2 === 0) {
        playSynthNote(note * 1.5, now + 0.25, 0.9);
      }

      noteIdx++;
      synthCurrentTime = (synthCurrentTime + 0.6) % synthDuration;
      updateProgressDisplay(synthCurrentTime, synthDuration);
    }, 600);
  }

  function stopSynthesizer() {
    if (synthInterval) {
      clearInterval(synthInterval);
      synthInterval = null;
    }
  }

  function setPlayerUI(playing) {
    isPlaying = playing;
    if (playing) {
      if (vinylDisc) vinylDisc.classList.add('spinning');
      if (toneArm) toneArm.classList.add('active');
      if (soundWave) soundWave.classList.add('active');
      if (playIcon) playIcon.textContent = '⏸';
      if (musicStatusPill) {
        musicStatusPill.innerHTML = '<span class="live-dot"></span> Çalıyor';
      }
    } else {
      if (vinylDisc) vinylDisc.classList.remove('spinning');
      if (toneArm) toneArm.classList.remove('active');
      if (soundWave) soundWave.classList.remove('active');
      if (playIcon) playIcon.textContent = '▶';
      if (musicStatusPill) {
        musicStatusPill.innerHTML = '<span class="live-dot" style="background:#888;"></span> Duraklatıldı';
      }
    }
  }

  function updateProgressDisplay(current, duration) {
    if (!duration || isNaN(duration)) return;
    const percent = Math.min((current / duration) * 100, 100);
    if (progressFill) progressFill.style.width = `${percent}%`;

    const cMin = Math.floor(current / 60);
    const cSec = Math.floor(current % 60);
    if (currentTimeLabel) {
      currentTimeLabel.textContent = `${cMin}:${String(cSec).padStart(2, '0')}`;
    }

    const dMin = Math.floor(duration / 60);
    const dSec = Math.floor(duration % 60);
    if (durationTimeLabel) {
      durationTimeLabel.textContent = `${dMin}:${String(dSec).padStart(2, '0')}`;
    }
  }

  function togglePlay() {
    if (!isPlaying) {
      // Audio etiketinden çalmayı dene
      if (audioEl && !useFallbackSynth) {
        const playPromise = audioEl.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setPlayerUI(true);
            })
            .catch(() => {
              // Dosya henüz eklenmemişse romantik melodiyi çal
              useFallbackSynth = true;
              startSynthesizer();
              setPlayerUI(true);
            });
        }
      } else {
        startSynthesizer();
        setPlayerUI(true);
      }
    } else {
      if (audioEl && !audioEl.paused) {
        audioEl.pause();
      }
      stopSynthesizer();
      setPlayerUI(false);
    }
  }

  // Audio dinleyicileri
  if (audioEl) {
    audioEl.volume = volumeSlider ? parseFloat(volumeSlider.value) : 0.75;

    audioEl.addEventListener('timeupdate', () => {
      if (!useFallbackSynth) {
        updateProgressDisplay(audioEl.currentTime, audioEl.duration);
      }
    });

    audioEl.addEventListener('ended', () => {
      setPlayerUI(false);
    });
  }

  // Buton Tıklamaları
  if (mainPlayBtn) mainPlayBtn.addEventListener('click', togglePlay);
  if (quickMusicBtn) {
    quickMusicBtn.addEventListener('click', () => {
      togglePlay();
      document.getElementById('bizim-sarkimiz')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Ses Seviyesi Kontrolü
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (audioEl) audioEl.volume = val;
    });
  }

  // İlerleme Çubuğuna Tıklama (Sarma)
  if (progressBarBg) {
    progressBarBg.addEventListener('click', (e) => {
      const rect = progressBarBg.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));

      if (audioEl && !useFallbackSynth && audioEl.duration) {
        audioEl.currentTime = ratio * audioEl.duration;
      } else {
        synthCurrentTime = ratio * synthDuration;
        updateProgressDisplay(synthCurrentTime, synthDuration);
      }
    });
  }
}

/* ==========================================================================
   3. MEKTUP MODALI (TIKLAYINCA AÇILAN PARŞÖMEN MEKTUP)
   ========================================================================== */
function initLetterModal() {
  const envelopeTrigger = document.getElementById('envelopeTrigger');
  const letterDialog = document.getElementById('letterDialog');
  const closeLetterBtn = document.getElementById('closeLetterBtn');

  // Zarfa tıklandığında mektup penceresini aç
  if (envelopeTrigger && letterDialog) {
    envelopeTrigger.addEventListener('click', () => {
      letterDialog.showModal();
      setTimeout(celebrateInLetter, 300);
    });

    envelopeTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        letterDialog.showModal();
        setTimeout(celebrateInLetter, 300);
      }
    });
  }

  // Kapatma butonu
  if (closeLetterBtn && letterDialog) {
    closeLetterBtn.addEventListener('click', () => letterDialog.close());
  }

  // Mektup dışına tıklandığında kapatma
  if (letterDialog) {
    letterDialog.addEventListener('click', (e) => {
      const rect = letterDialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        letterDialog.close();
      }
    });
  }
}

/* ==========================================================================
   4. ARKA PLAN KALP PARÇACIKLARI TUVALİ (CANVAS)
   ========================================================================== */
function initHeartCanvas() {
  const canvas = document.getElementById('heartCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = 35;

  class HeartParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 20;
      this.size = Math.random() * 12 + 6;
      this.speedY = Math.random() * 0.8 + 0.4;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.02;
      this.color = Math.random() > 0.3 ? 'rgba(224, 102, 133,' : 'rgba(255, 209, 220,';
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotSpeed;

      if (this.y < -30) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = `${this.color} ${this.opacity})`;

      const s = this.size;
      ctx.beginPath();
      ctx.moveTo(0, s / 4);
      ctx.quadraticCurveTo(0, 0, s / 4, 0);
      ctx.quadraticCurveTo(s / 2, 0, s / 2, s / 4);
      ctx.quadraticCurveTo(s / 2, 0, (3 * s) / 4, 0);
      ctx.quadraticCurveTo(s, 0, s, s / 4);
      ctx.quadraticCurveTo(s, s / 2, (3 * s) / 4, (3 * s) / 4);
      ctx.lineTo(s / 2, s);
      ctx.lineTo(s / 4, (3 * s) / 4);
      ctx.quadraticCurveTo(0, s / 2, 0, s / 4);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new HeartParticle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   5. KALP YAĞMURU VE KUTLAMA ANİMASYONU
   ========================================================================== */
/* ==========================================================================
   5. KALP YAĞMURU VE KUTLAMA ANİMASYONU (KESİN & KUSURSUZ ÇÖZÜM)
   ========================================================================== */
function initCelebration() {
  const heartRainBtn = document.getElementById('heartRainBtn');
  const celebrateBtn = document.getElementById('celebrateBtn');

  // Sayfa başındaki "Seni Seviyorum" butonu (Tüm ekrana yağdırır)
  if (heartRainBtn) {
    heartRainBtn.addEventListener('click', (e) => {
      e.preventDefault();
      heartRainBtn.animate([
        { transform: 'scale(0.92)' },
        { transform: 'scale(1.1)' },
        { transform: 'scale(1)' }
      ], { duration: 250 });
      celebrateOnScreen();
    });
  }

  // Mektup içindeki "Kalp Yağdır" butonu (Mektup kağıdının üzerine yağdırır)
  if (celebrateBtn) {
    celebrateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      celebrateBtn.animate([
        { transform: 'scale(0.92)' },
        { transform: 'scale(1.12)' },
        { transform: 'scale(1)' }
      ], { duration: 250 });
      celebrateInLetter();
    });
  }
}

// 1. MEKTUP İÇİ KALP YAĞMURU & PATLAMASI (Mektup açıldığında kağıt üzerinde görünür)
function celebrateInLetter() {
  const sheet = document.querySelector('.parchment-sheet');
  const celebrateBtn = document.getElementById('celebrateBtn');
  if (!sheet) return;

  const hearts = ['❤️', '💖', '💕', '✨', '🌹', '🤍', '🥰', '💗', '💞'];
  const sheetW = sheet.offsetWidth || 700;
  const sheetH = sheet.offsetHeight || 900;

  // Butonun mektup kağıdı içindeki göreceli koordinatları
  let originX = sheetW / 2;
  let originY = sheetH - 80;
  if (celebrateBtn) {
    const sheetRect = sheet.getBoundingClientRect();
    const btnRect = celebrateBtn.getBoundingClientRect();
    originX = btnRect.left - sheetRect.left + btnRect.width / 2;
    originY = btnRect.top - sheetRect.top + btnRect.height / 2;
  }

  // A) Butondan etrafa saçılan kalpler (Radial Explosion)
  const burstCount = 35;
  for (let i = 0; i < burstCount; i++) {
    const el = document.createElement('div');
    el.className = 'romantic-heart-fx';
    el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    
    const size = Math.random() * 20 + 18;
    el.style.left = `${originX}px`;
    el.style.top = `${originY}px`;
    el.style.fontSize = `${size}px`;
    sheet.appendChild(el);

    const angle = (Math.PI * 2 * i) / burstCount + (Math.random() - 0.5) * 0.4;
    const distance = Math.random() * 260 + 80;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance - (Math.random() * 80 + 40); // Yukarı doğru patlama
    const rotation = (Math.random() - 0.5) * 720;
    const duration = Math.random() * 600 + 1400;

    const anim = el.animate([
      { transform: 'translate(-50%, -50%) scale(0.2) rotate(0deg)', opacity: 1 },
      { transform: `translate(calc(-50% + ${destX * 0.7}px), calc(-50% + ${destY * 0.5}px)) scale(1.35) rotate(${rotation * 0.5}deg)`, opacity: 1, offset: 0.4 },
      { transform: `translate(calc(-50% + ${destX}px), calc(-50% + ${destY + 60}px)) scale(0.7) rotate(${rotation}deg)`, opacity: 0 }
    ], {
      duration: duration,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
    });

    anim.onfinish = () => el.remove();
  }

  // B) Mektup kağıdının tepesinden aşağı süzülen kalpler (Rain)
  const rainCount = 30;
  for (let i = 0; i < rainCount; i++) {
    const el = document.createElement('div');
    el.className = 'romantic-heart-fx';
    el.textContent = hearts[Math.floor(Math.random() * hearts.length)];

    const startX = Math.random() * (sheetW - 40) + 20;
    const startY = -30 - (Math.random() * 120);
    const size = Math.random() * 22 + 18;
    const duration = Math.random() * 2000 + 2200;
    const sway = (Math.random() - 0.5) * 120;

    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;
    el.style.fontSize = `${size}px`;
    sheet.appendChild(el);

    const anim = el.animate([
      { transform: 'translate(0px, 0px) scale(0.5) rotate(0deg)', opacity: 0 },
      { transform: `translate(${sway * 0.3}px, ${sheetH * 0.25}px) scale(1.15) rotate(${(Math.random() - 0.5) * 90}deg)`, opacity: 1, offset: 0.2 },
      { transform: `translate(${sway}px, ${sheetH + 60}px) scale(0.85) rotate(${(Math.random() - 0.5) * 360}deg)`, opacity: 0 }
    ], {
      duration: duration,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });

    anim.onfinish = () => el.remove();
  }
}

// 2. ANA SAYFA KALP YAĞMURU (Tüm ekranda görünür)
function celebrateOnScreen() {
  const heartRainBtn = document.getElementById('heartRainBtn');
  const hearts = ['❤️', '💖', '💕', '✨', '🌹', '🤍', '🥰', '💗', '💞'];
  
  let originX = window.innerWidth / 2;
  let originY = 80;
  if (heartRainBtn) {
    const rect = heartRainBtn.getBoundingClientRect();
    originX = rect.left + rect.width / 2;
    originY = rect.bottom;
  }

  // A) Butondan etrafa saçılma
  const burstCount = 35;
  for (let i = 0; i < burstCount; i++) {
    const el = document.createElement('div');
    el.className = 'romantic-heart-fx-fixed';
    el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    
    const size = Math.random() * 20 + 18;
    el.style.left = `${originX}px`;
    el.style.top = `${originY}px`;
    el.style.fontSize = `${size}px`;
    document.body.appendChild(el);

    const angle = (Math.PI * 2 * i) / burstCount + (Math.random() - 0.5) * 0.5;
    const distance = Math.random() * 240 + 70;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance + (Math.random() * 60 + 20);
    const rotation = (Math.random() - 0.5) * 720;
    const duration = Math.random() * 700 + 1300;

    const anim = el.animate([
      { transform: 'translate(-50%, -50%) scale(0.2) rotate(0deg)', opacity: 1 },
      { transform: `translate(calc(-50% + ${destX * 0.7}px), calc(-50% + ${destY * 0.5}px)) scale(1.3) rotate(${rotation * 0.5}deg)`, opacity: 1, offset: 0.4 },
      { transform: `translate(calc(-50% + ${destX}px), calc(-50% + ${destY + 80}px)) scale(0.7) rotate(${rotation}deg)`, opacity: 0 }
    ], {
      duration: duration,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
    });

    anim.onfinish = () => el.remove();
  }

  // B) Tüm ekran boyunca gökten yağan kalpler
  const rainCount = 40;
  for (let i = 0; i < rainCount; i++) {
    const el = document.createElement('div');
    el.className = 'romantic-heart-fx-fixed';
    el.textContent = hearts[Math.floor(Math.random() * hearts.length)];

    const startX = Math.random() * window.innerWidth;
    const startY = -40 - (Math.random() * 100);
    const size = Math.random() * 22 + 18;
    const duration = Math.random() * 2200 + 2000;
    const sway = (Math.random() - 0.5) * 160;

    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;
    el.style.fontSize = `${size}px`;
    document.body.appendChild(el);

    const anim = el.animate([
      { transform: 'translate(0px, 0px) scale(0.5) rotate(0deg)', opacity: 0 },
      { transform: `translate(${sway * 0.3}px, ${window.innerHeight * 0.3}px) scale(1.15) rotate(${(Math.random() - 0.5) * 90}deg)`, opacity: 1, offset: 0.2 },
      { transform: `translate(${sway}px, ${window.innerHeight + 80}px) scale(0.85) rotate(${(Math.random() - 0.5) * 360}deg)`, opacity: 0 }
    ], {
      duration: duration,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });

    anim.onfinish = () => el.remove();
  }
}

// Genel erişim için fonksiyonlar
window.celebrateInLetter = celebrateInLetter;
window.celebrateOnScreen = celebrateOnScreen;
window.triggerConfetti = function() {
  const letterDialog = document.getElementById('letterDialog');
  if (letterDialog && letterDialog.open) {
    celebrateInLetter();
  } else {
    celebrateOnScreen();
  }
};
