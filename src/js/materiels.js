let materiels = [];
let currentMatCategory = "Tous";

const container = document.getElementById("materiels-container");
const searchInput = document.getElementById("search-material");
const resultsCount = document.getElementById("results-count");
const categoryTitle = document.getElementById("category-title");

async function loadMateriels() {

    const response = await fetch("src/data/materiels.json");

    materiels = await response.json();

    displayMateriels();

}

function displayMateriels() {

    container.innerHTML = "";

    const keyword = searchInput.value.toLowerCase().trim();

    const filtered = materiels.filter(item => {

        const matchCategory =
            currentMatCategory === "Tous" ||
            item.category === currentMatCategory;

        const matchSearch =
            item.name.toLowerCase().includes(keyword);

        return matchCategory && matchSearch;

    });

    resultsCount.textContent =
        `${filtered.length} matériel${filtered.length > 1 ? "s" : ""}`;

    categoryTitle.textContent =
        currentMatCategory === "Tous"
            ? "Tous les matériels"
            : currentMatCategory;

    if (filtered.length === 0) {

        container.innerHTML = `

<div class="rounded-3xl border border-zinc-800 bg-zinc-900 p-12 text-center">

    <h3 class="text-2xl font-bold text-white">

        Aucun matériel trouvé

    </h3>

    <p class="mt-3 text-zinc-400">

        Essayez une autre recherche ou une autre catégorie.

    </p>

</div>

`;

        return;

    }

    filtered.forEach(item => {

        container.innerHTML += `

<div
class="group flex flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition duration-300 hover:border-[#F5C400] hover:shadow-xl hover:shadow-[#F5C400]/10 md:flex-row">

    <div class="md:w-60">

        <img
            src="${item.image}"
            alt="${item.name}"
            class="h-48 w-full object-cover transition duration-500 group-hover:scale-105 md:h-full">

    </div>

    <div
        class="flex flex-1 flex-col justify-between p-6">

        <div>

            <div class="flex flex-wrap items-center gap-3">

                <span
                    class="rounded-full bg-[#F5C400]/10 px-3 py-1 text-xs font-semibold text-[#F5C400]">

                    ${item.category}

                </span>

                ${item.badge ? `
                <span
                    class="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">

                    ⭐ ${item.badge}

                </span>
                ` : ""}

            </div>

            <h3
                class="mt-4 text-2xl font-bold text-white">

                ${item.name}

            </h3>

            <p
                class="mt-3 text-zinc-400">

                ${item.description || "Matériel professionnel disponible à la location."}

            </p>

        </div>

        <div
            class="mt-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

                <p class="text-sm text-zinc-500">

                    À partir de

                </p>

                <h4
                    class="text-3xl font-black text-[#F5C400]">

                    ${item.price}

                </h4>

            </div>

            <div
                class="flex flex-wrap gap-3">

                <span
                    class="rounded-full bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-400">

                    ✔ Disponible

                </span>

                <a
                    href="https://wa.me/21653308760"
                    target="_blank"
                    class="rounded-xl bg-[#F5C400] px-6 py-3 font-bold text-black transition hover:bg-yellow-400">

                    Réserver

                </a>

            </div>

        </div>

    </div>

</div>

`;

    });

}

/* ============================= */
/* Catégories */
/* ============================= */

document.addEventListener("click", e => {

    const btn = e.target.closest(".category-btn");

    if (!btn) return;

    document.querySelectorAll(".category-btn").forEach(button => {

        button.classList.remove(
            "bg-yellow-500",
            "text-black"
        );

        button.classList.add(
            "bg-zinc-800",
            "text-white"
        );

    });

    btn.classList.remove(
        "bg-zinc-800",
        "text-white"
    );

    btn.classList.add(
        "bg-yellow-500",
        "text-black"
    );

    currentMatCategory = btn.dataset.category;

    displayMateriels();

});

/* ============================= */
/* Recherche */
/* ============================= */

searchInput.addEventListener("input", () => {

    displayMateriels();

});

loadMateriels();