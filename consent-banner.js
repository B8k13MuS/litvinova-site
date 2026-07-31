(function () {
  "use strict";

  var STORAGE_KEY = "consent152fzAccepted";

  try {
    if (localStorage.getItem(STORAGE_KEY) === "1") return;
  } catch (e) {
    // localStorage unavailable (private mode, etc.) — show the banner anyway
  }

  function init() {
    var banner = document.createElement("div");
    banner.className = "consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Согласие на обработку персональных данных");
    banner.innerHTML =
      '<div class="consent-banner__container">' +
        '<p class="consent-banner__text">' +
          "Этот сайт использует файлы cookie и обрабатывает персональные данные, которые вы указываете в формах (имя, телефон, email), " +
          'в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных». ' +
          'Продолжая пользоваться сайтом, вы соглашаетесь с этим. Подробнее — в ' +
          '<a href="/privacy.html" class="consent-banner__link">политике конфиденциальности</a>.' +
        "</p>" +
        '<button type="button" class="btn btn--primary btn--small consent-banner__btn">Принимаю</button>' +
      "</div>";

    document.body.appendChild(banner);

    var btn = banner.querySelector(".consent-banner__btn");
    btn.addEventListener("click", function () {
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch (e) {
        // ignore — worst case the banner reappears next visit
      }
      banner.classList.add("consent-banner--hidden");
      setTimeout(function () {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
      }, 300);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
