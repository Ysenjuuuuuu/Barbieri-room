/* ============================================================
   BARBIERI-ROON — main.js  v1.1
   Busca cards da API, renderiza grid, filtros, busca ao vivo.
   Clique no card → navega para /card/<id> (página dedicada).
   ============================================================ */

const CATEGORY_COLOR = {
  cybersec:  "blue",
  concursos: "purple",
  projetos:  "green",
  especial:  "pink",
};

// ── Estado ────────────────────────────────────────────────

let allCards     = [];
let activeFilter = "todos";
let searchQuery  = "";

// ── DOM ───────────────────────────────────────────────────

const grid       = document.getElementById("card-grid");
const filterBtns = document.querySelectorAll(".filter-btn");
const searchInput= document.getElementById("search-input");
const termCards  = document.getElementById("term-cards");

// ── Fetch ─────────────────────────────────────────────────

async function fetchCards() {
  try {
    const res = await fetch("/api/cards");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allCards = await res.json();
    applyURLFilter();
    renderCards();
    updateTerminal();
  } catch (err) {
    grid.innerHTML = `
      <p class="grid-error">
        <i class="ti ti-alert-circle"></i>
        erro ao carregar cards: ${err.message}
      </p>`;
  }
}

// Lê ?filter= da URL para ativar categoria direto
function applyURLFilter() {
  const params = new URLSearchParams(window.location.search);
  const f = params.get("filter");
  if (f) {
    activeFilter = f;
    filterBtns.forEach(b => {
      b.classList.toggle("active", b.dataset.filter === f);
    });
  }
}

// ── Render ────────────────────────────────────────────────

function renderCards() {
  const q = searchQuery.toLowerCase().trim();

  const filtered = allCards.filter(card => {
    const matchFilter = activeFilter === "todos" || card.category === activeFilter;
    const matchSearch = !q ||
      card.title.toLowerCase().includes(q) ||
      card.description.toLowerCase().includes(q) ||
      card.tag.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <p class="grid-empty">
        <i class="ti ti-mood-empty"></i> nenhum card encontrado.
      </p>`;
    return;
  }

  grid.innerHTML = filtered.map(buildCard).join("");

  // Clique → navegação (exceto card especial locked que vai p/ /especial)
  grid.querySelectorAll(".card[data-href]").forEach(el => {
    el.addEventListener("click", () => {
      window.location.href = el.dataset.href;
    });
    // Acessibilidade: Enter/Space também navega
    el.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        window.location.href = el.dataset.href;
      }
    });
  });
}

function buildCard(card) {
  const color    = CATEGORY_COLOR[card.category] || "blue";
  const isLocked = card.status === "locked";
  const href     = isLocked ? "/especial" : `/card/${card.id}`;

  const sectionCount = card.sections ? card.sections.length : 0;

  const footer = isLocked
    ? `<div class="card-footer">
         <span class="card-date">${card.updated}</span>
         <span class="lock-badge"><i class="ti ti-heart"></i> especial</span>
       </div>`
    : `<div class="card-footer">
         <span class="card-date">${card.updated}</span>
         <span class="card-sections">${sectionCount} seção${sectionCount !== 1 ? "ões" : ""}</span>
         <i class="ti ti-arrow-right card-arrow"></i>
       </div>`;

  return `
    <article
      class="card ${color}${isLocked ? " locked" : ""}"
      data-id="${card.id}"
      data-href="${href}"
      role="link"
      tabindex="0"
      aria-label="Abrir: ${card.title}"
    >
      <i class="ti ${card.icon} card-icon"></i>
      <span class="card-tag">// ${card.tag}</span>
      <h3>${card.title}</h3>
      <p>${card.description}</p>
      ${footer}
    </article>`;
}

// ── Filtros ───────────────────────────────────────────────

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderCards();
  });
});

// ── Busca ao vivo ─────────────────────────────────────────

searchInput.addEventListener("input", e => {
  searchQuery = e.target.value;
  renderCards();
});

// Limpar busca com Escape
searchInput.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    searchQuery = "";
    searchInput.value = "";
    renderCards();
  }
});

// ── Terminal ──────────────────────────────────────────────

function updateTerminal() {
  const visible = allCards.filter(c => c.status !== "locked").length;
  if (termCards) {
    termCards.textContent =
      `► cards carregados: ${visible} / módulo especial: aguardando`;
  }
}

// ── Init ──────────────────────────────────────────────────

fetchCards();