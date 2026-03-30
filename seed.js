// ═══════════════════════════════════════════════════════════
//  LIFT — Seed Data
//
//  The seed only manages the exercise library.
//  Routines and sessions are owned by the user and backed
//  up to GitHub — never touched by the seed.
//
//  To patch exercise flags after a code update:
//    Manage tab → 🔄 Check for Updates
//  (this reloads the app AND patches exercise flags)
//
//  To manually patch without reloading:
//    Open console → SEED.patchExercises(1) then SEED.patchExercises(2)
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

  // ── PATCH EXERCISES ───────────────────────────────────
  // Adds missing exercises and patches flags on existing ones.
  // Never touches routines, sessions, or bodyweights.
  patchExercises(userNum = 1) {
    const KEY = k => `lift_u${userNum}_${k}`;
    const get = k => { try { const v = localStorage.getItem(KEY(k)); return v ? JSON.parse(v) : null; } catch { return null; } };
    const set = (k, v) => localStorage.setItem(KEY(k), JSON.stringify(v));

    const existing = get('exercises') || [];
    const exMap = {};
    existing.forEach(e => { exMap[e.name] = e; });

    let added = 0, patched = 0;

    this.exercises.forEach(ex => {
      if (!exMap[ex.name]) {
        // New exercise — add it
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
        existing.push({
          id, name: ex.name, category: ex.category || '',
          bodyweight: ex.bodyweight || false,
          barbell: ex.barbell || false,
          cable: ex.cable || false
        });
        exMap[ex.name] = existing[existing.length - 1];
        added++;
      } else {
        // Existing exercise — patch flags only, never rename or delete
        const e = exMap[ex.name];
        let changed = false;
        if (ex.bodyweight && !e.bodyweight) { e.bodyweight = true; changed = true; }
        if (ex.barbell   && !e.barbell)     { e.barbell = true;    changed = true; }
        if (ex.cable     && !e.cable)       { e.cable = true;      changed = true; }
        if (changed) patched++;
      }
    });

    set('exercises', existing);
    const name = userNum === 1 ? 'Max' : 'Laura';
    console.log(`✓ ${name}: ${existing.length} exercises (${added} added, ${patched} flags patched)`);
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