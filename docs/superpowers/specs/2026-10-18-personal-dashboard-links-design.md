# Personal dashboard links — design

Decided with Alan on 2026-10-18 (MacBook session). He took every recommended default except the link
format, which became name links.

## Why

Each rep on the RSD Events Team should have a link of their own that opens straight to their numbers, so they
can see every campaign they have worked and plan next year. Alan keeps the team page, and anything he changes
there shows up on every personal page: one page, one data file, no copies to keep up.

Nothing here is private. Alan: "I don't care if people go to other people's links… I encourage it even." The
links are for convenience. They are not a lock.

## Goals

- One easy link per core-team rep (all 21 on `meta.master_list`, Alan included).
- The rep's link opens their Rep View with no tabs and no name picker, so the page reads as "my numbers".
- Every campaign on one screen, so the rep doesn't have to tap through campaigns one by one.
- A "Plan <next year>" block that turns their history into a plan.
- After the first visit, the page is one tap away on their phone (Add to Home Screen).

## Non-goals

- Privacy, logins or secret codes. Names are in the links and anyone can open anyone's page.
- Sending the links. That comes later, with a preview and Alan's go.
- Targets set by Alan, or notes typed in by him. One source for v1.

## Decisions

| # | Decision |
|---|---|
| 1 | Openness stays as it is today. A rep's link hides the team tabs and the name picker, and a footer link opens the team page. |
| 2 | Rank and team average stay on the rep's page. |
| 3 | **Every campaign**: a grid of C1 / C2 / C3 / Year by year, for Total CPO · Event CPO · Orders · Avg order · Events, each figure with its change against the same campaign the year before. Tapping a figure opens that campaign (or year) further up the page. |
| 4 | **Plan <next year>**: the rep types a goal (prefilled with this year's pace + 10%, rounded to $5K). The page splits it into C1 / C2 / C3 by their own campaign mix, shows their best of each campaign, and works out about how many shifts each campaign takes. The goal is saved only in that browser. |
| 5 | One page and one data file, so every design change and every data refresh reaches all 21 pages. |
| 6 | **Link = the dashboard address plus the rep's name**: `…/rsd-events-dashboard/matt-foss`. A first name on its own works when it is unique (`/luke`); anything else gets a "pick your name" list. |
| 7 | All 21 core reps get a link. Gaps show as dashes, as they do today. |
| 8 | `data.js` stops publishing emails (dashboard file now, and the intake's parser so they don't come back). Rep numbers stay: the intake matches reps by them from one run to the next. |
| 9 | Alan merges the PR, which publishes the pages, but nobody has a link until he sends it. The smoke check opens every personal page on every PR. |
| 10 | No mockups. Screenshots of the real pages come with the PR. |

## How it works

- `?rep=<slug>` on `index.html` turns on personal mode (`body.personal`). The slug is the name in lower case
  with hyphens. Matching tries the exact slug first, then a unique first name, then a unique last name.
  Anything else shows the name list.
- `<slug>/index.html` (one small file per rep, written by `tools/rep-pages.mjs`) gives each rep a clean
  address and a proper link preview, then sends the browser to `../?rep=<slug>`.
- `404.html` catches anything else typed under the site (a first name, a typo) and hands it to the same lookup.
- The page title and `apple-mobile-web-app-title` become the rep's name, so Add to Home Screen saves their own
  page under their name. `apple-touch-icon.png` is the sun mark. Phones get a one-time tip that explains how.
- On the team page, Rep View shows the selected rep's link with a Copy button.
- The smoke check fails when a core rep has no page file, when a page file doesn't match a core rep, or when a
  personal page doesn't open to that rep.

## Plan math

- **Goal prefill**: this year's projected finish from the pacing block (YTD × the rep's multiplier) × 1.10,
  rounded to the nearest $5K. Once the year has closed, its full-year Total CPO × 1.10. No Total Sales on file:
  no prefill.
- **Split**: the rep's average share of each campaign over the closed years where all three campaigns have
  Total Sales. Failing that, the same on event sales. With no closed year at all, the team's split.
- **Best**: the rep's highest Total CPO for that campaign in any year (event CPO when Total CPO is missing).
- **Shifts**: target × (shift CPO ÷ full-year Total CPO) ÷ shift average, using the latest closed year that has
  both shifts and a full-year figure. Shift data is annual, so every campaign uses the same ratio. Shown as "≈".
- **When it shows**: the plan is for next year from the day C2 closes (the September refresh) until the next
  year's C1 closes. Outside that window the block is hidden.

## Left to the builder

The exact layout and wording, within the README's design rules, and the order of sections on phones.
