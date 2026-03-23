let products = [];
let cart = [];
let currentProduct = null;
let selectedVariantIndex = 0;
let quantity = 1;

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

// Render product grid
function renderProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const activeCat = document.querySelector('.filter-chip.active')?.dataset.cat || 'all';
    
    let filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm));
    if(activeCat !== 'all') filtered = filtered.filter(p => p.category === activeCat);
    
    const container = document.getElementById('productsGrid');
    container.innerHTML = filtered.map(p => `
        <div class="product-card" data-id="${p.id}">
            ${p.category === 'siopao' ? '<div class="badge-promo">Sulit Promo!</div>' : ''}
            <div class="product-img"><img src="${p.image}" alt="${p.name}"></div>
            <div class="product-info">
                <div class="product-title">${p.name}</div>
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
                    ${galleryImgs.map(img => `<div class="swiper-slide"><img src="${img}" alt="gallery"></div>`).join('')}
                </div>
                <div class="swiper-pagination"></div>
                <div class="swiper-button-next"></div>
                <div class="swiper-button-prev"></div>
            </div>
        </div>
        <div class="modal-details">
            <h2 style="font-size:1.8rem;">${currentProduct.name}</h2>
            <p style="margin:10px 0; color:#4a5b52;">${currentProduct.desc}</p>
            <div class="modal-price" id="modalDisplayPrice">₱${currentPrice.toFixed(2)}</div>
            ${hasVariants ? `<div class="variant-select"><label>Select variant:</label><select id="variantSelect">${currentProduct.variants.map((v, idx) => `<option value="${idx}" ${idx===selectedVariantIndex ? 'selected' : ''}>${v} - ₱${currentProduct.variantPrices[idx].toFixed(2)}</option>`).join('')}</select></div>` : ''}
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
    new Swiper('.productSwiper', { 
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }, 
        pagination: { el: '.swiper-pagination' }, 
        loop: true 
    });
    
    if(hasVariants) {
        const variantSelect = document.getElementById('variantSelect');
        variantSelect.addEventListener('change', (e) => {
            selectedVariantIndex = parseInt(e.target.value);
            const newPrice = currentProduct.variantPrices[selectedVariantIndex];
            document.getElementById('modalDisplayPrice').innerText = `₱${newPrice.toFixed(2)}`;
        });
    }
    
    document.getElementById('qtyMinus').addEventListener('click', () => { 
        if(quantity>1) quantity--; 
        document.getElementById('qtyValue').innerText = quantity; 
    });
    
    document.getElementById('qtyPlus').addEventListener('click', () => { 
        quantity++; 
        document.getElementById('qtyValue').innerText = quantity; 
    });
    
    document.getElementById('modalAddToCart').addEventListener('click', () => {
        const finalPrice = hasVariants ? currentProduct.variantPrices[selectedVariantIndex] : currentProduct.price;
        const variantName = hasVariants ? currentProduct.variants[selectedVariantIndex] : "Standard";
        addToCart(currentProduct.id, currentProduct.name, finalPrice, quantity, variantName);
        document.getElementById('productModal').style.display = 'none';
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
    document.getElementById('cartTotalAmount').innerHTML = `₱${total.toFixed(2)}`;
    document.getElementById('cartCount').innerText = cart.reduce((s,i)=> s+i.quantity,0);
    
    if(cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align:center; color:#888;">Cart is empty</p>';
    } else {
        cartContainer.innerHTML = cart.map((item, idx) => `
            <div style="display:flex; justify-content:space-between; margin-bottom:12px; border-bottom:1px solid #eee; padding-bottom:8px;">
                <div>
                    <strong>${item.name}</strong><br>
                    <small>${item.variant}</small><br>
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

// Checkout function
async function checkout() {
    if(cart.length === 0) {
        alert('Your cart is empty! Add some products first.');
        return;
    }
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart, total: cart.reduce((s,i)=> s + (i.price * i.quantity), 0), date: new Date() })
        });
        const result = await response.json();
        alert(result.message + '\n\nSuki Card promo: Complete 2 cards = FREE 1 Whole Chicken! 🎉');
        cart = [];
        updateCartUI();
        closeCart();
    } catch (error) {
        alert('Order placed! Thank you for shopping at Garypen! 🛒');
        cart = [];
        updateCartUI();
        closeCart();
    }
}

// Cart sidebar controls
function openCart() {
    document.getElementById('cartSidebar').classList.add('open');
    document.getElementById('overlay').style.display = 'block';
}

function closeCart() {
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('overlay').style.display = 'none';
}

// Event listeners
document.getElementById('cartIcon').addEventListener('click', openCart);
document.getElementById('closeCartBtn').addEventListener('click', closeCart);
document.getElementById('overlay').addEventListener('click', closeCart);
document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('productModal').style.display = 'none';
});
document.getElementById('checkoutBtn').addEventListener('click', checkout);

window.addEventListener('click', (e) => { 
    if(e.target === document.getElementById('productModal')) 
        document.getElementById('productModal').style.display = 'none'; 
});

document.getElementById('searchInput').addEventListener('input', renderProducts);

document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderProducts();
    });
});

// Load products on page load
loadProducts();