(function () {
  // 1. Données de secours directes (vos 12 matériels exacts)
  const defaultData = [
    {
      "name": "Satellite 15\" avec trépied",
      "category": "Son",
      "environment": "Tous",
      "description": "Enceinte professionnelle idéale pour les mariages, conférences et soirées.",
      "image": "src/images/materiels/speaker.jpg"
    },
    {
      "name": "Caisson de basse",
      "category": "Son",
      "environment": "Tous",
      "description": "Renforce les basses pour une sonorisation puissante et immersive.",
      "image": "src/images/materiels/subwoofer.jpg"
    },
    {
      "name": "Micro avec câble",
      "category": "Son",
      "environment": "Tous",
      "description": "Microphone filaire adapté aux discours, conférences et animations.",
      "image": "src/images/materiels/micro-cable.jpg"
    },
    {
      "name": "Micro sans fil",
      "category": "Son",
      "environment": "Tous",
      "description": "Micro HF offrant une grande liberté de mouvement sur scène.",
      "image": "src/images/materiels/micro-hf.jpg"
    },
    {
      "name": "PAR LED",
      "category": "Lumière",
      "environment": "Tous",
      "description": "Projecteur LED parfait pour créer des ambiances lumineuses colorées.",
      "image": "src/images/materiels/parled.jpg"
    },
    {
      "name": "Beam / Moving Head",
      "category": "Lumière",
      "environment": "Tous",
      "description": "Projecteur motorisé pour spectacles, concerts et événements premium.",
      "image": "src/images/materiels/beam.jpg"
    },
    {
      "name": "Projecteur Découpe",
      "category": "Lumière",
      "environment": "Indoor",
      "description": "Éclairage précis pour mettre en valeur une scène ou un intervenant.",
      "image": "src/images/materiels/decoupe.jpg"
    },
    {
      "name": "Machine à fumée",
      "category": "Lumière",
      "environment": "Tous",
      "description": "Crée un effet de fumée pour sublimer les jeux de lumière.",
      "image": "src/images/materiels/fumee.jpg"
    },
    {
      "name": "Écran LED NT V2 Indoor",
      "category": "LED",
      "environment": "Indoor",
      "description": "Écran LED haute définition pour les événements en intérieur.",
      "image": "src/images/materiels/led-indoor.jpg"
    },
    {
      "name": "Écran LED NT V2 Outdoor",
      "category": "LED",
      "environment": "Outdoor",
      "description": "Écran LED résistant aux conditions extérieures pour les grands événements.",
      "image": "src/images/materiels/led-outdoor.jpg"
    },
    {
      "name": "Régie Pioneer 2000 + NXS2",
      "category": "DJ",
      "environment": "Tous",
      "description": "Console DJ professionnelle utilisée dans les clubs et festivals.",
      "image": "src/images/materiels/nxs2.jpg"
    },
    {
      "name": "Régie Pioneer 2000 + Xone 92",
      "category": "DJ",
      "environment": "Tous",
      "description": "Configuration DJ haut de gamme offrant un mixage précis et performant.",
      "image": "src/images/materiels/xone92.jpg"
    }
  ];

  let items = defaultData;
  let activeEnv = "Tous";
  let activeCat = "Tous";

  function render() {
    const container = document.getElementById("materiels-container");
    const countEl = document.getElementById("results-count");
    const titleEl = document.getElementById("category-title");
    const badgeEl = document.getElementById("active-env-badge");
    const searchInput = document.getElementById("search-material");

    if (!container) return;

    const query = searchInput && searchInput.value ? searchInput.value.toLowerCase().trim() : "";

    const filtered = items.filter(item => {
      const env = item.environment || "Tous";
      const matchEnv = (activeEnv === "Tous") || (env === "Tous") || (env.toLowerCase() === activeEnv.toLowerCase());

      const cat = item.category || "";
      const matchCat = (activeCat === "Tous") || (cat.toLowerCase() === activeCat.toLowerCase());

      const name = (item.name || "").toLowerCase();
      const desc = (item.description || "").toLowerCase();
      const matchSearch = query === "" || name.includes(query) || desc.includes(query);

      return matchEnv && matchCat && matchSearch;
    });

    if (countEl) {
      countEl.textContent = `${filtered.length} matériel${filtered.length > 1 ? "s" : ""}`;
    }

    if (titleEl) {
      titleEl.textContent = activeCat === "Tous" ? "Tous les matériels" : activeCat;
    }

    if (badgeEl) {
      badgeEl.textContent = activeEnv === "Tous"
        ? "Tous environnements"
        : (activeEnv === "Indoor" ? "Configuration Intérieure (Indoor)" : "Configuration Extérieure (Outdoor)");
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-10 text-center">
            <p class="text-xs sm:text-sm text-zinc-500">
                Aucun matériel trouvé pour (${activeEnv} · ${activeCat}).
            </p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => `
      <div class="flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden backdrop-blur-sm transition duration-200 hover:border-[#F5C400]/50">
          
          <div class="relative h-24 sm:h-32 w-full overflow-hidden bg-black/40">
              <img 
                  src="${item.image}" 
                  alt="${item.name}" 
                  class="h-full w-full object-cover"
                  loading="lazy"
                  onerror="this.onerror=null; this.src='src/images/hero/hero.png';"
              >
              <div class="absolute top-1.5 left-1.5 flex gap-1">
                  <span class="rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-semibold text-[#F5C400]">
                      ${item.category}
                  </span>
                  ${item.environment && item.environment !== "Tous" ? `
                      <span class="rounded bg-zinc-800/90 px-1.5 py-0.5 text-[9px] font-medium text-zinc-300">
                          ${item.environment === "Indoor" ? "🏛️ In" : "🌿 Out"}
                      </span>
                  ` : ''}
              </div>
          </div>

          <div class="flex flex-1 flex-col justify-between p-2 sm:p-3">
              <div>
                  <h4 class="text-xs sm:text-sm font-bold text-white line-clamp-1" title="${item.name}">
                      ${item.name}
                  </h4>
                  <p class="mt-0.5 text-[10px] sm:text-xs text-zinc-400 line-clamp-1">
                      ${item.description}
                  </p>
              </div>

              <a 
                  href="https://wa.me/21653308760?text=${encodeURIComponent('Bonjour, je souhaite louer : ' + item.name)}" 
                  target="_blank"
                  class="mt-2.5 block w-full rounded-md bg-zinc-800 py-1.5 text-center text-[10px] sm:text-xs font-semibold text-white transition hover:bg-[#F5C400] hover:text-black"
              >
                  Réserver
              </a>
          </div>

      </div>
    `).join("");
  }

  async function loadData() {
    try {
      const res = await fetch("src/data/materiels.json");
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          items = json;
        }
      }
    } catch (err) {
      console.warn("Utilisation des données locales de secours :", err);
    }
    render();
  }

  // Écouteur pour Environnement (Tous / Indoor / Outdoor)
  document.addEventListener("click", e => {
    const envBtn = e.target.closest(".env-btn");
    if (!envBtn) return;

    document.querySelectorAll(".env-btn").forEach(btn => {
      btn.classList.remove("bg-[#F5C400]", "text-black", "font-bold");
      btn.classList.add("text-zinc-400", "font-medium");
    });

    envBtn.classList.remove("text-zinc-400", "font-medium");
    envBtn.classList.add("bg-[#F5C400]", "text-black", "font-bold");

    activeEnv = envBtn.dataset.env;
    render();
  });

  // Écouteur pour Sous-Catégories (Son, Lumière, LED, DJ...)
  document.addEventListener("click", e => {
    const catBtn = e.target.closest(".category-btn");
    if (!catBtn) return;

    const chosenCat = catBtn.dataset.category;
    activeCat = chosenCat;

    document.querySelectorAll(".category-btn").forEach(btn => {
      if (btn.dataset.category === chosenCat) {
        btn.classList.remove("bg-zinc-800/80", "bg-zinc-900", "text-zinc-300", "text-white");
        btn.classList.add("bg-[#F5C400]", "text-black", "font-bold");
      } else {
        btn.classList.remove("bg-[#F5C400]", "text-black", "font-bold");
        btn.classList.add("bg-zinc-900", "text-zinc-300");
      }
    });

    render();
  });

  // Écouteur Recherche
  document.addEventListener("input", e => {
    if (e.target && e.target.id === "search-material") {
      render();
    }
  });

  // Lancement automatique dès le chargement
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadData);
  } else {
    loadData();
  }
})();