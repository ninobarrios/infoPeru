(function () {
      const shareBtn = document.getElementById('btnShare');
      const saveBtn = document.getElementById('btnSave');
      const printBtn = document.getElementById('btnPrint');

      const STORAGE_KEY = 'tramitesperu.saved';

      // URL y título a compartir (puedes personalizar)
      const pageData = {
        url: location.href,
        title: document.title || 'Artículo'
      };

      // --- Compartir ---
      shareBtn.addEventListener('click', async () => {
        if (navigator.share) {
          try {
            await navigator.share({ title: pageData.title, url: pageData.url });
          } catch (err) {
            // user cancelled or error
            console.log('Share canceled or failed', err);
          }
        } else {
          // Fallback: copiar al portapapeles
          try {
            await navigator.clipboard.writeText(pageData.url);
            showTemp(shareBtn, 'Enlace copiado');
          } catch (e) {
            // ultima alternativa: prompt
            const ok = window.prompt('Copia el enlace:', pageData.url);
            if (ok !== null) showTemp(shareBtn, 'Copiado');
          }
        }
      });

      // --- Guardar (bookmark local) ---
      function isSaved() {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return saved.includes(pageData.url);
      }

      function updateSaveButton() {
        if (isSaved()) {
          saveBtn.classList.add('saved');
          saveBtn.querySelector('.bi').classList.remove('bi-bookmark');
          saveBtn.querySelector('.bi').classList.add('bi-bookmark-fill');
          saveBtn.querySelector('.action-label').textContent = 'Guardado';
          saveBtn.setAttribute('aria-pressed', 'true');
        } else {
          saveBtn.classList.remove('saved');
          saveBtn.querySelector('.bi').classList.remove('bi-bookmark-fill');
          saveBtn.querySelector('.bi').classList.add('bi-bookmark');
          saveBtn.querySelector('.action-label').textContent = 'Guardar';
          saveBtn.setAttribute('aria-pressed', 'false');
        }
      }

      saveBtn.addEventListener('click', () => {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (saved.includes(pageData.url)) {
          // quitar
          const next = saved.filter(u => u !== pageData.url);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          showTemp(saveBtn, 'Eliminado');
        } else {
          saved.push(pageData.url);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
          showTemp(saveBtn, 'Guardado');
        }
        updateSaveButton();
      });

      // --- Imprimir ---
      printBtn.addEventListener('click', () => {
        window.print();
      });

      // Helper: mostrar texto temporal en el botón
      function showTemp(button, text, ms = 1200) {
        const original = button.innerHTML;
        button.innerHTML = `<i class="bi bi-check2" aria-hidden="true"></i> <span class="action-label">${text}</span>`;
        setTimeout(() => { button.innerHTML = original; updateSaveButton(); }, ms);
      }

      // Init
      updateSaveButton();

    })();