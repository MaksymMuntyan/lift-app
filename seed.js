// ═══════════════════════════════════════════════════════════
//  LIFT — Seed Data
//
//  HOW IT WORKS:
//  - On first load (empty app), Max's data auto-installs for User 1
//  - To re-import after changes: right-click page → Inspect →
//    Console tab, then type:
//      SEED.install(1)   ← for Max
//      SEED.install(2)   ← for Laura
//    then reload the page
//  - To wipe all data: SEED.wipe(1) or SEED.wipe(2)
// ═══════════════════════════════════════════════════════════

const SEED = {

  // ── EXERCISES ─────────────────────────────────────────
  // bodyweight: true  →  weight defaults to 0, no weight selector shown
  exercises: [
    { name: 'Barbell Shrug',                 category: 'Upper Back'      },
    { name: 'Bench Press',                   category: 'Chest'           },
    { name: 'Cable Crunch',                  category: 'Abs'             },
    { name: 'Cable Forearm Curl',            category: 'Forearms'        },
    { name: 'Cable Row',                     category: 'Back'            },
    { name: 'Deadlift',                      category: 'Posterior Chain' },
    { name: 'Dip',                           category: 'Chest',          bodyweight: true },
    { name: 'Dumbbell Curl',                 category: 'Biceps'          },
    { name: 'Dumbbell Incline Press',        category: 'Chest'           },
    { name: 'Dumbbell Row',                  category: 'Back'            },
    { name: 'Dumbbell Split Squat',          category: 'Quads'           },
    { name: 'Dumbbell Wrist Curl',           category: 'Forearms'        },
    { name: 'Hip Thrust',                    category: 'Posterior Chain' },
    { name: 'Incline Dumbbell Curl',         category: 'Biceps'          },
    { name: 'Incline Push-Up',               category: 'Chest',          bodyweight: true },
    { name: 'Overhead Tricep Extension',     category: 'Triceps'         },
    { name: 'Pistol Squat',                  category: 'Quads',          bodyweight: true },
    { name: 'Preacher Hammer Curl',          category: 'Biceps'          },
    { name: 'Pull-Up',                       category: 'Back',           bodyweight: true },
    { name: 'RDL',                           category: 'Posterior Chain' },
    { name: 'Ring Dip',                      category: 'Chest'           },
    { name: 'Ring Fly',                      category: 'Chest'           },
    { name: 'Single Cable Forearm Curl',     category: 'Forearms'        },
    { name: 'Squat',                         category: 'Quads'           },
    { name: 'Top Bar Deep Shoulder Push-Up', category: 'Shoulders',      bodyweight: true },
    { name: 'Tricep Pushdown',               category: 'Triceps'         },
    { name: 'Weighted Body Row',             category: 'Back'            },
    { name: 'Weighted Dip',                  category: 'Chest'           },
    { name: 'Weighted Pistol Squat',         category: 'Quads'           },
    { name: 'Weighted Pull-Up',              category: 'Back'            },
    { name: 'Wide Towel Pull-Up',            category: 'Forearms',       bodyweight: true },
  ],

  // ── ROUTINES ───────────────────────────────────────────
  routines: [

    // ── MACKY 3x Full Body ────────────────────────────────
    {
      name: 'Macky 3x Full Body',
      days: [
        {
          name: 'Day A (Push)',
          slots: [
            { exercises: ['Weighted Dip', 'Bench Press'],                                      sets: 3, repMin: 6,  repMax: 8  },
            { exercises: ['Pull-Up'],                                                           sets: 3, repMin: 10, repMax: 20 },
            { exercises: ['Ring Fly', 'Dumbbell Incline Press'],                               sets: 3, repMin: 10, repMax: 12 },
            { exercises: ['Squat'],                                                             sets: 3, repMin: 3,  repMax: 5  },
            { exercises: ['Tricep Pushdown', 'Overhead Tricep Extension'],                     sets: 3, repMin: 10, repMax: 15 },
            { exercises: ['Preacher Hammer Curl', 'Wide Towel Pull-Up', 'Cable Forearm Curl'], sets: 3, repMin: 8,  repMax: 15 },
          ]
        },
        {
          name: 'Day B (Pull)',
          slots: [
            { exercises: ['Deadlift'],                                                          sets: 2, repMin: 3,  repMax: 5  },
            { exercises: ['Weighted Pull-Up'],                                                  sets: 3, repMin: 5,  repMax: 8  },
            { exercises: ['Dumbbell Incline Press', 'Top Bar Deep Shoulder Push-Up', 'Dip'],   sets: 3, repMin: 8,  repMax: 12 },
            { exercises: ['Cable Crunch'],                                                      sets: 3, repMin: 8,  repMax: 12 },
            { exercises: ['Dumbbell Curl', 'Incline Dumbbell Curl'],                           sets: 3, repMin: 10, repMax: 12 },
            { exercises: ['Preacher Hammer Curl', 'Wide Towel Pull-Up', 'Cable Forearm Curl'], sets: 3, repMin: 10, repMax: 15 },
          ]
        },
      ]
    },

    // ── MACKY 4x Upper Lower ──────────────────────────────
    {
      name: 'Macky 4x Upper Lower',
      days: [
        {
          name: 'Day A (Upper 1)',
          slots: [
            { exercises: ['Bench Press'],                                                       sets: 3, repMin: 3,  repMax: 5  },
            { exercises: ['Pull-Up'],                                                           sets: 3, repMin: 10, repMax: 20 },
            { exercises: ['Ring Fly', 'Dumbbell Incline Press'],                               sets: 3, repMin: 10, repMax: 12 },
            { exercises: ['Dumbbell Curl'],                                                     sets: 3, repMin: 10, repMax: 12 },
            { exercises: ['Tricep Pushdown'],                                                   sets: 3, repMin: 10, repMax: 15 },
          ]
        },
        {
          name: 'Day B (Lower 1)',
          slots: [
            { exercises: ['Deadlift'],                                                          sets: 2, repMin: 3,  repMax: 5  },
            { exercises: ['Dumbbell Split Squat', 'Weighted Pistol Squat', 'Pistol Squat'],    sets: 3, repMin: 8,  repMax: 12 },
            { exercises: ['Cable Crunch'],                                                      sets: 3, repMin: 8,  repMax: 12 },
            { exercises: ['Preacher Hammer Curl', 'Wide Towel Pull-Up', 'Cable Forearm Curl'], sets: 3, repMin: 10, repMax: 15 },
            { exercises: ['Preacher Hammer Curl', 'Wide Towel Pull-Up', 'Cable Forearm Curl'], sets: 3, repMin: 10, repMax: 15 },
          ]
        },
        {
          name: 'Day C (Upper 2)',
          slots: [
            { exercises: ['Weighted Pull-Up'],                                                  sets: 3, repMin: 5,  repMax: 8  },
            { exercises: ['Weighted Dip'],                                                      sets: 3, repMin: 5,  repMax: 8  },
            { exercises: ['Weighted Body Row', 'Cable Row', 'Dumbbell Row'],                   sets: 3, repMin: 8,  repMax: 12 },
            { exercises: ['Overhead Tricep Extension'],                                         sets: 3, repMin: 10, repMax: 12 },
            { exercises: ['Incline Dumbbell Curl'],                                             sets: 3, repMin: 10, repMax: 12 },
          ]
        },
        {
          name: 'Day D (Lower 2)',
          slots: [
            { exercises: ['Squat'],                                                             sets: 3, repMin: 3,  repMax: 5  },
            { exercises: ['RDL'],                                                               sets: 3, repMin: 10, repMax: 12 },
            { exercises: ['Barbell Shrug'],                                                     sets: 3, repMin: 10, repMax: 12 },
            { exercises: ['Cable Crunch'],                                                      sets: 3, repMin: 8,  repMax: 12 },
            { exercises: ['Preacher Hammer Curl', 'Wide Towel Pull-Up', 'Cable Forearm Curl'], sets: 3, repMin: 10, repMax: 15 },
          ]
        },
      ]
    },

    // ── LAURA 3x Full Body ────────────────────────────────
    {
      name: 'Laura 3x Full Body',
      days: [
        {
          name: 'Day A (Push)',
          slots: [
            { exercises: ['Squat'],                                                             sets: 3, repMin: 3,  repMax: 5  },
            { exercises: ['Ring Dip'],                                                          sets: 3, repMin: 8,  repMax: 15 },
            { exercises: ['Weighted Body Row', 'Cable Row', 'Pull-Up'],                        sets: 3, repMin: 5,  repMax: 15 },
            { exercises: ['Hip Thrust', 'RDL'],                                                sets: 3, repMin: 10, repMax: 12 },
            { exercises: ['Cable Crunch'],                                                      sets: 3, repMin: 10, repMax: 12 },
          ]
        },
        {
          name: 'Day B (Pull)',
          slots: [
            { exercises: ['Deadlift'],                                                          sets: 2, repMin: 3,  repMax: 5  },
            { exercises: ['Weighted Pull-Up'],                                                  sets: 3, repMin: 6,  repMax: 8  },
            { exercises: ['Incline Push-Up'],                                                   sets: 3, repMin: 8,  repMax: 15 },
            { exercises: ['Dumbbell Split Squat', 'Pistol Squat'],                             sets: 3, repMin: 10, repMax: 12 },
            { exercises: ['Cable Crunch'],                                                      sets: 3, repMin: 10, repMax: 12 },
          ]
        },
      ]
    },

  ],

  // ── MAX'S SESSION HISTORY (User 1 only) ───────────────
  maxSessions: [
    {
      date: '2026-02-27', routine: 'Macky 4x Upper Lower', day: 'Day C (Upper 2)', bodyweight: 156.8,
      sets: [
        { exercise: 'Weighted Pull-Up', weight: 45, reps: 6 },
        { exercise: 'Weighted Pull-Up', weight: 65, reps: 6 },
        { exercise: 'Weighted Pull-Up', weight: 65, reps: 6 },
        { exercise: 'Dip', weight: 0, reps: 20 },
        { exercise: 'Dip', weight: 0, reps: 20 },
        { exercise: 'Dip', weight: 0, reps: 20 },
      ]
    },
    {
      date: '2026-03-02', routine: 'Macky 4x Upper Lower', day: 'Day A (Upper 1)', bodyweight: 156,
      sets: [
        { exercise: 'Weighted Dip', weight: 70, reps: 6 },
        { exercise: 'Weighted Dip', weight: 80, reps: 4 },
        { exercise: 'Weighted Dip', weight: 80, reps: 2 },
        { exercise: 'Ring Fly', weight: 0, reps: 10 },
        { exercise: 'Ring Fly', weight: 0, reps: 10 },
        { exercise: 'Ring Fly', weight: 0, reps: 8 },
        { exercise: 'Pull-Up', weight: 0, reps: 13 },
        { exercise: 'Pull-Up', weight: 0, reps: 13 },
        { exercise: 'Pull-Up', weight: 0, reps: 13 },
        { exercise: 'Squat', weight: 135, reps: 5 },
        { exercise: 'Squat', weight: 165, reps: 5 },
        { exercise: 'Squat', weight: 165, reps: 6 },
        { exercise: 'Tricep Pushdown', weight: 60, reps: 20 },
        { exercise: 'Tricep Pushdown', weight: 70, reps: 15 },
        { exercise: 'Tricep Pushdown', weight: 70, reps: 15 },
        { exercise: 'Cable Forearm Curl', weight: 70, reps: 15 },
        { exercise: 'Cable Forearm Curl', weight: 95, reps: 20 },
        { exercise: 'Cable Forearm Curl', weight: 95, reps: 18 },
      ]
    },
    {
      date: '2026-03-04', routine: 'Macky 4x Upper Lower', day: 'Day B (Lower 1)', bodyweight: 156,
      sets: [
        { exercise: 'Deadlift', weight: 135, reps: 5 },
        { exercise: 'Deadlift', weight: 225, reps: 5 },
        { exercise: 'Deadlift', weight: 255, reps: 3 },
        { exercise: 'Weighted Pull-Up', weight: 65, reps: 5 },
        { exercise: 'Weighted Pull-Up', weight: 65, reps: 4 },
        { exercise: 'Weighted Pull-Up', weight: 65, reps: 3 },
        { exercise: 'Top Bar Deep Shoulder Push-Up', weight: 0, reps: 12 },
        { exercise: 'Top Bar Deep Shoulder Push-Up', weight: 0, reps: 10 },
        { exercise: 'Top Bar Deep Shoulder Push-Up', weight: 0, reps: 8 },
        { exercise: 'Cable Crunch', weight: 140, reps: 8 },
        { exercise: 'Cable Crunch', weight: 120, reps: 25 },
        { exercise: 'Cable Crunch', weight: 120, reps: 25 },
        { exercise: 'Dumbbell Curl', weight: 32, reps: 10 },
        { exercise: 'Dumbbell Curl', weight: 32, reps: 11 },
        { exercise: 'Dumbbell Curl', weight: 32, reps: 10 },
      ]
    },
    {
      date: '2026-03-06', routine: 'Macky 4x Upper Lower', day: 'Day A (Upper 1)', bodyweight: 159.2,
      sets: [
        { exercise: 'Bench Press', weight: 155, reps: 5 },
        { exercise: 'Bench Press', weight: 165, reps: 4 },
        { exercise: 'Bench Press', weight: 165, reps: 3 },
        { exercise: 'Bench Press', weight: 155, reps: 4 },
        { exercise: 'Pull-Up', weight: 0, reps: 13 },
        { exercise: 'Pull-Up', weight: 0, reps: 13 },
        { exercise: 'Pull-Up', weight: 0, reps: 12 },
        { exercise: 'Dumbbell Incline Press', weight: 53, reps: 9 },
        { exercise: 'Dumbbell Incline Press', weight: 53, reps: 7 },
        { exercise: 'Dumbbell Incline Press', weight: 53, reps: 5 },
        { exercise: 'Tricep Pushdown', weight: 70, reps: 20 },
        { exercise: 'Tricep Pushdown', weight: 80, reps: 15 },
        { exercise: 'Tricep Pushdown', weight: 80, reps: 20 },
        { exercise: 'Incline Dumbbell Curl', weight: 25, reps: 9 },
        { exercise: 'Incline Dumbbell Curl', weight: 25, reps: 7 },
        { exercise: 'Incline Dumbbell Curl', weight: 25, reps: 6 },
      ]
    },
    {
      date: '2026-03-07', routine: 'Macky 4x Upper Lower', day: 'Day D (Lower 2)', bodyweight: 157,
      sets: [
        { exercise: 'Squat', weight: 175, reps: 5 },
        { exercise: 'Squat', weight: 175, reps: 5 },
        { exercise: 'Squat', weight: 175, reps: 5 },
        { exercise: 'RDL', weight: 135, reps: 12 },
        { exercise: 'RDL', weight: 155, reps: 10 },
        { exercise: 'RDL', weight: 155, reps: 8 },
        { exercise: 'Barbell Shrug', weight: 155, reps: 20 },
        { exercise: 'Barbell Shrug', weight: 185, reps: 8 },
        { exercise: 'Barbell Shrug', weight: 185, reps: 10 },
        { exercise: 'Dumbbell Wrist Curl', weight: 32, reps: 10 },
        { exercise: 'Wide Towel Pull-Up', weight: 0, reps: 6 },
        { exercise: 'Dumbbell Wrist Curl', weight: 32, reps: 12 },
        { exercise: 'Wide Towel Pull-Up', weight: 0, reps: 8 },
        { exercise: 'Dumbbell Wrist Curl', weight: 25, reps: 15 },
        { exercise: 'Wide Towel Pull-Up', weight: 0, reps: 6 },
      ]
    },
    {
      date: '2026-03-09', routine: 'Macky 4x Upper Lower', day: 'Day A (Upper 1)', bodyweight: 157,
      sets: [
        { exercise: 'Bench Press', weight: 165, reps: 5 },
        { exercise: 'Bench Press', weight: 165, reps: 5 },
        { exercise: 'Bench Press', weight: 165, reps: 5 },
        { exercise: 'Pull-Up', weight: 0, reps: 13 },
        { exercise: 'Pull-Up', weight: 0, reps: 13 },
        { exercise: 'Pull-Up', weight: 0, reps: 13 },
        { exercise: 'Ring Fly', weight: 0, reps: 10 },
        { exercise: 'Ring Fly', weight: 0, reps: 9 },
        { exercise: 'Ring Fly', weight: 0, reps: 5 },
        { exercise: 'Dumbbell Curl', weight: 32, reps: 12 },
        { exercise: 'Dumbbell Curl', weight: 32, reps: 9 },
        { exercise: 'Dumbbell Curl', weight: 32, reps: 10 },
        { exercise: 'Tricep Pushdown', weight: 90, reps: 20 },
        { exercise: 'Tricep Pushdown', weight: 90, reps: 20 },
        { exercise: 'Tricep Pushdown', weight: 90, reps: 20 },
      ]
    },
    {
      date: '2026-03-11', routine: 'Macky 4x Upper Lower', day: 'Day B (Lower 1)', bodyweight: 155,
      sets: [
        { exercise: 'Deadlift', weight: 225, reps: 3 },
        { exercise: 'Deadlift', weight: 225, reps: 2 },
        { exercise: 'Dumbbell Split Squat', weight: 32, reps: 7 },
        { exercise: 'Dumbbell Split Squat', weight: 25, reps: 10 },
        { exercise: 'Dumbbell Split Squat', weight: 25, reps: 10 },
        { exercise: 'Cable Crunch', weight: 135, reps: 8 },
        { exercise: 'Cable Crunch', weight: 135, reps: 9 },
        { exercise: 'Cable Crunch', weight: 135, reps: 12 },
        { exercise: 'Dumbbell Wrist Curl', weight: 32, reps: 15 },
        { exercise: 'Wide Towel Pull-Up', weight: 0, reps: 10 },
        { exercise: 'Dumbbell Wrist Curl', weight: 32, reps: 15 },
        { exercise: 'Wide Towel Pull-Up', weight: 0, reps: 8 },
        { exercise: 'Dumbbell Wrist Curl', weight: 32, reps: 15 },
        { exercise: 'Wide Towel Pull-Up', weight: 0, reps: 9 },
      ]
    },
    {
      date: '2026-03-13', routine: 'Macky 4x Upper Lower', day: 'Day C (Upper 2)', bodyweight: 155,
      sets: [
        { exercise: 'Weighted Pull-Up', weight: 65, reps: 6 },
        { exercise: 'Weighted Pull-Up', weight: 65, reps: 6 },
        { exercise: 'Weighted Pull-Up', weight: 65, reps: 5 },
        { exercise: 'Weighted Dip', weight: 80, reps: 5 },
        { exercise: 'Weighted Dip', weight: 80, reps: 4 },
        { exercise: 'Weighted Dip', weight: 80, reps: 3 },
        { exercise: 'Weighted Body Row', weight: 24.2, reps: 12 },
        { exercise: 'Weighted Body Row', weight: 24.2, reps: 12 },
        { exercise: 'Weighted Body Row', weight: 24.2, reps: 12 },
        { exercise: 'Tricep Pushdown', weight: 100, reps: 20 },
        { exercise: 'Tricep Pushdown', weight: 110, reps: 15 },
        { exercise: 'Tricep Pushdown', weight: 110, reps: 10 },
        { exercise: 'Incline Dumbbell Curl', weight: 25, reps: 10 },
        { exercise: 'Incline Dumbbell Curl', weight: 25, reps: 8 },
        { exercise: 'Incline Dumbbell Curl', weight: 25, reps: 8 },
      ]
    },
    {
      date: '2026-03-14', routine: 'Macky 4x Upper Lower', day: 'Day D (Lower 2)', bodyweight: 155,
      sets: [
        { exercise: 'Squat', weight: 175, reps: 5 },
        { exercise: 'Squat', weight: 185, reps: 5 },
        { exercise: 'Squat', weight: 185, reps: 5 },
        { exercise: 'RDL', weight: 165, reps: 10 },
        { exercise: 'RDL', weight: 165, reps: 8 },
        { exercise: 'RDL', weight: 165, reps: 7 },
        { exercise: 'Barbell Shrug', weight: 195, reps: 12 },
        { exercise: 'Barbell Shrug', weight: 205, reps: 12 },
        { exercise: 'Barbell Shrug', weight: 205, reps: 12 },
        { exercise: 'Preacher Hammer Curl', weight: 25, reps: 12 },
        { exercise: 'Preacher Hammer Curl', weight: 25, reps: 12 },
        { exercise: 'Preacher Hammer Curl', weight: 25, reps: 12 },
        { exercise: 'Single Cable Forearm Curl', weight: 70, reps: 10 },
        { exercise: 'Single Cable Forearm Curl', weight: 70, reps: 12 },
        { exercise: 'Single Cable Forearm Curl', weight: 70, reps: 12 },
      ]
    },
    {
      date: '2026-03-16', routine: 'Macky 4x Upper Lower', day: 'Day A (Upper 1)', bodyweight: 155.6,
      sets: [
        { exercise: 'Bench Press', weight: 170, reps: 5 },
        { exercise: 'Bench Press', weight: 170, reps: 3 },
        { exercise: 'Bench Press', weight: 170, reps: 3 },
        { exercise: 'Pull-Up', weight: 0, reps: 13 },
        { exercise: 'Pull-Up', weight: 0, reps: 13 },
        { exercise: 'Pull-Up', weight: 0, reps: 13 },
        { exercise: 'Dumbbell Incline Press', weight: 53, reps: 11 },
        { exercise: 'Dumbbell Incline Press', weight: 53, reps: 7 },
        { exercise: 'Dumbbell Incline Press', weight: 53, reps: 6 },
        { exercise: 'Dumbbell Curl', weight: 32, reps: 12 },
        { exercise: 'Dumbbell Curl', weight: 32, reps: 10 },
        { exercise: 'Dumbbell Curl', weight: 32, reps: 9 },
        { exercise: 'Tricep Pushdown', weight: 110, reps: 20 },
        { exercise: 'Tricep Pushdown', weight: 110, reps: 16 },
        { exercise: 'Tricep Pushdown', weight: 110, reps: 13 },
      ]
    },
    {
      date: '2026-03-18', routine: 'Macky 4x Upper Lower', day: 'Day B (Lower 1)', bodyweight: 155.6,
      sets: [
        { exercise: 'Deadlift', weight: 225, reps: 3 },
        { exercise: 'Deadlift', weight: 245, reps: 2 },
        { exercise: 'Deadlift', weight: 245, reps: 2 },
        { exercise: 'Dumbbell Split Squat', weight: 25, reps: 12 },
        { exercise: 'Dumbbell Split Squat', weight: 25, reps: 12 },
        { exercise: 'Dumbbell Split Squat', weight: 25, reps: 12 },
        { exercise: 'Cable Crunch', weight: 135, reps: 12 },
        { exercise: 'Cable Crunch', weight: 135, reps: 12 },
        { exercise: 'Cable Crunch', weight: 135, reps: 14 },
        { exercise: 'Preacher Hammer Curl', weight: 25, reps: 15 },
        { exercise: 'Preacher Hammer Curl', weight: 25, reps: 15 },
        { exercise: 'Preacher Hammer Curl', weight: 25, reps: 15 },
        { exercise: 'Single Cable Forearm Curl', weight: 70, reps: 14 },
        { exercise: 'Single Cable Forearm Curl', weight: 70, reps: 14 },
        { exercise: 'Single Cable Forearm Curl', weight: 70, reps: 14 },
      ]
    },
    {
      date: '2026-03-20', routine: 'Macky 4x Upper Lower', day: 'Day C (Upper 2)', bodyweight: 154.6,
      sets: [
        { exercise: 'Weighted Pull-Up', weight: 70, reps: 5 },
        { exercise: 'Weighted Pull-Up', weight: 70, reps: 4 },
        { exercise: 'Weighted Pull-Up', weight: 70, reps: 4 },
        { exercise: 'Weighted Dip', weight: 80, reps: 6 },
        { exercise: 'Weighted Dip', weight: 80, reps: 5 },
        { exercise: 'Weighted Dip', weight: 80, reps: 4 },
        { exercise: 'Weighted Body Row', weight: 24.2, reps: 15 },
        { exercise: 'Weighted Body Row', weight: 24.2, reps: 12 },
        { exercise: 'Weighted Body Row', weight: 24.2, reps: 12 },
        { exercise: 'Overhead Tricep Extension', weight: 80, reps: 8 },
        { exercise: 'Overhead Tricep Extension', weight: 80, reps: 6 },
        { exercise: 'Overhead Tricep Extension', weight: 70, reps: 5 },
        { exercise: 'Incline Dumbbell Curl', weight: 25, reps: 12 },
        { exercise: 'Incline Dumbbell Curl', weight: 25, reps: 8 },
        { exercise: 'Incline Dumbbell Curl', weight: 25, reps: 7 },
      ]
    },
    {
      date: '2026-03-21', routine: 'Macky 4x Upper Lower', day: 'Day D (Lower 2)', bodyweight: 153.4,
      sets: [
        { exercise: 'Squat', weight: 195, reps: 2 },
        { exercise: 'Squat', weight: 185, reps: 5 },
        { exercise: 'Squat', weight: 190, reps: 5 },
        { exercise: 'RDL', weight: 165, reps: 12 },
        { exercise: 'RDL', weight: 165, reps: 12 },
        { exercise: 'RDL', weight: 165, reps: 10 },
        { exercise: 'Barbell Shrug', weight: 215, reps: 12 },
        { exercise: 'Barbell Shrug', weight: 215, reps: 12 },
        { exercise: 'Barbell Shrug', weight: 215, reps: 12 },
        { exercise: 'Cable Crunch', weight: 155, reps: 12 },
        { exercise: 'Cable Crunch', weight: 155, reps: 12 },
        { exercise: 'Cable Crunch', weight: 155, reps: 12 },
        { exercise: 'Preacher Hammer Curl', weight: 32, reps: 7 },
        { exercise: 'Preacher Hammer Curl', weight: 32, reps: 4 },
        { exercise: 'Preacher Hammer Curl', weight: 32, reps: 4 },
      ]
    },
    {
      date: '2026-03-23', routine: 'Macky 4x Upper Lower', day: 'Day A (Upper 1)', bodyweight: 154.4,
      sets: [
        { exercise: 'Bench Press', weight: 175, reps: 4 },
        { exercise: 'Bench Press', weight: 175, reps: 3 },
        { exercise: 'Bench Press', weight: 175, reps: 2 },
        { exercise: 'Pull-Up', weight: 0, reps: 13 },
        { exercise: 'Pull-Up', weight: 0, reps: 13 },
        { exercise: 'Pull-Up', weight: 0, reps: 17 },
        { exercise: 'Dumbbell Incline Press', weight: 53, reps: 12 },
        { exercise: 'Dumbbell Incline Press', weight: 53, reps: 7 },
        { exercise: 'Dumbbell Incline Press', weight: 53, reps: 6 },
        { exercise: 'Dumbbell Curl', weight: 32, reps: 12 },
        { exercise: 'Dumbbell Curl', weight: 32, reps: 11 },
        { exercise: 'Dumbbell Curl', weight: 32, reps: 8 },
        { exercise: 'Tricep Pushdown', weight: 125, reps: 9 },
        { exercise: 'Tricep Pushdown', weight: 125, reps: 9 },
        { exercise: 'Tricep Pushdown', weight: 125, reps: 8 },
      ]
    },
  ],

  // ── LAURA'S SESSION HISTORY (User 2 only) ─────────────
  lauraSessions: [
    // Add Laura's history here when you have it
  ],

  // ── BODYWEIGHT LOGS ────────────────────────────────────
  maxBodyweights: [
    { date: '2026-02-27', weight: 156.8 },
    { date: '2026-03-02', weight: 156   },
    { date: '2026-03-04', weight: 156   },
    { date: '2026-03-06', weight: 159.2 },
    { date: '2026-03-07', weight: 157   },
    { date: '2026-03-09', weight: 157   },
    { date: '2026-03-11', weight: 155   },
    { date: '2026-03-13', weight: 155   },
    { date: '2026-03-14', weight: 155   },
    { date: '2026-03-16', weight: 155.6 },
    { date: '2026-03-18', weight: 155.6 },
    { date: '2026-03-20', weight: 154.6 },
    { date: '2026-03-21', weight: 153.4 },
    { date: '2026-03-23', weight: 154.4 },
  ],

  lauraBodyweights: [
    // Add Laura's bodyweight log here when you have it
  ],


  // ═══════════════════════════════════════════════════════
  //  DO NOT EDIT BELOW THIS LINE
  // ═══════════════════════════════════════════════════════

  install(userNum = 1) {
    const KEY = k => `lift_u${userNum}_${k}`;
    const get = k => { try { const v = localStorage.getItem(KEY(k)); return v ? JSON.parse(v) : null; } catch { return null; } };
    const set = (k, v) => localStorage.setItem(KEY(k), JSON.stringify(v));

    const sessionData    = userNum === 1 ? this.maxSessions    : this.lauraSessions;
    const bodyweightData = userNum === 1 ? this.maxBodyweights : this.lauraBodyweights;
    const userName       = userNum === 1 ? 'Max' : 'Laura';
    console.log(`Installing seed data for ${userName} (User ${userNum})...`);

    // Exercises — include bodyweight flag
    const existingEx = get('exercises') || [];
    const exMap = {};
    existingEx.forEach(e => { exMap[e.name] = e.id; });
    const exercises = [...existingEx];
    this.exercises.forEach(ex => {
      if (!exMap[ex.name]) {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
        exercises.push({ id, name: ex.name, category: ex.category || '', bodyweight: ex.bodyweight || false });
        exMap[ex.name] = id;
      } else {
        // Update existing exercise with bodyweight flag if missing
        const existing = exercises.find(e => e.name === ex.name);
        if (existing && ex.bodyweight) existing.bodyweight = true;
      }
    });
    set('exercises', exercises);
    console.log(`✓ ${exercises.length} exercises`);

    // Routines
    const existingRoutines = get('routines') || [];
    const routineMap = {};
    existingRoutines.forEach(r => { routineMap[r.name] = r.id; });
    const routines = [...existingRoutines];
    this.routines.forEach(r => {
      const rid = routineMap[r.name] || (Date.now().toString(36) + Math.random().toString(36).slice(2,6));
      const days = r.days.map(d => ({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
        name: d.name,
        slots: d.slots.map(slot => ({
          choices: slot.exercises.map(n => exMap[n]).filter(Boolean),
          sets: slot.sets || 3,
          repMin: slot.repMin || null,
          repMax: slot.repMax || null,
        }))
      }));
      if (routineMap[r.name]) {
        const idx = routines.findIndex(x => x.id === rid);
        if (idx >= 0) routines[idx] = { id: rid, name: r.name, days };
      } else {
        routines.push({ id: rid, name: r.name, days });
        routineMap[r.name] = rid;
      }
    });
    set('routines', routines);
    console.log(`✓ ${routines.length} routines`);

    // Sessions
    const existingSessions = get('sessions') || [];
    const existingKeys = new Set(existingSessions.map(s => s.date + s.routineName + s.dayName));
    const sessions = [...existingSessions];
    sessionData.forEach(s => {
      const routine = routines.find(r => r.name === s.routine);
      const day = routine ? (routine.days || []).find(d => d.name === s.day) : null;
      const key = s.date + s.routine + s.day;
      if (existingKeys.has(key)) return;
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
      sessions.push({
        id, date: s.date,
        routineId: routine ? routine.id : '',
        routineName: s.routine,
        dayId: day ? day.id : '',
        dayName: s.day,
        bodyweight: s.bodyweight || null,
        sets: (s.sets || []).map((st, i) => ({
          exerciseId: exMap[st.exercise] || st.exercise,
          exerciseName: st.exercise,
          setNum: i + 1,
          weight: st.weight,
          reps: st.reps,
          bodyweight: s.bodyweight || null,
        }))
      });
      existingKeys.add(key);
    });
    sessions.sort((a, b) => a.date.localeCompare(b.date));
    set('sessions', sessions);
    console.log(`✓ ${sessions.length} sessions`);

    // Bodyweights
    const existingBW = get('bodyweights') || [];
    const bwDates = new Set(existingBW.map(b => b.date));
    const bodyweights = [...existingBW];
    bodyweightData.forEach(b => {
      if (!bwDates.has(b.date)) { bodyweights.push(b); bwDates.add(b.date); }
    });
    bodyweights.sort((a, b) => a.date.localeCompare(b.date));
    set('bodyweights', bodyweights);
    console.log(`✓ ${bodyweights.length} bodyweight entries`);

    console.log(`🏋️ Done! Reload the page.`);
    if (typeof renderAll === 'function') renderAll();
  },

  wipe(userNum = 1) {
    const name = userNum === 1 ? 'Max' : 'Laura';
    if (!confirm(`Wipe ALL data for ${name} (User ${userNum})? This cannot be undone.`)) return;
    const KEY = k => `lift_u${userNum}_${k}`;
    ['exercises','routines','sessions','bodyweights','lastroutine'].forEach(k => localStorage.removeItem(KEY(k)));
    console.log('Data wiped. Reload the page.');
    location.reload();
  }
};

// Auto-install on first load for both users if empty
document.addEventListener('DOMContentLoaded', () => {
  const maxEx = localStorage.getItem('lift_u1_exercises');
  if (!maxEx || JSON.parse(maxEx).length === 0) {
    console.log('No Max data found — auto-installing...');
    SEED.install(1);
  }
  const lauraEx = localStorage.getItem('lift_u2_exercises');
  if (!lauraEx || JSON.parse(lauraEx).length === 0) {
    console.log('No Laura data found — auto-installing...');
    SEED.install(2);
  }
});