/* ============================================================
   BARBIERI-ROON — especial.js
   Partículas flutuantes na página do Cantinho da Mon Cherí Bordin
   ============================================================ */

(function () {
  const container = document.getElementById("particles");
  if (!container) return;

  const COUNT = 28;

  function createParticle() {
    const el = document.createElement("div");
    el.className = "particle";

    const size = Math.random() * 4 + 2; // 2–6 px
    const left = Math.random() * 100;   // % horizontal
    const dur  = Math.random() * 12 + 8; // 8–20s
    const del  = Math.random() * 10;    // delay 0–10s

    el.style.cssText = `
      width:  ${size}px;
      height: ${size}px;
      left:   ${left}%;
      bottom: -10px;
      animation-duration: ${dur}s;
      animation-delay:    -${del}s;
      opacity: 0;
    `;

    container.appendChild(el);
  }

  for (let i = 0; i < COUNT; i++) createParticle();
})();