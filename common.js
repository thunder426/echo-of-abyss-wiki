(function () {
  // --- Page titles ---
  var titles = {
    home: 'Echo of Abyss Wiki',
    mechanics: 'Game Mechanics - Echo of Abyss Wiki',
    cards: 'Card Library - Echo of Abyss Wiki',
    heroes: 'Heroes & Talents - Echo of Abyss Wiki',
    relics: 'Relics - Echo of Abyss Wiki',
    encounters: 'Encounters - Echo of Abyss Wiki',
    rewards: 'Rewards & Shop - Echo of Abyss Wiki'
  };

  var content = document.getElementById('content');
  var navLinks = document.querySelectorAll('#main-nav a[data-page]');
  var cache = {};

  // --- Hash-based router ---
  function pageFromHash() {
    var h = location.hash.replace(/^#/, '');
    return (h && titles[h]) ? h : 'home';
  }

  function setActiveNav(page) {
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.dataset.page === page);
    });
  }

  function loadPage(page) {
    setActiveNav(page);
    document.title = titles[page] || 'Echo of Abyss Wiki';
    window.scrollTo(0, 0);

    if (cache[page]) {
      render(cache[page]);
      return;
    }

    var file = 'pages/' + page + '.html';
    fetch(file).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    }).then(function (html) {
      cache[page] = html;
      render(html);
    }).catch(function () {
      content.innerHTML = '<div class="container"><h1>Page not found</h1></div>';
    });
  }

  function render(html) {
    content.innerHTML = html;
    // Execute any inline <script> tags in the partial
    var scripts = content.querySelectorAll('script');
    scripts.forEach(function (old) {
      var s = document.createElement('script');
      s.textContent = old.textContent;
      old.parentNode.replaceChild(s, old);
    });
  }

  // Nav clicks — handled natively by hash hrefs, just close mobile nav
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-nav]');
    if (!link) return;
    document.getElementById('main-nav').classList.remove('open');
  });

  // Hash change (nav clicks + back/forward)
  window.addEventListener('hashchange', function () {
    loadPage(pageFromHash());
  });

  // Mobile nav toggle
  document.getElementById('nav-toggle').addEventListener('click', function () {
    document.getElementById('main-nav').classList.toggle('open');
  });

  // --- Music player ---
  var audio = document.getElementById('bg-music');
  var btn = document.getElementById('music-toggle');
  var muted = localStorage.getItem('eoa-wiki-muted') === 'true';
  audio.volume = 0.3;

  function updateBtn() {
    btn.textContent = muted ? '\u266C\u2009\u2715' : '\u266B';
    btn.title = muted ? 'Play music' : 'Mute music';
  }
  updateBtn();

  function startMusic() {
    audio.play().catch(function () {
      document.addEventListener('click', function f() {
        audio.play();
        document.removeEventListener('click', f);
      }, { once: true });
    });
  }

  if (!muted) startMusic();

  btn.addEventListener('click', function () {
    muted = !muted;
    localStorage.setItem('eoa-wiki-muted', muted);
    if (muted) audio.pause();
    else audio.play();
    updateBtn();
  });

  // --- Initial page load ---
  loadPage(pageFromHash());
})();
