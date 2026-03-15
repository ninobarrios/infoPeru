// Enfoca el buscador desde el ícono de lupa del header
const openSearchBtn = document.getElementById("openSearch");
const searchInput = document.getElementById("q");
const searchForm = document.getElementById("searchForm");

openSearchBtn?.addEventListener("click", () => {
  searchInput?.focus();
  searchInput?.scrollIntoView({ behavior: "smooth", block: "center" });
});

// Demo: búsqueda (sin backend). Puedes reemplazar esto por:
// - redirección a /buscar.html?q=...
// - o filtro estático en el futuro (si generas páginas por keyword)
searchForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = (searchInput.value || "").trim();

  if (!q) {
    alert("Escribe algo para buscar.");
    return;
  }

  // Ejemplo simple: abre Google con site: (cámbialo por tu dominio cuando lo tengas)
  // Si tu dominio fuera tramitesperu.pe:
  // const url = `https://www.google.com/search?q=site:tramitesperu.pe+${encodeURIComponent(q)}`;
  const url = `https://www.google.com/search?q=${encodeURIComponent(q + " Perú 2026")}`;
  window.open(url, "_blank", "noopener,noreferrer");
});
// (Opcional) Generar guías destacadas desde un array
const featured = [
  {
    category: { label: "Trámites", color: "blue" },
    title: "Cómo renovar DNI en Perú 2026: Requisitos, costos y pasos",
    desc: "Guía completa para renovar tu DNI en Perú. Conoce requisitos actualizados 2026, costos, tiempos y consejos.",
    read: "7 min de lectura",
    views: "15,421",
    href: "#",
    img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    alt: "Documentos y mesa de trabajo",
  },
  {
    category: { label: "Finanzas", color: "green" },
    title: "Retiro AFP 2026: Cómo retirar tu dinero paso a paso",
    desc: "Todo sobre el retiro de fondos AFP en Perú 2026. Requisitos, montos máximos, plazos y cómo solicitarlo.",
    read: "10 min de lectura",
    views: "28,350",
    href: "#",
    img: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
    alt: "Monedas y planta en crecimiento",
  },
  {
    category: { label: "Finanzas", color: "green" },
    title: "Consulta RUC SUNAT: Cómo verificar y obtener tu RUC 2026",
    desc: "Aprende a consultar el RUC en SUNAT, verificar datos tributarios y cómo obtener tu número RUC.",
    read: "6 min de lectura",
    views: "12,890",
    href: "#",
    img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    alt: "Documentos y escritorio",
  },
];

function chipClass(color){
  if(color === "green") return "chip chip--green";
  if(color === "blue") return "chip chip--blue";
  return "chip";
}

(function renderFeatured(){
  const el = document.getElementById("featuredGuides");
  if(!el) return;

  // Si ya hay cards escritas a mano, no renderiza
  if(el.children.length > 0) return;

  el.innerHTML = featured.map(g => `
    <article class="guideCard">
      <a class="guideCard__media" href="${g.href}">
        <img src="${g.img}" alt="${g.alt}">
      </a>
      <div class="guideCard__body">
        <div class="chips">
          <span class="${chipClass(g.category.color)}">${g.category.label}</span>
          <span class="chip chip--gold">Destacado</span>
        </div>
        <h4 class="guideCard__title"><a href="${g.href}">${g.title}</a></h4>
        <p class="guideCard__desc">${g.desc}</p>
        <div class="guideCard__meta">
          <span class="metaPill">⏱ ${g.read}</span>
          <span class="metaPill">👁 ${g.views}</span>
        </div>
      </div>
    </article>
  `).join("");
})();


// Newsletter (sin backend): valida y muestra mensaje
const newsletterForm = document.getElementById("newsletterForm");
const newsletterEmail = document.getElementById("newsletterEmail");

newsletterForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = (newsletterEmail?.value || "").trim();

  if (!email || !email.includes("@") || !email.includes(".")) {
    alert("Ingresa un email válido.");
    return;
  }

  // Aquí podrías integrar Mailchimp / Brevo / Google Forms si quieres mantenerlo sin backend.
  alert("¡Gracias! Te suscribiste correctamente.");
  newsletterEmail.value = "";
});
