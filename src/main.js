import { SpaceScene } from './scene.js';
import { sound } from './audio.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Three.js 3D Scene
  const canvasContainer = document.getElementById('canvas-container');
  let scene = null;

  try {
    scene = new SpaceScene(canvasContainer);
  } catch (err) {
    console.error('Failed to initialize 3D scene:', err);
  }

  // 2. Audio Controller Integration
  const soundBtn = document.getElementById('btn-sound');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const isAudible = sound.toggleMute();
      if (isAudible) {
        soundBtn.classList.add('active');
        sound.playBeep(980, 0.08);
      } else {
        soundBtn.classList.remove('active');
      }
    });
  }

  // Add click sound effects to all buttons
  document.querySelectorAll('button, a.btn-primary, a.btn-secondary').forEach((elem) => {
    elem.addEventListener('mouseenter', () => {
      sound.playBeep(1400, 0.03);
    });
    elem.addEventListener('click', () => {
      sound.playClick();
    });
  });

  // 3. Interactive 3D Lab Controls
  const camButtons = document.querySelectorAll('.control-btn[data-cam]');
  camButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      camButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const camKey = btn.dataset.cam;
      if (scene) {
        scene.setCameraView(camKey);
      }
    });
  });

  // Hotspot Pins on 3D Stage
  document.querySelectorAll('.hotspot-pin[data-cam]').forEach((pin) => {
    pin.addEventListener('click', () => {
      const camKey = pin.dataset.cam;
      if (scene) {
        scene.setCameraView(camKey);
        sound.playBeep(1200, 0.08);
      }
      camButtons.forEach((b) => {
        b.classList.toggle('active', b.dataset.cam === camKey);
      });
    });
  });

  // Wireframe Toggle
  const wireframeBtn = document.getElementById('btn-wireframe');
  if (wireframeBtn) {
    wireframeBtn.addEventListener('click', () => {
      if (scene) {
        const active = scene.toggleWireframe();
        wireframeBtn.classList.toggle('active', active);
        sound.playBeep(active ? 1100 : 700, 0.06);
      }
    });
  }

  // Throttle Boost
  const boostBtn = document.getElementById('btn-boost');
  const hudThrustStatus = document.getElementById('hud-thrust-status');
  let isBoostActive = false;

  if (boostBtn) {
    boostBtn.addEventListener('click', () => {
      isBoostActive = !isBoostActive;
      boostBtn.classList.toggle('active', isBoostActive);

      if (scene) {
        scene.setEngineBoost(isBoostActive);
      }
      sound.setEngineBoost(isBoostActive);

      if (hudThrustStatus) {
        if (isBoostActive) {
          hudThrustStatus.textContent = 'MPD AFTERBURNER // 128 kW [FULL ION FLOW]';
          hudThrustStatus.style.color = '#f59e0b';
        } else {
          hudThrustStatus.textContent = 'MPD CRUISE // 42 kW';
          hudThrustStatus.style.color = 'var(--accent-cyan)';
        }
      }
    });
  }

  // Lighting Mode Toggle
  const lightingBtn = document.getElementById('btn-lighting');
  if (lightingBtn) {
    lightingBtn.addEventListener('click', () => {
      if (scene) {
        const mode = scene.toggleLighting();
        lightingBtn.classList.toggle('active', mode === 'deep');
        sound.playBeep(mode === 'deep' ? 600 : 900, 0.06);
      }
    });
  }

  // Live HUD orientation telemetry loop
  const hudOrientation = document.getElementById('hud-orientation');
  if (hudOrientation && scene) {
    setInterval(() => {
      if (scene.shipGroup) {
        const rotX = (scene.shipGroup.rotation.x * (180 / Math.PI)).toFixed(1);
        const rotY = (scene.shipGroup.rotation.y * (180 / Math.PI)).toFixed(1);
        const rotZ = (scene.shipGroup.rotation.z * (180 / Math.PI)).toFixed(1);
        hudOrientation.textContent = `R: ${rotZ}° P: ${rotX}° Y: ${rotY}°`;
      }
    }, 100);
  }

  // 4. Mission Simulator & Payload Calculator
  const sliderPayload = document.getElementById('slider-payload');
  const displayPayload = document.getElementById('display-payload');
  const orbitOptions = document.querySelectorAll('.orbit-option-btn');
  const selectWindow = document.getElementById('select-window');

  const resDeltaV = document.getElementById('res-delta-v');
  const resTransit = document.getElementById('res-transit');
  const resCostKg = document.getElementById('res-cost-kg');
  const resTotalCost = document.getElementById('res-total-cost');

  let currentDestination = 'leo';

  const destinationData = {
    leo: { deltaV: 3920, transitHours: 2.4, baseCostKg: 1450 },
    geo: { deltaV: 7850, transitHours: 28.5, baseCostKg: 2200 },
    lunar: { deltaV: 11400, transitHours: 82.0, baseCostKg: 3800 },
    mars: { deltaV: 14800, transitHours: 2832.0, baseCostKg: 6900 }
  };

  function updateSimulation() {
    const payload = parseInt(sliderPayload.value, 10);
    displayPayload.textContent = `${payload.toLocaleString()} kg`;

    const data = destinationData[currentDestination];
    const isExpedited = selectWindow.value === 'expedited';
    const multiplier = isExpedited ? 1.35 : 1.0;

    // Delta V formula
    const finalDeltaV = Math.round(data.deltaV * (1 + (payload / 25000) * 0.15));

    // Transit duration display
    let transitStr = '';
    if (data.transitHours >= 48) {
      const days = (data.transitHours / 24).toFixed(1);
      transitStr = `${days}<span>days</span>`;
    } else {
      transitStr = `${data.transitHours.toFixed(1)}<span>hours</span>`;
    }

    // Cost calculations
    const costPerKg = Math.round(data.baseCostKg * multiplier);
    const totalM = ((payload * costPerKg) / 1000000).toFixed(2);

    resDeltaV.innerHTML = `${finalDeltaV.toLocaleString()}<span>m/s</span>`;
    resTransit.innerHTML = transitStr;
    resCostKg.innerHTML = `$${costPerKg.toLocaleString()}<span>/kg</span>`;
    resTotalCost.innerHTML = `$${totalM}<span>M</span>`;
  }

  if (sliderPayload) {
    sliderPayload.addEventListener('input', updateSimulation);
  }

  orbitOptions.forEach((btn) => {
    btn.addEventListener('click', () => {
      orbitOptions.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentDestination = btn.dataset.destination;
      updateSimulation();
      sound.playBeep(850, 0.05);
    });
  });

  if (selectWindow) {
    selectWindow.addEventListener('change', updateSimulation);
  }

  // 5. Scroll-based Camera Choreography
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.4
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && scene) {
        const id = entry.target.id;
        if (id === 'vessel') {
          scene.setCameraView('orbit');
        } else if (id === 'technology') {
          scene.setCameraView('propulsion');
        } else if (id === 'simulator') {
          scene.setCameraView('wings');
        } else if (id === 'specs') {
          scene.setCameraView('avionics');
        }
      }
    });
  }, observerOptions);

  document.querySelectorAll('section').forEach((section) => {
    sectionObserver.observe(section);
  });

  // Nav link smooth trigger
  document.querySelectorAll('.nav-links a[data-view]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const viewKey = link.dataset.view;
      if (scene && viewKey) {
        scene.setCameraView(viewKey);
      }
    });
  });

  // 6. Reservation Modal
  const modal = document.getElementById('modal-reservation');
  const openModalBtn = document.getElementById('btn-open-modal');
  const closeModalBtn = document.getElementById('btn-close-modal');
  const bookFromSimBtn = document.getElementById('btn-book-from-sim');
  const reservationForm = document.getElementById('reservation-form');
  const resPayloadMassInput = document.getElementById('res-payload-mass');

  function openModal() {
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      if (resPayloadMassInput && sliderPayload) {
        resPayloadMassInput.value = sliderPayload.value;
      }
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  if (openModalBtn) openModalBtn.addEventListener('click', openModal);
  if (bookFromSimBtn) bookFromSimBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (reservationForm) {
    reservationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sound.playBeep(1200, 0.15);
      const name = document.getElementById('res-name').value;
      alert(`[TRANSMISSION CONFIRMED]\n\nPayload flight reservation manifest received for: ${name}.\nTelemetry credentials dispatched to secure comms.`);
      closeModal();
      reservationForm.reset();
    });
  }

  // 7. UTC Clock in Footer
  const utcClock = document.getElementById('utc-clock');
  function updateClock() {
    if (!utcClock) return;
    const now = new Date();
    const h = String(now.getUTCHours()).padStart(2, '0');
    const m = String(now.getUTCMinutes()).padStart(2, '0');
    const s = String(now.getUTCSeconds()).padStart(2, '0');
    utcClock.textContent = `UTC TIME: ${h}:${m}:${s} // SYSTEM STATUS: ALL GREEN`;
  }
  setInterval(updateClock, 1000);
  updateClock();
});
