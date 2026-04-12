(function () {
  'use strict';

  function renderMath() {
    var inlineOpts = { throwOnError: false };
    var displayOpts = { throwOnError: false, displayMode: true };

    document.querySelectorAll('.math-inline').forEach(function (el) {
      var tex = el.getAttribute('data-latex');
      if (!tex) return;
      try {
        katex.render(tex, el, inlineOpts);
      } catch (err) {
        el.textContent = tex;
      }
    });

    document.querySelectorAll('.math-display').forEach(function (el) {
      var tex = el.getAttribute('data-latex');
      if (!tex) return;
      try {
        katex.render(tex, el, displayOpts);
      } catch (err) {
        el.textContent = tex;
      }
    });
  }

  function activatePanel(panelId) {
    var tabs = document.querySelectorAll('.tab');
    var panels = document.querySelectorAll('.panel');

    tabs.forEach(function (tab) {
      var isMatch = tab.getAttribute('data-panel') === panelId;
      tab.classList.toggle('tab--active', isMatch);
      tab.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    panels.forEach(function (panel) {
      var isMatch = panel.id === 'panel-' + panelId;
      panel.classList.toggle('panel--active', isMatch);
      if (isMatch) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });
  }

  document.querySelectorAll('.tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var panelId = tab.getAttribute('data-panel');
      if (panelId) activatePanel(panelId);
    });
  });

  function activateSubpanel(subId) {
    document.querySelectorAll('.subtab').forEach(function (btn) {
      var match = btn.getAttribute('data-subpanel') === subId;
      btn.classList.toggle('subtab--active', match);
      btn.setAttribute('aria-selected', match ? 'true' : 'false');
    });
    document.querySelectorAll('#panel-problems .subpanel').forEach(function (p) {
      var match = p.id === 'subpanel-' + subId;
      if (match) {
        p.removeAttribute('hidden');
      } else {
        p.setAttribute('hidden', '');
      }
    });
  }

  document.querySelectorAll('.subtab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sub = btn.getAttribute('data-subpanel');
      if (sub) activateSubpanel(sub);
    });
  });

  document.querySelectorAll('.solution-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('aria-controls');
      if (!id) return;
      var panel = document.getElementById(id);
      if (!panel) return;
      var isHidden = panel.hasAttribute('hidden');
      if (isHidden) {
        panel.removeAttribute('hidden');
        btn.setAttribute('aria-expanded', 'true');
        btn.textContent = 'Скрыть ответ';
      } else {
        panel.setAttribute('hidden', '');
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = 'Показать ответ';
      }
    });
  });

  renderMath();
})();
