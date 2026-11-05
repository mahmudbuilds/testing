document.addEventListener('DOMContentLoaded', () => {
  // 1. Live Supper Box Cart State
  const cart = [];
  const bagCount = document.getElementById('bag-count');
  const cartDrawerBackdrop = document.getElementById('cart-drawer-backdrop');
  const btnOpenBag = document.getElementById('btn-open-bag');
  const btnCloseCart = document.getElementById('btn-close-cart');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartEmptyMsg = document.getElementById('cart-empty-msg');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const btnCheckout = document.getElementById('btn-checkout');

  function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    bagCount.textContent = totalItems;

    if (cart.length === 0) {
      cartEmptyMsg.style.display = 'block';
      cartItemsList.innerHTML = '';
      cartSubtotal.textContent = '$0.00';
      return;
    }

    cartEmptyMsg.style.display = 'none';
    cartItemsList.innerHTML = '';

    let subtotal = 0;
    cart.forEach((item, index) => {
      subtotal += item.price * item.quantity;
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

    cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;

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
  if (btnCloseCart) btnCloseCart.addEventListener('click', closeCart);
  if (cartDrawerBackdrop) {
    cartDrawerBackdrop.addEventListener('click', (e) => {
      if (e.target === cartDrawerBackdrop) closeCart();
    });
  }

  // Add Dish to Box
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

      // Button feedback
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span>✓ Added to Supper Box</span>';
      btn.style.background = 'var(--p-accent)';
      btn.style.color = '#ffffff';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.style.color = '';
      }, 1000);
    });
  });

  // Checkout action
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('Your supper box is currently empty. Add dishes from the menu to proceed.');
        return;
      }
      alert('Order Confirmed!\n\nYour farm-to-table dinner has been sent to our central kitchen. The culinary team is preparing your dishes now.\n\nEstimated courier hand-off: 32 minutes in returnable insulated containers.');
      cart.length = 0;
      updateCartUI();
      closeCart();
    });
  }

  // 2. Menu Category Filtering
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
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 3. Interactive Weekly Supper Box Planner
  const dinerButtons = document.querySelectorAll('#group-diners .pill-option-btn');
  const nightButtons = document.querySelectorAll('#group-nights .pill-option-btn');
  const dietButtons = document.querySelectorAll('#group-diet .pill-option-btn');

  const summaryPrice = document.getElementById('summary-price');
  const summaryMealsCount = document.getElementById('summary-meals-count');
  const summaryMealsSubtotal = document.getElementById('summary-meals-subtotal');
  const summaryWeeklyTotal = document.getElementById('summary-weekly-total');
  const btnLockPlan = document.getElementById('btn-lock-plan');

  let selectedDiners = 2;
  let selectedNights = 3;

  function updatePlanner() {
    let pricePerPlate = 19;
    if (selectedDiners === 4) pricePerPlate = 17;
    if (selectedDiners === 6) pricePerPlate = 15;

    const totalPortions = selectedDiners * selectedNights;
    const weeklyTotal = totalPortions * pricePerPlate;

    summaryPrice.innerHTML = `$${pricePerPlate}<span>/ plate</span>`;
    summaryMealsCount.textContent = `${totalPortions} portions (${selectedDiners} diners × ${selectedNights} nights)`;
    summaryMealsSubtotal.textContent = `$${weeklyTotal.toFixed(2)}`;
    summaryWeeklyTotal.textContent = `$${weeklyTotal.toFixed(2)}`;
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

  dietButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      dietButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  if (btnLockPlan) {
    btnLockPlan.addEventListener('click', () => {
      alert(`Weekly Supper Plan Configured!\n\n${selectedDiners} Diners · ${selectedNights} Evenings Per Week.\nYour initial delivery schedule will begin this Tuesday with zero-waste canister exchange.`);
    });
  }

  // Initial calculation
  updatePlanner();
  updateCartUI();
});
