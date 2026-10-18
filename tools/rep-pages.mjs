// Every core-team rep gets a link of their own: the dashboard address plus their name,
// https://allinalan.github.io/rsd-events-dashboard/matt-foss (Alan, 2026-10-18). GitHub Pages serves that from
// matt-foss/index.html, a small page this tool writes: it names the rep for link previews and sends the browser
// on to ../?rep=matt-foss, where index.html opens that rep's Rep View. The pages hold no numbers, so a data
// refresh never touches them; only a change to the core team (meta.master_list) does.
//
//   node tools/rep-pages.mjs           write a page for every rep on meta.master_list in data.js, and take down
//                                      the pages of reps who are no longer on it
//   node tools/rep-pages.mjs --check   change nothing; list what is out of step and exit 1 (the smoke check runs this)
//   node tools/rep-pages.mjs --list    print every rep's link, to copy or text
//
// The link name rule (slugOf) must stay the same as slugOf() in index.html.

import { readFile, writeFile, mkdir, readdir, rm, rmdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

export const SITE = 'https://allinalan.github.io/rsd-events-dashboard/';
const MARK = '<!-- rep-page: ';   // on every page this tool writes; it never removes a folder without it

export const slugOf = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function masterList(root) {
  const ctx = { window: {} };
  vm.runInNewContext(await readFile(join(root, 'data.js'), 'utf8'), ctx, { filename: 'data.js' });
  const list = ctx.window.DASHBOARD_DATA && ctx.window.DASHBOARD_DATA.meta && ctx.window.DASHBOARD_DATA.meta.master_list;
  if (!Array.isArray(list) || !list.length) throw new Error('data.js has no meta.master_list, so there is no core team to write pages for');
  return list;
}

export function pageHtml(name) {
  const slug = slugOf(name), to = `../?rep=${slug}`, title = `${name} · RSD Numbers`;
  return `<!DOCTYPE html>
${MARK}${slug} · written by tools/rep-pages.mjs, do not edit by hand -->
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(name.split(' ')[0])}'s numbers on the Rising Sun Events Team dashboard: every campaign, and a plan for next year.">
<link rel="apple-touch-icon" href="../apple-touch-icon.png">
<meta http-equiv="refresh" content="0; url=${to}">
<script>location.replace(${JSON.stringify(to)} + location.hash);</script>
</head>
<body>
<p><a href="${to}">Open ${esc(name)}'s numbers</a></p>
</body>
</html>
`;
}

const isRepPage = async file => existsSync(file) && (await readFile(file, 'utf8')).includes(MARK);

// What would have to change: pages to write, pages to take down, and anything that stops the tool.
async function plan(root) {
  const names = await masterList(root);
  const want = new Map(), stop = [];
  for (const name of names) {
    const slug = slugOf(name);
    if (!slug) stop.push(`"${name}" has no letters or digits to make a link from`);
    else if (want.has(slug)) stop.push(`${want.get(slug)} and ${name} would share the link /${slug}`);
    else want.set(slug, name);
  }
  const write = [], remove = [];
  for (const [slug, name] of want) {
    const file = join(root, slug, 'index.html');
    if (existsSync(file) && !(await isRepPage(file))) stop.push(`/${slug} (${name}) would overwrite ${slug}/index.html, which this tool did not write`);
    else if (!existsSync(file) || await readFile(file, 'utf8') !== pageHtml(name)) write.push({ slug, name, file });
  }
  for (const d of await readdir(root, { withFileTypes: true })) {
    if (d.isDirectory() && !want.has(d.name) && await isRepPage(join(root, d.name, 'index.html'))) remove.push(d.name);
  }
  if (!existsSync(join(root, '404.html'))) stop.push('404.html is missing: a first name or a misspelled link would get GitHub\'s own error page');
  return { want, write, remove, stop };
}

// The smoke check's question: is every core rep's page in place, and nobody else's?
export async function checkPages(root) {
  const { write, remove, stop } = await plan(root);
  return [
    ...stop,
    ...write.map(w => `${w.name} has no up-to-date page at /${w.slug}: run node tools/rep-pages.mjs`),
    ...remove.map(s => `/${s} is a page for someone no longer on the core team: run node tools/rep-pages.mjs`),
  ];
}

async function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const mode = process.argv[2] || '';
  if (!['', '--check', '--list'].includes(mode)) throw new Error(`unknown option ${mode} (use --check or --list)`);
  const { want, write, remove, stop } = await plan(root);
  if (mode === '--list') {
    for (const [slug, name] of want) console.log(`${name.padEnd(20)} ${SITE}${slug}`);
    return 0;
  }
  if (mode === '--check') {
    const problems = await checkPages(root);
    for (const p of problems) console.log(`FAIL ${p}`);
    console.log(problems.length ? `\n${problems.length} problem(s).` : `ok   ${want.size} rep pages match the core team.`);
    return problems.length ? 1 : 0;
  }
  if (stop.length) {
    for (const s of stop) console.log(`STOP ${s}`);
    console.log('\nNothing written.');
    return 1;
  }
  for (const w of write) {
    await mkdir(dirname(w.file), { recursive: true });
    await writeFile(w.file, pageHtml(w.name));
    console.log(`wrote   /${w.slug}  (${w.name})`);
  }
  for (const s of remove) {
    await rm(join(root, s, 'index.html'));
    await rmdir(join(root, s)).catch(() => console.log(`        /${s}/ still holds other files; left in place`));
    console.log(`removed /${s}  (no longer on the core team)`);
  }
  console.log(write.length || remove.length ? `\n${want.size} rep pages in step with the core team.` : `Nothing to change: ${want.size} rep pages already match the core team.`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(code => process.exit(code), err => { console.error(`rep-pages: ${err.message}`); process.exit(1); });
}
