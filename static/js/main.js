/* ============================================================
   BARBIERI-ROON — main.js
   Responsabilidades: buscar cards da API, renderizar, filtrar,
   buscar por texto e abrir modal de detalhes.
   ============================================================ */

const CATEGORY_COLOR = {
  cybersec:  "blue",
  concursos: "purple",
  projetos:  "green",
  especial:  "pink",
};

const STATUS_CLASS = {
  "ativo":           "ativo",
  "locked":          "locked",
  "revisão pendente":"pendente",
  "em construção":   "construcao",
};

// ── Estado global ─────────────────────────────────────────

let allCards     = [];
let activeFilter = "todos";
let searchQuery  = "";

// ── Elementos do DOM ──────────────────────────────────────

const grid        = document.getElementById("card-grid");
const filterBtns  = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("search-input");
const termCards   = document.getElementById("term-cards");

const modalOverlay = document.getElementById("modal-overlay");
const modal        = document.getElementById("modal");
const modalClose   = document.getElementById("modal-close");
const modalTag     = document.getElementById("modal-tag");
const modalTitle   = document.getElementById("modal-title");
const modalContent = document.getElementById("modal-content");
const modalStatus  = document.getElementById("modal-status");
const modalDate    = document.getElementById("modal-date");

// ── Fetch cards da API Flask ──────────────────────────────

async function fetchCards() {
  try {
    const res = await fetch("/api/cards");
    if (!res.ok) throw new Error("Falha na API");
    allCards = await res.json();
    renderCards();
    updateTerminal();
  } catch (err) {
    grid.innerHTML = `
      <p style="color:rgba(244,114,182,0.7);font-family:var(--mono);font-size:12px;padding:1rem 0;grid-column:1/-1;">
        ► erro ao carregar cards: ${err.message}
      </p>`;
  }
}

// ── Renderização ──────────────────────────────────────────

function renderCards() {
  const filtered = allCards.filter(card => {
    const matchFilter =
      activeFilter === "todos" || card.category === activeFilter;

    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      card.title.toLowerCase().includes(q) ||
      card.description.toLowerCase().includes(q) ||
      card.tag.toLowerCase().includes(q);

    return matchFilter && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <p style="color:var(--text-4);font-family:var(--mono);font-size:12px;padding:1rem 0;grid-column:1/-1;">
        ► nenhum card encontrado.
      </p>`;
    return;
  }

  grid.innerHTML = filtered.map(card => buildCard(card)).join("");

  // Adiciona listeners de clique nos cards
  grid.querySelectorAll(".card").forEach(el => {
    el.addEventListener("click", () => {
      const id = parseInt(el.dataset.id, 10);
      const card = allCards.find(c => c.id === id);
      if (card && card.status !== "locked") openModal(card);
    });
  });
}

function buildCard(card) {
  const color   = CATEGORY_COLOR[card.category] || "blue";
  const isLocked = card.status === "locked";

  const footer = isLocked
    ? `<div class="card-footer">
         <span class="card-date">${card.updated}</span>
         <span class="lock-badge"><i class="ti ti-lock"></i> bloqueado</span>
       </div>`
    : `<div class="card-footer">
         <span class="card-date">${card.updated}</span>
         <i class="ti ti-arrow-right card-arrow"></i>
       </div>`;

  return `
    <article class="card ${color}${isLocked ? " locked" : ""}" data-id="${card.id}">
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

// ── Busca ─────────────────────────────────────────────────

searchInput.addEventListener("input", e => {
  searchQuery = e.target.value;
  renderCards();
});

// ── Modal ─────────────────────────────────────────────────

function openModal(card) {
  const color = CATEGORY_COLOR[card.category] || "blue";

  modal.className = `modal ${color}`;
  modalTag.textContent  = `// ${card.tag}`;
  modalTag.style.color  = getAccentColor(color);
  modalTitle.textContent   = card.title;
  modalContent.textContent = card.content;

  const statusKey = card.status;
  const statusClass = STATUS_CLASS[statusKey] || "ativo";
  modalStatus.className   = `modal-status ${statusClass}`;
  modalStatus.textContent = card.status;
  modalDate.textContent   = `atualizado: ${card.updated}`;

  modalOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modalOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", e => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

// ── Terminal status ───────────────────────────────────────

function updateTerminal() {
  const total = allCards.filter(c => c.status !== "locked").length;
  termCards.textContent = `► cards carregados: ${total} / módulo spotify: aguardando`;
}

// ── Helpers ───────────────────────────────────────────────

function getAccentColor(color) {
  const map = {
    blue:   "#38bdf8",
    purple: "#c084fc",
    green:  "#22c55e",
    pink:   "#f472b6",
  };
  return map[color] || "#38bdf8";
}

// Nav anchors → filtros
document.getElementById("nav-cybersec")?.addEventListener("click", () => {
  document.querySelector('[data-filter="cybersec"]').click();
});
document.getElementById("nav-concursos")?.addEventListener("click", () => {
  document.querySelector('[data-filter="concursos"]').click();
});

// ── Init ──────────────────────────────────────────────────

fetchCards();