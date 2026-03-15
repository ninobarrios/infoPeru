class ArticleActions extends HTMLElement {
  connectedCallback() {
    const share = this.getAttribute("share") !== "false";
    const save = this.getAttribute("save") !== "false";
    const print = this.getAttribute("print") !== "false";

    this.innerHTML = `
      <div class="hero-actions" role="toolbar" aria-label="Acciones del artículo">

        ${share ? `
        <button class="action-btn" data-action="share" type="button" title="Compartir">
          ${this.icons.share}
          <span class="action-label">Compartir</span>
        </button>` : ""}

        ${save ? `
        <button class="action-btn" data-action="save" type="button" title="Guardar">
          ${this.icons.save}
          <span class="action-label">Guardar</span>
        </button>` : ""}

        ${print ? `
        <button class="action-btn" data-action="print" type="button" title="Imprimir">
          ${this.icons.print}
          <span class="action-label">Imprimir</span>
        </button>` : ""}

      </div>
    `;

    this.initEvents();
  }

  initEvents() {
    const shareBtn = this.querySelector('[data-action="share"]');
    const saveBtn = this.querySelector('[data-action="save"]');
    const printBtn = this.querySelector('[data-action="print"]');

    if (shareBtn) {
      shareBtn.addEventListener("click", () => {
        if (navigator.share) {
          navigator.share({
            title: document.title,
            url: window.location.href
          });
        } else {
          navigator.clipboard.writeText(window.location.href);
          alert("Enlace copiado al portapapeles");
        }
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        const saved = JSON.parse(localStorage.getItem("savedArticles") || "[]");
        const current = window.location.href;

        if (!saved.includes(current)) {
          saved.push(current);
          localStorage.setItem("savedArticles", JSON.stringify(saved));
          alert("Artículo guardado");
        } else {
          alert("Ya está guardado");
        }
      });
    }

    if (printBtn) {
      printBtn.addEventListener("click", () => {
        window.print();
      });
    }
  }

  get icons() {
    return {
      share: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-share" viewBox="0 0 16 16">
        <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5m-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"/>
        </svg>
      `,
      save: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-floppy" viewBox="0 0 16 16">
  <path d="M11 2H9v3h2z"/>
  <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z"/>
</svg>
      `,
      print: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-printer" viewBox="0 0 16 16">
  <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/>
  <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1"/>
</svg>
      `
    };
  }
}

customElements.define("article-actions", ArticleActions);
