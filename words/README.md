# Word garden: flashcards with spaced repetition

- Students: `/words/?c=CODE` (also linked from the "🌱 Word garden" panel on their portal `/my/?c=CODE`).
- Polina: Teacher Desk → open a student → **Words** (sets, strong / learning / not seen, words that don't stick, a Preview link).
- Preview without saving anything: `/words/?preview=SET_ID` (or `?preview=all`). Use this for testing, never a real student's code.

## Adding a set after a lesson

1. Add an object to `window.WORD_SETS` in `assets/words.js`:

   ```js
   {
     id: "denis-sleep",            // unique, never reused or renamed
     title: "Sleep and habits",     // students see this
     for: ["denis"],                // student name slugs: "sasha", "lena", "denis", "vlada", "victoria", "diana"; or "all"
     added: "2026-11-21",
     words: [
       { w: "oversleep", ru: "проспать", def: "sleep longer than you wanted", ex: "I overslept and missed the bus." }
     ]
   }
   ```

   - `w` English word or phrase (front of the card). `ru` Russian translation. `def` short English meaning. `ex` one original example sentence.
   - Progress is stored per `w`, so fixing a typo in `w` later resets that one card. Fixing `ru`, `def` or `ex` is safe.
   - To stop showing a set, remove the student from `for` (progress stays saved).
   - `for` matches the student's name in Teacher Desk (slugged) or the start of their portal code (`sasha` in `sasha-xxxx`). Never put real portal codes in this public repo.
2. Bump `words.js?v=N` in `my/index.html`, `words/index.html` and `teacher/index.html` (GitHub Pages caches for ~10 min).
3. Nothing to do in Teacher Desk: the words appear on the student's portal by themselves.

## How the schedule works (`assets/srs.js`)

- Each card: the student sees the word, recalls the meaning (or makes a sentence), flips, and taps **Not yet** or **I knew it**.
- **Not yet** → level 0, back tomorrow (and once more later in the same session).
- **I knew it** → back after 3 days, then 7, 14, 30, 60, 120 days. Forgetting drops it to level 0 again.
- Up to 20 new words a day per student; the rest wait for the following days.
- "Practise this bed" is extra practice and does not change the schedule.
- "Strong" = remembered at least twice in a row (level ≥ 2).

## Storage

One result row per save with `activity = "me:words"` (like the portal decorations `me:style`), so it never shows up as homework.
`details = { cards: { "setId|word": { b, d, m, r, f, t, last } }, days: [...], ts }`:
`b` level, `d` next due day (YYYY-MM-DD), `m` times forgotten, `r` reviews, `f` first day seen, `t` last review time, `last` 1/0.
The page saves every 8 answers, at the end of a session and when the tab is closed; a copy is kept in localStorage and merged card by card (newest wins).
