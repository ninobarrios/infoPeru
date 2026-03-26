class PostCard extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute("title") || "";
    const image = this.getAttribute("image") || "";
    const alt = this.getAttribute("alt") || title;

    const description = this.getAttribute("description") || "";
    const readtime = this.getAttribute("readtime") || "";
    const views = this.getAttribute("views") || "";
    const url = this.getAttribute("url") || "#";

    const tagsAttr = this.getAttribute("tags");
    let tags = [];

    if (tagsAttr) {
      try {
        tags = JSON.parse(tagsAttr);
      } catch (e) {
        console.error("Error en formato JSON de tags:", tagsAttr);
      }
    }

    this.innerHTML = `
      <article class="postCard">
        <a class="postCard__media" href="${url}" aria-label="Leer más sobre ${title}">
          <img 
            src="${image}" 
            alt="${alt}" 
            width="362" 
            height="241"
            loading="lazy" 
            decoding="async"
            style="object-fit: cover;">
        </a>

        <div class="postCard__body">
          <div class="chips">
            ${tags.map(tag => `
              <span class="chip chip--${tag.color || "blue"}">
                ${tag.label}
              </span>
            `).join("")}
          </div>

          <h2 class="postCard__title">
            <a href="${url}">${title}</a>
          </h2>

          <p class="postCard__desc">${description}</p>

          <div class="postCard__meta">
            ${readtime ? `<span class="metaPill"><i class="bi bi-stopwatch"></i> ${readtime}</span>` : ""}
            ${views ? `<span class="metaPill"><i class="bi bi-eye"></i> ${views}</span>` : ""}
          </div>
        </div>
      </article>
    `;
  }
}

customElements.define("post-card", PostCard);