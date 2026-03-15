// /assets/js/article-meta.js
class ArticleMeta extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // prioridades: data-id JSON -> src JSON (fetch) -> atributos (date, readtime, author)
    const dataId = this.getAttribute('data-id');
    const src = this.getAttribute('src');

    if (dataId) {
      const script = document.getElementById(dataId);
      if (script) {
        try {
          const json = JSON.parse(script.textContent);
          this.renderFromObject(json);
          return;
        } catch (e) {
          console.error('article-meta: JSON inválido en', dataId, e);
        }
      } else {
        console.warn('article-meta: no se encontró script con id', dataId);
      }
    }

    if (src) {
      fetch(src, { cache: 'no-cache' })
        .then(r => r.json())
        .then(json => this.renderFromObject(json))
        .catch(err => {
          console.error('article-meta: error fetch src', src, err);
          this.renderFromAttributes();
        });
      return;
    }

    this.renderFromAttributes();
  }

  renderFromAttributes() {
    const date = this.getAttribute('date') || '';
    const readtime = this.getAttribute('readtime') || '';
    const author = this.getAttribute('author') || '';
    const custom = this.getAttribute('custom') || ''; // HTML extra pequeño, opcional (sanitize abajo)
    this.innerHTML = this.template({ date, readtime, author, custom });
  }

  renderFromObject(obj = {}) {
    const date = obj.date || obj.published || '';
    const readtime = obj.readtime || obj.time || '';
    const author = obj.author || obj.authorName || '';
    const custom = obj.custom || '';
    this.innerHTML = this.template({ date, readtime, author, custom });
  }

  // pequeña función para escapar texto y evitar XSS en atributos
  esc(str = '') {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  template({ date, readtime, author, custom }) {
    // si necesitas iconos distintos o clases, cámbialos en el template
    return `
      <div class="article-meta">
        <div class="meta-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
            class="bi bi-calendar-week" viewBox="0 0 16 16" aria-hidden="true"><path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z"/><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/></svg>
          <span>${this.esc(date)}</span>
        </div>

        <div class="meta-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
            class="bi bi-clock" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"/></svg>
          <span>${this.esc(readtime)}</span>
        </div>

        <div class="meta-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people" viewBox="0 0 16 16">
  <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
</svg>
          <span>${this.esc(author)}</span>
        </div>

        ${ custom ? `<div class="meta-item meta-item--custom">${this.esc(custom)}</div>` : '' }
      </div>
    `;
  }
}

customElements.define('article-meta', ArticleMeta);
