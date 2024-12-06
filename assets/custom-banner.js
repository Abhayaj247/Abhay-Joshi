document.addEventListener("DOMContentLoaded", function () {
  const shopButton = document.querySelector(".shop-now-button");
  if (shopButton) {
    shopButton.addEventListener("mouseenter", function () {
      const arrow = this.querySelector("svg");
      if (arrow) {
        arrow.style.transform = "translateX(5px)";
      }
    });
    shopButton.addEventListener("mouseleave", function () {
      const arrow = this.querySelector("svg");
      if (arrow) {
        arrow.style.transform = "translateX(0)";
      }
    });
  }
  const menuButton = document.querySelector(".mobile-menu-button");
  const mobileMenu = document.querySelector(".mobile-menu");
  const body = document.body;
  if (menuButton && mobileMenu) {
    const overlay = document.createElement("div");
    overlay.className = "mobile-menu-overlay";
    body.appendChild(overlay);
    menuButton.addEventListener("click", function () {
      this.classList.toggle("active");
      mobileMenu.classList.toggle("active");
      overlay.classList.toggle("active");
      body.style.overflow = body.style.overflow === "hidden" ? "" : "hidden";
    });

    overlay.addEventListener("click", function () {
      menuButton.classList.remove("active");
      mobileMenu.classList.remove("active");
      overlay.classList.remove("active");
      body.style.overflow = "";
    });

    document.addEventListener("keydown", function () {
      if (e.key === "Escape" && mobileMenu.classList.contains("active")) {
        menuButton.classList.remove("active");
        mobileMenu.classList.remove("active");
        overlay.classList.remove("active");
        body.style.overflow = "";
      }
    });
  }
  const buttons = document.querySelectorAll(".animated-button");
  buttons.forEach((button) => {
    button.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-2px)";
      this.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
    });
    button.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "none";
    });
  });

  window.addEventListener("scroll", function () {
    const banner = this.document.querySelector(".banner-section");
    if (banner) {
      if (window.scrollY > 50) {
        banner.classList.add("scrolled");
      } else {
        banner.classList.remove("scrolled");
      }
    }
  });
});
