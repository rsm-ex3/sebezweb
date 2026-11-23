(() => {
  'use strict';

  // IMPORTANT: Replace the placeholder with the cafe's WhatsApp number in international format,
  // digits only. Example format for Ethiopia: 2519XXXXXXXX (do not include + or spaces).
  const BUSINESS_WHATSAPP = '2519XXXXXXXX';

  // Location recovered from the supplied Google Maps pin / matching Hani Super Market listing.
  // Confirm this pin in Google Maps before launch.
  const CAFE = { lat: 8.895024, lng: 38.773635, maxKm: 10 };
  const MENU = Array.isArray(window.SEBeZ_MENU) ? window.SEBeZ_MENU : [];
  const cart = new Map();
  let selectedCategory = 'All';
  let customerPosition = null;
  let deliveryDistance = null;
  let pendingOrderText = '';

  const $ = (selector) => document.querySelector(selector);
  const money = (value) => `${Number(value || 0).toLocaleString('en-US')} ETB`;
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const categories = ['All', ...new Set(MENU.map(item => item.category))];

  function renderCategories() {
    $('#categoryTabs').innerHTML = categories.map((category) => `
      <button class="category-tab ${category === selectedCategory ? 'active' : ''}" type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>
    `).join('');
  }

  function filteredMenu() {
    const query = $('#menuSearch').value.trim().toLowerCase();
    return MENU.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const haystack = `${item.name} ${item.nameAm || ''} ${item.description || ''} ${item.category}`.toLowerCase();
      return matchesCategory && (!query || haystack.includes(query));
    });
  }

  function renderMenu() {
    const items = filteredMenu();
    $('#menuResultCount').textContent = `${items.length} menu item${items.length === 1 ? '' : 's'}`;
    $('#productGrid').innerHTML = items.length ? items.map(item => `
      <article class="product-card">
        <div class="product-photo-wrap">
          <img class="product-photo" src="${photoFor(item)}" alt="Real food photography representing ${escapeHtml(item.category)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='assets/food-fallback.svg'" />
          <span class="photo-label">${escapeHtml(item.category)}</span>
        </div>
        <div class="product-info">
          <div class="product-title-row"><h3>${escapeHtml(item.name)}</h3>${item.featured ? '<span class="popular-tag">Popular</span>' : ''}</div>
          ${item.nameAm ? `<div class="amharic-name">${escapeHtml(item.nameAm)}</div>` : ''}
          <p>${escapeHtml(item.description || '')}</p>
          ${item.verify ? '<div class="verify-tag">Name to confirm</div>' : ''}
          <div class="product-bottom"><b>${money(item.price)}</b><button class="add-button" type="button" data-add="${escapeHtml(item.id)}" aria-label="Add ${escapeHtml(item.name)} to order">＋ Add</button></div>
        </div>
      </article>
    `).join('') : '<div class="no-results"><b>No matches found</b><p>Try another search or category.</p></div>';
  }

  // Real, photographer-shot Unsplash images used as category illustrations.
  // These are representative category photos, not claims that every plate is Sebez's exact recipe.
  const CATEGORY_PHOTOS = {
    'Wraps': 'https://images.unsplash.com/photo-1666819604634-98dd67634148?auto=format&fit=crop&w=900&q=82',
    'Fresh Juice': 'https://images.unsplash.com/photo-1659204958264-369d15460b4a?auto=format&fit=crop&w=900&q=82',
    'Hot Drinks': 'https://images.unsplash.com/photo-1652507733698-b0c536a92cd4?auto=format&fit=crop&w=900&q=82',
    'Local Favourites': 'https://images.unsplash.com/photo-1765338915553-6e02fe63ff4f?auto=format&fit=crop&w=900&q=82',
    'Cafe Specials': 'https://images.unsplash.com/photo-1765338915553-6e02fe63ff4f?auto=format&fit=crop&w=900&q=82',
    'More Meals': 'https://images.unsplash.com/photo-1765338915553-6e02fe63ff4f?auto=format&fit=crop&w=900&q=82'
  };
  function photoFor(item) { return CATEGORY_PHOTOS[item.category] || CATEGORY_PHOTOS['Local Favourites']; }

  function artClass(category) {
    return ({'Wraps':'art-wrap','Fresh Juice':'art-juice','Mojito':'art-mojito','Hot Drinks':'art-coffee','Local Favourites':'art-local','Cafe Specials':'art-special','More Meals':'art-meal'})[category] || 'art-default';
  }
  function artIcon(category) {
    return ({'Wraps':'◒','Fresh Juice':'◉','Mojito':'✳','Hot Drinks':'☕','Local Favourites':'♨','Cafe Specials':'✦','More Meals':'⌂'})[category] || '✦';
  }

  function cartCount() {
    return [...cart.values()].reduce((sum, item) => sum + item.qty, 0);
  }
  function subtotal() {
    return [...cart.values()].reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  function renderCart() {
    const items = [...cart.values()];
    const count = cartCount();
    $('#headerCartCount').textContent = count;
    $('#cartHeadingCount').textContent = `(${count})`;
    $('#mobileCartCount').textContent = `${count} item${count === 1 ? '' : 's'}`;
    $('#cartSubtotal').textContent = money(subtotal());
    $('#cartTotal').textContent = money(subtotal());
    $('#mobileCartTotal').textContent = money(subtotal());
    $('#modalSubtotal').textContent = money(subtotal());
    $('#checkoutButton').disabled = count === 0;
    $('#cartItems').innerHTML = items.length ? items.map(item => `
      <div class="cart-line">
        <div class="cart-line-copy"><b>${escapeHtml(item.name)}</b><small>${money(item.price)} each</small></div>
        <div class="quantity-control"><button type="button" data-qty="${escapeHtml(item.id)}" data-step="-1" aria-label="Decrease ${escapeHtml(item.name)}">−</button><span>${item.qty}</span><button type="button" data-qty="${escapeHtml(item.id)}" data-step="1" aria-label="Increase ${escapeHtml(item.name)}">＋</button></div>
      </div>
    `).join('') : '<div class="empty-cart"><span>＋</span><b>Your cart is waiting</b><p>Add something tasty from the menu.</p></div>';
  }

  function toast(message) {
    const element = $('#toast');
    element.textContent = message;
    element.classList.add('show');
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => element.classList.remove('show'), 2600);
  }

  function setDistance(distance) {
    deliveryDistance = distance;
    const result = $('#distanceResult');
    const checkout = $('#checkoutDistance');
    if (distance == null) {
      result.className = 'distance-result';
      result.textContent = 'Your location is only used to estimate the distance from the cafe.';
      checkout.textContent = 'Distance not checked yet. The cafe will confirm your delivery area.';
      return;
    }
    const rounded = distance.toFixed(1);
    if (distance <= CAFE.maxKm) {
      result.className = 'distance-result good';
      result.textContent = `About ${rounded} km from Sebez Cafe — delivery is available within the 10 km service area. The cafe will confirm the final fee and route.`;
      checkout.textContent = `Estimated distance: ${rounded} km — within the 10 km delivery area. The cafe will confirm the final fee and route.`;
    } else {
      result.className = 'distance-result out';
      result.textContent = `About ${rounded} km from Sebez Cafe — sorry, delivery service is unavailable in your area. Pickup may still be available.`;
      checkout.textContent = `Estimated distance: ${rounded} km — delivery service is unavailable beyond 10 km. Please choose pickup.`;
    }
  }

  function haversineKm(lat1, lon1, lat2, lon2) {
    const toRad = degrees => degrees * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function checkLocation() {
    if (!navigator.geolocation) {
      toast('Location check is not supported by this browser.');
      return;
    }
    $('#checkLocation').disabled = true;
    $('#checkLocation').textContent = 'Checking…';
    navigator.geolocation.getCurrentPosition((position) => {
      customerPosition = {lat: position.coords.latitude, lng: position.coords.longitude};
      setDistance(haversineKm(customerPosition.lat, customerPosition.lng, CAFE.lat, CAFE.lng));
      $('#checkLocation').disabled = false;
      $('#checkLocation').textContent = 'Check again';
    }, (error) => {
      $('#checkLocation').disabled = false;
      $('#checkLocation').textContent = 'Try again';
      const messages = {1:'Please allow location access to check whether delivery is available. You can still choose pickup.',2:'Your location could not be found. Please try again or choose pickup.',3:'The location request timed out. Please try again.'};
      toast(messages[error.code] || 'Could not check your location.');
    }, {enableHighAccuracy:true, timeout:12000, maximumAge:60000});
  }

  function openCheckout() {
    if (!cart.size) return;
    $('#checkoutModal').classList.add('open');
    $('#checkoutModal').setAttribute('aria-hidden','false');
    $('#orderFallback').hidden = true;
    $('#checkoutForm').hidden = false;
    $('#modalSubtotal').textContent = money(subtotal());
    $('#checkoutDistance').textContent = deliveryDistance == null ? 'Distance not checked yet. The cafe will confirm your delivery area.' : $('#distanceResult').textContent;
    document.body.classList.add('modal-open');
  }

  function closeCheckout() {
    $('#checkoutModal').classList.remove('open');
    $('#checkoutModal').setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
  }

  function buildOrderText(formData) {
    const lines = [...cart.values()].map(item => `• ${item.name} × ${item.qty} — ${money(item.price * item.qty)}`);
    const orderType = formData.get('orderType');
    const address = orderType === 'pickup' ? 'Pickup at Sebez Cafe' : `${formData.get('address') || 'Address to confirm'}${formData.get('landmark') ? `, landmark: ${formData.get('landmark')}` : ''}`;
    const distance = orderType === 'pickup' ? 'Pickup' : deliveryDistance == null ? 'Not checked; please confirm' : `${deliveryDistance.toFixed(1)} km estimated straight-line distance — please confirm road route`;
    return [
      'Hello Sebez Cafe! I would like to place an order:',
      '', ...lines,
      '', `Subtotal: ${money(subtotal())}`,
      'Delivery fee: Please confirm with me',
      `Order type: ${orderType === 'pickup' ? 'Pickup' : 'Delivery'}`,
      `Customer: ${formData.get('customerName')}`,
      `Phone: ${formData.get('customerPhone')}`,
      `Address: ${address}`,
      `Distance check: ${distance}`,
      `Notes: ${formData.get('notes') || 'None'}`
    ].join('\n');
  }

  $('#categoryTabs').addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    selectedCategory = button.dataset.category;
    renderCategories(); renderMenu();
  });

  $('#productGrid').addEventListener('click', (event) => {
    const button = event.target.closest('[data-add]');
    if (!button) return;
    const product = MENU.find(item => item.id === button.dataset.add);
    if (!product) return;
    const existing = cart.get(product.id);
    cart.set(product.id, {...product, qty: existing ? existing.qty + 1 : 1});
    renderCart(); toast(`${product.name} added to your order.`);
  });

  $('#cartItems').addEventListener('click', (event) => {
    const button = event.target.closest('[data-qty]');
    if (!button) return;
    const item = cart.get(button.dataset.qty);
    if (!item) return;
    item.qty += Number(button.dataset.step);
    if (item.qty <= 0) cart.delete(item.id); else cart.set(item.id, item);
    renderCart();
  });

  $('#menuSearch').addEventListener('input', renderMenu);
  $('#clearCart').addEventListener('click', () => { cart.clear(); renderCart(); toast('Your order was cleared.'); });
  $('#headerCart').addEventListener('click', () => $('#cartPanel').scrollIntoView({behavior:'smooth', block:'center'}));
  $('#mobileCartButton').addEventListener('click', () => $('#cartPanel').scrollIntoView({behavior:'smooth', block:'center'}));
  $('#checkoutButton').addEventListener('click', openCheckout);
  $('#closeModal').addEventListener('click', closeCheckout);
  $('#checkoutModal').addEventListener('click', (event) => { if (event.target === $('#checkoutModal')) closeCheckout(); });
  $('#checkLocation').addEventListener('click', checkLocation);
  $('#orderType').addEventListener('change', () => {
    const pickup = $('#orderType').value === 'pickup';
    $('#deliveryAddress').disabled = pickup;
    $('#deliveryAddress').required = !pickup;
    $('#deliveryAddress').placeholder = pickup ? 'Not needed for pickup' : 'Sub-city, area, street and house number';
  });

  $('#checkoutForm').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!cart.size) return;
    const formData = new FormData(event.currentTarget);
    if (formData.get('orderType') === 'delivery' && deliveryDistance == null) {
      toast('Check your location first to confirm delivery availability, or choose pickup.');
      return;
    }
    if (formData.get('orderType') === 'delivery' && deliveryDistance > CAFE.maxKm) {
      toast('Sorry, delivery service is unavailable in your area. Please choose pickup.');
      return;
    }
    pendingOrderText = buildOrderText(formData);
    if (/^2519X+$/i.test(BUSINESS_WHATSAPP) || BUSINESS_WHATSAPP.includes('X')) {
      $('#checkoutForm').hidden = true;
      $('#orderFallback').hidden = false;
      $('#fallbackText').textContent = 'Your order summary is ready, but the cafe WhatsApp number has not been added to the website yet. Copy the summary and send it to the cafe, or add the official number in app.js.';
      return;
    }
    const url = `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(pendingOrderText)}`;
    window.open(url, '_blank', 'noopener');
    toast('Your order summary has been opened in WhatsApp.');
  });

  $('#copyOrder').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(pendingOrderText);
      toast('Order summary copied.');
    } catch (_) {
      const area = document.createElement('textarea');
      area.value = pendingOrderText; document.body.appendChild(area); area.select();
      document.execCommand('copy'); area.remove(); toast('Order summary copied.');
    }
  });

  $('#year').textContent = new Date().getFullYear();
  renderCategories(); renderMenu(); renderCart();
})();
