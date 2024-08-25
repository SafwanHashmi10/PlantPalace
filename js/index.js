document.addEventListener("DOMContentLoaded", () => {
    // Function to show success alert
    const showSuccessAlert = (message) => {
      const alert = document.getElementById("success-alert");
      if (alert) {
        alert.innerText = message;
        alert.style.display = "block";
        setTimeout(() => {
          alert.style.display = "none";
        }, 3000);
      }
    };
  
    // Function to update cart counter
    const updateCartCounter = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const cartCounter = document.getElementById("cart-counter");
      if (cartCounter) {
        cartCounter.textContent = cart.reduce(
          (total, item) => total + item.quantity,
          0
        );
      }
    };
  
    // Function to update cart and re-render
    const updateCart = () => {
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCartItems();
      updateCartCounter();
    };
  
    // Function to render cart items
    const renderCartItems = () => {
      const cartItemsDiv = document.getElementById("cart-items");
      const cartTotalPrice = document.getElementById("cart-total-price");
      const placeOrderBtn = document.getElementById("place-order-btn");
  
      if (!cartItemsDiv || !cartTotalPrice || !placeOrderBtn) return;
  
      cartItemsDiv.innerHTML = "";
      let totalPrice = 0;
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
      if (cart.length === 0) {
        placeOrderBtn.style.display = "none";
      } else {
        placeOrderBtn.style.display = "block";
      }
  
      cart.forEach((item, index) => {
        totalPrice += item.price * item.quantity;
  
        const itemDiv = document.createElement("div");
        itemDiv.className =
          "d-flex justify-content-between align-items-center mb-2";
        itemDiv.innerHTML = `
              <span>${item.name} (x${item.quantity})</span>
              <div>
                  <button class="btn btn-sm btn-outline-secondary me-2" onclick="decreaseQuantity(${index})">-</button>
                  <button class="btn btn-sm btn-outline-secondary me-2" onclick="increaseQuantity(${index})">+</button>
                  <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${index})">Remove</button>
              </div>
          `;
        cartItemsDiv.appendChild(itemDiv);
      });
  
      cartTotalPrice.innerText = totalPrice.toFixed(2);
    };
  
    // Global functions to handle cart item quantity changes
    window.increaseQuantity = (index) => {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      cart[index].quantity += 1;
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCartItems();
      updateCartCounter();
    };
  
    window.decreaseQuantity = (index) => {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCartItems();
        updateCartCounter();
      }
    };
  
    window.removeFromCart = (index) => {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCartItems();
      updateCartCounter();
    };
  
    // Function to add product to cart
    window.addToCart = (product) => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        console.log("Product to add:", product); // Debugging line
        const existingProductIndex = cart.findIndex(
          (item) => item.id === product.id
        );

        if (existingProductIndex > -1) {
          cart[existingProductIndex].quantity += 1;
          console.log("Updated cart item:", cart[existingProductIndex]); // Debugging line
        } else {
          cart.push({ ...product, quantity: 1 });
          console.log("Added new product to cart:", product); // Debugging line
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCounter();
        showSuccessAlert("Product added to cart!");
    };
  
    // Function to show cart modal
    const showCartModal = () => {
      renderCartItems();
      const cartModal = document.getElementById("cartModal");
      if (cartModal) {
        const bootstrapModal = new bootstrap.Modal(cartModal);
        bootstrapModal.show();
      }
    };
  
    // Function to handle place order
    const handlePlaceOrder = () => {
      showSuccessAlert("Your order has been placed!");
      localStorage.setItem("cart", JSON.stringify([]));
      updateCartCounter();
      const cartModal = bootstrap.Modal.getInstance(
        document.getElementById("cartModal")
      );
      if (cartModal) {
        cartModal.hide();
      }
    };
  
    // Function to show product modal
    window.showProductModal = (product) => {
      document.getElementById("product_img").src = product.imageUrl;
      document.getElementById("product_name").innerText = product.name;
      document.getElementById("product_scientific_name").innerText =
        product.scientificName || "N/A";
      document.getElementById("product_category").innerText =
        product.category || "N/A";
      document.getElementById("product_origin").innerText =
        product.origin || "N/A";
      document.getElementById("product_watering_cycle").innerText =
        product.wateringCycle || "N/A";
      document.getElementById("product_light_requirements").innerText =
        product.lightRequirements || "N/A";
      document.getElementById("product_desc").innerText =
        product.description || "N/A";
      document.getElementById(
        "product_price"
      ).innerText = `$${product.price.toFixed(2)}`;
  
      const productModal = document.getElementById("productModal");
      if (productModal) {
        const bootstrapModal = new bootstrap.Modal(productModal);
        bootstrapModal.show();
      }
    };
  
    // Fetch and display featured products
    const productsContainer = document.querySelector(".products-container");
    if (productsContainer) {
      fetch("../data/plants.json")
        .then((response) => response.json())
        .then((data) => {
          data.plants
            .filter((product) => product.productType === "Featured Products")
            .forEach((product) => {
              const productCard = `
                            <div class="col-md-3 mb-4">
                              <div class="card custom-card" onclick='showProductModal(${JSON.stringify(
                                product
                              ).replace(/'/g, "\\'")})'>
                                <img src="${
                                  product.imageUrl
                                }" class="card-img-top" alt="${product.name}" />
                                <div class="card-body">
                                  <h5 class="card-title">${product.name}</h5>
                                  <p class="card-text">$${product.price.toFixed(
                                    2
                                  )}</p>
                                  <button class="btn btn-success" onclick='event.stopPropagation(); addToCart(${JSON.stringify(
                                    product
                                  ).replace(/'/g, "\\'")})'>Add to Cart</button>
                                </div>
                              </div>
                            </div>
                        `;
              productsContainer.innerHTML += productCard;
            });
  
          updateCartCounter(); // Update cart counter after loading products
        })
        .catch((error) => console.error("Error fetching the JSON:", error));
    }
  
    // Add event listener for cart modal
    document
      .querySelector('.nav-link[data-bs-toggle="modal"]')
      .addEventListener("click", showCartModal);
  
    // Add event listener for place order button
    document
      .getElementById("place-order-btn")
      .addEventListener("click", handlePlaceOrder);
  });
  