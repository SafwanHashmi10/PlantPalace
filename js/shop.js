document.addEventListener("DOMContentLoaded", () => {
  fetch("../data/plants.json")
    .then((response) => response.json())
    .then((data) => {
      const plants = data.plants;
      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      // Show success alert
      const showSuccessAlert = (message) => {
        const alert = document.getElementById("success-alert");
        alert.innerText = message;
        alert.style.display = "block";
        setTimeout(() => {
          alert.style.display = "none";
        }, 3000);
      };

      // Update cart counter
      const updateCartCounter = () => {
        const cartCounter = document.getElementById("cart-counter");
        cartCounter.innerText = cart.reduce(
          (total, item) => total + item.quantity,
          0
        );
      };

      // Update cart in local storage and re-render
      const updateCart = () => {
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCartItems();
        updateCartCounter();
      };

      // Render cart items
      const renderCartItems = () => {
        const cartItemsDiv = document.getElementById("cart-items");
        const cartTotalPrice = document.getElementById("cart-total-price");
        const placeOrderBtn = document.getElementById("place-order-btn");

        // Check if elements exist
        if (!cartItemsDiv || !cartTotalPrice || !placeOrderBtn) return;

        // Clear the cart items container
        cartItemsDiv.innerHTML = "";
        let totalPrice = 0;
        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        // Show or hide the "Place Order" button based on the cart's content
        if (cart.length === 0) {
          placeOrderBtn.style.display = "none"; // Hide if cart is empty
        } else {
          placeOrderBtn.style.display = "block"; // Show if there are items in the cart
        }

        // Render each item in the cart
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

        // Update the total price display
        cartTotalPrice.innerText = totalPrice.toFixed(2);
      };

      // Increase quantity of product
      window.increaseQuantity = (index) => {
        cart[index].quantity += 1;
        updateCart();
      };

      // Decrease quantity of product
      window.decreaseQuantity = (index) => {
        if (cart[index].quantity > 1) {
          cart[index].quantity -= 1;
          updateCart();
        }
      };

      // Remove product from cart
      window.removeFromCart = (index) => {
        cart.splice(index, 1);
        updateCart();
      };

      const addToCart = (product) => {
        const existingProductIndex = cart.findIndex(
          (item) => item.id === product.id
        );
        if (existingProductIndex > -1) {
          cart[existingProductIndex].quantity += 1;
        } else {
          cart.push({ ...product, quantity: 1 });
        }
        updateCart();
        showSuccessAlert("Product added to cart!");
      };

      const renderProducts = (productsToRender) => {
        const productsDiv = document.getElementById("products");
        productsDiv.innerHTML = ""; // Clear existing products

        productsToRender.forEach((product) => {
          const col = document.createElement("div");
          col.className = "col-lg-3 col-md-4 col-sm-6 mb-4 d-flex justify-content-center";

          const card = document.createElement("div");
          card.className = "card product-card border-0 cursor-pointer w-100";
          card.dataset.productId = product.id; // Create a data attribute to store product ID

          const img = document.createElement("img");
          img.src = product.imageUrl;
          img.className = "card-img-top product-image";

          const cardBody = document.createElement("div");
          cardBody.className = "card-body px-2";

          const cardTitle = document.createElement("h5");
          cardTitle.className = "card-title";
          cardTitle.innerText = product.name;

          const cardPrice = document.createElement("p");
          cardPrice.className = "card-text";
          cardPrice.innerText = `$${product.price.toFixed(2)}`;

          const cartBtn = document.createElement("button");
          cartBtn.className = "btn btn-success mb-3";
          cartBtn.innerText = "Add to Cart";
          cartBtn.style.fontSize = "12px";
          cartBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent modal open
            addToCart(product);
          });

          cardBody.appendChild(cardTitle);
          cardBody.appendChild(cardPrice);
          cardBody.appendChild(cartBtn);

          card.appendChild(img);
          card.appendChild(cardBody);

          col.appendChild(card);
          productsDiv.appendChild(col);
        });

        // Add event listener for each product card to open the product modal
        document.querySelectorAll(".product-card").forEach((card) => {
          card.addEventListener("click", (e) => {
            const productId = e.currentTarget.dataset.productId;
            const product = plants.find((p) => p.id === parseInt(productId));
            if (product) {
              // Populate the modal with product details
              document.getElementById("product_img").src = product.imageUrl;
              document.getElementById("product_name").innerText = product.name;
              document.getElementById("product_scientific_name").innerText =
                product.scientificName || "N/A";
              document.getElementById(
                "product_category"
              ).innerText = `Category: ${product.category}`;
              document.getElementById("product_origin").innerText = `Origin: ${
                product.origin || "N/A"
              }`;
              document.getElementById(
                "product_watering_cycle"
              ).innerText = `Watering Cycle: ${product.wateringCycle || "N/A"}`;
              document.getElementById(
                "product_light_requirements"
              ).innerText = `Light Requirements: ${
                product.lightRequirements || "N/A"
              }`;
              document.getElementById("product_desc").innerText =
                product.description || "No description available.";
              document.getElementById(
                "product_price"
              ).innerText = `$${product.price.toFixed(2)}`;

              // Show the modal
              const productModal = new bootstrap.Modal(
                document.getElementById("productModal")
              );
              productModal.show();

              // Add event listener to the modal's "Add to cart" button
              document.getElementById("add-to-cart-btn").onclick = () => {
                addToCart(product);
                // Close the modal after adding to cart
                productModal.hide();
              };
            }
          });
        });
      };

      const filterProducts = (query, productsToFilter) => {
        return productsToFilter.filter((product) =>
          product.name.toLowerCase().includes(query.toLowerCase())
        );
      };

      const handleSearch = () => {
        const searchInput = document.getElementById("navbar-search-bar").value;
        const filteredPlants = filterProducts(searchInput, plants);
        renderProducts(filteredPlants);
      };

      const handleFilter = () => {
        let filteredPlants = [...plants];
        const minPrice =
          parseFloat(document.getElementById("minprice").value) || 0;
        const maxPrice =
          parseFloat(document.getElementById("maxprice").value) || Infinity;
        const wateringCycle = document.getElementById(
          "select-watering-cycle"
        ).value;
        const lightRequirements = document.getElementById(
          "select-light-requirements"
        ).value;
        const sortAlphabetical =
          document.getElementById("sort-alphabetical").value;

        if (minPrice > 0) {
          filteredPlants = filteredPlants.filter(
            (product) => product.price >= minPrice
          );
        }

        if (maxPrice < Infinity) {
          filteredPlants = filteredPlants.filter(
            (product) => product.price <= maxPrice
          );
        }

        if (wateringCycle) {
          filteredPlants = filteredPlants.filter(
            (product) => product.wateringCycle === wateringCycle
          );
        }

        if (lightRequirements) {
          filteredPlants = filteredPlants.filter(
            (product) => product.lightRequirements === lightRequirements
          );
        }

        if (sortAlphabetical) {
          filteredPlants.sort((a, b) =>
            sortAlphabetical === "asc"
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name)
          );
        }

        renderProducts(filteredPlants);
      };

      // Initial render
      renderProducts(plants);
      updateCartCounter();

      // Event listeners for search functionality
      document
        .getElementById("filter-form")
        .addEventListener("submit", function (event) {
          event.preventDefault();
          handleFilter();
        });

      document
        .getElementById("navbar-search-form")
        .addEventListener("submit", function (event) {
          event.preventDefault();
          handleSearch();
        });

      const handleTabClick = (event) => {
        const tabs = document.querySelectorAll(".nav-link");

        // Remove 'active' class from all tabs
        tabs.forEach((tab) => tab.classList.remove("active"));

        // Add 'active' class to clicked tab
        event.target.classList.add("active");
      };

      // Event listeners for tabs
      document
        .getElementById("all_products_tab")
        .addEventListener("click", (event) => {
          handleTabClick(event);
          renderProducts(plants);
        });

      document
        .getElementById("indoor_products_tab")
        .addEventListener("click", (event) => {
          handleTabClick(event);
          const indoorPlants = plants.filter(
            (product) => product.category === "Indoor"
          );
          renderProducts(indoorPlants);
        });

      document
        .getElementById("outdoor_products_tab")
        .addEventListener("click", (event) => {
          handleTabClick(event);
          const outdoorPlants = plants.filter(
            (product) => product.category === "Outdoor"
          );
          renderProducts(outdoorPlants);
        });

      document
        .getElementById("succulents_products_tab")
        .addEventListener("click", (event) => {
          handleTabClick(event);
          const succulentsPlants = plants.filter(
            (product) => product.category === "Succulents"
          );
          renderProducts(succulentsPlants);
        });

      document
        .getElementById("Flowering_Shrubs_products_tab")
        .addEventListener("click", (event) => {
          handleTabClick(event);
          const floweringShrubsPlants = plants.filter(
            (product) => product.category === "Flowering Shrubs"
          );
          renderProducts(floweringShrubsPlants);
        });
    });
});
