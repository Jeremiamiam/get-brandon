#!/usr/bin/env node
/**
 * Patch existing GBD-WIKI.html files to dark theme
 * Replaces the <style> block + fixes known inline styles
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const NEW_STYLE = `  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Syne', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 15px;
      line-height: 1.7;
      color: #e4e4e7;
      background: #0a0a0b;
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 220px;
      min-width: 220px;
      background: #111113;
      border-right: 1px solid #27272a;
      padding: 32px 20px;
      position: fixed;
      top: 0; left: 0;
      height: 100vh;
      overflow-y: auto;
    }

    .sidebar-brand {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #52525b;
      margin-bottom: 4px;
    }

    .sidebar-client {
      font-size: 17px;
      font-weight: 700;
      color: #f4f4f5;
      margin-bottom: 32px;
      line-height: 1.3;
    }

    .sidebar-nav { list-style: none; }
    .sidebar-nav li { margin-bottom: 4px; }

    .sidebar-nav a {
      display: block;
      padding: 6px 10px;
      border-radius: 6px;
      color: #71717a;
      text-decoration: none;
      font-size: 13px;
      transition: background 0.15s, color 0.15s;
    }

    .sidebar-nav a:hover { background: #18181b; color: #e4e4e7; }
    .sidebar-nav a.active { background: #18181b; color: #10b981; }

    .sidebar-nav .nav-section-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #3f3f46;
      padding: 16px 10px 4px;
    }

    .sidebar-nav a.nav-sub {
      padding-left: 20px;
      font-size: 12px;
      color: #52525b;
    }

    .sidebar-nav a.nav-sub:hover { background: #18181b; color: #e4e4e7; }
    .sidebar-nav a.nav-sub.active { background: #18181b; color: #10b981; }

    .main {
      margin-left: 220px;
      flex: 1;
      padding: 60px 64px;
      max-width: 860px;
    }

    .section {
      margin-bottom: 80px;
      padding-bottom: 80px;
      border-bottom: 1px solid #27272a;
    }

    .section:last-child { border-bottom: none; }

    .section-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #52525b;
      margin-bottom: 8px;
    }

    .section-title {
      font-size: 26px;
      font-weight: 700;
      color: #f4f4f5;
      margin-bottom: 24px;
      line-height: 1.3;
    }

    .tldr {
      background: rgba(16, 185, 129, 0.08);
      border-left: 3px solid #10b981;
      border-radius: 0 8px 8px 0;
      padding: 20px 24px;
      margin-bottom: 40px;
    }

    .tldr-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #52525b;
      margin-bottom: 10px;
    }

    .tldr ul { list-style: none; }

    .tldr ul li {
      font-size: 14px;
      color: #a1a1aa;
      padding: 4px 0;
      padding-left: 16px;
      position: relative;
    }

    .tldr ul li::before {
      content: "→";
      position: absolute;
      left: 0;
      color: #10b981;
    }

    .block { margin-bottom: 32px; }

    .block-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #52525b;
      margin-bottom: 8px;
    }

    .block-content {
      font-size: 15px;
      color: #a1a1aa;
      line-height: 1.7;
    }

    .block-content p { margin-bottom: 12px; }

    .tags { display: flex; flex-wrap: wrap; gap: 8px; }

    .tag {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 4px;
      padding: 4px 10px;
      font-size: 13px;
      color: #71717a;
    }

    .tag.negative {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .we-table { width: 100%; border-collapse: collapse; }

    .we-table th {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #52525b;
      padding: 8px 12px;
      text-align: left;
      border-bottom: 1px solid #27272a;
    }

    .we-table td {
      padding: 10px 12px;
      font-size: 14px;
      border-bottom: 1px solid #18181b;
    }

    .we-table td:first-child { color: #e4e4e7; }
    .we-table td:last-child { color: #ef4444; }

    .card {
      background: #111113;
      border: 1px solid #27272a;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 12px;
    }

    .card-title {
      font-weight: 700;
      font-size: 15px;
      margin-bottom: 6px;
      color: #f4f4f5;
    }

    .card-sub {
      font-size: 13px;
      color: #71717a;
      margin-bottom: 8px;
    }

    .card-proof {
      font-size: 12px;
      color: #52525b;
      font-style: italic;
    }

    .essence-block {
      text-align: center;
      padding: 48px;
      background: #111113;
      border: 1px solid #27272a;
      border-radius: 12px;
      margin: 32px 0;
    }

    .essence-text {
      font-size: 36px;
      font-weight: 800;
      color: #f4f4f5;
      letter-spacing: -0.02em;
    }

    .manifeste {
      font-size: 16px;
      line-height: 2;
      color: #a1a1aa;
      font-style: italic;
      border-left: 2px solid #27272a;
      padding-left: 24px;
      margin: 24px 0;
    }

    .footer {
      margin-top: 80px;
      padding-top: 24px;
      border-top: 1px solid #27272a;
      font-size: 12px;
      color: #3f3f46;
    }

    @media (max-width: 768px) {
      body { flex-direction: column; }
      .sidebar {
        position: relative;
        width: 100%;
        height: auto;
        border-right: none;
        border-bottom: 1px solid #27272a;
      }
      .main { margin-left: 0; padding: 32px 24px; }
    }
  </style>`;

// Inline style replacements for Portrait section cards
const INLINE_REPLACEMENTS = [
  // Portrait card backgrounds (old light → dark)
  [/background:#fafafa;border:1px solid #e5e5e5;border-radius:12px/g,
   'background:#111113;border:1px solid #27272a;border-radius:12px'],
  [/background:#fafafa;border:1px solid #e5e5e5;border-radius:8px/g,
   'background:#111113;border:1px solid #27272a;border-radius:8px'],
  // Section label colors (bbb → 52525b)
  [/color:#bbb;margin-bottom:16px/g, 'color:#52525b;margin-bottom:16px'],
  [/color:#bbb;margin-bottom:8px/g,  'color:#52525b;margin-bottom:8px'],
  // Title text colors (1a1a1a → f4f4f5)
  [/color:#1a1a1a;letter-spacing:-0\.03em/g, 'color:#f4f4f5;letter-spacing:-0.03em'],
  [/color:#1a1a1a;line-height:1\.5/g, 'color:#f4f4f5;line-height:1.5'],
  // Paragraph text (333 → a1a1aa)
  [/color:#333;line-height:1\.8/g, 'color:#a1a1aa;line-height:1.8'],
  // Code block (monospace blocks with light bg)
  [/background:#fafafa;border:1px solid #e5e5e5;border-radius:8px;padding:32px;font-family:monospace;font-size:13px;line-height:2;color:#333/g,
   'background:#111113;border:1px solid #27272a;border-radius:8px;padding:32px;font-family:\'JetBrains Mono\',monospace;font-size:13px;line-height:2;color:#a1a1aa'],
  // URL slug color (#999 → #52525b)
  [/font-weight:400;color:#999/g, 'font-weight:400;color:#52525b'],
  // essence-tension (#777 → #71717a)
  [/color:#777/g, 'color:#71717a'],
];

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠ Fichier introuvable : ${filePath}`);
    return;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // Replace <style>...</style> block
  const styleRegex = /<style>[\s\S]*?<\/style>/;
  if (!styleRegex.test(html)) {
    console.log(`⚠ Pas de <style> trouvé dans : ${filePath}`);
    return;
  }

  // Remove old font link tags if present
  html = html.replace(/<link[^>]*fonts\.googleapis[^>]*>\n?/g, '');
  html = html.replace(/<link[^>]*fonts\.gstatic[^>]*>\n?/g, '');
  html = html.replace(/<link[^>]*preconnect[^>]*>\n?/g, '');

  // Replace style block with new CSS (including font links)
  html = html.replace(styleRegex, NEW_STYLE);

  // Apply inline style replacements
  for (const [from, to] of INLINE_REPLACEMENTS) {
    html = html.replace(from, to);
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✓ Patché : ${filePath}`);
}

const clients = ['Brutus', 'Forge', 'bloo-conseil'];

for (const client of clients) {
  const filePath = path.join(rootDir, 'clients', client, 'outputs', 'GBD-WIKI.html');
  patchFile(filePath);
}

console.log('\nDone. Lance maintenant : node scripts/sync-dashboard.mjs');
