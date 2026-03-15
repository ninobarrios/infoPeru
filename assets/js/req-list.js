// /assets/js/req-list.js
class ReqList extends HTMLElement {
  constructor() {
    super();
    this.items = []; // each item: { title?, description?, html? }
  }

  connectedCallback() {
    this.editable = this.getAttribute('editable') === 'true';
    this.storageKey = this.getAttribute('storage-key') || null;
    this.dataId = this.getAttribute('data-id') || null;
    this.src = this.getAttribute('src') || null;
    this.allowHtml = this.getAttribute('allow-html') === 'true';

    const itemsAttr = this.getAttribute('items');

    // priority: data-id -> src -> storage -> items attr -> empty
    if (this.dataId) {
      const script = document.getElementById(this.dataId);
      if (script) {
        try {
          const json = JSON.parse(script.textContent);
          this.items = Array.isArray(json) ? json : (json.items || []);
        } catch (e) { console.warn('req-list: JSON inválido en data-id', e); }
        this.render();
        return;
      }
    }

    if (this.src) {
      fetch(this.src, { cache: 'no-cache' })
        .then(r => r.json())
        .then(json => { this.items = Array.isArray(json) ? json : (json.items || []); this.render(); })
        .catch(e => { console.warn('req-list: error fetch', e); this.loadFromAttrOrStorage(itemsAttr); });
      return;
    }

    this.loadFromAttrOrStorage(itemsAttr);
  }

  loadFromAttrOrStorage(itemsAttr) {
    if (this.storageKey) {
      try {
        const stored = JSON.parse(localStorage.getItem(this.storageKey) || 'null');
        if (Array.isArray(stored)) { this.items = stored; this.render(); return; }
      } catch (e) {}
    }

    if (itemsAttr) {
      try {
        const parsed = JSON.parse(itemsAttr);
        this.items = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        // allow simple CSV/textlines
        this.items = String(itemsAttr).split('\n').map(s => ({ description: s.trim() })).filter(Boolean);
      }
    } else {
      this.items = [];
    }

    this.render();
  }

  render() {
    this.innerHTML = `
      <div class="req-list-wrapper">
        <ul class="req-list" role="list" aria-label="${this.escape(this.getAttribute('aria-label') || 'Requisitos')}">
          ${this.items.length ? this.items.map((it, idx) => this.itemTemplate(it, idx)).join('') : '<li class="req-item muted">Sin requisitos</li>'}
        </ul>
        ${this.editable ? this.editorTemplate() : ''}
      </div>
    `;
    this.bindings();
  }

  itemTemplate(it, idx) {
    const title = it.title ? `<strong>${this.escape(it.title)}</strong>` : '';
    const desc = it.description ? ` ${this.allowHtml && it.html ? it.description : this.escape(it.description)}` : (it.html && this.allowHtml ? it.html : '');
    const display = `${title}${desc}`;
    const removeBtn = this.editable ? `<button class="req-remove" data-idx="${idx}" type="button" aria-label="Eliminar requisito ${idx+1}">✕</button>` : '';
    return `
      <li class="req-item" data-idx="${idx}">
        <span class="req-icon" aria-hidden="true">${this.checkIcon()}</span>
        <div class="req-text">${display}</div>
        ${removeBtn}
      </li>
    `;
  }

  editorTemplate() {
    return `
      <div class="req-editor" style="margin-top:12px;">
        <input class="req-title" placeholder="Título (opcional)" aria-label="Título del requisito">
        <input class="req-desc" placeholder="Descripción del requisito" aria-label="Descripción del requisito">
        <button type="button" class="req-add">Añadir requisito</button>
      </div>
    `;
  }

  bindings() {
    // click on req -> emit event
    this.querySelectorAll('.req-item').forEach(li => {
      li.addEventListener('click', (e) => {
        // ignore clicks on remove button
        if (e.target.closest('.req-remove')) return;
        const idx = Number(li.dataset.idx);
        const item = this.items[idx];
        this.dispatchEvent(new CustomEvent('req-click', { detail: { item, idx }, bubbles: true }));
      });
    });

    // remove buttons
    if (this.editable) {
      this.querySelectorAll('.req-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = Number(btn.dataset.idx);
          if (confirm('¿Eliminar este requisito?')) {
            this.items.splice(idx,1);
            this.persist();
            this.render();
            this.emitChange();
          }
        });
      });

      // add
      const addBtn = this.querySelector('.req-add');
      const titleInput = this.querySelector('.req-title');
      const descInput = this.querySelector('.req-desc');

      if (addBtn) {
        addBtn.addEventListener('click', () => {
          const title = (titleInput.value || '').trim();
          const description = (descInput.value || '').trim();
          if (!title && !description) return;
          this.items.push({ title, description });
          titleInput.value = '';
          descInput.value = '';
          this.persist();
          this.render();
          this.emitChange();
        });

        [titleInput, descInput].forEach(inp => {
          inp.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); addBtn.click(); }
          });
        });
      }
    }
  }

  checkIcon() {
    return `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="22" height="22" rx="5" fill="#eef2ff"></rect>
        <path d="M7 12.5l2.5 2.5L17 8" stroke="#1d4ed8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `;
  }

  persist() {
    if (!this.storageKey) return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) { console.warn('req-list: persist error', e); }
  }

  emitChange() {
    this.dispatchEvent(new CustomEvent('reqs-changed', { detail: { items: this.items.slice() }, bubbles: true }));
  }

  // escape helper
  escape(s='') {
    return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  }
}

customElements.define('req-list', ReqList);
