#!/usr/bin/env node
/**
 * Patch GBD-WIKI.html files :
 * - Page switching (Brief / Plateforme / Site / Campagne)
 * - Sidebar rebuilt as page nav (avec sub-nav pour Plateforme)
 * - Brief stylé : angle card hero + meilleure hiérarchie
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// === CSS à injecter avant </style> ===
const EXTRA_CSS = `
    /* ── Page switching ─────────────────────── */
    .page { display: none; }
    .page.active { display: block; }

    /* ── Sidebar : page nav items ───────────── */
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      color: #71717a;
      transition: background 0.15s, color 0.15s;
      margin-bottom: 2px;
      user-select: none;
      line-height: 1.3;
    }
    .nav-item:hover { background: #18181b; color: #e4e4e7; }
    .nav-item.active { background: #18181b; color: #f4f4f5; font-weight: 600; }

    .nav-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #3f3f46;
      min-width: 20px;
      flex-shrink: 0;
    }
    .nav-item.active .nav-num { color: #10b981; }

    /* Sub-nav (plateforme sections) */
    .sub-nav { display: none; padding: 2px 0 10px 40px; }
    .sub-nav.visible { display: block; }
    .sub-nav .nav-sub {
      display: block;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 12px;
      color: #52525b;
      text-decoration: none;
      transition: background 0.1s, color 0.1s;
    }
    .sub-nav .nav-sub:hover { background: #18181b; color: #e4e4e7; }
    .sub-nav .nav-sub.active { color: #10b981; }

    /* ── Brief page — Angle hero card ──────── */
    #page-brief .block:first-of-type,
    #page-contre-brief .block:first-of-type,
    #page-brief-strategique .block:first-of-type {
      background: rgba(16, 185, 129, 0.05);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 12px;
      padding: 32px 36px;
      margin-bottom: 36px;
      position: relative;
    }
    #page-brief .block:first-of-type .block-title,
    #page-contre-brief .block:first-of-type .block-title,
    #page-brief-strategique .block:first-of-type .block-title {
      color: #10b981;
      font-size: 10px;
      letter-spacing: 0.14em;
      margin-bottom: 16px;
    }
    #page-brief .block:first-of-type .block-content strong,
    #page-contre-brief .block:first-of-type .block-content strong,
    #page-brief-strategique .block:first-of-type .block-content strong {
      display: block;
      font-size: 22px;
      font-weight: 700;
      color: #f4f4f5;
      letter-spacing: -0.01em;
      line-height: 1.3;
      margin-bottom: 14px;
    }
    #page-brief .block:first-of-type .block-content p,
    #page-contre-brief .block:first-of-type .block-content p,
    #page-brief-strategique .block:first-of-type .block-content p {
      color: #d4d4d8;
      font-size: 15px;
      line-height: 1.75;
      margin-bottom: 10px;
    }
    #page-brief .block:first-of-type .block-content p:last-child,
    #page-contre-brief .block:first-of-type .block-content p:last-child,
    #page-brief-strategique .block:first-of-type .block-content p:last-child { margin-bottom: 0; }

    /* Brief : section-title bigger */
    #page-brief .section-title,
    #page-contre-brief .section-title,
    #page-brief-strategique .section-title {
      font-size: 38px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.05;
    }

    /* Brief : angles écartés as stacked cards */
    #page-brief .block:nth-of-type(2) .block-content p,
    #page-contre-brief .block:nth-of-type(2) .block-content p,
    #page-brief-strategique .block:nth-of-type(2) .block-content p {
      background: #111113;
      border: 1px solid #27272a;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 8px;
      font-size: 13px;
      color: #a1a1aa;
    }
    #page-brief .block:nth-of-type(2) .block-content p strong,
    #page-contre-brief .block:nth-of-type(2) .block-content p strong,
    #page-brief-strategique .block:nth-of-type(2) .block-content p strong {
      display: inline;
      font-size: 13px;
      font-weight: 600;
      color: #e4e4e7;
    }
`;

// === JS de remplacement ===
const NEW_SCRIPT = `  <script>
    (function () {
      // --- Config groupes de pages ---
      var BRIEF_IDS  = ['brief-strategique','brief stratégique','contre-brief','brief'];
      var PLAT_IDS   = ['portrait','diagnostic','map-territory','plateforme',
                        'raison-detre','vision-mission','valeurs','personas',
                        'positionnement','personnalite','essence','territoire'];
      var SITE_IDS   = ['site'];   // + toutes les sections dont l'id commence par "site-"
      var CAMP_IDS   = ['campagne','campaign'];

      var PLAT_LABELS = {
        portrait:'Portrait', diagnostic:'Diagnostic', 'map-territory':'Territoire de marque',
        plateforme:'Plateforme', 'raison-detre':"Raison d'être",
        'vision-mission':'Vision & Mission', valeurs:'Valeurs', personas:'Personas',
        positionnement:'Positionnement', personnalite:'Personnalité & Ton',
        essence:'Essence & Manifeste', territoire:'Territoire',
      };

      function findSections(ids, alsoPrefix) {
        var found = [];
        ids.forEach(function(id) {
          var el = document.getElementById(id) || document.querySelector('[id="'+id+'"]');
          if (el && found.indexOf(el) === -1) found.push(el);
        });
        if (alsoPrefix) {
          document.querySelectorAll('section.section').forEach(function(s) {
            if (s.id && s.id.indexOf(alsoPrefix) === 0 && found.indexOf(s) === -1) found.push(s);
          });
        }
        return found;
      }

      var GROUPS = [
        { key:'brief',      label:'Brief stratégique',   num:'01', sections: findSections(BRIEF_IDS) },
        { key:'plateforme', label:'Plateforme de marque', num:'02', sections: findSections(PLAT_IDS) },
        { key:'campagne',   label:'Campagne',              num:'03', sections: findSections(CAMP_IDS) },
        { key:'site',       label:'Site web',              num:'04', sections: findSections(SITE_IDS, 'site-') },
      ].filter(function(g) { return g.sections.length > 0; });

      if (!GROUPS.length) return;

      var main = document.querySelector('.main');
      if (!main) return;

      // --- Wrap sections dans des .page divs ---
      GROUPS.forEach(function(g, idx) {
        var div = document.createElement('div');
        div.className = idx === 0 ? 'page active' : 'page';
        div.id = 'page-' + g.key;
        g.sections[0].before(div);
        g.sections.forEach(function(s) { div.appendChild(s); });
      });

      // --- Rebuild sidebar nav ---
      var sidebar = document.querySelector('.sidebar');
      if (!sidebar) return;
      var oldNav = sidebar.querySelector('.sidebar-nav, ul.sidebar-nav');
      if (!oldNav) return;

      var nav = document.createElement('nav');
      nav.className = 'sidebar-nav';

      GROUPS.forEach(function(g, idx) {
        var item = document.createElement('div');
        item.className = 'nav-item' + (idx === 0 ? ' active' : '');
        item.id = 'nav-' + g.key;
        item.innerHTML = '<span class="nav-num">' + g.num + '</span>' + g.label;
        item.addEventListener('click', function() { showPage(g.key); });
        nav.appendChild(item);

        // Sub-nav pour plateforme (si plusieurs sections)
        if (g.key === 'plateforme' && g.sections.length > 1) {
          var sub = document.createElement('div');
          sub.className = 'sub-nav' + (idx === 0 ? ' visible' : '');
          sub.id = 'subnav-plateforme';
          g.sections.forEach(function(s) {
            if (!s.id) return;
            var a = document.createElement('a');
            a.href = '#' + s.id;
            a.className = 'nav-sub';
            a.textContent = PLAT_LABELS[s.id] || s.id;
            sub.appendChild(a);
          });
          nav.appendChild(sub);
        }

        // Sub-nav pour site (si plusieurs sections)
        if (g.key === 'site' && g.sections.length > 1) {
          var subSite = document.createElement('div');
          subSite.className = 'sub-nav' + (idx === 0 ? ' visible' : '');
          subSite.id = 'subnav-site';
          g.sections.forEach(function(s) {
            if (!s.id) return;
            var a = document.createElement('a');
            a.href = '#' + s.id;
            a.className = 'nav-sub';
            // Prettify site-* IDs
            a.textContent = s.querySelector('h1,h2')
              ? s.querySelector('h1,h2').textContent.trim()
              : s.id.replace('site-','').replace(/-/g,' ');
            subSite.appendChild(a);
          });
          nav.appendChild(subSite);
        }
      });

      oldNav.replaceWith(nav);

      // --- Page switching ---
      function showPage(key) {
        document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
        var pg = document.getElementById('page-' + key);
        if (pg) pg.classList.add('active');

        document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
        var ni = document.getElementById('nav-' + key);
        if (ni) ni.classList.add('active');

        document.querySelectorAll('.sub-nav').forEach(function(s) { s.classList.remove('visible'); });
        var sub = document.getElementById('subnav-' + key);
        if (sub) sub.classList.add('visible');

        window.scrollTo(0, 0);
      }

      window.showPage = showPage;

      // --- Scroll spy pour sub-nav ---
      ['plateforme','site'].forEach(function(key) {
        var pg = document.getElementById('page-' + key);
        var subNav = document.getElementById('subnav-' + key);
        if (!pg || !subNav) return;
        var obs = new IntersectionObserver(function(entries) {
          entries.forEach(function(e) {
            if (e.isIntersecting && e.target.id) {
              subNav.querySelectorAll('.nav-sub').forEach(function(a) { a.classList.remove('active'); });
              var activeLink = subNav.querySelector('a[href="#' + e.target.id + '"]');
              if (activeLink) activeLink.classList.add('active');
            }
          });
        }, { threshold: 0.25 });
        pg.querySelectorAll('.section').forEach(function(s) { obs.observe(s); });
      });

    })();
  </script>`;

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠ Introuvable : ${filePath}`);
    return;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Injecter le CSS avant </style>
  if (!html.includes('/* ── Page switching')) {
    html = html.replace('</style>', EXTRA_CSS + '\n  </style>');
    console.log(`  → CSS injecté`);
  } else {
    console.log(`  → CSS déjà présent, skip`);
  }

  // 2. Remplacer le bloc <script>...</script>
  const scriptRegex = /<script>[\s\S]*?<\/script>/;
  if (scriptRegex.test(html)) {
    html = html.replace(scriptRegex, NEW_SCRIPT);
    console.log(`  → JS remplacé`);
  } else {
    // Insérer avant </body>
    html = html.replace('</body>', NEW_SCRIPT + '\n</body>');
    console.log(`  → JS inséré avant </body>`);
  }

  fs.writeFileSync(filePath, html, 'utf8');
}

const clients = ['Brutus', 'Forge', 'bloo-conseil'];

for (const client of clients) {
  const filePath = path.join(rootDir, 'clients', client, 'outputs', 'GBD-WIKI.html');
  console.log(`\n✦ ${client}`);
  patchFile(filePath);
  console.log(`  ✓ OK`);
}

console.log('\nDone — lance : node scripts/sync-dashboard.mjs');
