document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("quickViewModal");
  const modalContent = document.querySelector(".modal-body");
  const closeButton = document.querySelector(".close-modal");
  let currentProduct = null;

  initQuickViewButton();
  initModalClose();
  initKeyboardEvents();

  function initQuickViewButton() {
    document.querySelectorAll(".quick-view-button").forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const productId = this.dataset.productId;
        openQuickView(productId);
      });
    });
  }

  function initModalClose() {
    closeButton?.addEventListener("click", closeQuickView);
    modal?.addEventListener("click", function (e) {
      if (e.target === modal) {
        closeQuickView();
      }
    });
  }

  function initKeyboardEvents() {
    document.addEventListener("keydown", function (e) {
      if (e.key == "Escape" && modal?.style.display === "block") {
        closeQuickView();
      }
    });
  }

  async function openQuickView(productId) {
    try {
      showLoading();
      const response = await fetch(`/products/${productId}.js`);
      if (!response.ok) throw new Error("Failed to fetch product");

      const product = await response.json();
      currentProduct = product;

      renderQuickView(product);
      showModal();
      initializeProductInteractions();
    } catch (error) {
      console.error("Error loading product:", error);
      showError("Failed to load product details");
    } finally {
      hideLoading();
    }
  }

  function renderQuickView(product) {
    if (!modalContent) return;

    modalContent.innerHTML = `
    <div class="quick-view-product">
      <div class="product-image">
        <img
          src="${product.featured_image}"
          alt="${product.title}"
          width="600"
          height="600"
          class="modal-product-image"
          loading="lazy" />
      </div>
      <div class="product-details">
        <h2 class="product-title">${product.title}</h2>
        <p class="price">${formatMoney(product.price)}</p>
        <div class="product-description">${product.description}</div>
        ${genreateVariantSelectors(product)}
        <div class="quantity-selector">
          <label>Quantity</label>
          <div class="quantity-controls">
            <button class="quantity-btn minus" aria-label="Decrease quantity">-</button>
            <input type="number" class="quantity-input" value="1" min="1" max="99" aria-label="Product quantity" />
            <button class="quantity-btn plus" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="add-to-cart-button" ${
          product.available ? "disabled" : ""
        }>
          ${product.available ? "ADD TO CART" : "SOLD OUT"}
        </button>
      </div>
    </div>
    `;
  }

  function genreateVariantSelectors(product) {
    if (!product.variants || product.variants.length <= 1) return "";

    return product.options
      .map(
        (option, index) => `
    <div class="variant-selector" data-option="${index}">
      <label for="option${index}">${option.name}</label>
      <select id="option${index}" class="variant-select" data-option="${
          option.name
        }">
        ${option.values
          .map(
            (value) => `
          <option
            value="${value}"
            ${!isVariantAvailable(product, index, value) ? "disabled" : ""}
          >
            ${value}
          </option>
        `
          )
          .join("")}
      </select>
    </div>
    `
      )
      .join("");
  }

  function initializeProductInteractions() {
    initializeVariantSelectors();
    initializaeQuantityControls();
    initializeAddToCart();
  }

  function initializeVariantSelectors() {
    modalContent?.querySelectorAll(".variant-select").forEach((select) => {
      select.addEventListener("change", handleVariantSelection);
    });
  }

  function initializaeQuantityControls() {
    const quantityInput = modalContent?.querySelector(".quantity-input");
    const minusBtn = modalContent?.querySelector(".quantity-btn.minus");
    const plusBtn = modalContent?.querySelector(".quantity-btn.plus");

    minusBtn?.addEventListener("click", () => updateQuantity("decrease"));
    plusBtn?.addEventListener("click", () => updateQuantity("increase"));
    quantityInput?.addEventListener("change", validateQuantity);
  }

  function initializeAddToCart() {
    const addToCartButton = modalContent?.querySelector(".add-to-cart-button");
    addToCartButton?.addEventListener("click", handleAddToCart);
  }

  function handleVariantSelection(e) {
    const select = e.target;
    const optionIndex = select.closest(".variant-selector").dataset.optionIndex;
    const value = select.value;

    updateVariantSelection();
  }

  function updateVariantSelection() {
    const selectedOptions = getSelectedOptions();
    const variant = findVariant(selectedOptions);

    if (variant) {
      updatePrice(variant.price);
      updateAddToCartButton(variant.available);
      updateProductImage(
        variant.featured_image?.src || currentProduct.featured_image
      );
    }
  }

  function getSelectedOptions() {
    const options = [];
    modalContent?.querySelectorAll(".variant-select").forEach((select) => {
      options.push({
        name: select.dataset.option,
        value: select.value,
      });
    });
    return options;
  }

  function findVariant(selectedOptions) {
    return currentProduct?.variants.find((variant) =>
      selectedOptions.every(
        (option) => variant[`option${option.index + 1}`] === option.value
      )
    );
  }

  function isVariantAvailable(product, optionIndex, optionValue) {
    return product.variants.some((variant) => {
      return (
        variant[`option${optionIndex + 1}`] === optionValue && variant.available
      );
    });
  }

  //Black adn Medium Variant Check
  function isBlackAndMediumVariant(selectedOptions) {
    return (
      selectedOptions.some(
        (option) => option.value.toLowerCase() === "black"
      ) &&
      selectedOptions.some((option) => option.value.toLowerCase() === "medium")
    );
  }

  //Soft Winter Jacket Addition
  async function addSoftWinterJacket() {
    try {
      const response = await fetch("/product/soft-winter-jacket.js");
      if (!response.ok) throw new Error("Failed to fetch Soft Winter Jacket");

      const product = await response.json();
      const defaultVariant = product.variants[0];

      if (!defaultVariant)
        throw new Error("No variant found for Soft Winter Jacket");

      const cartResponse = await fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              id: defaultVariant.id,
              quantity: 1,
            },
          ],
        }),
      });
      if (!cartResponse.ok)
        throw new Error("Failed to add Soft Winter Jacket to cart");

      return cartResponse.json();
    } catch (error) {
      console.error("Error adding Soft Winter Jacket:", error);
      throw error;
    }
  }

  function updateQuantity(action) {
    const input = modalContent?.querySelector(".quntity-input");
    if (!input) return;

    let value = parseInt(input.value);
    value =
      action === "decrease" ? Math.max(1, value - 1) : Math.min(99, value + 1);
    input.value = value;
  }

  function validateQuantity(e) {
    const input = e.target;
    let value = parseInt(input.value);

    if (isNaN(value) || value < 1) value = 1;
    if (value > 99) value = 99;

    input.value = value;
  }

  async function handleAddToCart() {
    const selectedOptions = getSelectedOptions();
    const variant = findVariant(selectedOptions);
    const quantity = parseInt(
      modalContent?.querySelector(".quantity-input")?.value || 1
    );

    if (!variant) {
      showError("Please select all options");
      return;
    }

    try {
      showLoading();
      await addToCart(variant.id, quantity, selectedOptions);
      await updateCartDrawer();
      closeQuickView();
      showSuccess("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      showError("Failed to add to cart");
    } finally {
      hideLoading();
    }
  }

  async function addToCart(variantId, quantity, selectedOptions) {
    try {
      const response = await fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              id: variantId,
              quantity: quantity,
            },
          ],
        }),
      });
      if (!response.ok) throw new Error("Add to cart failed");

      if (isBlackAndMediumVariant(selectedOptions)) {
        await addSoftWinterJacket();
      }
      return response.json();
    } catch (error) {
      console.error("Error in addToCart:", error);
      throw error;
    }
  }

  async function updateCartDrawer() {
    const response = await fetch("/cart.js");
    if(!response.ok) throw new Error('Failed to fetch cart')


    const cart = await response.json();

    document.querySelectorAll(".cart-count").forEach((elem) => {
      elem.textContent = cart.item_count;
    });
  }

  function showModal() {
    if (modal) {
      modal.style.display = "block";
      document.body.style.overflow = "hidden";
    }
  }

  function closeQuickView() {
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "";
      currentProduct = null;
    }
  }

  function showLoading() {
    const loader = document.createElement("div");
    loader.className = "loader-spinner";
    modalContent?.appendChild(loader);

    if(modalContent){
      modalContent.classList.add("loading");
    }
  }

  function hideLoading() {
    modalContent?.querySelector(".loader-spinner")?.remove()
    if(modalContent){
      modalContent.classList.remove("loading")
    }
  }

  function showError(message) {
    createNotification(message, "error");
  }

  function showSuccess(message) {
    createNotification(message, "success");
  }

  function createNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(()=> notification.remove(),3000);
  }

  function formatMoney(cents) {
    return new Int1.NumberFormat('en-US',{
      style: 'currency',
      currency: 'USD'
    }).format(cents/100)
  }

  function updatePrice(price) {
    const priceElement = modalContent?.querySelector(".price");
    if (priceElement) {
      priceElement.textContent = formatMoney(price);
    }
  }

  function updateAddToCartButton(available) {
    const button = modalContent?.querySelector(".add-to-cart-button");
    if (button) {
      button.disabled = !available;
      button.textContent = available ? "ADD TO CART" : "SOLD OUT";
    }
  }

  function updateProductImage(imageUrl) {
    const image = modalContent?.querySelector(".modal-product-image");
    if (image && imageUrl) {
      image.src = imageUrl;
    }
  }
});
