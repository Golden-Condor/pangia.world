

document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const menuContainer = document.querySelector(".menu-container");

  if (hamburger && menuContainer) {
    hamburger.addEventListener("click", function () {
      menuContainer.classList.toggle("collapsed");
    });
  }
});
