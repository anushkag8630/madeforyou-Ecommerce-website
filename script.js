// --- OPEN LINKS IN NEW TAB ---
document.querySelectorAll(".menuItems, .pgitem h3, .pgitem .item-img").forEach(item => {
  item.addEventListener("click", () => {
    const pageLink = item.getAttribute("data-link") || item.closest(".pgitem")?.querySelector("h3")?.getAttribute("data-link");
    if (pageLink) window.open(pageLink, "_blank");
  });
});

// --- SAVE/RESTORE SCROLL ---
window.addEventListener("beforeunload", () => {
  localStorage.setItem("scrollPos", window.scrollY);
});
window.addEventListener("load", () => {
  const scrollPos = localStorage.getItem("scrollPos");
  if (scrollPos) window.scrollTo(0, parseInt(scrollPos, 10));
});

// --- SCROLL REVEAL ---
const revealElements = document.querySelectorAll(".Arrivals-container, .footer-container, .pageItems, .pgitem");
revealElements.forEach(el => el.classList.add("scroll-reveal"));
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("active");
    else setTimeout(() => entry.target.classList.remove("active"), 100);
  });
}, { threshold: 0.1 });
revealElements.forEach(el => observer.observe(el));

// --- CART SYSTEM ---
let cart = [];
let username = localStorage.getItem("username");

// --- CART WRAPPER ---
const cartWrapper = document.createElement("div");
const cartImg = document.createElement("img");
const cartCount = document.createElement("div");

if (username) {
  cart = JSON.parse(localStorage.getItem(`cart_${username}`)) || [];
} else {
  cart = [];
}

Object.assign(cartWrapper.style, {
  position: "fixed",
  top: "4px",
  right: "15px",
  width: "35px",
  height: "35px",
  zIndex: "2000",
  cursor: "pointer"
});

// Cart image
cartImg.src = "images/cart.jpg";
Object.assign(cartImg.style, {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  position: "absolute",
  top: "0px",
  marginTop: "20px",
  right: "100px",
  cursor: "pointer",
});
cartWrapper.appendChild(cartImg);

// Cart badge
cartCount.id = "cart-count";
cartCount.textContent = cart.length > 0 ? cart.reduce((s, i) => s + (i.qty || 0), 0) : "0";
Object.assign(cartCount.style, {
  position: "absolute",
  top: "15px",
  right: "95px",
  background: "#FF8400",
  color: "#FFFFFF",
  fontSize: "13px",
  fontWeight: "bold",
  width: "20px",
  height: "20px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
});
cartWrapper.appendChild(cartCount);
document.body.appendChild(cartWrapper);

// --- UPDATE CART COUNT ---
const updateCartCount = () => {
  const totalQty = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  cartCount.textContent = totalQty > 0 ? totalQty : "0";
};
updateCartCount();

// --- TOAST MESSAGE ---
const toast = document.createElement("div");
toast.id = "cart-toast";
Object.assign(toast.style, {
  position: "fixed",
  bottom: "30px",
  right: "30px",
  background: "#FF8400",
  color: "#FFFFFF",
  padding: "12px 20px",
  borderRadius: "10px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  opacity: "0",
  transition: "opacity 0.4s ease, transform 0.4s ease",
  transform: "translateY(20px)",
  zIndex: "3000",
  fontSize: "15px",
  fontWeight: "500"
});
document.body.appendChild(toast);

const showToast = (msg) => {
  toast.textContent = msg;
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
  }, 2000);
};

// --- ADD TO CART BUTTONS ---
document.querySelectorAll(".add-cart").forEach((button) => {
  button.addEventListener("click", () => {
    username = localStorage.getItem("username");

    if (!username) {
      renderCart(); // show warning in sidebar
      cartCount.textContent = "0";
      return;
    }

    const card = button.closest(".product-card") || button.closest(".arrivals") || button.closest("div");
    const name = card.querySelector("h3")?.innerText || "Item";

    let price = 0;
    if (typeof getPrice === "function") price = getPrice(card);

    const image = card.querySelector("img")?.src || "";

    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.qty = (existing.qty || 0) + 1;
    } else {
      cart.push({ name, price, image, qty: 1 });
    }

    localStorage.setItem(`cart_${username}`, JSON.stringify(cart));
    updateCartCount();
    renderCart();
  });
});

// --- CART SIDEBAR ---
const cartSidebar = document.createElement("div");
cartSidebar.id = "cart-sidebar";
Object.assign(cartSidebar.style, {
  position: "fixed",
  top: "0",
  right: "-400px",
  width: "350px",
  height: "100%",
  background: "#FFFFFF",
  boxShadow: "-3px 0 10px rgba(0,0,0,0.2)",
  padding: "20px",
  zIndex: "5000",
  transition: "right 0.4s ease",
  overflowY: "auto",
  fontFamily: "Arial, sans-serif"
});
document.body.appendChild(cartSidebar);

const cartHeader = document.createElement("div");
cartHeader.innerHTML = `<h2 style="margin:0 0 15px; font-size:20px; color:#333;">🛒 Your Cart</h2>`;
cartSidebar.appendChild(cartHeader);

const cartItemsContainer = document.createElement("div");
cartSidebar.appendChild(cartItemsContainer);

const closeBtn = document.createElement("button");
closeBtn.textContent = "×";
Object.assign(closeBtn.style, {
  position: "absolute",
  top: "10px",
  right: "15px",
  background: "none",
  border: "none",
  fontSize: "24px",
  cursor: "pointer",
  color: "#333"
});
cartSidebar.appendChild(closeBtn);

closeBtn.addEventListener("click", () => {
  cartSidebar.style.right = "-400px";
});

// --- RENDER CART FUNCTION ---
const renderCart = () => {
  username = localStorage.getItem("username");
  cartItemsContainer.innerHTML = "";

  if (!username) {
    cartItemsContainer.innerHTML = "<p style='color:#FF8400; font-weight:bold;'>⚠️ Please login to your account!</p>";
    return;
  }

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p style='color:#777;'>Your cart is empty.</p>";
    return;
  }

  cart.forEach((item, index) => {
    const itemDiv = document.createElement("div");
    Object.assign(itemDiv.style, {
      display: "flex",
      alignItems: "center",
      marginBottom: "12px",
      borderBottom: "1px solid #eee",
      paddingBottom: "10px"
    });
    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}" style="width:50px;height:50px;border-radius:8px;margin-right:10px;">
      <div style="flex:1;">
        <p style="margin:0;font-weight:500;color:#333;">${item.name}</p>
        <p style="margin:0;font-size:14px;color:#555;">₹${item.price}</p>
        <div style="display:flex;align-items:center;margin-top:5px;">
          <button data-action="dec" data-index="${index}" style="padding:2px 6px;margin-right:5px;border:none;background:#ddd;cursor:pointer;">-</button>
          <span style="min-width:20px;text-align:center;">${item.qty || 1}</span>
          <button data-action="inc" data-index="${index}" style="padding:2px 6px;margin-left:5px;border:none;background:#ddd;cursor:pointer;">+</button>
        </div>
      </div>
      <button data-action="remove" data-index="${index}" style="background:#FF4D4D;border:none;color:white;padding:5px 8px;border-radius:6px;cursor:pointer;font-size:12px;margin-left:10px;">Remove</button>
    `;
    cartItemsContainer.appendChild(itemDiv);
  });

  cartItemsContainer.querySelectorAll("button").forEach((btn) => {
    const i = btn.getAttribute("data-index");
    const action = btn.getAttribute("data-action");

    btn.addEventListener("click", () => {
      if (action === "remove") cart.splice(i, 1);
      else if (action === "inc") cart[i].qty = (cart[i].qty || 0) + 1;
      else if (action === "dec") {
        cart[i].qty = (cart[i].qty || 0) - 1;
        if (cart[i].qty <= 0) cart.splice(i, 1);
      }
      localStorage.setItem(`cart_${username}`, JSON.stringify(cart));
      updateCartCount();
      renderCart();
    });
  });
};

// --- OPEN CART SIDEBAR ---
cartWrapper.addEventListener("click", () => {
  renderCart();
  cartSidebar.style.right = "0";
});

// --- GUEST / USER DISPLAY ---
document.addEventListener("DOMContentLoaded", () => {
  const guestText = document.querySelector(".guest-text");
  const guestIcon = document.querySelector(".guest");

  username = localStorage.getItem("username");
  if (guestText) guestText.textContent = username || "Guest";

  [guestText, guestIcon].forEach(el => {
    if (el) {
      el.style.cursor = "pointer";
      el.addEventListener("click", () => {
        if (!username) window.location.href = "login.html";
        else window.location.href = "profile.html";
      });
    }
  });
});

  // --- Sync across tabs ---
  window.addEventListener("storage", (event) => {
    if (event.key === `cart_${username}`) {
      cart = JSON.parse(event.newValue) || [];
      updateCartCount();
    }
  });