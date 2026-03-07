#!/usr/bin/env node

/**
 * GBD Tools — CLI utility for GetBrandDone workflow operations
 *
 * Usage: node gbd-tools.cjs <command> [args]
 *
 * Commands:
 *   init [client-name]                           Create project structure, return status JSON
 *   status [client-name]                         Return available outputs + CLIENT-STATE data JSON
 *   update-state [client-slug] <step> done [n]   Update CLIENT-STATE.md, return next_step
 *   clients                                      List all client projects with their status
 *   tally-create-form [client] <json>            Create Tally form from questions array, save form ID
 *   tally-fetch-responses [client]               Fetch Tally form responses for client
 *
 * Mode CWD : si aucun [client-name], le répertoire courant EST le projet.
 * Mode legacy : le projet est dans clients/<slug>/ depuis le répertoire courant.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// ─── Env ──────────────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return {};
  const vars = {};
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) return;
    vars[line.slice(0, eqIdx).trim()] = line.slice(eqIdx + 1).trim();
  });
  return vars;
}

const ENV = loadEnv();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function out(data) {
  console.log(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
}

function err(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function getClientsDir(cwd) {
  return path.join(cwd, 'clients');
}

function getClientDir(cwd, clientName) {
  return path.join(getClientsDir(cwd), clientName);
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * resolveProject(cwd, nameOrNull)
 * Mode CWD : si nameOrNull est vide/null, le CWD EST le projet.
 * Mode legacy : le projet est dans clients/<slug>/ depuis cwd.
 */
function resolveProject(cwd, nameOrNull) {
  if (!nameOrNull || nameOrNull.trim() === '') {
    return {
      mode: 'cwd',
      clientDir: cwd,
      clientSlug: slugify(path.basename(cwd)),
      clientName: path.basename(cwd),
    };
  }
  const slug = slugify(nameOrNull);
  return {
    mode: 'legacy',
    clientDir: getClientDir(cwd, slug),
    clientSlug: slug,
    clientName: nameOrNull,
  };
}

function fileExists(filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

function getInputFiles(clientDir) {
  const inputsDir = path.join(clientDir, 'inputs');
  if (!fileExists(inputsDir)) return [];

  const files = fs.readdirSync(inputsDir).filter(f => !f.startsWith('.'));
  return files.map(f => {
    const ext = path.extname(f).toLowerCase();
    const types = {
      '.pdf': 'PDF',
      '.md': 'Markdown',
      '.txt': 'Texte',
      '.eml': 'Email',
      '.docx': 'Word',
      '.doc': 'Word',
      '.html': 'HTML',
      '.htm': 'HTML',
    };
    return {
      name: f,
      path: path.join(inputsDir, f),
      type: types[ext] || 'Fichier',
    };
  });
}

function getOutputStatus(clientDir) {
  const outputs = {
    brief_strategique: fileExists(path.join(clientDir, 'outputs', 'BRIEF-STRATEGIQUE.json')),
    platform: fileExists(path.join(clientDir, 'outputs', 'PLATFORM.json')),
    campaign: fileExists(path.join(clientDir, 'outputs', 'CAMPAIGN.json')),
    site: fileExists(path.join(clientDir, 'outputs', 'SITE.json')),
    wiki: fileExists(path.join(clientDir, 'outputs', 'GBD-WIKI.html')),
  };
  return outputs;
}

// ─── State helpers ────────────────────────────────────────────────────────────

/**
 * Extract lines from a markdown section (between ## Header and next ## Header).
 * Returns an array of non-empty lines (excluding the header itself).
 */
function extractSection(content, sectionHeader) {
  const lines = content.split('\n');
  const start = lines.findIndex(l => l.trim() === sectionHeader);
  if (start === -1) return [];

  const result = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) break;
    const line = lines[i].trim();
    if (line && line !== '- (aucun)') result.push(line);
  }
  return result;
}

/**
 * Parse step completion dates from a CLIENT-STATE.md pipeline section.
 * Returns { start: 'YYYY-MM-DD', platform: 'YYYY-MM-DD', ... }
 */
function extractStepDates(content) {
  const dates = {};
  const labelToKey = {
    'Brief stratégique': 'start',
    'Plateforme de marque': 'platform',
    'Campagne': 'campaign',
    'Site web': 'site',
    'Wiki': 'wiki',
  };

  for (const line of content.split('\n')) {
    const match = line.match(/- \[x\] (.+?) — (\d{4}-\d{2}-\d{2})/);
    if (match && labelToKey[match[1]]) {
      dates[labelToKey[match[1]]] = match[2];
    }
  }
  return dates;
}

/**
 * Parse "## Décisions clés" section from CLIENT-STATE.md.
 * Returns { angle_retenu: '...', essence: '...', posture_agence: '...' }
 */
function extractDecisionsFromStateFile(content) {
  const decisions = {};
  const lines = content.split('\n');
  const start = lines.findIndex(l => l.trim() === '## Décisions clés');
  if (start === -1) return decisions;

  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) break;
    const match = lines[i].match(/^- (.+?) : "?(.+?)"?\s*$/);
    if (match) {
      const key = match[1].toLowerCase().replace(/[^a-z0-9]+/g, '_');
      decisions[key] = match[2];
    }
  }
  return decisions;
}

/**
 * Extract brand decisions (angle, essence, posture) from BRIEF-STRATEGIQUE.json output.
 */
function extractDecisionsFromOutputs(clientDir) {
  const decisions = {};
  const briefPath = path.join(clientDir, 'outputs', 'BRIEF-STRATEGIQUE.json');

  if (fileExists(briefPath)) {
    try {
      const brief = JSON.parse(fs.readFileSync(briefPath, 'utf8'));
      if (brief.angle_strategique?.titre) decisions['Angle retenu'] = brief.angle_strategique.titre;
      if (brief.plateforme?.essence) decisions['Essence'] = brief.plateforme.essence;
      if (brief.meta?.mode_agence) decisions['Posture agence'] = brief.meta.mode_agence;
    } catch {}
  }

  return decisions;
}

// ─── Commands ─────────────────────────────────────────────────────────────────

/**
 * init [client-name]
 * Create project structure. Return JSON with status.
 * Mode CWD si client-name absent : structure créée dans cwd.
 */
function cmdInit(cwd, clientName) {
  const project = resolveProject(cwd, clientName);
  const { clientDir, clientSlug, clientName: name, mode } = project;
  const exists = fileExists(clientDir);

  if (!exists) {
    fs.mkdirSync(path.join(clientDir, 'inputs'), { recursive: true });
    fs.mkdirSync(path.join(clientDir, 'session'), { recursive: true });
    fs.mkdirSync(path.join(clientDir, 'outputs'), { recursive: true });
  }

  const inputs = getInputFiles(clientDir);
  const outputs = getOutputStatus(clientDir);

  out({
    client_name: name,
    client_slug: clientSlug,
    client_dir: clientDir,
    inputs_dir: path.join(clientDir, 'inputs'),
    outputs_dir: path.join(clientDir, 'outputs'),
    session_dir: path.join(clientDir, 'session'),
    project_existed: exists,
    input_count: inputs.length,
    inputs: inputs,
    outputs: outputs,
    mode,
  });
}

/**
 * status [client-name]
 * Return JSON with available outputs and overall project status.
 * Mode CWD si client-name absent.
 */
function cmdStatus(cwd, clientName) {
  const project = resolveProject(cwd, clientName);
  const { clientDir, clientSlug, clientName: name, mode } = project;

  if (!fileExists(clientDir)) {
    const suggestion = mode === 'cwd' ? '/gbd:start' : `/gbd:start ${name}`;
    out({
      found: false,
      client_slug: clientSlug,
      message: `Projet "${name}" non trouvé. Lance ${suggestion}`,
    });
    return;
  }

  const inputs = getInputFiles(clientDir);
  const outputs = getOutputStatus(clientDir);

  const steps = [
    { key: 'brief_strategique', label: 'Brief stratégique',    cmd: '/gbd:start'    },
    { key: 'platform',          label: 'Plateforme de marque', cmd: '/gbd:platform' },
    { key: 'campaign',          label: 'Campagne',             cmd: '/gbd:campaign' },
    { key: 'site',              label: 'Site web',             cmd: '/gbd:site'     },
    { key: 'wiki',              label: 'Wiki',                 cmd: '/gbd:wiki'     },
  ];

  const completed = steps.filter(s => outputs[s.key]).length;
  const next = steps.find(s => !outputs[s.key]);

  // Read CLIENT-STATE.md if available
  const statePath = path.join(clientDir, 'session', 'CLIENT-STATE.md');
  let clientState = null;
  if (fileExists(statePath)) {
    const stateContent = fs.readFileSync(statePath, 'utf8');
    const derniereSession = extractSection(stateContent, '## Dernière session');
    clientState = {
      decisions: extractDecisionsFromStateFile(stateContent),
      points_ouverts: extractSection(stateContent, '## Points ouverts'),
      derniere_session: derniereSession,
    };
  }

  const nextCmd = next
    ? (mode === 'cwd' ? next.cmd : `${next.cmd} ${clientSlug}`)
    : null;

  out({
    found: true,
    client_name: name,
    client_slug: clientSlug,
    client_dir: clientDir,
    input_count: inputs.length,
    inputs: inputs,
    outputs: outputs,
    progress: `${completed}/${steps.length}`,
    next_step: next ? { label: next.label, command: nextCmd } : null,
    client_state: clientState,
    mode,
  });
}

/**
 * clients
 * List all client projects in clients/ with their status.
 */
function cmdClients(cwd) {
  const clientsDir = getClientsDir(cwd);

  if (!fileExists(clientsDir)) {
    out({ count: 0, clients: [], message: 'Aucun projet client. Lance /gbd:start <client-name>' });
    return;
  }

  const dirs = fs.readdirSync(clientsDir).filter(d => {
    const full = path.join(clientsDir, d);
    return fs.statSync(full).isDirectory() && !d.startsWith('.');
  });

  const clients = dirs.map(slug => {
    const clientDir = path.join(clientsDir, slug);
    const outputs = getOutputStatus(clientDir);
    const inputs = getInputFiles(clientDir);
    const completed = Object.values(outputs).filter(Boolean).length;

    return {
      slug,
      dir: clientDir,
      input_count: inputs.length,
      outputs,
      progress: `${completed}/5`,
    };
  });

  out({
    count: clients.length,
    clients,
  });
}

/**
 * read-json <filepath>
 * Read and output a JSON file. Used by workflows to load output files.
 */
function cmdReadJson(filePath) {
  if (!filePath) err('filepath requis. Usage: gbd-tools read-json <filepath>');

  const resolved = path.resolve(filePath);
  if (!fileExists(resolved)) {
    out({ found: false, path: resolved });
    return;
  }

  try {
    const content = fs.readFileSync(resolved, 'utf8');
    const json = JSON.parse(content);
    out({ found: true, path: resolved, data: json });
  } catch (e) {
    out({ found: true, path: resolved, parse_error: e.message });
  }
}

/**
 * write-json <filepath> <json-string>
 * Write a JSON file, creating parent directories as needed.
 */
function cmdWriteJson(filePath, jsonString) {
  if (!filePath) err('filepath requis. Usage: gbd-tools write-json <filepath> <json>');

  const resolved = path.resolve(filePath);
  const dir = path.dirname(resolved);

  fs.mkdirSync(dir, { recursive: true });

  try {
    const json = JSON.parse(jsonString);
    fs.writeFileSync(resolved, JSON.stringify(json, null, 2), 'utf8');
    out({ success: true, path: resolved });
  } catch (e) {
    err(`JSON invalide : ${e.message}`);
  }
}

/**
 * write-session [client-name] <filename> <content>
 * Write a file to session/.
 * Mode CWD si client-name absent (détecté si args[1] a une extension).
 */
function cmdWriteSession(cwd, clientName, filename, content) {
  const project = resolveProject(cwd, clientName);
  const sessionDir = path.join(project.clientDir, 'session');
  fs.mkdirSync(sessionDir, { recursive: true });
  const filePath = path.join(sessionDir, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  out({ success: true, path: filePath });
}

/**
 * update-state [client-slug] <step> done [notes]
 * Writes/updates session/CLIENT-STATE.md with current pipeline status and decisions.
 * step: start | platform | campaign | site | wiki
 * Mode CWD si args[1] est un step valide (pas de slug).
 * Returns { success, path, next_step, decisions }.
 */
function cmdUpdateState(cwd, clientSlugOrNull, step, status, notes) {
  if (!step) err('step requis (start|platform|campaign|site|wiki).');

  const validSteps = ['start', 'platform', 'campaign', 'site', 'wiki'];
  if (!validSteps.includes(step)) {
    err(`step invalide : "${step}". Valeurs acceptées : ${validSteps.join(', ')}`);
  }

  const project = resolveProject(cwd, clientSlugOrNull);
  const { clientDir, clientSlug, clientName, mode } = project;
  const statePath = path.join(clientDir, 'session', 'CLIENT-STATE.md');
  const today = new Date().toISOString().slice(0, 10);

  const outputs = getOutputStatus(clientDir);

  // Preserve existing step dates and points ouverts
  let existingDates = {};
  let pointsOuverts = [];
  if (fileExists(statePath)) {
    const existing = fs.readFileSync(statePath, 'utf8');
    existingDates = extractStepDates(existing);
    pointsOuverts = extractSection(existing, '## Points ouverts');
  }

  // Mark current step as done today
  if (status === 'done') existingDates[step] = today;

  // Extract brand decisions from JSON outputs
  const decisions = extractDecisionsFromOutputs(clientDir);

  const stepConfig = [
    { key: 'start',    outputKey: 'brief_strategique', label: 'Brief stratégique',    cmd: '/gbd:start'    },
    { key: 'platform', outputKey: 'platform',           label: 'Plateforme de marque', cmd: '/gbd:platform' },
    { key: 'campaign', outputKey: 'campaign',           label: 'Campagne',             cmd: '/gbd:campaign' },
    { key: 'site',     outputKey: 'site',               label: 'Site web',             cmd: '/gbd:site'     },
    { key: 'wiki',     outputKey: 'wiki',               label: 'Wiki',                 cmd: '/gbd:wiki'     },
  ];

  // Determine which steps are completed (output exists OR just marked done)
  const completedKeys = new Set([
    ...stepConfig.filter(s => outputs[s.outputKey]).map(s => s.key),
    ...(status === 'done' ? [step] : []),
  ]);

  // Find next incomplete step
  const nextStep = stepConfig.find(s => !completedKeys.has(s.key));
  const nextCmd = nextStep
    ? (mode === 'cwd' ? nextStep.cmd : `${nextStep.cmd} ${clientSlug}`)
    : null;

  // Build markdown
  const lines = [
    `# État du projet — ${clientName}`,
    `*Dernière mise à jour : ${today}*`,
    '',
    '## Pipeline',
  ];

  for (const s of stepConfig) {
    const done = completedKeys.has(s.key);
    const date = existingDates[s.key] || today;
    lines.push(done ? `- [x] ${s.label} — ${date}` : `- [ ] ${s.label}`);
  }

  lines.push('');
  lines.push('## Prochaine étape');
  lines.push(nextCmd || 'Projet complet ✓');

  lines.push('');
  lines.push('## Décisions clés');
  if (Object.keys(decisions).length > 0) {
    for (const [k, v] of Object.entries(decisions)) lines.push(`- ${k} : "${v}"`);
  } else {
    lines.push('- (à compléter après le brief stratégique)');
  }

  lines.push('');
  lines.push('## Points ouverts');
  if (pointsOuverts.length > 0) {
    lines.push(...pointsOuverts);
  } else {
    lines.push('- (aucun)');
  }

  lines.push('');
  lines.push('## Dernière session');
  lines.push(`Date : ${today}`);
  const stepLabel = stepConfig.find(s => s.key === step)?.label || step;
  lines.push(`Fait : ${notes || `${stepLabel} terminé`}`);
  lines.push('');

  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, lines.join('\n'), 'utf8');

  out({ success: true, path: statePath, next_step: nextCmd, decisions });
}

// ─── Tally helpers ────────────────────────────────────────────────────────────

function tallyRequest(method, endpoint, body, apiKey) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.tally.so',
      path: endpoint,
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
      },
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function questionsToBlocks(questions) {
  const blocks = [];
  for (const q of questions) {
    const text = q.text || q;
    const required = q.required !== false;

    // TITLE block — question label
    blocks.push({
      uuid: crypto.randomUUID(),
      type: 'TITLE',
      groupUuid: crypto.randomUUID(),
      groupType: 'QUESTION',
      payload: {
        safeHTMLSchema: [[text]],
      },
    });

    // TEXTAREA block — answer input
    blocks.push({
      uuid: crypto.randomUUID(),
      type: 'TEXTAREA',
      groupUuid: crypto.randomUUID(),
      groupType: 'TEXTAREA',
      payload: {
        isRequired: required,
        hasMinCharacters: false,
        hasMaxCharacters: false,
        hasDefaultAnswer: false,
        placeholder: 'Votre réponse...',
      },
    });
  }
  return blocks;
}

/**
 * tally-create-form [client-name] <questions-json>
 * Creates a Tally form from a JSON array of questions.
 * Saves form metadata to session/TALLY-FORM.json.
 * Mode CWD si questions-json est le premier arg (commence par '[' ou '{').
 */
async function cmdTallyCreateForm(cwd, clientName, questionsJson) {
  if (!questionsJson) err('questions-json requis.');

  const apiKey = ENV.TALLY_API_KEY;
  if (!apiKey) err('TALLY_API_KEY manquante dans .env');

  let questions;
  try {
    questions = JSON.parse(questionsJson);
  } catch (e) {
    err(`JSON invalide : ${e.message}`);
  }

  const project = resolveProject(cwd, clientName);
  const { clientDir, clientName: name } = project;

  const titleUuid = crypto.randomUUID();
  const titleBlock = {
    uuid: titleUuid,
    type: 'FORM_TITLE',
    groupUuid: crypto.randomUUID(),
    groupType: 'FORM_TITLE',
    payload: {
      title: `Brief client — ${name}`,
      safeHTMLSchema: [[`Brief client — ${name}`]],
      button: { label: 'Envoyer' },
    },
  };

  const blocks = [titleBlock, ...questionsToBlocks(questions)];

  const payload = {
    name: `Brief client — ${name}`,
    status: 'PUBLISHED',
    blocks,
  };

  let res;
  try {
    res = await tallyRequest('POST', '/forms', payload, apiKey);
  } catch (e) {
    err(`Erreur réseau Tally : ${e.message}`);
  }

  if (res.status !== 200 && res.status !== 201) {
    err(`Tally API erreur ${res.status} : ${JSON.stringify(res.body)}`);
  }

  const form = res.body;
  const formId = form.id;
  const formUrl = `https://tally.so/r/${formId}`;

  // Save to session
  const sessionDir = path.join(clientDir, 'session');
  fs.mkdirSync(sessionDir, { recursive: true });
  const tallyFile = path.join(sessionDir, 'TALLY-FORM.json');
  fs.writeFileSync(tallyFile, JSON.stringify({
    form_id: formId,
    form_url: formUrl,
    created_at: new Date().toISOString(),
    client: name,
    questions: questions,
  }, null, 2), 'utf8');

  out({
    success: true,
    form_id: formId,
    form_url: formUrl,
    question_count: questions.length,
    session_file: tallyFile,
  });
}

/**
 * tally-fetch-responses [client-name]
 * Fetches submissions from the Tally form saved for this client.
 * Mode CWD si client-name absent.
 */
async function cmdTallyFetchResponses(cwd, clientName) {
  const apiKey = ENV.TALLY_API_KEY;
  if (!apiKey) err('TALLY_API_KEY manquante dans .env');

  const project = resolveProject(cwd, clientName);
  const { clientDir, clientName: name } = project;
  const tallyFile = path.join(clientDir, 'session', 'TALLY-FORM.json');

  if (!fileExists(tallyFile)) {
    err(`Aucun form Tally trouvé pour ${name}. Lance d'abord tally-create-form.`);
  }

  const formMeta = JSON.parse(fs.readFileSync(tallyFile, 'utf8'));
  const formId = formMeta.form_id;

  let res;
  try {
    res = await tallyRequest('GET', `/forms/${formId}/submissions`, null, apiKey);
  } catch (e) {
    err(`Erreur réseau Tally : ${e.message}`);
  }

  if (res.status !== 200) {
    err(`Tally API erreur ${res.status} : ${JSON.stringify(res.body)}`);
  }

  const { submissions = [], questions = [], totalNumberOfSubmissionsPerFilter = {} } = res.body;
  const completed = submissions.filter(s => s.isCompleted);

  // Build question map for readable output
  const qMap = {};
  questions.forEach(q => { qMap[q.id] = q.title; });

  const formatted = completed.map(sub => ({
    submitted_at: sub.submittedAt,
    answers: sub.responses.map(r => ({
      question: qMap[r.questionId] || r.questionId,
      answer: r.formattedAnswer || r.answer,
    })),
  }));

  out({
    form_id: formId,
    form_url: formMeta.form_url,
    total: totalNumberOfSubmissionsPerFilter.all || 0,
    completed: totalNumberOfSubmissionsPerFilter.completed || 0,
    submissions: formatted,
  });
}

// ─── Router ───────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const cwd = process.cwd();

  if (!command) {
    err('Usage: gbd-tools <command> [args]\nCommands: init, status, update-state, clients, read-json, write-json, write-session, tally-create-form, tally-fetch-responses');
  }

  const validSteps = ['start', 'platform', 'campaign', 'site', 'wiki'];

  switch (command) {
    case 'init':
      cmdInit(cwd, args[1]);
      break;
    case 'status':
      cmdStatus(cwd, args[1]);
      break;
    case 'update-state':
      // CWD mode si args[1] est un step valide (pas de slug en préfixe)
      if (validSteps.includes(args[1])) {
        cmdUpdateState(cwd, null, args[1], args[2] || 'done', args.slice(3).join(' '));
      } else {
        cmdUpdateState(cwd, args[1], args[2], args[3] || 'done', args.slice(4).join(' '));
      }
      break;
    case 'clients':
      cmdClients(cwd);
      break;
    case 'read-json':
      cmdReadJson(args[1]);
      break;
    case 'write-json':
      cmdWriteJson(args[1], args.slice(2).join(' '));
      break;
    case 'write-session':
      // CWD mode si args[1] a une extension (c'est un nom de fichier, pas un client)
      if (args[1] && path.extname(args[1])) {
        cmdWriteSession(cwd, null, args[1], args.slice(2).join(' '));
      } else {
        cmdWriteSession(cwd, args[1], args[2], args.slice(3).join(' '));
      }
      break;
    case 'tally-create-form':
      // CWD mode si args[1] commence par '[' ou '{' (JSON, pas client-name)
      if (args[1] && (args[1].startsWith('[') || args[1].startsWith('{'))) {
        cmdTallyCreateForm(cwd, null, args.slice(1).join(' ')).catch(e => err(e.message));
      } else {
        cmdTallyCreateForm(cwd, args[1], args.slice(2).join(' ')).catch(e => err(e.message));
      }
      break;
    case 'tally-fetch-responses':
      cmdTallyFetchResponses(cwd, args[1] || null).catch(e => err(e.message));
      break;
    default:
      err(`Commande inconnue : ${command}\nDisponibles : init, status, update-state, clients, read-json, write-json, write-session, tally-create-form, tally-fetch-responses`);
  }
}

main();
