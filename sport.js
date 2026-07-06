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

  var gItems = document.querySelectorAll('.g-item');
  if ('IntersectionObserver' in window) {
    var gio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('gin');
          gio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    gItems.forEach(function (el) { gio.observe(el); });
  } else {
    gItems.forEach(function (el) { el.classList.add('gin'); });
  }

  /* ---------- Auto-sliding image (every 2s, smooth fade) ---------- */
  document.querySelectorAll('.ev-slider').forEach(function (slider) {
    var slides = slider.querySelectorAll('.ev-slide');
    if (slides.length < 2) return;
    var interval = parseInt(slider.getAttribute('data-interval'), 10) || 2000;
    var i = 0;
    setInterval(function () {
      slides[i].classList.remove('active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('active');
    }, interval);
  });

  /* ---------- Lightbox for the gallery ---------- */
  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lb-img');
  var lbCap = document.getElementById('lb-cap');
  var lbPrev = lb ? lb.querySelector('.lb-prev') : null;
  var lbNext = lb ? lb.querySelector('.lb-next') : null;
  var lbClose = lb ? lb.querySelector('.lb-x') : null;
  var galleryImgs = Array.prototype.map.call(document.querySelectorAll('#ev-gg .g-item img'), function (img) {
    return { src: img.getAttribute('src'), cap: img.getAttribute('alt') || '' };
  });
  var lbIndex = 0;

  function openLightbox(idx) {
    if (!lb) return;
    lbIndex = idx;
    lbImg.src = galleryImgs[lbIndex].src;
    lbImg.alt = galleryImgs[lbIndex].cap;
    lbCap.textContent = galleryImgs[lbIndex].cap;
    lb.classList.add('open');
  }
  function closeLightbox() { if (lb) lb.classList.remove('open'); }
  function showNext() { lbIndex = (lbIndex + 1) % galleryImgs.length; openLightbox(lbIndex); }
  function showPrev() { lbIndex = (lbIndex - 1 + galleryImgs.length) % galleryImgs.length; openLightbox(lbIndex); }

  document.querySelectorAll('#ev-gg .g-item').forEach(function (item, idx) {
    item.addEventListener('click', function () { openLightbox(idx); });
  });
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbNext) lbNext.addEventListener('click', showNext);
  if (lbPrev) lbPrev.addEventListener('click', showPrev);
  if (lb) {
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
  }
  document.addEventListener('keydown', function (e) {
    if (!lb || !lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });

});

window.addEventListener('scroll', function () {
  var navEl = document.getElementById('nav');
  if (navEl) {
    if (window.scrollY > 40) {
      navEl.classList.add('scrolled');
    } else {
      navEl.classList.remove('scrolled');
    }
  }
});