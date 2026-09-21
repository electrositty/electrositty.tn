async function loadComponent(id, path) {

    const response = await fetch(path);

    const html = await response.text();

    document.getElementById(id).innerHTML = html;

}

async function init() {

  await Promise.all([
    loadComponent("navbar", "src/components/Navbar.html"),
    loadComponent("hero", "src/components/Hero.html"),
    loadComponent("services", "src/components/Services.html"),
    loadComponent("about", "src/components/About.html"),
    loadComponent("packs", "src/components/Packs.html"),
    loadComponent("materiels", "src/components/Materiels.html"),
    loadComponent("process", "src/components/Process.html"),
    loadComponent("contact", "src/components/contact.html"),
    loadComponent("whychooseus", "src/components/WhyChooseUs.html"),
]);
  

    // Navbar

    const navbarScript = document.createElement("script");
    navbarScript.src = "src/js/navbar.js";
    document.body.appendChild(navbarScript);

    // Packs

    const packsScript = document.createElement("script");
    packsScript.src = "src/js/packs.js";
    document.body.appendChild(packsScript);

    // Matériels

    const materielsScript = document.createElement("script");
    materielsScript.src = "src/js/materiels.js";
    document.body.appendChild(materielsScript);


    // Gallery

    const galleryScript = document.createElement("script");
    galleryScript.src = "src/js/gallery.js";
    document.body.appendChild(galleryScript);

}

init();