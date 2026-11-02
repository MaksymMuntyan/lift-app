// ═══════════════════════════════════════════════════════════
//  LIFT — Seed Data
//
//  The seed runs ONCE per user on first install, populating
//  the exercise library. After that it never touches data.
//  All exercises (seeded or user-created) are identical —
//  there is no distinction. Users own their exercise list.
//
//  To wipe all data (last resort):
//    SEED.wipe(1) or SEED.wipe(2)
// ═══════════════════════════════════════════════════════════

const SEED = {

  // ── EXERCISE LIBRARY ──────────────────────────────────
  // Flags:
  //   bodyweight: true  → no weight selector, defaults to 0
  //   barbell: true     → plate math per side (45lb bar)
  //   cable: true       → plate math total (no bar)
  exercises: [
    { name: 'Barbell Shrug',                 category: 'Upper Back',      barbell: true    },
    { name: 'Bench Press',                   category: 'Chest',           barbell: true    },
    { name: 'Body Row',                      category: 'Back',            bodyweight: true },
    { name: 'Cable Crunch',                  category: 'Abs',             cable: true      },
    { name: 'Cable Forearm Curl',            category: 'Forearms',        cable: true      },
    { name: 'Cable Row',                     category: 'Back',            cable: true      },
    { name: 'Deadlift',                      category: 'Posterior Chain', barbell: true    },
    { name: 'Dip',                           category: 'Chest',           bodyweight: true },
    { name: 'Dumbbell Curl',                 category: 'Biceps'                           },
    { name: 'Dumbbell Incline Press',        category: 'Chest'                            },
    { name: 'Dumbbell Row',                  category: 'Back'                             },
    { name: 'Dumbbell Split Squat',          category: 'Quads'                            },
    { name: 'Dumbbell Wrist Curl',           category: 'Forearms'                         },
    { name: 'Hip Thrust',                    category: 'Posterior Chain', barbell: true    },
    { name: 'Incline Dumbbell Curl',         category: 'Biceps'                           },
    { name: 'Incline Push-Up',               category: 'Chest',           bodyweight: true },
    { name: 'Overhead Tricep Extension',     category: 'Triceps',         cable: true      },
    { name: 'Pistol Squat',                  category: 'Quads',           bodyweight: true },
    { name: 'Preacher Hammer Curl',          category: 'Biceps'                           },
    { name: 'Pull-Up',                       category: 'Back',            bodyweight: true },
    { name: 'RDL',                           category: 'Posterior Chain', barbell: true    },
    { name: 'Ring Dip',                      category: 'Chest',           bodyweight: true },
    { name: 'Ring Fly',                      category: 'Chest',           bodyweight: true },
    { name: 'Single Cable Forearm Curl',     category: 'Forearms',        cable: true      },
    { name: 'Squat',                         category: 'Quads',           barbell: true    },
    { name: 'Top Bar Deep Shoulder Push-Up', category: 'Shoulders',       bodyweight: true },
    { name: 'Tricep Pushdown',               category: 'Triceps',         cable: true      },
    { name: 'Weighted Body Row',             category: 'Back'                             },
    { name: 'Weighted Dip',                  category: 'Chest'                            },
    { name: 'Weighted Pistol Squat',         category: 'Quads'                            },
    { name: 'Weighted Pull-Up',              category: 'Back'                             },
    { name: 'Wide Towel Pull-Up',            category: 'Forearms',        bodyweight: true },
  ],

  // ── SEED ONCE ─────────────────────────────────────────
  // Runs only on first install (checks lift_seeded_v1 flag).
  // After that, never touches exercises again — users own
  // their library completely.
  seedOnce(userNum = 1) {
    const flagKey = `lift_u${userNum}_seeded_v1`;
    if (localStorage.getItem(flagKey)) return; // already seeded

    const KEY = k => `lift_u${userNum}_${k}`;
    const get = k => { try { const v = localStorage.getItem(KEY(k)); return v ? JSON.parse(v) : null; } catch { return null; } };
    const set = (k, v) => localStorage.setItem(KEY(k), JSON.stringify(v));

    // Only seed if exercise list is empty — never overwrite existing data
    const existing = get('exercises') || [];
    if (existing.length > 0) {
      // User already has exercises (e.g. restored from backup) — just mark as seeded
      localStorage.setItem(flagKey, '1');
      return;
    }

    const seeded = this.exercises.map(ex => ({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
      name: ex.name,
      category: ex.category || '',
      bodyweight: ex.bodyweight || false,
      barbell: ex.barbell || false,
      cable: ex.cable || false
    }));

    set('exercises', seeded);
    localStorage.setItem(flagKey, '1');
    const name = userNum === 1 ? 'Max' : 'Laura';
    console.log(`✓ Seeded ${seeded.length} exercises for ${name}`);
  },

  // ── RUNNING PLANS ─────────────────────────────────────
  // Hardcoded marathon plans per user (1 = Max, 2 = Laura).
  // Each entry: { date: 'YYYY-MM-DD', distance: miles, notes: '...' }
  runPlans: {
    1: [ // Max — marathon Mar 6, 2027
      { date: '2026-10-26', distance: 3   , notes: 'Easy' },
      { date: '2026-10-28', distance: 6   , notes: 'Long run' },
      { date: '2026-10-31', distance: 3   , notes: 'Easy' },
      { date: '2026-11-01', distance: 4   , notes: 'Easy' },
      { date: '2026-11-02', distance: 3   , notes: 'Easy' },
      { date: '2026-11-04', distance: 7   , notes: 'Long run' },
      { date: '2026-11-07', distance: 3   , notes: 'Easy + strides' },
      { date: '2026-11-08', distance: 4   , notes: 'Easy' },
      { date: '2026-11-09', distance: 4   , notes: 'Easy' },
      { date: '2026-11-11', distance: 8   , notes: 'Long run' },
      { date: '2026-11-14', distance: 4   , notes: 'Easy' },
      { date: '2026-11-15', distance: 5   , notes: 'Easy' },
      { date: '2026-11-16', distance: 3   , notes: 'Easy (recovery week)' },
      { date: '2026-11-18', distance: 6   , notes: 'Long run (recovery week)' },
      { date: '2026-11-21', distance: 4   , notes: 'Easy + strides (recovery week)' },
      { date: '2026-11-22', distance: 4   , notes: 'Easy (recovery week)' },
      { date: '2026-11-23', distance: 4   , notes: 'Easy' },
      { date: '2026-11-25', distance: 9   , notes: 'Long run' },
      { date: '2026-11-28', distance: 5   , notes: '10 min tempo' },
      { date: '2026-11-29', distance: 5   , notes: 'Easy' },
      { date: '2026-11-30', distance: 4   , notes: 'Easy' },
      { date: '2026-12-02', distance: 10  , notes: 'Long run' },
      { date: '2026-12-05', distance: 5   , notes: '15 min tempo' },
      { date: '2026-12-06', distance: 5   , notes: 'Easy' },
      { date: '2026-12-07', distance: 4   , notes: 'Easy (recovery week)' },
      { date: '2026-12-09', distance: 8   , notes: 'Long run (recovery week)' },
      { date: '2026-12-12', distance: 4   , notes: 'Easy + strides (recovery week)' },
      { date: '2026-12-13', distance: 5   , notes: 'Easy (recovery week)' },
      { date: '2026-12-14', distance: 4   , notes: 'Easy' },
      { date: '2026-12-16', distance: 11  , notes: 'Long run' },
      { date: '2026-12-19', distance: 5   , notes: '20 min tempo' },
      { date: '2026-12-20', distance: 5   , notes: 'Easy' },
      { date: '2026-12-21', distance: 4   , notes: 'Easy' },
      { date: '2026-12-23', distance: 12  , notes: 'Long run' },
      { date: '2026-12-26', distance: 5   , notes: 'Easy' },
      { date: '2026-12-27', distance: 6   , notes: 'Easy' },
      { date: '2026-12-28', distance: 4   , notes: 'Easy (recovery week)' },
      { date: '2026-12-30', distance: 9   , notes: 'Long run (recovery week)' },
      { date: '2027-01-02', distance: 5   , notes: '20 min tempo (recovery week)' },
      { date: '2027-01-03', distance: 5   , notes: 'Easy (recovery week)' },
      { date: '2027-01-04', distance: 5   , notes: 'Easy' },
      { date: '2027-01-06', distance: 13  , notes: 'Long run' },
      { date: '2027-01-09', distance: 6   , notes: '2 × 10 min tempo' },
      { date: '2027-01-10', distance: 6   , notes: 'Easy' },
      { date: '2027-01-11', distance: 5   , notes: 'Easy' },
      { date: '2027-01-13', distance: 14  , notes: 'Long run' },
      { date: '2027-01-16', distance: 5   , notes: 'Easy + strides' },
      { date: '2027-01-17', distance: 6   , notes: 'Easy' },
      { date: '2027-01-18', distance: 4   , notes: 'Easy (recovery week)' },
      { date: '2027-01-20', distance: 10  , notes: 'Long run (recovery week)' },
      { date: '2027-01-23', distance: 5   , notes: '25 min tempo (recovery week)' },
      { date: '2027-01-24', distance: 5   , notes: 'Easy (recovery week)' },
      { date: '2027-01-25', distance: 5   , notes: 'Easy' },
      { date: '2027-01-27', distance: 16  , notes: 'Long run' },
      { date: '2027-01-30', distance: 6   , notes: '2 × 12 min tempo' },
      { date: '2027-01-31', distance: 6   , notes: 'Easy' },
      { date: '2027-02-01', distance: 5   , notes: 'Easy' },
      { date: '2027-02-03', distance: 18  , notes: 'Long run' },
      { date: '2027-02-06', distance: 5   , notes: 'Easy' },
      { date: '2027-02-07', distance: 7   , notes: 'Easy' },
      { date: '2027-02-08', distance: 5   , notes: 'Easy' },
      { date: '2027-02-10', distance: 20  , notes: 'Long run — PEAK' },
      { date: '2027-02-13', distance: 6   , notes: 'Including 3 mi at marathon pace' },
      { date: '2027-02-14', distance: 7   , notes: 'Easy' },
      { date: '2027-02-15', distance: 4   , notes: 'Easy' },
      { date: '2027-02-17', distance: 14  , notes: 'Long run' },
      { date: '2027-02-20', distance: 5   , notes: 'Easy' },
      { date: '2027-02-21', distance: 6   , notes: 'Easy' },
      { date: '2027-02-22', distance: 4   , notes: 'Easy' },
      { date: '2027-02-24', distance: 10  , notes: 'Long run' },
      { date: '2027-02-27', distance: 4   , notes: 'Including 2 mi at marathon pace' },
      { date: '2027-02-28', distance: 4   , notes: 'Easy' },
      { date: '2027-03-01', distance: 3   , notes: 'Easy' },
      { date: '2027-03-03', distance: 4   , notes: 'Easy' },
      { date: '2027-03-06', distance: 26.2, notes: '🏁 MARATHON' },
    ],
    2: [ // Laura — marathon Mar 6, 2027 (plan starts at week 8)
      { date: '2026-11-02', distance: 3   , notes: 'Medium (recovery week)' },
      { date: '2026-11-04', distance: 5   , notes: 'Long run (recovery week)' },
      { date: '2026-11-08', distance: 1.5 , notes: 'Easy (recovery week)' },
      { date: '2026-11-09', distance: 4   , notes: 'Medium' },
      { date: '2026-11-11', distance: 8   , notes: 'Long run' },
      { date: '2026-11-15', distance: 2   , notes: 'Easy' },
      { date: '2026-11-16', distance: 4   , notes: 'Medium' },
      { date: '2026-11-18', distance: 9   , notes: 'Long run' },
      { date: '2026-11-22', distance: 2   , notes: 'Easy' },
      { date: '2026-11-23', distance: 4.5 , notes: 'Medium' },
      { date: '2026-11-25', distance: 10  , notes: 'Long run' },
      { date: '2026-11-29', distance: 2   , notes: 'Easy' },
      { date: '2026-11-30', distance: 4   , notes: 'Medium (recovery week)' },
      { date: '2026-12-02', distance: 8   , notes: 'Long run (recovery week)' },
      { date: '2026-12-06', distance: 1.5 , notes: 'Easy (recovery week)' },
      { date: '2026-12-07', distance: 5   , notes: 'Medium' },
      { date: '2026-12-09', distance: 11  , notes: 'Long run' },
      { date: '2026-12-13', distance: 2   , notes: 'Easy' },
      { date: '2026-12-14', distance: 5   , notes: 'Medium' },
      { date: '2026-12-16', distance: 12  , notes: 'Long run' },
      { date: '2026-12-20', distance: 2   , notes: 'Easy' },
      { date: '2026-12-21', distance: 5   , notes: 'Medium (recovery week)' },
      { date: '2026-12-23', distance: 10  , notes: 'Long run (recovery week)' },
      { date: '2026-12-27', distance: 1.5 , notes: 'Easy (recovery week)' },
      { date: '2026-12-28', distance: 5.5 , notes: 'Medium' },
      { date: '2026-12-30', distance: 13  , notes: 'Long run' },
      { date: '2027-01-03', distance: 2   , notes: 'Easy' },
      { date: '2027-01-04', distance: 5.5 , notes: 'Medium' },
      { date: '2027-01-06', distance: 14  , notes: 'Long run' },
      { date: '2027-01-10', distance: 2   , notes: 'Easy' },
      { date: '2027-01-11', distance: 5   , notes: 'Medium (recovery week)' },
      { date: '2027-01-13', distance: 11  , notes: 'Long run (recovery week)' },
      { date: '2027-01-17', distance: 1.5 , notes: 'Easy (recovery week)' },
      { date: '2027-01-18', distance: 6   , notes: 'Medium' },
      { date: '2027-01-20', distance: 15  , notes: 'Long run' },
      { date: '2027-01-24', distance: 2   , notes: 'Easy' },
      { date: '2027-01-25', distance: 6   , notes: 'Medium' },
      { date: '2027-01-27', distance: 16  , notes: 'Long run' },
      { date: '2027-01-31', distance: 2   , notes: 'Easy' },
      { date: '2027-02-01', distance: 5   , notes: 'Medium (recovery week)' },
      { date: '2027-02-03', distance: 12  , notes: 'Long run (recovery week)' },
      { date: '2027-02-07', distance: 2   , notes: 'Easy (recovery week)' },
      { date: '2027-02-08', distance: 6   , notes: 'Medium' },
      { date: '2027-02-10', distance: 18  , notes: 'Long run — PEAK' },
      { date: '2027-02-14', distance: 2   , notes: 'Easy' },
      { date: '2027-02-15', distance: 4   , notes: 'Medium' },
      { date: '2027-02-17', distance: 10  , notes: 'Long run' },
      { date: '2027-02-21', distance: 1   , notes: 'Easy' },
      { date: '2027-02-22', distance: 3   , notes: 'Medium' },
      { date: '2027-02-24', distance: 6   , notes: 'Long run' },
      { date: '2027-02-28', distance: 1   , notes: 'Easy' },
      { date: '2027-03-01', distance: 2   , notes: 'Medium' },
      { date: '2027-03-03', distance: 3   , notes: 'Long run' },
      { date: '2027-03-06', distance: 26.2, notes: '🏁 MARATHON' },
    ],
  },

  // Loads the hardcoded plan once, and only if the user has no plan yet
  // (never overwrites runs added/edited in the app or restored from backup).
  seedRunPlanOnce(userNum = 1) {
    const plan = this.runPlans[userNum] || [];
    const flagKey = `lift_u${userNum}_runplan_seeded_v1`;
    if (plan.length === 0 || localStorage.getItem(flagKey)) return;

    const KEY = `lift_u${userNum}_runplan`;
    let existing = [];
    try { existing = JSON.parse(localStorage.getItem(KEY)) || []; } catch {}
    if (existing.length === 0) {
      // Runs already logged on a planned day count as that day's run being done
      let cardio = [];
      try { cardio = JSON.parse(localStorage.getItem(`lift_u${userNum}_cardio`)) || []; } catch {}
      const used = new Set();
      const seeded = plan.map(r => {
        const match = cardio.find(s => s.type === 'running' && s.date === r.date && !used.has(s.id));
        if (match) used.add(match.id);
        return {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
          date: r.date,
          distance: r.distance || null,
          notes: r.notes || null,
          status: match ? 'done' : 'planned',
          sessionId: match ? match.id : null
        };
      }).sort((a,b) => a.date.localeCompare(b.date));
      localStorage.setItem(KEY, JSON.stringify(seeded));
      const name = userNum === 1 ? 'Max' : 'Laura';
      console.log(`✓ Seeded ${seeded.length} planned runs for ${name}`);
    }
    localStorage.setItem(flagKey, '1');
  },

  // One-time update of labels (recovery week, PEAK) on an already-loaded plan.
  // Only touches runs whose note is still the original, un-labelled text.
  applyRunPlanLabelsOnce(userNum = 1) {
    const flagKey = `lift_u${userNum}_runplan_labels_v1`;
    if (localStorage.getItem(flagKey)) return;
    const KEY = `lift_u${userNum}_runplan`;
    let stored = [];
    try { stored = JSON.parse(localStorage.getItem(KEY)) || []; } catch {}
    const plan = this.runPlans[userNum] || [];
    let changed = 0;
    stored.forEach(r => {
      const src = plan.find(p => p.date === r.date && p.distance === r.distance);
      if (src && r.notes && src.notes !== r.notes && src.notes.startsWith(r.notes)) { r.notes = src.notes; changed++; }
    });
    if (changed) localStorage.setItem(KEY, JSON.stringify(stored));
    localStorage.setItem(flagKey, '1');
  },

  // ── WIPE (last resort only) ───────────────────────────
  wipe(userNum = 1) {
    const name = userNum === 1 ? 'Max' : 'Laura';
    if (!confirm(`Wipe ALL data for ${name} (User ${userNum})? This cannot be undone.`)) return;
    const KEY = k => `lift_u${userNum}_${k}`;
    ['exercises','routines','sessions','bodyweights','cardio','runplan','lastroutine'].forEach(k => localStorage.removeItem(KEY(k)));
    console.log('Data wiped. Reload the page.');
    location.reload();
  }
};