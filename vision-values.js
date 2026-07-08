/* ---------- Preloader ---------- */
window.addEventListener('load', function () {
  var pre = document.getElementById('preloader');
  if (pre) {
    setTimeout(function () {
      pre.classList.add('preloader-hidden');
    }, 600);
  }
});

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Mobile nav toggle ---------- */
  var ham = document.querySelector('.ham');
  var navEl = document.getElementById('nav');
  if (ham && navEl) {
    ham.addEventListener('click', function () {
      navEl.classList.toggle('menu-open');
    });
  }

  /* Mobile dropdown toggles */
  document.querySelectorAll('.drop-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var parent = btn.closest('.dropdown');
      var wasOpen = parent.classList.contains('open');
      document.querySelectorAll('.dropdown.open').forEach(function (d) { d.classList.remove('open'); });
      if (!wasOpen) parent.classList.add('open');
    });
  });

  /* ---------- Turn nav solid on scroll ---------- */
  window.addEventListener('scroll', function () {
    if (navEl) {
      if (window.scrollY > 40) {
        navEl.classList.add('scrolled');
      } else {
        navEl.classList.remove('scrolled');
      }
    }
  });

  /* ---------- Reveal-on-scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

});
