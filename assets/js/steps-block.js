// /assets/js/steps-block.js
class StepsBlock extends HTMLElement {
  constructor() {
    super();
    this.steps = [];
  }

  connectedCallback() {
    this.editable = this.getAttribute('editable') === 'true';
    this.storageKey = this.getAttribute('storage-key') || null;
    this.dataId = this.getAttribute('data-id') || null;
    this.src = this.getAttribute('src') || null;
    this.placeholderTitle = this.getAttribute('placeholder-title') || 'Título del paso';
    this.placeholderDesc = this.getAttribute('placeholder-desc') || 'Descripción del paso';

    // load sequence: data-id -> src -> attribute steps -> storage (if any)
    const stepsAttr = this.getAttribute('steps');

    if (this.dataId) {
      const script = document.getElementById(this.dataId);
      if (script) {
        try {
          const json = JSON.parse(script.textContent);
          this.steps = Array.isArray(json) ? json : (json.steps || []);
        } catch (e) {
          console.warn('steps-block: JSON inválido en data-id', e);
        }
        this.render();
        return;
      }
    }

    if (this.src) {
      fetch(this.src, {cache: 'no-cache'}).then(r => r.json()).then(json => {
        this.steps = Array.isArray(json) ? json : (json.steps || []);
        this.render();
      }).catch(e => {
        console.warn('steps-block: error fetch src', e);
        this.loadFromAttrOrStorage(stepsAttr);
      });
      return;
    }

    this.loadFromAttrOrStorage(stepsAttr);
  }

  loadFromAttrOrStorage(stepsAttr) {
    // try storageKey first
    if (this.storageKey) {
      try {
        const stored = JSON.parse(localStorage.getItem(this.storageKey) || 'null');
        if (Array.isArray(stored)) { this.steps = stored; this.render(); return; }
      } catch (e) { /* ignore */ }
    }

    if (stepsAttr) {
      try {
        const parsed = JSON.parse(stepsAttr);
        if (Array.isArray(parsed)) this.steps = parsed.map((s, i) => this.normalizeStep(s, i+1));
        else this.steps = [];
      } catch (e) {
        console.warn('steps-block: steps attr no JSON -> ignorado', e);
        this.steps = [];
      }
    } else {
      this.steps = [];
    }

    this.render();
  }

  normalizeStep(s, i=1) {
    if (typeof s === 'string') {
      return { title: s, desc: '' , order: i };
    }
    return {
      title: s.title || s.heading || `Paso ${i}`,
      desc: s.desc || s.description || s.body || '',
      order: s.order || i
    };
  }

  render() {
    this.innerHTML = `
      <div class="steps-block">
        <div class="steps-list" role="list"></div>
        ${this.editable ? this.editorTemplate() : ''}
      </div>
    `;
    this.listEl = this.querySelector('.steps-list');
    if (this.editable) {
      this.titleInput = this.querySelector('.step-title-input');
      this.descInput = this.querySelector('.step-desc-input');
      this.addBtn = this.querySelector('.step-add-btn');
      this.saveBtn = this.querySelector('.step-save-btn');
      this.cancelBtn = this.querySelector('.step-cancel-btn');
    }
    this._renderSteps();
    if (this.editable) this.attachEditorEvents();
  }

  editorTemplate() {
    return `
      <div class="steps-editor" style="margin-top:12px;">
        <input class="step-title-input" placeholder="${this.escape(this.placeholderTitle)}" aria-label="Título del paso" />
        <input class="step-desc-input" placeholder="${this.escape(this.placeholderDesc)}" aria-label="Descripción del paso" />
        <button type="button" class="step-add-btn">Añadir paso</button>
        <button type="button" class="step-save-btn" style="display:none;">Guardar cambios</button>
        <button type="button" class="step-cancel-btn" style="display:none;">Cancelar</button>
      </div>
    `;
  }

  _renderSteps() {
    if (!this.listEl) return;
    if (!this.steps || this.steps.length === 0) {
      this.listEl.innerHTML = `<div class="no-steps muted">No hay pasos definidos</div>`;
      return;
    }

    // sort by order
    this.steps.sort((a,b) => (a.order || 0) - (b.order || 0));

    this.listEl.innerHTML = this.steps.map((s, i) => `
      <article class="step" data-index="${i}" role="listitem">
        <div class="step-badge">${i+1}</div>
        <div class="step-body">
          <h4 class="step-title" ${this.editable ? 'contenteditable="false"' : ''}>${this.escape(s.title)}</h4>
          <p class="step-desc" ${this.editable ? 'contenteditable="false"' : ''}>${this.escape(s.desc)}</p>
        </div>
        ${this.editable ? `
          <div class="step-actions" style="margin-left:12px;">
            <button type="button" class="step-edit-btn" aria-label="Editar paso ${i+1}">Editar</button>
            <button type="button" class="step-delete-btn" aria-label="Eliminar paso ${i+1}">Eliminar</button>
          </div>` : ''}
      </article>
    `).join('');
    // after render attach edit/delete events if editable
    if (this.editable) this.attachStepButtons();
  }

  attachEditorEvents() {
    this.addBtn.addEventListener('click', () => this.addStepFromInputs());
    this.titleInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); this.addStepFromInputs(); } });
    this.descInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); this.addStepFromInputs(); } });
    this.saveBtn.addEventListener('click', () => this.saveEditing());
    this.cancelBtn.addEventListener('click', () => this.cancelEditing());
  }

  attachStepButtons() {
    this.querySelectorAll('.step-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(e.currentTarget.closest('.step').dataset.index);
        this.startEditing(idx);
      });
    });
    this.querySelectorAll('.step-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = Number(e.currentTarget.closest('.step').dataset.index);
        if (confirm('¿Eliminar este paso?')) this.deleteStep(idx);
      });
    });
  }

  addStepFromInputs() {
    const title = (this.titleInput.value || '').trim();
    const desc = (this.descInput.value || '').trim();
    if (!title) return;
    const order = (this.steps.length ? Math.max(...this.steps.map(s=>s.order||0)) + 1 : 1);
    this.steps.push({ title, desc, order });
    this.titleInput.value = '';
    this.descInput.value = '';
    this._renderSteps();
    this.persist();
    this.emitChange();
  }

  startEditing(idx) {
    const s = this.steps[idx];
    if (!s) return;
    // populate editor and show save/cancel
    this.titleInput.value = s.title;
    this.descInput.value = s.desc;
    this.addBtn.style.display = 'none';
    this.saveBtn.style.display = '';
    this.cancelBtn.style.display = '';
    this.currentEditing = idx;
    this.titleInput.focus();
  }

  saveEditing() {
    if (this.currentEditing == null) return;
    const title = (this.titleInput.value || '').trim();
    const desc = (this.descInput.value || '').trim();
    if (!title) return;
    this.steps[this.currentEditing].title = title;
    this.steps[this.currentEditing].desc = desc;
    this.currentEditing = null;
    this.titleInput.value = '';
    this.descInput.value = '';
    this.addBtn.style.display = '';
    this.saveBtn.style.display = 'none';
    this.cancelBtn.style.display = 'none';
    this._renderSteps();
    this.persist();
    this.emitChange();
  }

  cancelEditing() {
    this.currentEditing = null;
    this.titleInput.value = '';
    this.descInput.value = '';
    this.addBtn.style.display = '';
    this.saveBtn.style.display = 'none';
    this.cancelBtn.style.display = 'none';
  }

  deleteStep(idx) {
    if (idx < 0 || idx >= this.steps.length) return;
    this.steps.splice(idx, 1);
    // reassign orders
    this.steps.forEach((s, i) => s.order = i+1);
    this._renderSteps();
    this.persist();
    this.emitChange();
  }

  persist() {
    if (!this.storageKey) return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.steps));
    } catch (e) {
      console.warn('steps-block: error saving storage', e);
    }
  }

  emitChange() {
    // emit shallow copy
    this.dispatchEvent(new CustomEvent('steps-changed', { detail: { steps: this.steps.map(s => ({...s})) }, bubbles: true }));
  }

  // helper safe escape
  escape(s='') {
    return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  }
}

customElements.define('steps-block', StepsBlock);
