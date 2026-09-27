(function () {
  "use strict";

  var VIRTUAL_WIDTH = 1100; // «виртуальный» вьюпорт тренажёра, который уменьшаем до карточки
  var canHover = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function resizePreview(preview) {
    var iframe = preview.querySelector("iframe");
    if (!iframe) return;
    var box = preview.getBoundingClientRect();
    if (!box.width || !box.height) return;
    var scale = box.width / VIRTUAL_WIDTH;
    iframe.style.width = VIRTUAL_WIDTH + "px";
    iframe.style.height = (box.height / scale) + "px";
    iframe.style.transform = "scale(" + scale + ")";
  }

  function mountPreview(preview) {
    if (preview.dataset.mounted === "1") return;
    var src = preview.dataset.src;
    if (!src) return;

    var iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = "Предпросмотр тренажёра";
    iframe.setAttribute("aria-hidden", "true");
    iframe.setAttribute("tabindex", "-1");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("loading", "lazy");
    preview.insertBefore(iframe, preview.firstChild);
    preview.dataset.mounted = "1";
    resizePreview(preview);
  }

  function showPreview(item) {
    var preview = item.querySelector(".preview");
    if (!preview) return;
    mountPreview(preview);
    preview.classList.add("is-visible");
  }

  function hidePreview(item) {
    var preview = item.querySelector(".preview");
    if (preview) preview.classList.remove("is-visible");
  }

  var items = Array.prototype.slice.call(document.querySelectorAll(".trainer-item"));

  items.forEach(function (item) {
    var card = item.querySelector(".trainer");
    var toggle = item.querySelector(".preview-toggle");
    if (!card) return;

    if (canHover) {
      card.addEventListener("pointerenter", function () { showPreview(item); });
      card.addEventListener("pointerleave", function () { hidePreview(item); });
      card.addEventListener("focus", function () { showPreview(item); });
      card.addEventListener("blur", function () { hidePreview(item); });
    }

    if (toggle) {
      toggle.addEventListener("click", function () {
        var preview = item.querySelector(".preview");
        if (!preview) return;
        var on = preview.classList.toggle("is-visible");
        if (on) mountPreview(preview);
        toggle.setAttribute("aria-pressed", String(on));
        toggle.textContent = on ? "Скрыть превью" : "Превью";
      });
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") items.forEach(hidePreview);
  });

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      document.querySelectorAll(".preview[data-mounted='1']").forEach(resizePreview);
    }, 150);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      document.querySelectorAll(".preview[data-mounted='1']").forEach(resizePreview);
    });
  }
})();
