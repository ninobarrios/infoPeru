// /assets/js/keywords-block.js
class KeywordsBlock extends HTMLElement {
  constructor() {
    super();
    this.tags = [];
  }

  connectedCallback() {
    // config
    this.editable = this.getAttribute('editable') === 'true' || false;
    this.storageKey = this.getAttribute('storage-key') || null; // opcional para persistencia
    this.dataId = this.getAttribute('data-id') || null;
    this.src = this.getAttribute('src') || null;
    this.placeholder = this.getAttribute('placeholder') || 'Añadir palabra clave';

    // carga inicial: prioridad data-id -> src -> attr tags
    const tagsAttr = this.getAttribute('tags');
    if (this.dataId) {
      const script = document.getElementById(this.dataId);
      if (script) {
        try {
          const json = JSON.parse(script.textContent);
          this.tags = Array.isArray(json) ? json : (json.tags || []);
        } catch (e) {
          console.warn('keywords-block: JSON inválido en data-id', e);
        }
        this.render();
        return;
      }
    }

    if (this.src) {
      fetch(this.src, {cache: 'no-cache'}).then(r => r.json()).then(json => {
        this.tags = Array.isArray(json) ? json : (json.tags || []);
        this.render();
      }).catch(e => {
        console.warn('keywords-block: error fetch src', e);
        this.loadFromAttrOrStorage(tagsAttr);
      });
      return;
    }

    this.loadFromAttrOrStorage(tagsAttr);
  }

  loadFromAttrOrStorage(tagsAttr) {
    // si hay storageKey, intentar cargar
    if (this.storageKey) {
      try {
        const stored = JSON.parse(localStorage.getItem(this.storageKey) || 'null');
        if (Array.isArray(stored)) { this.tags = stored; this.render(); return; }
      } catch (e) { /* ignore */ }
    }

    if (tagsAttr) {
      try {
        const parsed = JSON.parse(tagsAttr);
        if (Array.isArray(parsed)) this.tags = parsed.map(t => typeof t === 'string' ? t : (t.label || ''));
        else this.tags = [String(tagsAttr)];
      } catch (e) {
        // si no es JSON, interpretarlo como texto separado por comas
        this.tags = String(tagsAttr).split(',').map(s => s.trim()).filter(Boolean);
      }
    } else {
      this.tags = [];
    }

    this.render();
  }

  render() {
    // renderiza markup
    this.innerHTML = `
      <div class="keywords-block" aria-label="Palabras clave">
        <div class="keywords-label">Palabras clave:</div>
        <div class="keywords-list" role="list" tabindex="0"></div>
        ${this.editable ? `
          <div class="keywords-editor" style="margin-top:8px;">
            <input type="text" class="keywords-input" placeholder="${this.escape(this.placeholder)}" aria-label="Agregar palabra clave"/>
            <button type="button" class="keywords-add">Añadir</button>
          </div>` : ''}
      </div>
    `;

    this.listEl = this.querySelector('.keywords-list');
    this.inputEl = this.querySelector('.keywords-input');
    this.addBtn = this.querySelector('.keywords-add');

    this._renderTags();

    // eventos
    this.listEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.keyword-chip');
      if (!btn) return;
      const key = btn.dataset.key;
      if (this.editable && e.target.classList.contains('keyword-remove')) {
        this.removeTag(key);
      } else {
        // comportamiento por defecto: disparar evento o copiar texto para búsqueda
        this.dispatchEvent(new CustomEvent('keyword-click', { detail: { key }, bubbles: true }));
        // ejemplo práctico: copiar al portapapeles para búsqueda
        // navigator.clipboard?.writeText(key);
      }
    });

    if (this.editable) {
      this.addBtn.addEventListener('click', () => this.addFromInput());
      this.inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); this.addFromInput(); }
      });
    }
  }

  _renderTags() {
    if (!this.listEl) return;
    if (!this.tags || this.tags.length === 0) {
      this.listEl.innerHTML = `<div class="no-keywords muted">Sin palabras clave</div>`;
      return;
    }

    this.listEl.innerHTML = this.tags.map(tag => `
      <button class="keyword-chip" type="button" role="listitem" data-key="${this.escape(tag)}" title="Buscar: ${this.escape(tag)}">
        <span class="keyword-label">${this.escape(tag)}</span>
        ${this.editable ? `<span class="keyword-remove" aria-hidden="true" style="margin-left:8px">✕</span>` : ''}
      </button>
    `).join('');
  }

  addFromInput() {
    const text = (this.inputEl.value || '').trim();
    if (!text) return;
    if (this.tags.includes(text)) {
      this.inputEl.value = '';
      this.inputEl.focus();
      return;
    }
    this.tags.push(text);
    this.inputEl.value = '';
    this._renderTags();
    this.persist();
    this.emitChange();
  }

  removeTag(tag) {
    this.tags = this.tags.filter(t => t !== tag);
    this._renderTags();
    this.persist();
    this.emitChange();
  }

  persist() {
    if (this.storageKey) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.tags));
      } catch (e) {
        console.warn('keywords-block: error saving storage', e);
      }
    }
  }

  emitChange() {
    this.dispatchEvent(new CustomEvent('keywords-changed', { detail: { tags: this.tags.slice() }, bubbles: true }));
  }

  // helper safe escape
  escape(s='') {
    return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  }
}

customElements.define('keywords-block', KeywordsBlock);
