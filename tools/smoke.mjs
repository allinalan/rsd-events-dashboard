// Smoke check for the dashboard, run by .github/workflows/smoke.yml on every PR and every push to main.
// Serves this repo as GitHub Pages would, opens index.html in headless Chromium, and fails on anything
// that would publish a broken page to the reps: a console error or uncaught error, the load-error
// message (data.js missing or broken), an empty Total leaderboard, or a page that stops answering.
//
// Run it locally:
//   npm install --no-save playwright@1.63.0 && npx playwright install --only-shell chromium
//   node tools/smoke.mjs [--out <screenshot folder>]

import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';

const { values: args } = parseArgs({ options: {
  root: { type: 'string', default: resolve(dirname(fileURLToPath(import.meta.url)), '..') },
  out: { type: 'string', default: join(tmpdir(), 'rsd-dashboard-smoke') },
} });

const VIEWPORTS = [{ width: 1280, height: 900 }, { width: 375, height: 812 }];
const TABS = ['total', 'campaigns', 'products', 'rep'];
const LOAD_MS = 15000;       // a page load, a tab tap, a screenshot
const SETTLE_MS = 800;       // bars grow in over 600ms the first time a tab is shown
const ANSWER_MS = 5000;      // once settled, the page must answer within this or it is frozen
const WATCHDOG_MS = 300000;  // the whole run; a hang the per-step timeouts did not catch

const results = [];  // { where, problems: [] }, one per page opened
const shots = [];

class Hang extends Error {}
const within = (ms, what, promise) => {
  let timer;
  const late = new Promise((_, reject) => { timer = setTimeout(() => reject(new Hang(`${what} did not answer within ${ms / 1000}s`)), ms); });
  return Promise.race([promise, late]).finally(() => clearTimeout(timer));
};

setTimeout(() => {
  results.push({ where: 'smoke check', problems: [`hang: still running after ${WATCHDOG_MS / 1000}s`] });
  report();
  process.exit(1);
}, WATCHDOG_MS).unref();

// --- Static server: the repo folder, as GitHub Pages serves it ----------------------------------
const ROOT = resolve(args.root);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
};
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = join(ROOT, normalize(path.endsWith('/') ? path + 'index.html' : path));
    if (!file.startsWith(ROOT + sep)) throw new Error('outside the repo');
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' }).end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
});
await new Promise(ready => server.listen(0, '127.0.0.1', ready));
const ORIGIN = `http://127.0.0.1:${server.address().port}`;

// --- Checks ----------------------------------------------------------------------------------------
const size = vp => `${vp.width}x${vp.height}`;
const firstLine = e => String(e && e.message || e).split('\n')[0];

function consoleProblem(msg) {
  const { url, lineNumber } = msg.location();
  if (url && !url.startsWith(ORIGIN)) return `console error from off-site ${new URL(url).host} (not the dashboard's own files; re-run if that service was down): ${msg.text()}`;
  const at = url ? ` (${url.slice(ORIGIN.length + 1)}${lineNumber >= 0 ? ':' + (lineNumber + 1) : ''})` : '';
  return `console error: ${msg.text()}${at}`;
}

// Waits for the tab to settle, then asks the page for its state. The answer has to come back through
// an animation frame and a timer, so a page whose main thread is stuck (an observer retriggering
// itself, an endless loop) fails here instead of hanging the run.
async function settle(page) {
  await sleep(SETTLE_MS);
  return within(ANSWER_MS, 'the page', page.evaluate(() => new Promise(done =>
    requestAnimationFrame(() => setTimeout(() => done({
      loadError: !!document.querySelector('.load-error'),
      view: (document.querySelector('.view.active') || {}).id || null,
      lbRows: document.querySelectorAll('#t-lb-body tr[data-rep]').length,
    }), 0)))));
}

function stateProblems(state, tab) {
  if (state.loadError) return ['data.js is missing or broken: the page shows its "The numbers didn\'t load." message'];
  const problems = [];
  if (state.view !== `${tab}-view`) problems.push(`#${tab} did not open (showing ${state.view || 'no view'})`);
  if (!state.lbRows) problems.push('the Total leaderboard (#t-lb-body) has no rep rows');
  return problems;
}

// Opens index.html#<tab> in a fresh browser tab, runs fn, and records everything the page reported.
async function inPage(browser, vp, tab, where, fn) {
  const problems = [];
  const context = await browser.newContext({ viewport: vp });
  const page = await context.newPage();
  page.on('console', msg => { if (msg.type() === 'error') problems.push(consoleProblem(msg)); });
  page.on('pageerror', err => problems.push(`uncaught error: ${firstLine(err)}`));
  page.on('crash', () => problems.push('the page crashed'));
  try {
    await page.goto(`${ORIGIN}/index.html#${tab}`, { waitUntil: 'load', timeout: LOAD_MS }).catch(err => {
      throw err.name === 'TimeoutError' ? new Hang(`index.html did not finish loading within ${LOAD_MS / 1000}s`) : err;
    });
    await fn(page, problems);
  } catch (err) {
    problems.push(err instanceof Hang ? `hang: ${err.message}` : firstLine(err));
  } finally {
    await within(LOAD_MS, 'closing the page', context.close()).catch(() => {});
  }
  results.push({ where, problems });
}

// One tab, opened straight from its link, as a rep opening #rep would see it. Screenshot kept.
const checkTab = (browser, vp, tab) => inPage(browser, vp, tab, `${size(vp)} #${tab}`, async (page, problems) => {
  problems.push(...stateProblems(await settle(page), tab));
  const file = join(args.out, `${size(vp)}-${tab}.png`);
  await page.screenshot({ path: file, fullPage: true, animations: 'disabled', timeout: LOAD_MS });
  shots.push(file);
});

// Tapping through every tab from Total and back: the path where pill thumbs and observers fire.
const checkSwitching = (browser, vp) => inPage(browser, vp, 'total', `${size(vp)} tab switching`, async (page, problems) => {
  if ((await settle(page)).loadError) { problems.push('not tested: data.js did not load'); return; }
  for (const tab of [...TABS.slice(1), TABS[0]]) {
    await page.click(`.nav button[data-view="${tab}"]`, { timeout: LOAD_MS }).catch(async err => {
      const answers = await within(ANSWER_MS, 'the page', page.evaluate(() => true)).catch(() => false);
      throw answers ? new Error(`could not tap the ${tab} tab: ${firstLine(err)}`) : new Hang(`the page stopped answering after tapping the ${tab} tab`);
    });
    const state = await settle(page);
    if (state.view !== `${tab}-view`) problems.push(`tapping ${tab} did not open it (showing ${state.view || 'no view'})`);
  }
});

// --- Report ----------------------------------------------------------------------------------------
function report() {
  const failed = results.filter(r => r.problems.length);
  for (const r of results) {
    console.log(`${r.problems.length ? 'FAIL' : 'ok  '} ${r.where}`);
    for (const p of r.problems) console.log(`       ${p}`);
  }
  console.log(failed.length
    ? `\n${failed.length} of ${results.length} checks failed. Do not merge until this is green.`
    : `\nAll ${results.length} checks passed. ${shots.length} screenshots in ${args.out}`);
  if (!process.env.GITHUB_ACTIONS) return;
  const esc = s => s.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
  for (const r of failed) for (const p of r.problems) console.log(`::error title=Dashboard smoke check: ${esc(r.where)}::${esc(p)}`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    const cell = s => s.replace(/\|/g, '\\|');
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, [
      `## Dashboard smoke check: ${failed.length ? `${failed.length} of ${results.length} failed` : 'passed'}`, '',
      '| Page | Result |', '|---|---|',
      ...results.map(r => `| ${r.where} | ${r.problems.length ? '❌ ' + r.problems.map(cell).join('<br>') : '✅'} |`), '',
      'Screenshots of every tab at 1280x900 and 375x812 are in the **dashboard-screenshots** artifact on this run.', '',
    ].join('\n'));
  }
}

let browser;
try {
  await mkdir(args.out, { recursive: true });
  browser = await chromium.launch();
  for (const vp of VIEWPORTS) {
    for (const tab of TABS) await checkTab(browser, vp, tab);
    await checkSwitching(browser, vp);
  }
  const want = VIEWPORTS.length * TABS.length;
  if (results.every(r => !r.problems.length) && shots.length !== want) {
    results.push({ where: 'smoke check', problems: [`expected ${want} screenshots, took ${shots.length}`] });
  }
} catch (err) {
  results.push({ where: 'smoke check', problems: [`could not run: ${firstLine(err)}`] });
} finally {
  await (browser && within(LOAD_MS, 'closing the browser', browser.close()).catch(() => {}));
  server.close();
}
report();
process.exit(results.some(r => r.problems.length) ? 1 : 0);
