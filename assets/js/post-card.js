/* ==========================================================================
   Rediseño Completo del Web Component: post-card
   Enfoque: Semántica, Responsividad y SEO
   ========================================================================== */

class PostCard extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute("title") || "";
    const description = this.getAttribute("description") || "";
    const readtime = this.getAttribute("readtime") || "";
    const views = this.getAttribute("views") || "";
    const url = this.getAttribute("url") || "#";
    
    // Obtenemos el tag principal para definir el icono y color
    const tagsAttr = this.getAttribute("tags");
    let tags = [];
    if (tagsAttr) {
      try {
        // Asegura que tags es un array de objetos o JSON limpio
        tags = JSON.parse(tagsAttr);
      } catch (e) {
        console.error("Error en formato JSON de tags:", e);
      }
    }

    const mainTag = tags[0] || { label: "General", color: "blue" };
    
    // Mapeo de iconos según el label del tag (Nombres de tags más lógicos)
    const iconMap = {
      "Transporte": "bi-car-front",
      "Identidad": "bi-person-badge",
      "Empleo": "bi-briefcase",
      "Documentos": "bi-file-earmark-text",
      "Salud": "bi-heart-pulse",
      "Derechos": "bi-shield-check"
    };
    
    const iconClass = iconMap[mainTag.label] || "bi-bookmark-star";

    this.innerHTML = `
      <article class="postCard">
        <a class="postCard__media postCard__media--placeholder bg-${mainTag.color || 'blue'}" href="${url}">
          <i class="${iconClass} placeholder-icon" aria-hidden="true"></i>
          <span class="chip chip--floating chip--${mainTag.color || "blue"}">
            ${mainTag.label}
          </span>
        </a>

        <div class="postCard__body">
          <h2 class="postCard__title">
            <a href="${url}">${title}</a>
          </h2>

          <p class="postCard__desc">${description}</p>

          <div class="postCard__meta">
            ${readtime ? `<span class="metaPill" title="Tiempo de lectura estimado"><i class="bi bi-stopwatch"></i> ${readtime}</span>` : ""}
            ${views ? `<span class="metaPill" title="Visualizaciones totales"><i class="bi bi-eye"></i> ${views}</span>` : ""}
          </div>
        </div>
      </article>
    `;
  }
}

customElements.define("post-card", PostCard);