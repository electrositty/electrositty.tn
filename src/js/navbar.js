
const menuBtn = document.getElementById("menu-btn");
const closeMenu = document.getElementById("close-menu");
const mobileMenu = document.getElementById("mobile-menu");
const overlay = document.getElementById("menu-overlay");

function openMenu() {

    mobileMenu.classList.remove("translate-x-full");

    overlay.classList.remove("hidden");

    document.body.style.overflow = "hidden";

}

function closeSidebar() {

    mobileMenu.classList.add("translate-x-full");

    overlay.classList.add("hidden");

    document.body.style.overflow = "";

}

menuBtn.addEventListener("click", openMenu);

closeMenu.addEventListener("click", closeSidebar);

overlay.addEventListener("click", closeSidebar);

document.querySelectorAll(".mobile-link").forEach(link => {

    link.addEventListener("click", closeSidebar);

});