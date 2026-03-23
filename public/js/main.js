let products = [];
let cart = [];
let currentProduct = null;
let selectedVariantIndex = 0;
let quantity = 1;

// FALLBACK PRODUCTS (gagamitin kung hindi mag-load ang JSON)
const fallbackProducts = [
    {
        id: 1,
        name: "Dressed Whole Chicken",
        category: "chicken",
        price: 220,
        desc: "Presko, sigurado! Fresh from local farms. Ideal for roasting, tinola, or fried chicken.",
        image: "/images/1.jpg",
        gallery: ["/images/1.jpg", "/images/8.jpg"],
        variants: ["Whole (1.2-1.5kg)", "Whole (1.6-1.9kg)"],
        variantPrices: [220, 280]
    },
    {
        id: 2,
        name: "Pork Liempo",
        category: "pork",
        price: 320,
        desc: "Tender, juicy liempo perfect for grilling. Premium quality, locally sourced.",
        image: "/images/5.jpg",
        gallery: ["/images/9.jpg", "/images/5.jpg"],
        variants: ["500g pack", "1kg pack"],
        variantPrices: [180, 320]
    },
    {
        id: 3,
        name: "Pure Beef Meat",
        category: "beef",
        price: 390,
        desc: "Lean & fresh beef, ideal for kaldereta, nilaga, or steak. Guaranteed quality.",
        image: "/images/9.jpg",
        gallery: ["/images/5.jpg", "/images/9.jpg"],
        variants: ["Tenderloin 500g", "Sirloin 500g"],
        variantPrices: [390, 370]
    },
    {
        id: 4,
        name: "Fresh Eggs (Tray)",
        category: "eggs",
        price: 210,
        desc: "Farm-fresh eggs, siguradong lokal, walang halong chemical. Barato pa!",
        image: "/images/12.jpg",
        gallery: ["/images/12.jpg", "/images/12.jpg"],
        variants: ["30 pcs tray", "60 pcs double tray"],
        variantPrices: [210, 410]
    },
    {
        id: 5,
        name: "Pork Asado Siopao",
        category: "siopao",
        price: 75,
        desc: "Sulit na, lamian pa! Authentic Asado filling, soft bun. Ready to steam.",
        image: "/images/4.jpg",
        gallery: ["/images/4.jpg", "/images/4.jpg"],
        variants: ["1 pc", "3 pcs pack"],
        variantPrices: [75, 210]
    },
    {
        id: 6,
        name: "Pork Siomai",
        category: "siopao",
        price: 120,
        desc: "Classic pork siomai, juicy & flavorful. Perfect partner for sawsawan.",
        image: "/images/4.jpg",
        gallery: ["/images/4.jpg", "/images/4.jpg"],
        variants: ["10 pcs", "20 pcs"],
        variantPrices: [120, 230]
    },
    {
        id: 7,
        name: "Cube Ice",
        category: "ice",
        price: 45,
        desc: "Pure & crystal clear ice. Perfect for drinks & coolers. Bulk & bagged ice available!",
        image: "/images/2.jpg",
        gallery: ["/images/2.jpg", "/images/2.jpg"],
        variants: ["Small bag", "Large bulk bag"],
        variantPrices: [45, 85]
    },
    {
        id: 8,
        name: "Chicken Wings",
        category: "chicken",
        price: 190,
        desc: "Juicy wings, perfect for frying or adobo. Fresh cut-ups available.",
        image: "/images/8.jpg",
        gallery: ["/images/8.jpg", "/images/8.jpg"],
        variants: ["500g pack", "1kg pack"],
        variantPrices: [190, 360]
    },
    {
        id: 9,
        name: "Pork Chop",
        category: "pork",
        price: 260,
        desc: "Thick-cut pork chop, tender and flavorful. Best for frying or grilling.",
        image: "/images/5.jpg",
        gallery: ["/images/5.jpg", "/images/5.jpg"],
        variants: ["2 pcs pack", "4 pcs pack"],
        variantPrices: [260, 500]
    },
    {
        id: 10,
        name: "Fresh Eggs (per piece)",
        category: "eggs",
        price: 9,
        desc: "Per piece farm fresh eggs. Sigurado ka na, barato pa!",
        image: "/images/12.jpg",
        gallery: ["/images/12.jpg"],
        variants: ["per piece", "10 pieces"],
        variantPrices: [9, 85]
    }
];

// Load products
async function loadProducts() {
    try {
        console.log('Loading products...');
        const response = await fetch('/products.json');
        
        if (response.ok) {
            products = await response.json();
            console.log('Products loaded from JSON:', products.length);
        } else {
            console.log('Failed to load JSON, using fallback products');
            products = fallbackProducts;
        }
    } catch (error) {
        console.error('Error loading products:', error);
        console.log('Using fallback products');
        products = fallbackProducts;
    }
    
    renderProducts();
}

// Render product grid
function renderProducts() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const activeCat = document.querySelector('.filter-chip.active')?.dataset.cat || 'all';
    
    let filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm));
    if(activeCat !== 'all') filtered = filtered.filter(p => p.category === activeCat);
    
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    if (filtered.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:3rem;"><i class="fas fa-search" style="font-size:3rem; color:#ccc;"></i><p style="margin-top:1rem;">No products found. Try another search!</p></div>';
        return;
    }
    
    container.innerHTML = filtered.map(p => `
        <div class="product-card" data-id="${p.id}">
            ${p.category === 'siopao' ? '<div class="badge-promo">Sulit Promo!</div>' : ''}
            <div class="product-img"><img src="${p.image}" alt="${p.name}" onerror="this.src='https://placehold.co/600x400/FFE0CC/AA5A2C?text=${encodeURIComponent(p.name)}'"></div>
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

// Add to cart
function addToCart(id, name, price, qty, variantLabel) {
    const existing = cart.find(item => item.id === id && item.variant === variantLabel);
    if(existing) {
        existing.quantity += qty;
    } else {
        cart.push({ id, name, price, quantity: qty, variant: variantLabel });
    }
    updateCartUI();
    alert(`Added ${qty}x ${name} (${variantLabel}) to cart!`);
}

// Update cart UI
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

// Checkout
function checkout() {
    if(cart.length === 0) {
        alert('Your cart is empty! Add some products first.');
        return;
    }
    
    const total = cart.reduce((s,i)=> s + (i.price * i.quantity), 0);
    alert(`Thank you for your order! 🎉\n\nTotal: ₱${total.toFixed(2)}\n\nPlease visit our store:\n📍 Aras-asan Cagwait, Surigao del Sur\n\nSalamat sa pagtangkilik, Garypen!`);
    cart = [];
    updateCartUI();
    closeCart();
}

// Cart controls
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

// Event listeners
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
    
    loadProducts();
});