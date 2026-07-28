/* ==========================================================
   FEATURED PRODUCTIONS + EVENTS
========================================================== */

/* ==========================================================
   FEATURED PRODUCTIONS
========================================================== */

const featuredDesktop = document.getElementById("featuredDesktop");
const featuredMobile = document.getElementById("featuredMobile");

let featuredProjects = [];

async function loadFeaturedProjects() {
    try {

        const response = await fetch("src/data/featured-projects.json");

        if (!response.ok)
            throw new Error("Unable to load featured-projects.json");

        featuredProjects = await response.json();

        renderFeatured();

    } catch (err) {

        console.error(err);

    }
}

function renderFeatured() {

    if (!featuredDesktop || !featuredMobile) return;

    featuredDesktop.innerHTML = "";
    featuredMobile.innerHTML = "";

    if (window.innerWidth >= 1024) {

        renderFeaturedDesktop();

    } else {

        renderFeaturedMobile();

    }

}

function renderFeaturedDesktop() {

    featuredDesktop.innerHTML = featuredProjects.map(project => `

<div class="group relative h-[520px] overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 transition-all duration-500 hover:border-[#F5C400] hover:shadow-2xl">

    <img
        src="${project.image}"
        alt="${project.title}"
        class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110">

    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

    <div class="absolute bottom-0 left-0 right-0 p-8">

        <span
            class="inline-flex rounded-full px-4 py-2 text-sm font-bold mb-5"
            style="background:${project.color};color:black;">

            ${project.badge}

        </span>

        <h3 class="text-3xl font-black text-white">

            ${project.title}

        </h3>

        <p class="mt-2 text-zinc-300">

            ${project.subtitle}

        </p>

    </div>

</div>

`).join("");

}

function renderFeaturedMobile() {

    featuredMobile.innerHTML = featuredProjects.map(project => `

<div class="group flex items-center gap-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">

    <img
        src="${project.image}"
        alt="${project.title}"
        class="h-24 w-36 object-cover transition duration-500 group-hover:scale-105">

    <div class="flex-1 py-4 pr-4">

        <span
            class="inline-flex rounded-full px-3 py-1 text-xs font-bold"
            style="background:${project.color};color:black;">

            ${project.badge}

        </span>

        <h3 class="mt-2 text-lg font-bold text-white">

            ${project.title}

        </h3>

        <p class="text-sm text-zinc-400">

            ${project.subtitle}

        </p>

    </div>

</div>

`).join("");

}

/* ==========================================================
   EVENTS
========================================================== */

const eventsDesktop = document.getElementById("eventsDesktop");
const eventsMobile = document.getElementById("eventsMobile");
const showMoreEvents = document.getElementById("showMoreEvents");

let events = [];
let showAllEvents = false;

async function loadEvents() {

    try {

        const response = await fetch("src/data/events.json");

        if (!response.ok)
            throw new Error("Unable to load events.json");

        events = await response.json();

        renderEvents();

    }

    catch(err){

        console.error(err);

    }

}

function renderEvents(){

    if(!eventsDesktop || !eventsMobile) return;

    renderEventsDesktop();
    renderEventsMobile();

}

function renderEventsDesktop(){

    eventsDesktop.innerHTML = events.map(event=>`

<div class="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition-all duration-500 hover:border-[#F5C400] hover:-translate-y-2">

    <div class="relative overflow-hidden">

        <img
            src="${event.image}"
            alt="${event.title}"
            class="h-64 w-full object-cover transition duration-700 group-hover:scale-110">

        <span
            class="absolute left-4 top-4 rounded-full bg-white px-4 py-2 text-xs font-bold text-black transition group-hover:-translate-y-1">

            ${event.date}

        </span>

    </div>

    <div class="p-6">

        <span
            class="inline-flex rounded-full bg-[#F5C400] px-3 py-1 text-xs font-bold text-black">

            ${event.category}

        </span>

        <h3 class="mt-4 text-2xl font-bold text-white">

            ${event.title}

        </h3>

    </div>

</div>

`).join("");

}

function renderEventsMobile(){

    const visibleEvents = showAllEvents
        ? events
        : events.slice(0,4);

    eventsMobile.innerHTML = visibleEvents.map(event=>`

<div class="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">

    <div class="relative">

        <img
            src="${event.image}"
            alt="${event.title}"
            class="h-32 w-full object-cover">

        <span
            class="absolute left-2 top-2 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-black">

            ${event.date}

        </span>

    </div>

    <div class="p-3">

        <span
            class="inline-flex rounded-full bg-[#F5C400] px-2 py-1 text-[10px] font-bold text-black">

            ${event.category}

        </span>

        <h3 class="mt-2 text-sm font-bold text-white">

            ${event.title}

        </h3>

    </div>

</div>

`).join("");

    if(events.length>4){

        showMoreEvents?.classList.remove("hidden");

    }else{

        showMoreEvents?.classList.add("hidden");

    }

}

showMoreEvents?.addEventListener("click",()=>{

    showAllEvents = true;

    renderEventsMobile();

    showMoreEvents.classList.add("hidden");

});

/* ==========================================================
   RESPONSIVE
========================================================== */

window.addEventListener("resize",()=>{

    renderFeatured();
    renderEvents();

});

/* ==========================================================
   INIT
========================================================== */

loadFeaturedProjects();
loadEvents();
/* ==========================================================
   GALLERY
========================================================== */

const galleryGrid = document.getElementById("galleryGrid");
const filterContainer = document.getElementById("galleryFilters");

let gallery = [];
let currentCategory = "All";

async function loadGallery() {

    try {

        const response = await fetch("src/data/gallery.json");

        if (!response.ok)
            throw new Error("Unable to load gallery.json");

        gallery = await response.json();

        gallery.sort((a,b)=>a.order-b.order);

        renderFilters();

        renderGallery();

    }

    catch(err){

        console.error(err);

    }

}

/* ==========================================================
   FILTERS
========================================================== */

function renderFilters(){

    if(!filterContainer) return;

    const categories = [
        "All",
        ...new Set(gallery.map(item=>item.category))
    ];

    filterContainer.innerHTML = categories.map(category=>`

<button
    data-category="${category}"
    class="gallery-filter px-5 py-3 rounded-full border transition
    ${
        category===currentCategory
        ? "bg-[#F5C400] text-black border-[#F5C400]"
        : "border-zinc-700 text-white hover:border-[#F5C400]"
    }">

    ${category}

</button>

`).join("");

    document.querySelectorAll(".gallery-filter").forEach(button=>{

        button.addEventListener("click",()=>{

            currentCategory = button.dataset.category;

            renderFilters();

            renderGallery();

        });

    });

}

/* ==========================================================
   GALLERY GRID
========================================================== */

function renderGallery(){

    if(!galleryGrid) return;

    const projects = currentCategory==="All"

        ? gallery

        : gallery.filter(item=>item.category===currentCategory);

    galleryGrid.innerHTML = projects.map(item=>`

<div
    class="gallery-card group relative overflow-hidden rounded-3xl bg-zinc-900 cursor-pointer"
    data-id="${item.id}">

    <img

        src="${item.thumbnail}"

        alt="${item.title}"

        class="w-full h-full object-cover transition duration-700 group-hover:scale-110">

    <div
        class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90">

    </div>

    <div
        class="absolute bottom-0 left-0 right-0 p-6">

        <span
            class="inline-flex px-3 py-1 rounded-full bg-[#F5C400] text-black text-xs font-bold">

            ${item.category}

        </span>

        <h3
            class="mt-3 text-2xl font-black text-white">

            ${item.title}

        </h3>

        <p
            class="text-zinc-300 mt-2">

            ${item.subtitle}

        </p>

    </div>

</div>

`).join("");

    initGalleryClicks();

}

/* ==========================================================
   GALLERY CLICK
========================================================== */

function initGalleryClicks(){

    document.querySelectorAll(".gallery-card").forEach(card=>{

        card.addEventListener("click",()=>{

            const id = card.dataset.id;

            openProject(id);

        });

    });

}
/* ==========================================================
   LIGHTBOX
========================================================== */

const lightbox = document.getElementById("lightbox");
const lightboxContent = document.getElementById("lightboxContent");
const closeLightbox = document.getElementById("closeLightbox");

function openProject(id){

    const project = gallery.find(item => item.id === id);

    if(!project) return;

    let media = "";

    if(project.video){

        media = `

<video
    controls
    autoplay
    playsinline
    class="w-full rounded-3xl mb-10">

    <source src="${project.video}" type="video/mp4">

</video>

`;

    }else{

        media = `

<img
    src="${project.hero || project.thumbnail}"
    alt="${project.title}"
    class="w-full rounded-3xl mb-10">

`;

    }

    const galleryImages = (project.gallery || []).map(image => `

<img
    src="${image}"
    class="rounded-2xl w-full object-cover">

`).join("");

    lightboxContent.innerHTML = `

${media}

<div class="grid lg:grid-cols-3 gap-12">

    <div class="lg:col-span-2">

        <span
            class="inline-flex px-4 py-2 rounded-full bg-[#F5C400] text-black font-bold">

            ${project.category}

        </span>

        <h2
            class="mt-6 text-5xl font-black text-white">

            ${project.title}

        </h2>

        <p
            class="mt-6 text-zinc-300 text-lg leading-relaxed">

            ${project.description || ""}

        </p>

    </div>

    <div>

        <div class="space-y-6">

            <div>

                <h4 class="text-zinc-500 uppercase text-sm">

                    Client

                </h4>

                <p class="text-white font-semibold">

                    ${project.client || "-"}

                </p>

            </div>

            <div>

                <h4 class="text-zinc-500 uppercase text-sm">

                    Year

                </h4>

                <p class="text-white font-semibold">

                    ${project.year || "-"}

                </p>

            </div>

            <div>

                <h4 class="text-zinc-500 uppercase text-sm">

                    Location

                </h4>

                <p class="text-white font-semibold">

                    ${project.location || "-"}

                </p>

            </div>

            <div>

                <h4 class="text-zinc-500 uppercase text-sm">

                    Services

                </h4>

                <div class="flex flex-wrap gap-2 mt-3">

                    ${(project.services || []).map(service => `

<span
    class="px-3 py-2 rounded-full bg-zinc-800 text-white text-sm">

    ${service}

</span>

`).join("")}

                </div>

            </div>

        </div>

    </div>

</div>

${galleryImages.length ? `

<div class="mt-16">

    <h3
        class="text-3xl font-bold text-white mb-8">

        Gallery

    </h3>

    <div
        class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        ${galleryImages}

    </div>

</div>

` : ""}

`;

    lightbox.classList.remove("hidden");

    document.body.style.overflow = "hidden";

}

function closeProject(){

    lightbox.classList.add("hidden");

    document.body.style.overflow = "";

    lightboxContent.innerHTML = "";

}

closeLightbox?.addEventListener("click", closeProject);

lightbox?.addEventListener("click", e => {

    if(e.target === lightbox){

        closeProject();

    }

});

document.addEventListener("keydown", e => {

    if(e.key === "Escape"){

        closeProject();

    }

});

/* ==========================================================
   WALL OF TRUST
========================================================== */

const trustViewer = document.getElementById("trustViewer");
const trustGallery = document.getElementById("trustGallery");
const trustMobile = document.getElementById("trustMobile");

let recognitions = [];
let activeRecognition = 0;

async function loadRecognition() {

    try {

        const response = await fetch("src/data/avis.json");

        if (!response.ok)
            throw new Error("Unable to load avis.json");

        recognitions = await response.json();

        renderRecognition();

    } catch (err) {

        console.error(err);

    }

}

function renderRecognition() {

    if (!recognitions.length) return;

    renderTrustViewer();

    renderTrustGallery();

    renderTrustMobile();

}

function renderTrustViewer() {

    if (!trustViewer) return;

    const item = recognitions[activeRecognition];

    trustViewer.innerHTML = `

<div class="relative">

    <img
        src="${item.image}"
        alt="${item.title}"
        class="w-full rounded-t-3xl">

</div>

<div class="p-8">

    <div class="flex items-center gap-4 mb-6">

        <div>

            <h3 class="text-3xl font-black text-white">

                ${item.person.name}

            </h3>

            <p class="text-zinc-400">

                ${item.person.role}
                ${item.person.company ? "• " + item.person.company : ""}

            </p>

        </div>

    </div>

    <div class="flex gap-1 mb-6">

        ${"★".repeat(item.rating)}

    </div>

    <blockquote
        class="text-2xl leading-relaxed text-zinc-200 italic">

        "${item.quote}"

    </blockquote>

    <div class="mt-8 flex flex-wrap gap-2">

        ${item.tags.map(tag => `
            <span class="px-3 py-2 rounded-full bg-zinc-800 text-sm text-white">
                ${tag}
            </span>
        `).join("")}

    </div>

</div>

`;

}
/* ==========================================================
   GALLERY (RIGHT SIDE)
========================================================== */

function renderTrustGallery() {

    if (!trustGallery) return;

    trustGallery.innerHTML = recognitions.map((item,index)=>`

<div
    class="trust-card group cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300
    ${index===activeRecognition
        ? "border-[#F5C400]"
        : "border-zinc-800 hover:border-zinc-600"}"

    data-index="${index}">

    <div class="relative overflow-hidden">

        <img
            src="${item.image}"
            alt="${item.title}"
            class="h-40 w-full object-cover transition duration-500 group-hover:scale-105">

        <div
            class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent">

        </div>

        <span
            class="absolute top-3 left-3 rounded-full bg-[#F5C400] px-3 py-1 text-xs font-bold text-black">

            ${item.type}

        </span>

    </div>

    <div class="p-4">

        <h4
            class="font-bold text-white">

            ${item.person.name}

        </h4>

        <p
            class="text-sm text-zinc-400 mt-1">

            ${item.project}

        </p>

    </div>

</div>

`).join("");

    document.querySelectorAll(".trust-card").forEach(card=>{

        card.addEventListener("click",()=>{

            activeRecognition = Number(card.dataset.index);

            fadeRecognition();

        });

    });

}

/* ==========================================================
   ANIMATION
========================================================== */

function fadeRecognition(){

    if(trustViewer){

        trustViewer.classList.add("opacity-0","translate-y-4");

        setTimeout(()=>{

            renderTrustViewer();

            renderTrustGallery();

            trustViewer.classList.remove("opacity-0","translate-y-4");

        },250);

    }

}

/* ==========================================================
   MOBILE
========================================================== */

function renderTrustMobile(){

    if(!trustMobile) return;

    trustMobile.innerHTML = recognitions.map(item=>`

<div
    class="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">

    <img
        src="${item.image}"
        alt="${item.title}"
        class="w-full object-cover">

    <div class="p-6">

        <div
            class="flex items-center justify-between mb-4">

            <span
                class="rounded-full bg-[#F5C400] px-3 py-1 text-xs font-bold text-black">

                ${item.type}

            </span>

            <span
                class="text-zinc-500 text-sm">

                ${item.year}

            </span>

        </div>

        <h3
            class="text-2xl font-bold text-white">

            ${item.person.name}

        </h3>

        <p
            class="text-zinc-400 mt-1">

            ${item.person.role}

        </p>

        <blockquote
            class="mt-6 italic text-lg text-zinc-200">

            "${item.quote}"

        </blockquote>

        <div
            class="mt-6 flex flex-wrap gap-2">

            ${item.tags.map(tag=>`

<span
    class="rounded-full bg-zinc-800 px-3 py-1 text-xs text-white">

    ${tag}

</span>

`).join("")}

        </div>

    </div>

</div>

`).join("");

}
loadFeaturedProjects();
loadEvents();
loadGallery();
loadRecognition();