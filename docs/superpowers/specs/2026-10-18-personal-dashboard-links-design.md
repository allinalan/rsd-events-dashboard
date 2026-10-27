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

## Round two: the 10-second page (same day)

Alan, after looking again as a rep: "in the first 10 seconds that they see it and they look away, they remember what
they see ... a confused mind never looks at it." Before: 11 sections open at once, about 8 phone screens and 870
words, six period buttons above the rep's name, the big number below three badges, and for a rep near the bottom
"−69% below" as the first thing in color. He took every default:

1. The first screen: name, one number, one line against this time last year, one plain sentence, and three facts:
   Team rank · On pace for · Best campaign ever.
2. Rank stays on it.
3. Cut from it: the Team Avg and vs Team Avg badges, the office / career line, and the masthead's period line, which
   becomes "Numbers through Aug 31, 2026 · next update Jan 8".
4. Everything else folds under "More about my numbers", closed until tapped, with the period buttons inside.
5. The campaign grid offers Total CPO, Event CPO and Orders (Avg order and Events left; they live in More).
6. Plain numbers wherever a rep looks first: whole percents, "vs this time last year", no multipliers or footnotes.
7. The team page's Rep View has the same layout, with More open.

After: about 3 phone screens and 345 words; the big number sits about 200px from the top of a phone.
`docs/screenshots/2026-10-18-rep-first-screen-before-after.png` shows Charity Campbell and Matt Foss before and after.

## Round three: the plan, shows held steady (2026-10-22)

Alan: "Not a fan of the 2027 plan section ... feels a bit too basic/generic. And I don't want them discouraged if
they try to go after bigger numbers ... we don't want to offer any suggestions ... just shows them what they would
have to sell each campaign to make that happen", then "assume the amount of shows don't change for them btw. so to
increase their sales will have to come outside of the booth." All defaults. This replaces *Plan math* above.

- The goal starts empty. Gone: the pace + 10% prefill, "Use the suggestion", the pace comparison, "My best", shifts.
- My shows, per campaign: the shows and event sales of the last time that campaign was worked.
- Outside the booth = goal − my shows, spread the way the rep's outside sales usually fall (years with all three
  campaigns on file; the team's otherwise), counted in orders at their average outside order across all campaigns
  (the team's under 10 orders; dollars only without order counts).
- Any campaign's total can be changed; the year is then the sum. A goal below the shows: "Your shows cover this goal".
- Saved only in the browser. The smoke check holds the empty start.

`docs/screenshots/2026-10-22-plan-outside-the-booth.png` shows Alan before typing and at $500,000, Kendall at
$100,000 (team outside mix) and Jeremy at $600,000 (dollars only).

Follow-up, 2026-10-27 (Alan: "count this year's finished campaigns too, not only full years"): the outside-the-booth
split now uses each campaign's average over every finished campaign on file, the year in progress included, instead
of only years with all three campaigns. Averages rather than sums, so C3 isn't shortchanged in the fall. Matt Foss at
$1.3M moved from C3-heavy ($457,700 outside in C3) to C2-heavy ($289,900 in C2, $251,000 in C3), matching his 2026.
Kendall Gooch now gets her own split instead of the team's.
