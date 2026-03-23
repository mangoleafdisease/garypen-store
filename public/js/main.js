let products = [];
let cart = [];
let currentProduct = null;
let selectedVariantIndex = 0;
let quantity = 1;

// Load products from products.json (direktang file, hindi API)
async function loadProducts() {
    try {
        console.log('Loading products...');
        // Direktang i-load ang products.json file
        const response = await fetch('/products.json');
        
        if (response.ok) {
            products = await response.json();
            console.log('Products loaded successfully:', products.length);
            renderProducts();
        } else {
            console.error('Response not OK:', response.status);
            throw new Error('Failed to load products');
        }
    } catch (error) {
        console.error('Failed to load products:', error);
        // Show error message
        const container = document.getElementById('productsGrid');
        container.innerHTML = `
            <div style="text-align:center; padding:3rem;">
                <i class="fas fa-exclamation-triangle" style="font-size:3rem; color:#c53a1f;"></i>
                <p style="margin-top:1rem;">Unable to load products.</p>
                <p style="font-size:0.9rem; color:#666;">Please check if products.json exists in the root folder.</p>
                <button onclick="location.reload()" style="margin-top:1rem; padding:10px 20px; background:#c53a1f; color:white; border:none; border-radius:30px; cursor:pointer;">Retry</button>
            </div>
        `;
    }
}

// Render product grid
function renderProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const activeCat = document.querySelector('.filter-chip.active')?.dataset.cat || 'all';
    
    let filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm));
    if(activeCat !== 'all') filtered = filtered.filter(p => p.category === activeCat);
    
    const container = document.getElementById('productsGrid');
    
    if (filtered.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:3rem;"><i class="fas fa-search" style="font-size:3rem; color:#ccc;"></i><p style="margin-top:1rem;">No products found. Try another search!</p></div>';
        return;
    }
    
    container.innerHTML = filtered.map(p => `
        <div class="product-card" data-id="${p.id}">
            ${p.category === 'siopao' ? '<div class="badge-promo">Sulit Promo!</div>' : ''}
            <div class="product-img"><img src="${p.image}" alt="${p.name}" onerror="this.src='https://placehold.co/600x400/FFE0CC/AA5A2C?text=No+Image'"></div>
            <div class="product-info">
                <div class="product-title">${escapeHtml(p.name)}</div>
                <div class="product-category">${p.category.toUpperCase()}</div>
                <div class="price">₱${p.price.toFixed(2)}</div>
                <button class="btn-add view-detail" data-id="${p.id}"><i class="fas fa-eye"></i> View & Order</button>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.view-detail').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            openProductDetail(id);
        });
    });
}

// Open product modal
function openProductDetail(productId) {
    const prod = products.find(p => p.id === productId);
    if(!prod) return;
    currentProduct = prod;
    selectedVariantIndex = 0;
    quantity = 1;
    updateModalContent();
    document.getElementById('productModal').style.display = 'flex';
}

// Update modal with current product
function updateModalContent() {
    if(!currentProduct) return;
    const hasVariants = currentProduct.variants && currentProduct.variants.length > 0;
    const currentPrice = hasVariants ? currentProduct.variantPrices[selectedVariantIndex] : currentProduct.price;
    const galleryImgs = currentProduct.gallery && currentProduct.gallery.length ? currentProduct.gallery : [currentProduct.image];
    
    const modalHtml = `
        <div class="modal-gallery">
            <div class="swiper productSwiper" style="width:100%;">
                <div class="swiper-wrapper">
                    ${galleryImgs.map(img => `<div class="swiper-slide"><img src="${img}" alt="gallery" onerror="this.src='https://placehold.co/600x400/FFE0CC/AA5A2C?text=No+Image'"></div>`).join('')}
                </div>
                <div class="swiper-pagination"></div>
                <div class="swiper-button-next"></div>
                <div class="swiper-button-prev"></div>
            </div>
        </div>
        <div class="modal-details">
            <h2 style="font-size:1.8rem;">${escapeHtml(currentProduct.name)}</h2>
            <p style="margin:10px 0; color:#4a5b52;">${escapeHtml(currentProduct.desc)}</p>
            <div class="modal-price" id="modalDisplayPrice">₱${currentPrice.toFixed(2)}</div>
            ${hasVariants ? `<div class="variant-select"><label>Select variant:</label><select id="variantSelect">${currentProduct.variants.map((v, idx) => `<option value="${idx}" ${idx===selectedVariantIndex ? 'selected' : ''}>${escapeHtml(v)} - ₱${currentProduct.variantPrices[idx].toFixed(2)}</option>`).join('')}</select></div>` : ''}
            <div class="qty-control">
                <span>Quantity:</span>
                <div class="qty-btn" id="qtyMinus">-</div>
                <span id="qtyValue" style="font-weight:bold; min-width:40px; text-align:center;">${quantity}</span>
                <div class="qty-btn" id="qtyPlus">+</div>
            </div>
            <button class="btn-add" id="modalAddToCart" style="margin-top:20px;"><i class="fas fa-cart-plus"></i> Add to Cart</button>
        </div>
    `;
    
    document.getElementById('modalDynamicContent').innerHTML = modalHtml;
    
    // Initialize Swiper
    if (typeof Swiper !== 'undefined') {
        new Swiper('.productSwiper', { 
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }, 
            pagination: { el: '.swiper-pagination' }, 
            loop: true 
        });
    }
    
    if(hasVariants) {
        const variantSelect = document.getElementById('variantSelect');
        if (variantSelect) {
            variantSelect.addEventListener('change', (e) => {
                selectedVariantIndex = parseInt(e.target.value);
                const newPrice = currentProduct.variantPrices[selectedVariantIndex];
                document.getElementById('modalDisplayPrice').innerText = `₱${newPrice.toFixed(2)}`;
            });
        }
    }
    
    const qtyMinus = document.getElementById('qtyMinus');
    const qtyPlus = document.getElementById('qtyPlus');
    const qtyValue = document.getElementById('qtyValue');
    
    if (qtyMinus) {
        qtyMinus.addEventListener('click', () => { 
            if(quantity > 1) quantity--; 
            if(qtyValue) qtyValue.innerText = quantity; 
        });
    }
    
    if (qtyPlus) {
        qtyPlus.addEventListener('click', () => { 
            quantity++; 
            if(qtyValue) qtyValue.innerText = quantity; 
        });
    }
    
    const addToCartBtn = document.getElementById('modalAddToCart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const finalPrice = hasVariants ? currentProduct.variantPrices[selectedVariantIndex] : currentProduct.price;
            const variantName = hasVariants ? currentProduct.variants[selectedVariantIndex] : "Standard";
            addToCart(currentProduct.id, currentProduct.name, finalPrice, quantity, variantName);
            document.getElementById('productModal').style.display = 'none';
        });
    }
}

// Helper function to escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Add to cart
function addToCart(id, name, price, qty, variantLabel) {
    const existing = cart.find(item => item.id === id && item.variant === variantLabel);
    if(existing) {
        existing.quantity += qty;
    } else {
        cart.push({ id, name, price, quantity: qty, variant: variantLabel });
    }
    updateCartUI();
}

// Update cart sidebar
function updateCartUI() {
    const cartContainer = document.getElementById('cartItemsList');
    const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const cartTotalElement = document.getElementById('cartTotalAmount');
    const cartCountElement = document.getElementById('cartCount');
    
    if (cartTotalElement) cartTotalElement.innerHTML = `₱${total.toFixed(2)}`;
    if (cartCountElement) cartCountElement.innerText = cart.reduce((s,i)=> s + i.quantity, 0);
    
    if(cart.length === 0) {
        if (cartContainer) cartContainer.innerHTML = '<p style="text-align:center; color:#888;">Cart is empty</p>';
    } else {
        if (cartContainer) {
            cartContainer.innerHTML = cart.map((item, idx) => `
                <div style="display:flex; justify-content:space-between; margin-bottom:12px; border-bottom:1px solid #eee; padding-bottom:8px;">
                    <div>
                        <strong>${escapeHtml(item.name)}</strong><br>
                        <small>${escapeHtml(item.variant)}</small><br>
                        ₱${item.price} x ${item.quantity}
                    </div>
                    <div>
                        <button class="remove-item" data-idx="${idx}" style="background:none; border:none; color:#c53a1f; font-size:1.2rem; cursor:pointer;">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `).join('');
            
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(btn.dataset.idx);
                    cart.splice(idx,1);
                    updateCartUI();
                });
            });
        }
    }
}

// Checkout function
function checkout() {
    if(cart.length === 0) {
        alert('Your cart is empty! Add some products first.');
        return;
    }
    
    const total = cart.reduce((s,i)=> s + (i.price * i.quantity), 0);
    const orderSummary = cart.map(item => `${item.name} (${item.variant}) x${item.quantity} = ₱${(item.price * item.quantity).toFixed(2)}`).join('\n');
    
    if (confirm(`Order Summary:\n\n${orderSummary}\n\n💰 TOTAL: ₱${total.toFixed(2)}\n\n✨ Suki Card promo: Complete 2 cards = FREE 1 Whole Chicken!\n\nProceed to checkout?`)) {
        alert('Thank you for your order! 🎉\n\nPlease visit our store or contact us:\n📍 Main Branch: Aras-asan Cagwait, Surigao del Sur\n📞 0912-345-6789\n\nSalamat sa pagtangkilik, Garypen!');
        cart = [];
        updateCartUI();
        closeCart();
    }
}

// Cart sidebar controls
function openCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.style.display = 'block';
}

function closeCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.style.display = 'none';
}

// Event listeners - make sure elements exist
document.addEventListener('DOMContentLoaded', () => {
    const cartIcon = document.getElementById('cartIcon');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const overlay = document.getElementById('overlay');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const searchInput = document.getElementById('searchInput');
    const filterChips = document.querySelectorAll('.filter-chip');
    const modal = document.getElementById('productModal');
    
    if (cartIcon) cartIcon.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (overlay) overlay.addEventListener('click', closeCart);
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => {
        if (modal) modal.style.display = 'none';
    });
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);
    if (searchInput) searchInput.addEventListener('input', renderProducts);
    
    if (filterChips.length) {
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                filterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                renderProducts();
            });
        });
    }
    
    if (modal) {
        window.addEventListener('click', (e) => { 
            if(e.target === modal) modal.style.display = 'none'; 
        });
    }
    
    // Load products
    loadProducts();
});