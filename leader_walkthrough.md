# Rep Dashboard — Leader Walkthrough

**For:** RSD Events Team leadership (7 of us)
**Status:** Soft launch · v1.0
**Goal of this doc:** Give you enough context to navigate the dashboard, understand the math, and bring sharp feedback to the leadership meeting.

---

## What this is

A single-page dashboard that shows each rep on the events team how their numbers compare year-over-year, where they rank, and where their biggest growth opportunity is. **Updates 3× per year** after each campaign closes. No login, no app — just a URL that loads in any browser.

Think of it less like a report and more like a coaching mirror — the rep opens it, sees themselves vs the team, sees where they're winning, sees the one place that would move their book the most.

---

## How to navigate

**Three top-level tabs:**

1. **Team View** — KPIs, leaderboard, category mix across the team
2. **Rep View** — pick any rep, see their full story (hero stats, pies, summary, buckets, shifts, pacing)
3. **Product Growth** — placeholder for now; will populate when product-mix data is in

**Leaderboard** has two controls:
- **Metric** — what you're ranking by (Total CPO, per-bucket CPO, shift productivity, per-bucket avg order, etc.)
- **Sort** — *By value* (largest absolute number) or *By biggest growth* (biggest C1-over-C1 % change). The growth sort surfaces the climbers — not the same people as the value-sort top 10.

---

## The math behind what you're seeing

### Bucket taxonomy (7 buckets)

Two prominent cards on top: **Total Event CPO** and **Non-Event CPO** (SC's / Marketing). The 6 sub-categories below add up to Total Event CPO:

- Event (Traditional)
- Service Event
- Industry Event
- Realtor
- Mall
- Federal

Non-Event CPO is **derived** as Total Sales − Total Event Sales for each campaign. It captures everything outside the booth: service calls, marketing, in-home customers, etc.

### Team averages

> Team averages use the **full 269-rep RSD division stats universe**, not just the 21-rep Master List events team.

Why: comparing only against active eventers would inflate the averages (we're all already strong relative to the broader division). Using the full universe gives more honest context. The leaderboard *display*, by contrast, only shows the 21 Master List reps — you won't see in-home-only reps in the rankings.

### Pacing multiplier

Each rep's projected 2026 = their C1 2026 Total Sales × a personalized multiplier. The multiplier is **1 / (their historical C1 share of full year)**.

Empirically: team-wide C1 represents **31.9% of the full year** (based on 2024 + 2025) — meaning fall (C2+C3) is slightly heavier than spring. Team-average multiplier: **×3.14**.

**Per-rep multiplier logic:**
- Need 2 years of complete C1+FY history → use personal multiplier
- Less than 2 years → fall back to team average (×3.14)
- Multiplier capped to range **×2.0 to ×4.5** — prevents extreme projections from noisy data or unusual seasonality (Sarah Krick's history said ×6.58; that's not realistic for her DM role this year)

The basis label on the pacing strip tells you exactly which path was used for each rep.

### Opportunity engine

The "Biggest Area of Opportunity" callout in the Performance Summary evaluates four types of improvement per rep:

1. **Lift avg order in [bucket]** — only buckets where rep has 16+ orders (avoid 1-order outliers)
2. **Increase orders per shift** — booth efficiency angle
3. **Lift combined shift average** — overall productivity (combines #1 + #2)
4. **Grow Non-Event sales** — peer gap in what they do outside events

For each, uplift = **Gap × Volume** = the dollar impact if they matched Master List peer average.

**Then a filter:** the opportunity must be at least **5% of their current C1 book** (or $2K minimum, whichever is bigger). This prevents "$2K uplift on a $320K book" from being surfaced as the "biggest" opportunity — that's a rounding error, not a needle mover.

**Top performers correctly get no opportunity callout** (Adam Conroy, Matt Foss, etc.) — the system doesn't manufacture one if nothing crosses the meaningful threshold. That's an honest signal that they're at peer level everywhere.

---

## Known em-dash situations (so you're not surprised)

When something renders as `—` instead of a number, it's intentional. There are 4 cases:

| Rep(s) | What's em-dash | Why |
|---|---|---|
| **Jeremy Katen, Rob Lord, Roman Earhart** | Non-Event CPO bucket, all years | Their individual Total Sales reports are pending. Will populate when those reports arrive (timed with product growth data). |
| **Sarah Krick** | 2026 Shifts breakdown | She's a District Manager now — no booth shifts in 2026 by design. |
| **Kendall Gooch** | All 2024 + 2025 data | New rep, only became active in 2026. |
| **Matthew Aragon** | 2024 C1 data | Contract date 2024-06-14 — wasn't a rep yet during C1 2024. |

In all cases, em-dash means "no data captured," NOT "$0." (Zero would imply effort with no result; em-dash signals the metric isn't applicable or available yet.)

---

## What's still coming (v1.1)

- **Product Growth tab** — Ultimate Sets, Signature Sets, Homemaker Sets, Ultimate Blocks, Signature Blocks, Flatware, Cookware, Galley+6, Business Gift cross-channel, Realtor cross-channel. Three years of annual data per rep. Growth-first framing.
- **Service-Call-per-Event metric** — annual attribution % showing how much of each rep's book comes from event-generated service calls
- **Jeremy / Rob / Roman Non-Event** — fills in once their individual Total Sales arrive (timed with product data)

---

## Feedback I'd love at the next meeting

For each leader, having looked at the dashboard for a week or so before we meet, come prepared with:

1. **Does your own Performance Summary feel accurate?** Strengths, watches, and especially the opportunity callout — does it land?
2. **Does your pacing projection look like where you'll actually land?** If you're already mid-year and the projection feels way off, flag it.
3. **Anything you'd ignore on the dashboard?** If something doesn't earn its space, I'd rather cut it than ship dead pixels.
4. **Anything missing you keep wanting?** What did you wish you could see that's not there?
5. **Numbers that look wrong.** If a bucket figure or pacing multiplier feels off vs your memory, flag it — could be a data quirk we should patch.

Bring screenshots when useful. The goal of the leadership round is to debug v1 against real-world use before we widen to the rest of the team.

---

## Disclaimers

- This is **mid-campaign data** for 2026, full-year for 2024/2025. Some bucket comparisons mix scopes — labeled where it matters.
- **Numbers can move** as you submit campaigns through the year. The dashboard refreshes from a single source file (data.js) that gets re-run with each campaign close.
- **Privacy is intentionally zero** — everyone on the team sees everyone's numbers. This matches how we already operate; if anyone has concerns, surface them.

---

*Drafted ahead of leadership meeting · soft-launch v1.0*
