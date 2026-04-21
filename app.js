(function () {
  "use strict";

  function renderMath() {
    var inlineOpts = { throwOnError: false };
    var displayOpts = { throwOnError: false, displayMode: true };

    document.querySelectorAll(".math-inline").forEach(function (el) {
      var tex = el.getAttribute("data-latex");
      if (!tex) return;
      try {
        katex.render(tex, el, inlineOpts);
      } catch (err) {
        el.textContent = tex;
      }
    });

    document.querySelectorAll(".math-display").forEach(function (el) {
      var tex = el.getAttribute("data-latex");
      if (!tex) return;
      try {
        katex.render(tex, el, displayOpts);
      } catch (err) {
        el.textContent = tex;
      }
    });
  }

  function activatePanel(panelId) {
    var tabs = document.querySelectorAll(".tab");
    var panels = document.querySelectorAll(".panel");

    tabs.forEach(function (tab) {
      var isMatch = tab.getAttribute("data-panel") === panelId;
      tab.classList.toggle("tab--active", isMatch);
      tab.setAttribute("aria-selected", isMatch ? "true" : "false");
    });

    panels.forEach(function (panel) {
      var isMatch = panel.id === "panel-" + panelId;
      panel.classList.toggle("panel--active", isMatch);
      if (isMatch) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });
  }

  document.querySelectorAll(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      var panelId = tab.getAttribute("data-panel");
      if (panelId) activatePanel(panelId);
    });
  });

  function activateSubpanel(subId) {
    document.querySelectorAll(".subtab").forEach(function (btn) {
      var match = btn.getAttribute("data-subpanel") === subId;
      btn.classList.toggle("subtab--active", match);
      btn.setAttribute("aria-selected", match ? "true" : "false");
    });
    document
      .querySelectorAll("#panel-problems .subpanel")
      .forEach(function (p) {
        var match = p.id === "subpanel-" + subId;
        if (match) {
          p.removeAttribute("hidden");
        } else {
          p.setAttribute("hidden", "");
        }
      });
  }

  document.querySelectorAll(".subtab").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var sub = btn.getAttribute("data-subpanel");
      if (sub) activateSubpanel(sub);
    });
  });

  document.querySelectorAll(".solution-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("aria-controls");
      if (!id) return;
      var panel = document.getElementById(id);
      if (!panel) return;
      var isHidden = panel.hasAttribute("hidden");
      if (isHidden) {
        panel.removeAttribute("hidden");
        btn.setAttribute("aria-expanded", "true");
        btn.textContent = "Скрыть ответ";
      } else {
        panel.setAttribute("hidden", "");
        btn.setAttribute("aria-expanded", "false");
        btn.textContent = "Показать ответ";
      }
    });
  });

  async function generateAndDownloadPDF() {
    const btn = document.getElementById("download-cheatsheet-btn");
    const originalText = btn.textContent;
    btn.textContent = "⏳ Генерация...";
    btn.disabled = true;

    try {
      if (typeof window.jspdf === "undefined") {
        await loadPDFLibraries();
      }

      const pdfContainer = document.createElement("div");
      pdfContainer.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      width: 800px;
      background: white;
      padding: 30px;
      font-family: 'Times New Roman', Times, serif;
    `;
      document.body.appendChild(pdfContainer);

      const container = document.getElementById("formula-groups-container");
      const groups = container.querySelectorAll(".formula-group");

      let htmlContent = `
      <div class="pdf-header" style="text-align: center; margin-bottom: 30px; page-break-after: avoid;">
        <h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 10px;">
          📐 Шпаргалка по тригонометрии
        </h1>
      </div>
    `;

      groups.forEach((group) => {
        const title = group.querySelector("h3")?.textContent || "Раздел";
        htmlContent += `
    <div class="formula-section" style="margin-bottom: 25px; page-break-inside: avoid;">
      <h2 style="color: #2980b9; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px; font-size: 18px; page-break-after: avoid;">
        ${title}
      </h2>
  `;

        const children = group.children;

        for (let i = 0; i < children.length; i++) {
          const child = children[i];

          if (child.tagName === "H4") {
            htmlContent += `<h3 style="color: #34495e; margin: 20px 0 15px 0; font-size: 16px; page-break-after: avoid;">${child.textContent}</h3>`;
          }

          if (
            child.classList &&
            (child.classList.contains("formula-grid") ||
              child.querySelector(".formula-card"))
          ) {
            const cards = child.querySelectorAll(".formula-card");
            if (cards.length > 0) {
              htmlContent +=
                '<div class="formula-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 10px 0;">';

              cards.forEach((card) => {
                const formulas = card.querySelectorAll(".math-display");
                const description = card.querySelector("p")?.textContent || "";

                htmlContent += `
            <div class="formula-card-pdf" style="background: #f8f9fa; padding: 10px; border-radius: 5px; text-align: center; border: 1px solid #dee2e6; page-break-inside: avoid;">
          `;

                formulas.forEach((formula) => {
                  const latex = formula.getAttribute("data-latex");
                  if (latex) {
                    htmlContent += `<div class="pdf-formula" data-latex="${latex.replace(/"/g, "&quot;")}" style="page-break-inside: avoid;"></div>`;
                  }
                });

                if (description && !description.includes("margin:")) {
                  htmlContent += `<small style="color: #7f8c8d; font-size: 11px; display: block; margin-top: 5px;">${description}</small>`;
                }

                htmlContent += "</div>";
              });

              htmlContent += "</div>";
            }
          }

          if (child.tagName === "TABLE" || child.querySelector("table")) {
            const table =
              child.tagName === "TABLE" ? child : child.querySelector("table");
            if (table) {
              htmlContent += `
          <div class="table-wrapper" style="margin: 15px 0; overflow-x: auto; page-break-inside: avoid;">
            ${table.outerHTML}
          </div>
        `;
            }
          }

          if (
            child.tagName === "P" &&
            !child.closest(".formula-card") &&
            !child.classList.contains("panel-lead")
          ) {
            const pClone = child.cloneNode(true);
            htmlContent += `<div style="margin: 10px 0; color: #555; font-size: 14px; page-break-inside: avoid;">${pClone.innerHTML}</div>`;
          }

          if (
            child.classList &&
            !child.classList.contains("formula-grid") &&
            child.querySelector(".math-display")
          ) {
            const formulas = child.querySelectorAll(".math-display");
            formulas.forEach((formula) => {
              const latex = formula.getAttribute("data-latex");
              if (latex) {
                htmlContent += `<div class="pdf-formula" data-latex="${latex.replace(/"/g, "&quot;")}" style="page-break-inside: avoid; margin: 10px 0;"></div>`;
              }
            });
          }
        }

        htmlContent += "</div>";
      });

      htmlContent += `
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #dee2e6;">
      <p style="text-align: center; color: #95a5a6; font-size: 11px; margin-top: 20px;">
        Сгенерировано с помощью сайта по тригонометрии<br>
        на основе выпускной квалификационной работы Бойкова Никиты<br>
        Воронежский государственный педагогический университет - 2026
      </p>
    `;

      pdfContainer.innerHTML = htmlContent;

      const mathElements = pdfContainer.querySelectorAll(".pdf-formula");
      mathElements.forEach((el) => {
        const latex = el.getAttribute("data-latex");
        if (latex) {
          try {
            katex.render(latex, el, {
              displayMode: true,
              throwOnError: false,
            });
          } catch (e) {
            console.error("KaTeX error:", e);
            el.textContent = latex;
          }
        }
      });

      const style = document.createElement("style");
      style.textContent = `
      * {
        box-sizing: border-box;
      }
      
      /* Запрещаем разрыв внутри элементов */
      .formula-section {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      
      .formula-card-pdf {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      
      .pdf-formula {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      
      .table-wrapper {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      
      /* Заголовки не должны отрываться от содержимого */
      h2, h3, h4 {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      
      /* Стили для таблиц */
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      
      th, td {
        border: 1px solid #333;
        padding: 6px;
        text-align: center;
        font-size: 13px;
      }
      
      th {
        background-color: #e9ecef;
        font-weight: bold;
      }
      
      /* Стили для формул */
      .katex-display {
        margin: 0.3em 0;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      
      .katex {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      
      /* Отступы для лучшего разбиения */
      body {
        margin: 0;
        padding: 0;
      }
      
      /* Группировка элементов */
      .formula-grid {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      
      /* Для маленьких экранов/страниц */
      @media print {
        .formula-section {
          page-break-inside: avoid !important;
        }
        
        .formula-card-pdf {
          page-break-inside: avoid !important;
        }
        
        .pdf-formula {
          page-break-inside: avoid !important;
        }
      }
    `;
      pdfContainer.appendChild(style);

      await new Promise((resolve) => setTimeout(resolve, 800));

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const sections = pdfContainer.querySelectorAll(".formula-section");

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - 2 * margin;

      let currentPage = 1;
      let yPosition = margin;

      const header = pdfContainer.querySelector(".pdf-header");
      const headerCanvas = await html2canvas(header, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const headerImgData = headerCanvas.toDataURL("image/png");
      const headerHeight =
        (headerCanvas.height * contentWidth) / headerCanvas.width;

      pdf.addImage(
        headerImgData,
        "PNG",
        margin,
        yPosition,
        contentWidth,
        headerHeight,
      );
      yPosition += headerHeight + 5;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];

        const sectionCanvas = await html2canvas(section, {
          scale: 2,
          backgroundColor: "#ffffff",
          logging: false,
        });

        const sectionImgData = sectionCanvas.toDataURL("image/png");
        const sectionHeight =
          (sectionCanvas.height * contentWidth) / sectionCanvas.width;

        if (yPosition + sectionHeight > pageHeight - margin) {
          pdf.addPage();
          currentPage++;
          yPosition = margin;
        }

        pdf.addImage(
          sectionImgData,
          "PNG",
          margin,
          yPosition,
          contentWidth,
          sectionHeight,
        );
        yPosition += sectionHeight + 5;
      }

      const footerHTML = `
        <div style="margin-top: 20px;">
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #dee2e6;">
          <p style="text-align: center; color: #95a5a6; font-size: 11px; margin-top: 20px;">
            Сгенерировано с помощью сайта по тригонометрии<br>
            на основе выпускной квалификационной работы Бойкова Никиты<br>
            Воронежский государственный педагогический университет – 2026
          </p>
        </div>
      `;

      const footerTempDiv = document.createElement("div");
      footerTempDiv.innerHTML = footerHTML;
      footerTempDiv.style.width = pdfContainer.style.width;
      footerTempDiv.style.fontFamily = "'Times New Roman', Times, serif";
      pdfContainer.appendChild(footerTempDiv);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const footerCanvas = await html2canvas(footerTempDiv, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const footerImgData = footerCanvas.toDataURL("image/png");
      const footerHeight =
        (footerCanvas.height * contentWidth) / footerCanvas.width;

      if (yPosition + footerHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.addImage(
        footerImgData,
        "PNG",
        margin,
        yPosition,
        contentWidth,
        footerHeight,
      );

      pdfContainer.removeChild(footerTempDiv);

      document.body.removeChild(pdfContainer);

      pdf.save("Тригонометрия_Шпаргалка.pdf");

      btn.textContent = originalText;
      btn.disabled = false;

      showNotification("✅ PDF-файл успешно скачан!", "success");
    } catch (error) {
      console.error("Ошибка при генерации PDF:", error);
      btn.textContent = originalText;
      btn.disabled = false;
      showNotification("❌ Ошибка при создании PDF", "error");
    }
  }

  function loadPDFLibraries() {
    return new Promise((resolve, reject) => {
      const jspdfScript = document.createElement("script");
      jspdfScript.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

      const html2canvasScript = document.createElement("script");
      html2canvasScript.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";

      let loaded = 0;
      const checkLoaded = () => {
        loaded++;
        if (loaded === 2) {
          resolve();
        }
      };

      jspdfScript.onload = checkLoaded;
      html2canvasScript.onload = checkLoaded;

      jspdfScript.onerror = reject;
      html2canvasScript.onerror = reject;

      document.head.appendChild(jspdfScript);
      document.head.appendChild(html2canvasScript);
    });
  }

  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${type === "success" ? "#2ecc71" : "#e74c3c"};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: bold;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  const style = document.createElement("style");
  style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
  document.head.appendChild(style);

  document.addEventListener("DOMContentLoaded", function () {
    const downloadBtn = document.getElementById("download-cheatsheet-btn");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", generateAndDownloadPDF);
    }
  });

  renderMath();
})();
