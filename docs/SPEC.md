# LoopDay: Spec

**Tiny habits that forgive you: move, read, anything** · #5 of 17 · Wave 1: Daily keepers · Used: Daily · Easy · Revenue potential: Medium · Habits, Health & Learning · Source: ChatGPT + Perplexity (absorbs PageStreak and RunStreak)

## One-liner

Track 3–10 habits with one tap a day. Streaks you can recover, a clean weekly view and simple stats. No social feed, no coaching, no clutter.

## Problem / audience

- **Who it's for:** People who have tried and quit complicated habit apps.
- **The problem it solves:** Most habit apps are overwhelming, and one missed day wipes out a streak along with the motivation.
- **Example:** A user tracks water, walking, reading and no-scroll evenings, misses Tuesday, and uses a freeze to keep their streak.

## MVP features (ship with only these)

1. 3 free habits (up to 10 with premium)
2. One-tap check-off and a weekly view
3. Streaks with 'recovery mode' and earned freezes
4. Reminders
5. Simple completion stats
6. Habit types with their own tracking: reading (pages, books, yearly goal) and moving (walks, run/walk plans)

## Not in MVP

- Widgets and lock-screen shortcuts
- Year heatmap
- Themes

## Monetisation

| Model | Detail |
|---|---|
| Free | 3 habits, with ads |
| Premium | £34.99/year (shown first) or £3.49/month: unlimited habits, stats, widgets, themes, every Arcade game in the app |
| Arcade games | £0.99 each, kept forever, or every game in the app with Premium |
| KC All Access | £25 once (every Arcade game in every KC app, kept forever) plus £7.99/month or £79.99/year (Premium in every KC app). Needs a free KC account. |
| Ads | Banner on the stats screen only |

Prices are starting points; test before committing. **Portfolio premium promise:** free has ads; the moment you pay you get no ads, cloud backup and storage, and sync across your devices, plus this app's extras.

## Retention: The Progression Loop

| Stage | Design |
|---|---|
| Cue | Daily reminder at a time the user picks |
| Tiny win | One tap per habit |
| Progress | Streaks, freezes, heatmap |
| Share | Streak milestone cards |
| Next step | At 30 days, suggest adding or levelling up a habit |
| Cadence | Daily |

Follow the portfolio guardrails: no guilt-trip notifications, no fake urgency, progress is
never wiped, at most one notification a day by default.

## Animation and tone: five signature animations

**Playful.** Celebrations, confetti, cute characters, satisfying sounds and mild comic reactions. Nothing tragic.

- Check-off: the tick pops and the streak flame grows
- Missed day with a freeze: an ice cube drops over the flame
- Skipped reading: the page rips in half, then gets taped back
- 7 days: the flame puts on sunglasses
- 30 days: the flame turns into a tiny dragon that sneezes confetti

**Line we don't cross:** Never sad or guilt-tripping about a broken streak.

## AI

**None.** Not needed. Plain code does everything this app does. (Portfolio rule: plain code first, code does the maths,
cheapest model, shared budget cap, premium-gated.)

## Platform & data

- **Platform:** Expo app.
- **Data:** On the device only.
- **Backend:** None for the free version: everything lives on the phone. Premium backup and sync use the shared portfolio backend (see the master repo's HOSTING.md).
- **Stack:** shared portfolio foundation (Expo, PostHog, RevenueCat, AdMob, shared Progression Loop module).

## Growth engine

- **Content pillars:** Tiny habits; Streak psychology; Routine ideas
- **Shareable output:** Streak milestone cards

## Risks

Extremely crowded. It has to be noticeably simpler and kinder than the competition.

## Launch checklist

- [ ] Name checked on the App Store, Play Store and a trademark search
- [ ] MVP features done and tested
- [ ] Progression Loop wired (cue, tiny win, progress, milestone, next step)
- [ ] Privacy policy and terms
- [ ] Landing page
- [ ] Analytics wired (D1/D7/D30 retention)
- [ ] Payments / ads wired
- [ ] Added to the Growth & Maintenance Engine as an app config
