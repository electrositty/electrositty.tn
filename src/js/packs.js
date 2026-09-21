(function () {
  const EVENTS = [
    {
      name: "Tous",
      icon: "✨",
      description: "Découvrez tous nos packs."
    },
    {
      name: "Anniversaire",
      icon: "🎂",
      description: "Des solutions idéales pour vos anniversaires."
    },
    {
      name: "Mariage",
      icon: "💍",
      description: "Une ambiance exceptionnelle pour votre mariage."
    },
    {
      name: "Conférence",
      icon: "🏢",
      description: "Du matériel professionnel pour vos conférences."
    },
    {
      name: "Concert",
      icon: "🎤",
      description: "Des équipements puissants pour vos concerts."
    },
    {
      name: "Soirée privée",
      icon: "🎉",
      description: "Créez une soirée inoubliable."
    },
    {
      name: "Remise de diplôme",
      icon: "🎓",
      description: "Une sonorisation parfaite pour votre cérémonie."
    }
  ];

  let packItems = [];

  function createSidebar() {
    const sidebar = document.getElementById("event-sidebar");
    if (!sidebar) return; // Sécurité : évite l'erreur "Cannot set properties of null"

    sidebar.innerHTML = "";

    EVENTS.forEach((event, index) => {
      sidebar.innerHTML += `
        <button
          class="event-btn w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 text-left text-white flex items-center justify-between transition hover:border-[#F5C400] ${index === 0 ? "active-event" : ""}"
          data-event="${event.name}">
          <div class="flex items-center gap-3">
            <span class="text-2xl">${event.icon}</span>
            <span class="font-semibold text-sm sm:text-base">${event.name}</span>
          </div>
          <i class="fa-solid fa-chevron-right text-xs opacity-50"></i>
        </button>
      `;
    });

    document.querySelectorAll(".event-btn").forEach(button => {
      button.addEventListener("click", () => {
        document.querySelectorAll(".event-btn").forEach(btn => btn.classList.remove("active-event"));
        button.classList.add("active-event");
        filterPacks(button.dataset.event);
      });
    });
  }

  function filterPacks(eventName) {
    const title = document.getElementById("selected-event-title");
    const description = document.getElementById("selected-event-description");
    const event = EVENTS.find(e => e.name === eventName);

    if (title && event) {
      title.innerHTML = `${event.icon} ${event.name}`;
    }

    if (description && event) {
      description.innerHTML = event.description;
    }

    let filtered = [];
    if (eventName === "Tous") {
      filtered = packItems;
    } else {
      filtered = packItems.filter(pack => pack.events && pack.events.includes(eventName));
    }

    filtered.sort((a, b) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return 0;
    });

    renderPacks(filtered);
  }

  function renderPacks(packs) {
    const grid = document.getElementById("packs-grid");
    if (!grid) return; // Sécurité anti-crash

    grid.innerHTML = "";

    if (packs.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
            <h3 class="text-xl font-bold text-white">Aucun pack disponible</h3>
            <p class="mt-2 text-xs sm:text-sm text-zinc-400">Aucun pack ne correspond à cet événement.</p>
        </div>
      `;
      return;
    }

    packs.forEach(pack => {
      const features = (pack.features || [])
        .map(feature => `
          <li class="flex items-center gap-2 text-xs sm:text-sm text-zinc-300">
              <span class="text-[#F5C400]">✔</span>
              <span>${feature}</span>
          </li>
        `).join("");

      const idealFor = (pack.idealFor || [])
        .map(item => `
          <span class="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[11px] text-zinc-300">
              ${item}
          </span>
        `).join("");

      grid.innerHTML += `
        <div class="group overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-800 bg-zinc-900 transition-all duration-300 hover:border-[#F5C400] hover:shadow-xl hover:shadow-[#F5C400]/10 flex flex-col justify-between">
            <div class="relative">
                <img
                    src="${pack.image}"
                    class="h-44 sm:h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                    alt="${pack.name}"
                    onerror="this.src='src/images/hero/hero.png'">
                ${pack.popular ? `
                <div class="absolute left-3 top-3 rounded-full bg-[#F5C400] px-3 py-1 text-[11px] font-bold text-black">
                    ⭐ Populaire
                </div>
                ` : ""}
            </div>

            <div class="p-5 sm:p-6 flex flex-1 flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg sm:text-xl font-black text-white">${pack.name}</h3>
                        ${pack.price ? `
                        <span class="rounded-full bg-[#F5C400]/10 px-2.5 py-0.5 text-xs font-bold text-[#F5C400]">
                            ${pack.price}
                        </span>
                        ` : ''}
                    </div>

                    ${pack.people ? `
                    <p class="mt-2 text-xs text-zinc-400">👥 ${pack.people}</p>
                    ` : ''}

                    <div class="mt-4">
                        <h4 class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Inclus :</h4>
                        <ul class="mt-2 space-y-1.5">${features}</ul>
                    </div>

                    ${idealFor ? `
                    <div class="mt-4">
                        <div class="flex flex-wrap gap-1.5">${idealFor}</div>
                    </div>
                    ` : ''}
                </div>

                <a
                    href="https://wa.me/21653308760?text=${encodeURIComponent('Bonjour, je suis intéressé par le ' + pack.name)}"
                    target="_blank"
                    class="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#F5C400] py-2.5 text-xs sm:text-sm font-bold text-black transition hover:bg-yellow-400">
                    Réserver
                    <i class="fa-solid fa-arrow-right text-xs"></i>
                </a>
            </div>
        </div>
      `;
    });
  }

  async function loadPacks() {
    try {
      const response = await fetch("./src/data/packs.json");
      if (response.ok) {
        packItems = await response.json();
      }
    } catch (error) {
      console.warn("Fichier packs.json non chargé :", error);
    }
    createSidebar();
    filterPacks("Tous");
  }

  // Export global pour être appelé par app.js après l'injection HTML de la section packs
  window.loadPacks = loadPacks;

  // Lancement automatique si les conteneurs sont déjà dans le DOM
  if (document.getElementById("packs-grid") || document.getElementById("event-sidebar")) {
    loadPacks();
  }
})();