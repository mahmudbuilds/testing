document.addEventListener('DOMContentLoaded', () => {
  // 1. Scroll-Based Progress Bar & Navbar Scroll State
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

  // 2. IntersectionObserver for Scroll-Triggered Reveal Animations
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
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach((el) => revealObserver.observe(el));

  // 3. Mobile Navigation Drawer
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

  // 4. Live Feast Box Cart State
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
            <span>$${item.price}.00 × ${item.quantity}</span>
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

    // Attach remove listeners
    document.querySelectorAll('.btn-remove-item').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        cart.splice(idx, 1);
        updateCartUI();
      });
    });
  }

  // Open/Close Cart Drawer
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

  // Add Dish to Feast Box
  document.querySelectorAll('.btn-add-dish').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);

      const existing = cart.find((item) => item.id === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ id, name, price, quantity: 1 });
      }

      updateCartUI();

      // Tactile button feedback
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span>✓ Added to Feast Box</span>';
      btn.style.background = 'var(--p-action)';
      btn.style.color = '#ffffff';
      btn.style.borderColor = 'var(--p-action)';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.style.color = '';
        btn.style.borderColor = '';
      }, 900);
    });
  });

  // Checkout action
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('Your feast box is empty. Select your dishes from the Búkà menu first.');
        return;
      }
      alert('E ku orire! (Order Confirmed)\n\nYour authentic Nigerian feast has been transmitted to our central hearth kitchen.\n\nEstimated electric courier arrival: 28 minutes in double-walled insulated tiffins.');
      cart.length = 0;
      updateCartUI();
      closeCart();
    });
  }

  // 5. Daily Búkà Menu Category Filtering
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

  // 6. Interactive Weekly Feast Box Planner
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
      alert(`Weekly Feast Plan Confirmed!\n\n${selectedDiners} Diners · ${selectedNights} Nights Weekly.\nIncludes free returnable tiffin canisters and complimentary golden puff-puff platters.`);
    });
  }

  // Initial UI updates
  updatePlanner();
  updateCartUI();
});
