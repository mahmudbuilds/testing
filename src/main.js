document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // 1. SCROLL PROGRESS & NAVBAR SCROLLED STATE
  // ==========================================================================
  const scrollProgress = document.getElementById('scroll-progress');
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      if (scrollProgress) {
        scrollProgress.style.width = `${progress}%`;
      }
    }

    if (navbar) {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }, { passive: true });

  // ==========================================================================
  // 2. INTERSECTION OBSERVER FOR SCROLL ANIMATIONS
  // ==========================================================================
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.12,
    rootMargin: '0px 0px -30px 0px'
  });

  revealElements.forEach((el) => revealObserver.observe(el));

  // ==========================================================================
  // 3. PROCEDURAL WEB AUDIO API (Búkà Hearth Firewood Ambience)
  // ==========================================================================
  let audioCtx = null;
  let isSoundPlaying = false;
  let noiseNode = null;
  let gainNode = null;
  let crackleTimer = null;

  function initBukaAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
  }

  function startHearthAmbience() {
    try {
      initBukaAudio();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      // Generate soft pink/brown filtered noise for fireplace warmth
      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.03;
        b2 = 0.90 * b2 + white * 0.02;
        output[i] = (b0 + b1 + b2) * 0.25;
      }

      noiseNode = audioCtx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;

      const lowpass = audioCtx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(450, audioCtx.currentTime);

      gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);

      noiseNode.connect(lowpass);
      lowpass.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      noiseNode.start();

      // Procedural soft firewood pop crackle generator
      crackleTimer = setInterval(() => {
        if (!isSoundPlaying || !audioCtx) return;
        if (Math.random() > 0.4) {
          const popOsc = audioCtx.createOscillator();
          const popGain = audioCtx.createGain();
          popOsc.type = 'triangle';
          popOsc.frequency.setValueAtTime(120 + Math.random() * 180, audioCtx.currentTime);

          popGain.gain.setValueAtTime(0.04 * Math.random(), audioCtx.currentTime);
          popGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);

          popOsc.connect(popGain);
          popGain.connect(audioCtx.destination);
          popOsc.start();
          popOsc.stop(audioCtx.currentTime + 0.05);
        }
      }, 250);

      isSoundPlaying = true;
      updateSoundUI(true);
    } catch (e) {
      console.warn('AudioContext not allowed without user gesture', e);
    }
  }

  function stopHearthAmbience() {
    if (noiseNode) {
      try { noiseNode.stop(); } catch (e) {}
      noiseNode.disconnect();
      noiseNode = null;
    }
    if (crackleTimer) {
      clearInterval(crackleTimer);
      crackleTimer = null;
    }
    isSoundPlaying = false;
    updateSoundUI(false);
  }

  function toggleHearthSound() {
    if (isSoundPlaying) {
      stopHearthAmbience();
    } else {
      startHearthAmbience();
    }
  }

  function updateSoundUI(playing) {
    const btnTop = document.getElementById('btn-sound-toggle');
    const soundIcon = document.getElementById('sound-icon');
    const soundLabel = document.getElementById('sound-label');
    const btnMobile = document.getElementById('btn-sound-toggle-mobile');
    const soundIconMobile = document.getElementById('sound-icon-mobile');
    const soundLabelMobile = document.getElementById('sound-label-mobile');

    if (playing) {
      if (btnTop) btnTop.classList.add('playing');
      if (soundIcon) soundIcon.textContent = '🔊';
      if (soundLabel) soundLabel.textContent = 'Hearth Live';
      if (btnMobile) btnMobile.classList.add('playing');
      if (soundIconMobile) soundIconMobile.textContent = '🔊';
      if (soundLabelMobile) soundLabelMobile.textContent = 'Hearth Active';
    } else {
      if (btnTop) btnTop.classList.remove('playing');
      if (soundIcon) soundIcon.textContent = '🔈';
      if (soundLabel) soundLabel.textContent = 'Búkà Ambience';
      if (btnMobile) btnMobile.classList.remove('playing');
      if (soundIconMobile) soundIconMobile.textContent = '🔈';
      if (soundLabelMobile) soundLabelMobile.textContent = 'Turn On';
    }
  }

  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const btnSoundToggleMobile = document.getElementById('btn-sound-toggle-mobile');
  if (btnSoundToggle) btnSoundToggle.addEventListener('click', toggleHearthSound);
  if (btnSoundToggleMobile) btnSoundToggleMobile.addEventListener('click', toggleHearthSound);

  // ==========================================================================
  // 4. INTERACTIVE CUSTOM OWAMBE FEAST PLATE BUILDER
  // ==========================================================================
  const customPlate = {
    base: { name: 'Firewood Party Jollof', price: 0, notes: 'Cast-iron bottom-pot char with sweet tatashe peppers' },
    soup: { name: 'Stoneground Egusi Soup', price: 0, notes: 'Benue melon seeds with wild smoked catfish' },
    protein: { name: 'Flame-Charred Peppered Goat (Asun)', price: 0, notes: 'Tender goat meat in spicy ata rodo reduction' },
    sides: [
      { id: 'dodo', name: 'Fried Sweet Plantains (Dodo)', price: 3 }
    ]
  };

  const BASE_PRICE = 28.00;

  function updatePlateBuilderUI() {
    let extraPrice = customPlate.base.price + customPlate.soup.price + customPlate.protein.price;
    customPlate.sides.forEach(s => extraPrice += s.price);

    const totalPrice = (BASE_PRICE + extraPrice).toFixed(2);

    const priceEl = document.getElementById('plate-total-price');
    const ctaPriceEl = document.getElementById('plate-cta-price');
    const summaryBase = document.getElementById('summary-base');
    const summarySoup = document.getElementById('summary-soup');
    const summaryProtein = document.getElementById('summary-protein');
    const summarySides = document.getElementById('summary-sides');
    const tasteNotes = document.getElementById('plate-taste-notes');

    if (priceEl) priceEl.textContent = `$${totalPrice}`;
    if (ctaPriceEl) ctaPriceEl.textContent = `$${totalPrice}`;

    if (summaryBase) summaryBase.textContent = customPlate.base.name;
    if (summarySoup) summarySoup.textContent = customPlate.soup.name;
    if (summaryProtein) summaryProtein.textContent = customPlate.protein.name;

    if (summarySides) {
      if (customPlate.sides.length === 0) {
        summarySides.textContent = 'None selected (Add Dodo, Moin-Moin, or Zobo)';
      } else {
        summarySides.textContent = customPlate.sides.map(s => s.name).join(', ');
      }
    }

    if (tasteNotes) {
      tasteNotes.textContent = `${customPlate.base.notes}, coupled with ${customPlate.soup.notes.toLowerCase()}, and ${customPlate.protein.notes.toLowerCase()}.`;
    }
  }

  // Radio button selectors for Base, Soup, Protein
  document.querySelectorAll('.builder-btn[data-type="base"], .builder-btn[data-type="soup"], .builder-btn[data-type="protein"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      const parent = btn.closest('.step-options');
      parent.querySelectorAll('.builder-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      const notes = btn.dataset.notes;

      if (type === 'base') customPlate.base = { name, price, notes };
      if (type === 'soup') customPlate.soup = { name, price, notes };
      if (type === 'protein') customPlate.protein = { name, price, notes };

      updatePlateBuilderUI();
    });
  });

  // Multi-select for Sides & Extras
  document.querySelectorAll('.builder-btn[data-type="side"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);

      const existingIndex = customPlate.sides.findIndex(s => s.id === id);
      if (existingIndex > -1) {
        customPlate.sides.splice(existingIndex, 1);
        btn.classList.remove('active');
      } else {
        customPlate.sides.push({ id, name, price });
        btn.classList.add('active');
      }

      updatePlateBuilderUI();
    });
  });

  // ==========================================================================
  // 5. LIVE FEAST BOX CART STATE & DRAWER
  // ==========================================================================
  const cart = [];
  const bagCount = document.getElementById('bag-count');
  const mobileBagCount = document.getElementById('mobile-bag-count');
  const mobileBagSubtotal = document.getElementById('mobile-bag-subtotal');
  const cartDrawerBackdrop = document.getElementById('cart-drawer-backdrop');
  const btnOpenBag = document.getElementById('btn-open-bag');
  const btnCloseCart = document.getElementById('btn-close-cart');
  const btnMobileOrderOpen = document.getElementById('btn-mobile-order-open');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartEmptyMsg = document.getElementById('cart-empty-msg');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const btnCheckout = document.getElementById('btn-checkout');

  function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (bagCount) bagCount.textContent = totalItems;
    if (mobileBagCount) mobileBagCount.textContent = totalItems;

    let subtotal = 0;
    cart.forEach((item) => {
      subtotal += item.price * item.quantity;
    });

    if (mobileBagSubtotal) {
      mobileBagSubtotal.textContent = `$${subtotal.toFixed(0)}`;
    }

    if (cart.length === 0) {
      if (cartEmptyMsg) cartEmptyMsg.style.display = 'block';
      if (cartItemsList) cartItemsList.innerHTML = '';
      if (cartSubtotal) cartSubtotal.textContent = '$0.00';
      return;
    }

    if (cartEmptyMsg) cartEmptyMsg.style.display = 'none';
    if (cartItemsList) {
      cartItemsList.innerHTML = '';

      cart.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <span>$${item.price.toFixed(2)} × ${item.quantity}</span>
            ${item.details ? `<div style="font-size: 0.75rem; color: var(--p-dim); margin-top: 0.25rem;">${item.details}</div>` : ''}
          </div>
          <div class="cart-item-actions">
            <button class="btn-remove-item" data-index="${index}" aria-label="Remove ${item.name}">Remove</button>
          </div>
        `;
        cartItemsList.appendChild(row);
      });
    }

    if (cartSubtotal) {
      cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    }

    document.querySelectorAll('.btn-remove-item').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        cart.splice(idx, 1);
        updateCartUI();
      });
    });
  }

  function openCart() {
    if (cartDrawerBackdrop) {
      cartDrawerBackdrop.classList.add('open');
      cartDrawerBackdrop.setAttribute('aria-hidden', 'false');
    }
  }

  function closeCart() {
    if (cartDrawerBackdrop) {
      cartDrawerBackdrop.classList.remove('open');
      cartDrawerBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  if (btnOpenBag) btnOpenBag.addEventListener('click', openCart);
  if (btnMobileOrderOpen) btnMobileOrderOpen.addEventListener('click', openCart);
  if (btnCloseCart) btnCloseCart.addEventListener('click', closeCart);
  if (cartDrawerBackdrop) {
    cartDrawerBackdrop.addEventListener('click', (e) => {
      if (e.target === cartDrawerBackdrop) closeCart();
    });
  }

  // Add Custom Owambe Plate to Cart
  const btnAddCustomPlate = document.getElementById('btn-add-custom-plate');
  if (btnAddCustomPlate) {
    btnAddCustomPlate.addEventListener('click', () => {
      let extraPrice = customPlate.base.price + customPlate.soup.price + customPlate.protein.price;
      customPlate.sides.forEach(s => extraPrice += s.price);
      const price = BASE_PRICE + extraPrice;

      const details = `${customPlate.base.name} · ${customPlate.soup.name} · ${customPlate.protein.name}${customPlate.sides.length ? ' · ' + customPlate.sides.map(s => s.name).join(', ') : ''}`;

      cart.push({
        id: `custom-plate-${Date.now()}`,
        name: 'Curated Owambe Royal Plate',
        price: price,
        quantity: 1,
        details: details
      });

      updateCartUI();
      openCart();
    });
  }

  // Add À La Carte Dish to Cart
  document.querySelectorAll('.btn-add-dish').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);

      const existing = cart.find((item) => item.id === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ id, name, price, quantity: 1, details: '3-tier tiffin packed' });
      }

      updateCartUI();

      const originalHtml = btn.innerHTML;
      btn.innerHTML = '<span>✓ Added to Tiffin</span>';
      btn.style.background = 'var(--p-action)';
      btn.style.color = '#ffffff';
      btn.style.borderColor = 'var(--p-action)';
      setTimeout(() => {
        btn.innerHTML = originalHtml;
        btn.style.background = '';
        btn.style.color = '';
        btn.style.borderColor = '';
      }, 900);
    });
  });

  // Checkout Action
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('Your feast box is empty. Curate a custom plate or choose dishes from the menu first.');
        return;
      }
      alert('Ẹ kú oríire! (Order Transmitted)\n\nYour authentic Nigerian feast has been assigned to our Victoria Island Hearth Hub.\n\n3-Tier insulated brass-latch canisters packed at 88°C.\nElectric courier dispatch ETA: 28 minutes.');
      cart.length = 0;
      updateCartUI();
      closeCart();
    });
  }

  // ==========================================================================
  // 6. PEPPER HEAT INDEX & MENU CATEGORY FILTERING
  // ==========================================================================
  const heatButtons = document.querySelectorAll('.heat-btn');
  const heatBadges = document.querySelectorAll('[data-heat-badge]');

  const heatProfiles = {
    mild: '🍃 Sweet Tatashe & Slow Stew',
    classic: '🌶️ Balanced Búkà Scotch Bonnet',
    party: '🔥 Saturday Owambe Firewood Heat'
  };

  heatButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      heatButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const heat = btn.dataset.heat;
      heatBadges.forEach((badge) => {
        badge.textContent = heatProfiles[heat] || '🌶️ Balanced Heat';
      });
    });
  });

  const filterButtons = document.querySelectorAll('.filter-btn');
  const dishCards = document.querySelectorAll('.dish-card');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      dishCards.forEach((card) => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
          card.classList.add('is-revealed');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ==========================================================================
  // 7. INTERACTIVE WEEKLY FEAST PLANNER
  // ==========================================================================
  const dinerButtons = document.querySelectorAll('#group-diners .pill-option-btn');
  const nightButtons = document.querySelectorAll('#group-nights .pill-option-btn');
  const spiceButtons = document.querySelectorAll('#group-spice .pill-option-btn');

  const summaryPrice = document.getElementById('summary-price');
  const summaryMealsCount = document.getElementById('summary-meals-count');
  const summaryMealsSubtotal = document.getElementById('summary-meals-subtotal');
  const summaryWeeklyTotal = document.getElementById('summary-weekly-total');
  const btnLockPlan = document.getElementById('btn-lock-plan');

  let selectedDiners = 2;
  let selectedNights = 3;

  function updatePlanner() {
    let pricePerPlate = 18;
    if (selectedDiners === 4) pricePerPlate = 16;
    if (selectedDiners === 6) pricePerPlate = 14;

    const totalPortions = selectedDiners * selectedNights;
    const weeklyTotal = totalPortions * pricePerPlate;

    if (summaryPrice) {
      summaryPrice.innerHTML = `$${pricePerPlate}<span>/ portion</span>`;
    }
    if (summaryMealsCount) {
      summaryMealsCount.textContent = `${totalPortions} portions (${selectedDiners} diners × ${selectedNights} nights)`;
    }
    if (summaryMealsSubtotal) {
      summaryMealsSubtotal.textContent = `$${weeklyTotal.toFixed(2)}`;
    }
    if (summaryWeeklyTotal) {
      summaryWeeklyTotal.textContent = `$${weeklyTotal.toFixed(2)}`;
    }
  }

  dinerButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      dinerButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedDiners = parseInt(btn.dataset.diners, 10);
      updatePlanner();
    });
  });

  nightButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      nightButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedNights = parseInt(btn.dataset.nights, 10);
      updatePlanner();
    });
  });

  spiceButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      spiceButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  if (btnLockPlan) {
    btnLockPlan.addEventListener('click', () => {
      alert(`Weekly Feast Plan Confirmed!\n\n${selectedDiners} Diners · ${selectedNights} Nights Weekly.\nIncludes free 3-tier brass tiffin canister exchange and complimentary golden puff-puff platters.`);
    });
  }

  // ==========================================================================
  // 8. MOBILE NAVIGATION DRAWER
  // ==========================================================================
  const mobileToggle = document.getElementById('btn-mobile-toggle');
  const mobileNavBackdrop = document.getElementById('mobile-nav-backdrop');
  const btnCloseMobileNav = document.getElementById('btn-close-mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function openMobileNav() {
    if (mobileNavBackdrop) {
      mobileNavBackdrop.classList.add('open');
      mobileNavBackdrop.setAttribute('aria-hidden', 'false');
    }
  }

  function closeMobileNav() {
    if (mobileNavBackdrop) {
      mobileNavBackdrop.classList.remove('open');
      mobileNavBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openMobileNav);
  if (btnCloseMobileNav) btnCloseMobileNav.addEventListener('click', closeMobileNav);
  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener('click', (e) => {
      if (e.target === mobileNavBackdrop) closeMobileNav();
    });
  }

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileNav();
    });
  });

  // Initial UI Bootstrapping
  updatePlateBuilderUI();
  updatePlanner();
  updateCartUI();
});
