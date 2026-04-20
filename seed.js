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

  // ── WIPE (last resort only) ───────────────────────────
  wipe(userNum = 1) {
    const name = userNum === 1 ? 'Max' : 'Laura';
    if (!confirm(`Wipe ALL data for ${name} (User ${userNum})? This cannot be undone.`)) return;
    const KEY = k => `lift_u${userNum}_${k}`;
    ['exercises','routines','sessions','bodyweights','cardio','lastroutine'].forEach(k => localStorage.removeItem(KEY(k)));
    console.log('Data wiped. Reload the page.');
    location.reload();
  }
};