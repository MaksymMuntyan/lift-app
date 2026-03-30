// ═══════════════════════════════════════════════════════════
//  LIFT — Workout Tracker  v3
//  Data model:
//    Routine  { id, name, days: [{ id, name, slots: [{ choices, sets, repMin, repMax }] }] }
//    Session  { id, date, routineId, routineName, dayId, dayName, bodyweight, sets: [...] }
//    Exercise { id, name, category }
//    Bodyweight { date, weight }
// ═══════════════════════════════════════════════════════════

let currentUser = parseInt(localStorage.getItem('lift_activeUser') || '1');
const USERS = { 1: { name: 'Max' }, 2: { name: 'Laura' } };

let session = null;
let numpadValue = '', numpadCallback = null, numpadAllowDecimal = true;
let bwValue = '';

// Routine editor state
let editingRoutineId = null;
let editingDays = [];
let activeDayIdx = 0;
let currentSlotIndex = null;
let editingExerciseId = null;

// Chart
let chartInstance = null;
let chartSeries = [];

// Plate math toggle
let showPlateMath = localStorage.getItem('lift_plateMath') === 'true';
let showPRPlateMath = localStorage.getItem('lift_prPlateMath') === 'true';

// ── STORAGE ────────────────────────────────────────────────

const KEY = k => `lift_u${currentUser}_${k}`;
function load(k, def) { try { const v = localStorage.getItem(KEY(k)); return v !== null ? JSON.parse(v) : def; } catch { return def; } }
function save(k, v)   { try { localStorage.setItem(KEY(k), JSON.stringify(v)); } catch(e) { console.error(e); } }

function getExercises()   { return load('exercises', []); }
function getRoutines()    { return load('routines', []); }
function getSessions()    { return load('sessions', []); }
function getBodyweights() { return load('bodyweights', []); }
function saveExercises(d)   { save('exercises', d); }
function saveRoutines(d)    { save('routines', d); }
function saveSessions(d)    { save('sessions', d); }
function saveBodyweights(d) { save('bodyweights', d); }

function getLastDayId(routineId)        { return load(`lastday_${routineId}`, null); }
function setLastDayId(routineId, dayId) { save(`lastday_${routineId}`, dayId); }

function getLastRoutineId()      { return load('lastroutine', null); }
function setLastRoutineId(id)    { save('lastroutine', id); }

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

// ── INIT ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const now = new Date();
  document.getElementById('topbar-date').textContent =
    now.toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' });
  updateUserDisplay();
  renderHome();
});

// ── USER SWITCH ────────────────────────────────────────────

function switchUser() {
  if (session && !confirm('Switching users will discard your active workout. Continue?')) return;
  session = null;
  currentUser = currentUser === 1 ? 2 : 1;
  localStorage.setItem('lift_activeUser', currentUser);
  updateUserDisplay();
  renderAll();
}

function updateUserDisplay() {
  document.getElementById('user-name-display').textContent = USERS[currentUser].name;
  document.getElementById('user-dot').className = 'user-dot' + (currentUser === 2 ? ' u2' : '');
}

function renderAll() { renderHome(); renderHistory(); renderStats(); renderManage(); renderCardioScreen(); }

// ── TABS ───────────────────────────────────────────────────

function showTab(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
  if (name === 'stats')   renderStats();
  if (name === 'history') renderHistory();
  if (name === 'manage')  renderManage();
  if (name === 'cardio')  renderCardioScreen();
}

// ── HOME ───────────────────────────────────────────────────

function renderHome() {
  session ? renderActiveWorkout() : renderIdleHome();
}

function renderIdleHome() {
  show('home-idle'); hide('home-active');
  show('home-bottom-idle'); hide('home-bottom-active');

  const routines = getRoutines();
  const el = document.getElementById('routine-list');

  if (routines.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">🏋️</div><div class="empty-title">No Routines Yet</div><p>Go to Manage to create your first routine.</p></div>`;
  } else {
    const lastRoutineId = getLastRoutineId();
    el.innerHTML = routines.map(r => {
      const nextDay = getNextDay(r);
      const dayCount = (r.days || []).length;
      const isLast = r.id === lastRoutineId;
      return `<div class="list-item card" style="margin-bottom:8px;border-radius:8px;${isLast ? 'border-color:var(--accent);' : ''}" onclick="pickDayAndStart('${r.id}')">
        <div class="list-item-main">
          <div class="list-item-title">${esc(r.name)}${isLast ? ' <span style="font-size:11px;font-family:\'Barlow Condensed\',sans-serif;font-weight:700;letter-spacing:0.08em;color:var(--accent);text-transform:uppercase;vertical-align:middle;">Last used</span>' : ''}</div>
          <div class="list-item-sub">${dayCount} day${dayCount !== 1 ? 's' : ''} &nbsp;·&nbsp; Next: <strong style="color:var(--accent)">${esc(nextDay.name)}</strong></div>
        </div>
        <div style="font-size:24px;color:var(--text3)">›</div>
      </div>`;

    }).join('');
  }

  const prEl = document.getElementById('recent-prs');
  const prs = computeAllPRs().slice(0, 5);
  prEl.innerHTML = prs.length === 0
    ? `<div style="padding:16px;color:var(--text2);font-size:14px;">Log your first workout to see PRs here.</div>`
    : prs.map(pr => `<div class="pr-row">
        <div class="pr-name">${esc(pr.name)}</div>
        <div><div class="pr-val">${pr.weight}<span style="font-size:13px;color:var(--text2)"> lbs</span></div>
        <div class="pr-sub">${pr.reps} reps${pr.bw ? ' · ' + pr.bw + ' bw' : ''}</div></div>
      </div>`).join('');
}

function getNextDay(routine) {
  const days = routine.days || [];
  if (days.length === 0) return { id: null, name: 'No days' };
  const lastId = getLastDayId(routine.id);
  if (!lastId) return days[0];
  const lastIdx = days.findIndex(d => d.id === lastId);
  if (lastIdx === -1) return days[0];
  return days[(lastIdx + 1) % days.length];
}

// ── START WORKOUT: pick day ────────────────────────────────

function pickDayAndStart(routineId) {
  const routine = getRoutines().find(r => r.id === routineId);
  if (!routine) return;

  // Single-day routine — skip picker
  if ((routine.days || []).length === 1) {
    beginWorkout(routine, routine.days[0]);
    return;
  }

  const nextDay = getNextDay(routine);
  const list = document.getElementById('modal-day-picker-list');
  list.innerHTML = (routine.days || []).map(d => {
    const isNext = d.id === nextDay.id;
    return `<div class="list-item" onclick="confirmDayStart('${routineId}','${d.id}')">
      <div class="list-item-main">
        <div class="list-item-title">${esc(d.name)}</div>
        <div class="list-item-sub">${(d.slots||[]).length} exercise slot${(d.slots||[]).length !== 1 ? 's' : ''}</div>
      </div>
      ${isNext ? '<span class="badge badge-new">Next up</span>' : ''}
    </div>`;
  }).join('');

  document.getElementById('modal-day-picker-routine').textContent = routine.name;
  openModal('modal-day-picker');
}

function confirmDayStart(routineId, dayId) {
  closeModal('modal-day-picker');
  const routine = getRoutines().find(r => r.id === routineId);
  if (!routine) return;
  const day = (routine.days || []).find(d => d.id === dayId);
  if (!day) return;
  beginWorkout(routine, day);
}

function beginWorkout(routine, day) {
  const today = todayStr();
  const bws = getBodyweights();
  const todayBW = (bws.find(b => b.date === today) || {}).weight || null;

  session = {
    id: uid(), routineId: routine.id, routineName: routine.name,
    dayId: day.id, dayName: day.name, date: today, bodyweight: todayBW,
    exercises: [],
    slots: (day.slots || []).map((slot, i) => ({
      slotIdx: i, choices: slot.choices || [],
      sets: slot.sets || 3, repMin: slot.repMin || null, repMax: slot.repMax || null,
      resolved: (slot.choices || []).length === 1 ? slot.choices[0] : null
    }))
  };

  // Build all exercises immediately — unresolved OR slots show inline picker
  buildSessionExercises();
}

// ── OR-CHOICE RESOLUTION (inline, per exercise) ────────────

function pickOrChoice(exIdx) {
  const slot = session.slots[exIdx];
  const exercises = getExercises();
  const list = document.getElementById('modal-choose-exercise-list');
  list.innerHTML = slot.choices.map(cid => {
    const ex = exercises.find(e => e.id === cid);
    return ex ? `<div class="list-item" onclick="resolveInlineSlot(${exIdx},'${cid}')">${esc(ex.name)}</div>` : '';
  }).join('');
  openModal('modal-choose-exercise');
}

function resolveInlineSlot(exIdx, choiceId) {
  closeModal('modal-choose-exercise');
  const slot = session.slots[exIdx];
  slot.resolved = choiceId;

  // Build this exercise now that we have a choice
  const exercises = getExercises();
  const allSessions = getSessions();
  const ex = exercises.find(e => e.id === choiceId);
  if (!ex) return;

  const isBodyweight = !!ex.bodyweight;
  const isBarbell = !!ex.barbell;
  const isCable = !!ex.cable;
  let lastWeight = isBodyweight ? 0 : 45, lastReps = 5, lastDate = null;
  let lastSetReps = [];
  for (let i = allSessions.length - 1; i >= 0; i--) {
    const s = allSessions[i];
    const match = s.sets.filter(st => st.exerciseId === choiceId);
    if (match.length > 0) {
      const best = match.reduce((a, b) => b.weight > a.weight ? b : (b.weight === a.weight && b.reps > a.reps ? b : a), match[0]);
      lastWeight = best.weight; lastReps = best.reps; lastDate = s.date;
      lastSetReps = match.map(st => st.reps);
      break;
    }
  }

  const targetSets = slot.sets || 3;
  session.exercises[exIdx] = {
    exerciseId: choiceId, name: ex.name, targetWeight: lastWeight,
    lastWeight, lastReps, lastDate, lastSetReps, isBodyweight, isBarbell, isCable,
    repMin: slot.repMin, repMax: slot.repMax, targetSets,
    sets: Array.from({ length: targetSets }, () => ({ weight: lastWeight, reps: 0, logged: false })),
    skipped: false
  };
  refreshExerciseBlock(exIdx);
}

// ── BUILD SESSION EXERCISES ────────────────────────────────

function buildSessionExercises() {
  const exercises = getExercises();
  const allSessions = getSessions();

  session.exercises = session.slots.map(slot => {
    // OR slot not yet resolved — create a pending placeholder
    if (!slot.resolved) {
      const names = slot.choices.map(cid => (exercises.find(e => e.id === cid) || {}).name || '?');
      return {
        exerciseId: null, name: names.join(' / '), pending: true,
        choices: slot.choices, repMin: slot.repMin, repMax: slot.repMax,
        targetSets: slot.sets || 3, targetWeight: 0, sets: [], skipped: false
      };
    }

    const exId = slot.resolved;
    const ex = exercises.find(e => e.id === exId);
    if (!ex) return null;

    const isBodyweight = !!ex.bodyweight;
    const isBarbell = !!ex.barbell;
    const isCable = !!ex.cable;
    let lastWeight = isBodyweight ? 0 : 45, lastReps = 5, lastDate = null;
    let lastSetReps = [];
    for (let i = allSessions.length - 1; i >= 0; i--) {
      const s = allSessions[i];
      const match = s.sets.filter(st => st.exerciseId === exId);
      if (match.length > 0) {
        const best = match.reduce((a, b) => b.weight > a.weight ? b : (b.weight === a.weight && b.reps > a.reps ? b : a), match[0]);
        lastWeight = best.weight; lastReps = best.reps; lastDate = s.date;
        lastSetReps = match.map(st => st.reps);
        break;
      }
    }

    const targetSets = slot.sets || 3;
    return {
      exerciseId: exId, name: ex.name, targetWeight: lastWeight,
      lastWeight, lastReps, lastDate, lastSetReps, isBodyweight, isBarbell, isCable,
      repMin: slot.repMin, repMax: slot.repMax, targetSets,
      sets: Array.from({ length: targetSets }, () => ({ weight: lastWeight, reps: 0, logged: false })),
      skipped: false, pending: false
    };
  }).filter(Boolean);

  renderActiveWorkout();
}

// ── ACTIVE WORKOUT ─────────────────────────────────────────

function togglePlateMath() {
  showPlateMath = !showPlateMath;
  localStorage.setItem('lift_plateMath', showPlateMath);
  renderActiveWorkout();
}

function calcPlates(totalWeight) {
  const barWeight = 45;
  const plates = [45, 35, 25, 10, 5, 2.5];
  let remaining = (totalWeight - barWeight) / 2;
  if (remaining <= 0) return totalWeight <= 0 ? null : '45 lb bar only';
  const result = [];
  for (const p of plates) {
    const count = Math.floor(remaining / p);
    if (count > 0) { result.push(`${count}× ${p}`); remaining -= count * p; }
  }
  remaining = Math.round(remaining * 10) / 10;
  if (remaining > 0) result.push(`+${remaining} ?`);
  return result.length ? result.join(' + ') + ' per side' : '45 lb bar only';
}

function calcCablePlates(totalWeight) {
  // Cable: no bar, just plates on the stack
  const plates = [45, 35, 25, 10, 5, 2.5];
  let remaining = totalWeight;
  if (remaining <= 0) return null;
  const result = [];
  for (const p of plates) {
    const count = Math.floor(remaining / p);
    if (count > 0) { result.push(`${count}× ${p}`); remaining -= count * p; }
  }
  remaining = Math.round(remaining * 10) / 10;
  if (remaining > 0) result.push(`+${remaining} ?`);
  return result.length ? result.join(' + ') : null;
}

function renderActiveWorkout() {
  hide('home-idle'); show('home-active');
  hide('home-bottom-idle'); show('home-bottom-active');

  const prs = computeAllPRs();
  const prMap = {};
  prs.forEach(p => { prMap[p.exerciseId] = p; });

  const plateBtnStyle = showPlateMath
    ? `background:var(--accent);color:#fff;border-color:var(--accent);`
    : ``;

  let html = `<div class="workout-header">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
      <div>
        <div class="workout-title">${esc(session.routineName)}</div>
        <div style="font-size:15px;font-weight:600;color:var(--accent);margin-top:2px;">${esc(session.dayName)}</div>
        <div class="workout-meta">${formatDate(session.date)}${session.bodyweight
          ? ' · BW: ' + session.bodyweight + ' lbs'
          : ' &nbsp;<span style="color:var(--text3);font-size:12px;">tap ⚖️ to log BW</span>'}</div>
      </div>
      <button class="btn-inline" onclick="togglePlateMath()" style="margin-top:4px;flex-shrink:0;${plateBtnStyle}">
        🏋️ Plates
      </button>
    </div>
  </div><div style="height:12px;"></div>`;

  session.exercises.forEach((ex, exIdx) => {
    html += renderExerciseBlock(ex, exIdx, prMap[ex.exerciseId]);
  });

  html += `<div style="padding:8px 16px 4px;">
    <button class="btn btn-secondary" onclick="openAddExtraExercise()">+ Add Extra Exercise</button>
  </div>`;

  document.getElementById('home-active').innerHTML = html;
}

function renderExerciseBlock(ex, exIdx, pr) {
  // ── PENDING: OR choice not yet made ──
  if (ex.pending) {
    const exercises = getExercises();
    const names = ex.choices.map(cid => (exercises.find(e => e.id === cid) || {}).name || '?');
    return `<div class="exercise-block" id="ex-block-${exIdx}" style="border-style:dashed;opacity:0.7;">
      <div class="exercise-block-header">
        <div>
          <div class="exercise-name" style="color:var(--text2);">${names.join(' / ')}</div>
          <div style="font-size:13px;color:var(--text3);margin-top:2px;">OR choice — pick when ready</div>
        </div>
      </div>
      <div style="padding:12px 14px;display:flex;gap:8px;">
        <button class="btn btn-primary" style="flex:2;" onclick="pickOrChoice(${exIdx})">Choose Exercise</button>
        <button class="btn btn-secondary" style="flex:1;" onclick="skipExercise(${exIdx})">Skip</button>
      </div>
    </div>`;
  }

  // ── SKIPPED ──
  if (ex.skipped) {
    return `<div class="exercise-block" id="ex-block-${exIdx}" style="opacity:0.4;">
      <div class="exercise-block-header">
        <div class="exercise-name" style="text-decoration:line-through;color:var(--text3);">${esc(ex.name)}</div>
        <button class="btn-inline" onclick="unskipExercise(${exIdx})">Undo</button>
      </div>
    </div>`;
  }

  // ── NORMAL ──
  const loggedSets = ex.sets.filter(s => s.logged);
  const bestLoggedWeight = loggedSets.length ? Math.max(...loggedSets.map(s => s.weight)) : 0;
  const bestLoggedReps = loggedSets.filter(s => s.weight === bestLoggedWeight).reduce((m, s) => Math.max(m, s.reps), 0);
  const isNewPR = pr && (bestLoggedWeight > pr.weight || (bestLoggedWeight === pr.weight && bestLoggedReps > pr.reps));

  const hasRange = ex.repMin || ex.repMax;
  const isMaxReps = ex.repMax === 'MAX';
  const rangeLabel = isMaxReps
    ? (ex.repMin ? `${ex.repMin}+ reps (MAX)` : 'MAX reps')
    : ex.repMin && ex.repMax ? `${ex.repMin}–${ex.repMax} reps`
    : ex.repMin ? `${ex.repMin}+ reps`
    : ex.repMax ? `up to ${ex.repMax} reps` : '';
  const setsLabel = hasRange
    ? `${ex.targetSets} sets of ${rangeLabel}`
    : `${ex.targetSets} sets`;

  let dpHint = '';
  if (ex.lastDate) {
    if (ex.isBodyweight || isMaxReps) {
      // Bodyweight or MAX — just show last reps and encourage beating it
      dpHint = `<span style="color:var(--accent);font-size:12px;font-weight:700;">Got ${ex.lastReps} last time — beat it!</span>`;
    } else if (hasRange) {
      if (ex.repMax && ex.lastReps >= ex.repMax)
        dpHint = `<span style="color:var(--accent2);font-size:12px;font-weight:700;">↑ Got ${ex.lastReps} last time — bump weight!</span>`;
      else if (ex.repMin && ex.lastReps < ex.repMin)
        dpHint = `<span style="color:var(--text2);font-size:12px;">Got ${ex.lastReps} last time — push for ${ex.repMin}</span>`;
    }
  }

  let html = `<div class="exercise-block${isNewPR ? ' current' : ''}" id="ex-block-${exIdx}">
    <div class="exercise-block-header">
      <div>
        <div class="exercise-name">${esc(ex.name)}</div>
        ${hasRange ? `<div style="font-size:13px;color:var(--text2);margin-top:1px;">${setsLabel}</div>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        ${isNewPR ? '<span class="badge badge-pr pr-flash">PR 🔥</span>' : ''}
        <button class="btn-inline" onclick="skipExercise(${exIdx})" style="font-size:12px;padding:4px 10px;color:var(--text3);border-color:var(--border);">Skip</button>
      </div>
    </div>`;

  if (ex.lastDate) {
    const lastStr = ex.isBodyweight
      ? `BW × ${ex.lastReps}`
      : `${ex.lastWeight} lbs × ${ex.lastReps}`;
    html += `<div class="last-session">Last: <span>${lastStr}</span> on ${formatDate(ex.lastDate)}${dpHint ? '&nbsp;&nbsp;' + dpHint : ''}</div>`;
  } else {
    html += `<div class="last-session" style="color:var(--text3)">No previous data${hasRange ? ' · Target: ' + setsLabel : ''}</div>`;
  }

  if (ex.isBodyweight) {
    html += `<div class="weight-selector">
      <span class="weight-label">Weight</span>
      <div style="flex:1;font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:800;color:var(--text2);padding:0 8px;">Bodyweight</div>
    </div>`;
  } else {
    html += `<div class="weight-selector">
      <span class="weight-label">Target</span>
      <div class="weight-stepper">
        <button class="stepper-btn" onclick="adjustWeight(${exIdx},-5)">−</button>
        <div class="weight-display" onclick="openWeightNumpad(${exIdx})">${ex.targetWeight}<span class="weight-unit">lbs</span></div>
        <button class="stepper-btn" onclick="adjustWeight(${exIdx},5)">+</button>
      </div>
      <button class="btn-inline" onclick="adjustWeight(${exIdx},2.5)" style="padding:6px 10px;font-size:12px;">+2.5</button>
    </div>`;
    if (showPlateMath && (ex.isBarbell || ex.isCable)) {
      const plates = ex.isBarbell ? calcPlates(ex.targetWeight) : calcCablePlates(ex.targetWeight);
      if (plates) {
        const label = ex.isCable ? `🔵 ${plates}` : `🏋️ ${plates}`;
        html += `<div style="padding:6px 14px 8px;font-size:13px;color:var(--accent);font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:0.04em;">
          ${label}
        </div>`;
      }
    }
  }
  html += `<div class="sets-area" id="sets-area-${exIdx}">`;
  ex.sets.forEach((set, setIdx) => { html += renderSetRow(exIdx, setIdx, set, ex.targetWeight); });
  html += `</div><button class="add-set-btn" onclick="addSet(${exIdx})">+ Add Set</button></div>`;
  return html;
}

function renderSetRow(exIdx, setIdx, set, targetWeight) {
  const ex = session ? session.exercises[exIdx] : null;
  const w = set.logged ? set.weight : targetWeight;
  const wLabel = (ex && ex.isBodyweight) ? 'BW' : `${w} lbs`;
  const prevReps = ex && ex.lastSetReps && ex.lastSetReps[setIdx] !== undefined
    ? ex.lastSetReps[setIdx] : null;
  const setNumHtml = `<div class="set-num">S${setIdx+1}${prevReps !== null
    ? `<div style="font-size:10px;color:var(--text3);font-weight:400;letter-spacing:0;margin-top:1px;">${prevReps}</div>`
    : ''}</div>`;
  const statusIcon  = set.logged ? (set.reps > 0 ? '✓' : '✗') : '';
  const statusColor = set.logged ? (set.reps > 0 ? 'var(--green)' : 'var(--red)') : '';
  let repsColor = 'var(--text)';
  if (set.logged && set.reps > 0 && ex) {
    if (ex.repMax === 'MAX') repsColor = 'var(--green)'; // any logged reps is good for MAX
    else if (ex.repMax && set.reps >= ex.repMax)     repsColor = 'var(--accent)';
    else if (ex.repMin && set.reps >= ex.repMin)     repsColor = 'var(--green)';
    else if (ex.repMin && set.reps < ex.repMin)      repsColor = 'var(--text2)';
  }
  return `<div class="set-row" id="set-row-${exIdx}-${setIdx}"${set.skipped?' style="opacity:0.35;"':''}>
    ${setNumHtml}
    <div class="set-weight">${wLabel}</div>
    <div class="reps-input-row">
      <button class="reps-btn" onclick="adjustReps(${exIdx},${setIdx},-1)" ${set.skipped?'disabled':''}>−</button>
      <div class="reps-display" onclick="openRepsNumpad(${exIdx},${setIdx})" style="color:${set.logged&&set.reps>0?repsColor:'var(--text)'};">${set.reps>0?set.reps:'—'}</div>
      <button class="reps-btn" onclick="adjustReps(${exIdx},${setIdx},1)" ${set.skipped?'disabled':''}>+</button>
      ${set.skipped
        ? `<button class="btn-inline" onclick="unskipSet(${exIdx},${setIdx})" style="font-size:12px;color:var(--text2);">Undo</button>`
        : `<button class="btn-inline" onclick="logSet(${exIdx},${setIdx})"
            style="background:${set.logged?'var(--surface2)':'var(--accent)'};color:${set.logged?'var(--text2)':'#ffffff'};border-color:${set.logged?'var(--border)':'var(--accent)'};">
            ${set.logged?'Edit':'LOG'}
          </button>`
      }
    </div>
    <div class="set-status" style="color:${set.skipped?'var(--text3)':statusColor};cursor:pointer;"
      onclick="${set.skipped?`unskipSet(${exIdx},${setIdx})`:`skipSet(${exIdx},${setIdx})`}"
      title="${set.skipped?'Undo skip':'Skip this set'}">
      ${set.skipped?'–':statusIcon||'<span style="font-size:12px;color:var(--text3);">✕</span>'}
    </div>
  </div>`;
}

function adjustWeight(exIdx, delta) {
  if (!session) return;
  const ex = session.exercises[exIdx];
  ex.targetWeight = Math.max(0, Math.round((ex.targetWeight + delta) * 2) / 2);
  ex.sets.forEach(s => { if (!s.logged) s.weight = ex.targetWeight; });
  refreshExerciseBlock(exIdx);
}

function openWeightNumpad(exIdx) {
  openNumpad('WEIGHT (LBS)', session.exercises[exIdx].targetWeight, true, val => {
    session.exercises[exIdx].targetWeight = val;
    session.exercises[exIdx].sets.forEach(s => { if (!s.logged) s.weight = val; });
    refreshExerciseBlock(exIdx);
  });
}

function adjustReps(exIdx, setIdx, delta) {
  if (!session) return;
  const set = session.exercises[exIdx].sets[setIdx];
  set.reps = Math.max(0, (set.reps || 0) + delta);
  const el = document.getElementById(`set-row-${exIdx}-${setIdx}`);
  if (el) el.outerHTML = renderSetRow(exIdx, setIdx, set, session.exercises[exIdx].targetWeight);
}

function openRepsNumpad(exIdx, setIdx) {
  const set = session.exercises[exIdx].sets[setIdx];
  openNumpad('REPS', set.reps || '', false, val => {
    session.exercises[exIdx].sets[setIdx].reps = val;
    const el = document.getElementById(`set-row-${exIdx}-${setIdx}`);
    if (el) el.outerHTML = renderSetRow(exIdx, setIdx, session.exercises[exIdx].sets[setIdx], session.exercises[exIdx].targetWeight);
  });
}

function logSet(exIdx, setIdx) {
  const ex = session.exercises[exIdx];
  const set = ex.sets[setIdx];
  set.logged = true; set.weight = ex.targetWeight;
  refreshExerciseBlock(exIdx);
}

function addSet(exIdx) {
  const ex = session.exercises[exIdx];
  ex.sets.push({ weight: ex.targetWeight, reps: 0, logged: false, skipped: false });
  refreshExerciseBlock(exIdx);
}

function skipExercise(exIdx) {
  session.exercises[exIdx].skipped = true;
  refreshExerciseBlock(exIdx);
}

function unskipExercise(exIdx) {
  session.exercises[exIdx].skipped = false;
  refreshExerciseBlock(exIdx);
}

function skipSet(exIdx, setIdx) {
  session.exercises[exIdx].sets[setIdx].skipped = true;
  session.exercises[exIdx].sets[setIdx].logged = false;
  refreshExerciseBlock(exIdx);
}

function unskipSet(exIdx, setIdx) {
  session.exercises[exIdx].sets[setIdx].skipped = false;
  refreshExerciseBlock(exIdx);
}

// Add an extra exercise not in the routine
function openAddExtraExercise() {
  const exercises = getExercises();
  const list = document.getElementById('modal-extra-exercise-list');
  list.innerHTML = exercises.map(ex => `
    <div class="list-item" onclick="addExtraExercise('${ex.id}')">
      <div class="list-item-main">
        <div class="list-item-title">${esc(ex.name)}</div>
        ${ex.category ? `<div class="list-item-sub">${esc(ex.category)}</div>` : ''}
      </div>
    </div>
  `).join('') || `<div style="padding:20px;color:var(--text2);">No exercises in library yet.</div>`;
  openModal('modal-extra-exercise');
}

function addExtraExercise(exId) {
  closeModal('modal-extra-exercise');
  const exercises = getExercises();
  const allSessions = getSessions();
  const ex = exercises.find(e => e.id === exId);
  if (!ex) return;

  const isBodyweight = !!ex.bodyweight;
  const isBarbell = !!ex.barbell;
  const isCable = !!ex.cable;
  let lastWeight = isBodyweight ? 0 : 45, lastReps = 5, lastDate = null;
  let lastSetReps = [];
  for (let i = allSessions.length - 1; i >= 0; i--) {
    const s = allSessions[i];
    const match = s.sets.filter(st => st.exerciseId === exId);
    if (match.length > 0) {
      const best = match.reduce((a, b) => b.weight > a.weight ? b : (b.weight === a.weight && b.reps > a.reps ? b : a), match[0]);
      lastWeight = best.weight; lastReps = best.reps; lastDate = s.date;
      lastSetReps = match.map(st => st.reps);
      break;
    }
  }

  session.exercises.push({
    exerciseId: exId, name: ex.name, targetWeight: lastWeight,
    lastWeight, lastReps, lastDate, lastSetReps, isBodyweight, isBarbell, isCable,
    repMin: null, repMax: null, targetSets: 3,
    sets: Array.from({ length: 3 }, () => ({ weight: lastWeight, reps: 0, logged: false, skipped: false })),
    skipped: false, pending: false, extra: true
  });

  // Re-render active workout to show new block
  renderActiveWorkout();
  // Scroll to bottom
  setTimeout(() => {
    const el = document.getElementById('home-active');
    if (el) el.scrollTop = el.scrollHeight;
  }, 100);
}

function refreshExerciseBlock(exIdx) {
  const el = document.getElementById(`ex-block-${exIdx}`);
  if (!el) return;
  const prs = computeAllPRs(); const prMap = {};
  prs.forEach(p => { prMap[p.exerciseId] = p; });
  el.outerHTML = renderExerciseBlock(session.exercises[exIdx], exIdx, prMap[session.exercises[exIdx].exerciseId]);
}

// ── FINISH / CANCEL ────────────────────────────────────────

function finishWorkout() {
  if (!session) return;
  const sets = [];
  session.exercises.forEach(ex => {
    if (ex.skipped || ex.pending) return;
    ex.sets.filter(s => s.logged && s.reps > 0 && !s.skipped).forEach((s, i) => {
      sets.push({ exerciseId: ex.exerciseId, exerciseName: ex.name, setNum: i+1,
                  weight: s.weight, reps: s.reps, bodyweight: session.bodyweight });
    });
  });
  if (sets.length === 0) { if (!confirm('No sets logged. Discard workout?')) return; cancelWorkout(); return; }

  const savedSession = { id: session.id, date: session.date, routineId: session.routineId,
    routineName: session.routineName, dayId: session.dayId, dayName: session.dayName,
    bodyweight: session.bodyweight, sets };

  const allSessions = getSessions();
  allSessions.push(savedSession);
  saveSessions(allSessions);

  if (session.bodyweight) {
    const bws = getBodyweights();
    const idx = bws.findIndex(b => b.date === session.date);
    if (idx >= 0) bws[idx].weight = session.bodyweight; else bws.push({ date: session.date, weight: session.bodyweight });
    saveBodyweights(bws);
  }

  setLastDayId(session.routineId, session.dayId);
  setLastRoutineId(session.routineId);
  autoBackup(); // silent background backup to GitHub
  showSessionSummary(savedSession);
  session = null;
  renderIdleHome();
}

function cancelWorkout() { session = null; renderIdleHome(); }

function showSessionSummary(savedSession) {
  const prs = computeAllPRs(); const prMap = {};
  prs.forEach(p => { prMap[p.exerciseId] = p; });
  const exMap = {};
  savedSession.sets.forEach(s => {
    if (!exMap[s.exerciseId]) exMap[s.exerciseId] = { name: s.exerciseName, id: s.exerciseId, sets: [] };
    exMap[s.exerciseId].sets.push(s);
  });
  let html = `<div style="padding:12px 0;color:var(--text2);font-size:14px;">${esc(savedSession.dayName)} · ${formatDate(savedSession.date)}${savedSession.bodyweight ? ' · BW ' + savedSession.bodyweight + ' lbs' : ''}</div>`;
  Object.values(exMap).forEach(ex => {
    const pr = prMap[ex.id];
    const bestW = Math.max(...ex.sets.map(s => s.weight));
    const bestR = ex.sets.filter(s => s.weight === bestW).reduce((m, s) => Math.max(m, s.reps), 0);
    const isNewPR = (!pr && ex.sets.length > 0) || (pr && (bestW > pr.weight || (bestW === pr.weight && bestR > pr.reps)));
    html += `<div class="summary-exercise">
      <div class="summary-ex-name">${esc(ex.name)} ${isNewPR ? '<span class="badge badge-pr">PR</span>' : ''}</div>
      <div class="summary-ex-sets">${ex.sets.length} set${ex.sets.length !== 1 ? 's' : ''}</div>
      <div class="summary-ex-best">${bestW} lbs × ${bestR} reps</div>
    </div>`;
  });
  document.getElementById('modal-summary-body').innerHTML = html + '<div style="height:8px;"></div>';
  document.querySelector('#modal-summary .modal-title').textContent = 'SESSION COMPLETE 💪';
  openModal('modal-summary');
}

// ── HISTORY ────────────────────────────────────────────────

function renderHistory() {
  const sessions = getSessions().slice().reverse();
  const el = document.getElementById('history-list');
  if (sessions.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">No Sessions Yet</div><p>Complete your first workout to see history here.</p></div>`;
    return;
  }
  el.innerHTML = sessions.map(s => {
    const names = [...new Set(s.sets.map(st => st.exerciseName))];
    return `<div class="list-item card" style="margin:0 16px 8px;border-radius:8px;" onclick="showHistoryDetail('${s.id}')">
      <div class="list-item-main">
        <div class="list-item-title">${esc(s.routineName)} <span style="color:var(--accent);font-size:14px;">${esc(s.dayName||'')}</span></div>
        <div class="list-item-sub">${names.slice(0,3).map(esc).join(', ')}${names.length>3?'…':''}</div>
      </div>
      <div class="text-right">
        <div style="font-size:13px;color:var(--text2)">${formatDate(s.date)}</div>
        <div style="font-size:12px;color:var(--text3)">${s.sets.length} sets</div>
      </div>
    </div>`;
  }).join('');
}

function showHistoryDetail(sessionId) {
  const s = getSessions().find(x => x.id === sessionId);
  if (!s) return;
  const exMap = {};
  s.sets.forEach(st => {
    if (!exMap[st.exerciseId]) exMap[st.exerciseId] = { name: st.exerciseName, sets: [] };
    exMap[st.exerciseId].sets.push(st);
  });
  let html = `<div style="padding:12px 0;color:var(--text2);font-size:14px;">${formatDate(s.date)} · ${esc(s.routineName)} ${esc(s.dayName||'')}${s.bodyweight ? ' · BW ' + s.bodyweight + ' lbs' : ''}</div>`;
  Object.values(exMap).forEach(ex => {
    const bestW = Math.max(...ex.sets.map(st => st.weight));
    const bestR = ex.sets.filter(st => st.weight === bestW).reduce((m, st) => Math.max(m, st.reps), 0);
    html += `<div class="summary-exercise">
      <div class="summary-ex-name">${esc(ex.name)}</div>
      <div class="summary-ex-sets">${ex.sets.map(st => `${st.weight}×${st.reps}`).join(', ')}</div>
      <div class="summary-ex-best">Best: ${bestW} lbs × ${bestR} reps</div>
    </div>`;
  });
  html += `<div style="height:8px;"></div><button class="btn btn-danger btn-sm" onclick="deleteSession('${s.id}')">Delete Session</button><div style="height:16px;"></div>`;
  document.getElementById('modal-summary-body').innerHTML = html;
  document.querySelector('#modal-summary .modal-title').textContent = 'SESSION DETAIL';
  openModal('modal-summary');
}

function deleteSession(id) {
  if (!confirm('Delete this session permanently?')) return;
  saveSessions(getSessions().filter(s => s.id !== id));
  closeModal('modal-summary');
  renderHistory();
}

// ── STATS ──────────────────────────────────────────────────

function renderStats() {
  renderPRBoard();
  buildChartSeriesList();
  renderChart();
  // Sync plate button state
  const btn = document.getElementById('pr-plate-btn');
  if (btn) {
    btn.style.background = showPRPlateMath ? 'var(--accent)' : '';
    btn.style.color = showPRPlateMath ? '#fff' : '';
    btn.style.borderColor = showPRPlateMath ? 'var(--accent)' : '';
  }
}

function togglePRPlateMath() {
  showPRPlateMath = !showPRPlateMath;
  localStorage.setItem('lift_prPlateMath', showPRPlateMath);
  renderStats();
}

function computeAllPRs() {
  const prMap = {};
  getSessions().forEach(s => {
    s.sets.forEach(st => {
      const cur = prMap[st.exerciseId];
      if (!cur || st.weight > cur.weight || (st.weight === cur.weight && st.reps > cur.reps))
        prMap[st.exerciseId] = { exerciseId: st.exerciseId, name: st.exerciseName,
          weight: st.weight, reps: st.reps, bw: st.bodyweight, date: s.date };
    });
  });
  // Sort: weighted exercises first (by weight desc), then bodyweight exercises (weight=0) by name
  return Object.values(prMap).sort((a, b) => {
    if (a.weight > 0 && b.weight === 0) return -1;
    if (a.weight === 0 && b.weight > 0) return 1;
    if (a.weight !== b.weight) return b.weight - a.weight;
    return a.name.localeCompare(b.name);
  });
}

const PR_FEATURED = ['Bench Press', 'Squat', 'Deadlift', 'Weighted Dip', 'Weighted Pull-Up'];
const BARBELL_EXERCISES = ['Barbell Shrug', 'Bench Press', 'Deadlift', 'Hip Thrust', 'RDL', 'Squat'];
const CABLE_EXERCISES = ['Cable Crunch', 'Cable Forearm Curl', 'Cable Row', 'Overhead Tricep Extension', 'Single Cable Forearm Curl', 'Tricep Pushdown'];

function renderPRBoard() {
  const prs = computeAllPRs().sort((a, b) => a.name.localeCompare(b.name));
  const el = document.getElementById('pr-board');

  if (prs.length === 0) {
    el.innerHTML = `<div style="padding:20px;color:var(--text2);font-size:14px;">No data yet.</div>`;
    return;
  }

  const featured = prs.filter(pr => PR_FEATURED.includes(pr.name));
  const rest = prs.filter(pr => !PR_FEATURED.includes(pr.name));

  const renderRow = (pr) => {
    const isBarbell = BARBELL_EXERCISES.includes(pr.name);
    const isCable = CABLE_EXERCISES.includes(pr.name);
    let plateHtml = '';
    if (showPRPlateMath && pr.weight > 0) {
      if (isBarbell) plateHtml = `<div style="font-size:12px;color:var(--accent);font-family:'Barlow Condensed',sans-serif;font-weight:700;margin-top:2px;">🏋️ ${calcPlates(pr.weight)}</div>`;
      else if (isCable) { const p = calcCablePlates(pr.weight); if (p) plateHtml = `<div style="font-size:12px;color:var(--accent);font-family:'Barlow Condensed',sans-serif;font-weight:700;margin-top:2px;">🔵 ${p}</div>`; }
    }
    return `<div class="pr-row">
      <div class="pr-name">${esc(pr.name)}</div>
      <div>
        <div class="pr-val">${pr.weight > 0 ? pr.weight + '<span style="font-size:13px;color:var(--text2)"> lbs</span>' : 'BW'}</div>
        <div class="pr-sub">${pr.reps} reps${pr.bw ? ' · BW ' + pr.bw : ''}${pr.date ? ' · ' + formatDate(pr.date) : ''}</div>
        ${plateHtml}
      </div>
    </div>`;
  };

  let html = featured.map(renderRow).join('');

  if (rest.length > 0) {
    html += `<div id="pr-more" class="hidden">${rest.map(renderRow).join('')}</div>`;
    html += `<div style="padding:12px 16px;">
      <button class="btn btn-secondary btn-sm" onclick="togglePRMore(this)" style="width:100%;">
        Show all lifts (${rest.length} more)
      </button>
    </div>`;
  }

  el.innerHTML = html;
}

function togglePRMore(btn) {
  const more = document.getElementById('pr-more');
  const hidden = more.classList.toggle('hidden');
  const count = more.querySelectorAll('.pr-row').length;
  btn.textContent = hidden ? `Show all lifts (${count} more)` : 'Show less';
}

function buildChartSeriesList() {
  const exercises = getExercises();
  const wasActive = {};
  chartSeries.forEach(s => { wasActive[s.id] = s.active; });
  chartSeries = [
    { id:'bodyweight', label:'Bodyweight (lbs)', type:'bodyweight', isBW: true, active: wasActive['bodyweight']||false },
    ...exercises.map(ex => ({
      id: ex.id, label: ex.name,
      type: 'exercise',
      isBW: !!ex.bodyweight,
      active: wasActive[ex.id]||false
    }))
  ];
  if (chartSeries.filter(s=>s.active).length === 0 && chartSeries.length > 1) chartSeries[1].active = true;
  renderChartSeriesChips();
}

function renderChartSeriesChips() {
  const activeExercises = chartSeries.filter(s => s.active && s.type !== 'bodyweight');
  const activeisBW = activeExercises.length > 0 ? activeExercises[0].isBW : null;
  document.getElementById('chart-series-list').innerHTML =
    chartSeries.map((s,i) => {
      // Bodyweight tracker is always compatible — never fade it
      const incompatible = s.type !== 'bodyweight' && !s.active && activeisBW !== null && s.isBW !== activeisBW;
      return `<div class="toggle-chip${s.active?' active':''}${incompatible?' disabled':''}"
        onclick="toggleChartSeries('${s.id}')"
        style="${incompatible?'opacity:0.35;cursor:not-allowed;':''}"
        title="${incompatible?'Can\'t mix weighted and bodyweight exercises on the same chart':''}"
      >${esc(s.label)}</div>`;
    }).join('');
}

function toggleChartSeries(id) {
  const s = chartSeries.find(x => x.id === id);
  if (!s) return;

  // The bodyweight tracker (scale weight) is always compatible with everything
  // Only exercise series need to be same-type
  if (!s.active && s.type !== 'bodyweight') {
    const currentActiveExercises = chartSeries.filter(x => x.active && x.type !== 'bodyweight');
    if (currentActiveExercises.length > 0 && currentActiveExercises[0].isBW !== s.isBW) {
      // Incompatible exercise type — clear exercises but keep bodyweight tracker if active
      chartSeries.forEach(x => { if (x.type !== 'bodyweight') x.active = false; });
    }
  }

  s.active = !s.active;
  renderChartSeriesChips();
  renderChart();
}

const CHART_COLORS = ['#2563eb','#ea580c','#0891b2','#9333ea','#16a34a','#ca8a04'];

function renderChart() {
  const ctx = document.getElementById('progress-chart').getContext('2d');
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
  const activeSeries = chartSeries.filter(s => s.active);
  if (activeSeries.length === 0) return;

  const sessions = getSessions().sort((a,b) => a.date.localeCompare(b.date));
  const bws = getBodyweights().sort((a,b) => a.date.localeCompare(b.date));
  const activeExerciseSeries = activeSeries.filter(s => s.type !== 'bodyweight');
  const isBodyweightChart = activeExerciseSeries.length > 0 && activeExerciseSeries[0].isBW;
  const yLabel = isBodyweightChart ? 'Reps' : 'lbs';

  // Build per-series data maps
  const seriesData = activeSeries.map(series => {
    const map = {};
    if (series.type === 'bodyweight') {
      bws.forEach(b => { map[b.date] = b.weight; });
    } else if (isBodyweightChart) {
      // Bodyweight exercise — track MAX REPS per session
      sessions.forEach(s => {
        s.sets.filter(st => st.exerciseId === series.id).forEach(st => {
          if (!map[s.date] || st.reps > map[s.date]) map[s.date] = st.reps;
        });
      });
    } else {
      // Weighted exercise — track max weight
      sessions.forEach(s => {
        s.sets.filter(st => st.exerciseId === series.id).forEach(st => {
          if (!map[s.date] || st.weight > map[s.date]) map[s.date] = st.weight;
        });
      });
    }
    return map;
  });

  const allDates = [...new Set(seriesData.flatMap(m => Object.keys(m)))].sort();
  if (allDates.length === 0) return;

  const labels = allDates.map(d => {
    const [y, m, day] = d.split('-');
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m)-1] + ' ' + parseInt(day);
  });

  const datasets = activeSeries.map((series, i) => {
    const color = CHART_COLORS[i % CHART_COLORS.length];
    const map = seriesData[i];
    const data = allDates.map(d => map[d] !== undefined ? map[d] : null);
    return {
      label: series.type === 'bodyweight' ? 'Bodyweight' : series.label,
      data, borderColor: color, backgroundColor: color + '22',
      tension: 0.3, pointRadius: 4, pointBackgroundColor: color,
      spanGaps: true
    };
  });

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: activeSeries.length > 1, labels: { color:'#888', font:{ family:'Barlow Condensed', size:13, weight:'700' }, boxWidth:12 } },
        tooltip: { backgroundColor:'#ffffff', borderColor:'#d8d8d4', borderWidth:1, titleColor:'#2563eb', bodyColor:'#111111', padding:10 }
      },
      scales: {
        x: { ticks: { color:'#666666', font:{ family:'Barlow', size:11 }, maxRotation:45, autoSkip:true, maxTicksLimit:8 }, grid:{ color:'#ebebeb' } },
        y: {
          ticks: { color:'#666666', font:{ family:'Barlow Condensed', size:13, weight:'700' } },
          grid: { color:'#ebebeb' },
          title: { display: true, text: yLabel, color:'#aaaaaa', font:{ family:'Barlow Condensed', size:12 } }
        }
      }
    }
  });
}

// ── MANAGE ─────────────────────────────────────────────────

function renderManage() { renderRoutineManageList(); renderExerciseManageList(); renderGithubToken(); }

function renderRoutineManageList() {
  const routines = getRoutines();
  const el = document.getElementById('routine-manage-list');
  if (routines.length === 0) { el.innerHTML = `<div style="padding:12px 0;color:var(--text2);font-size:14px;">No routines yet.</div>`; return; }
  el.innerHTML = routines.map(r => {
    const days = r.days || [];
    return `<div class="slot-item">
      <div style="flex:1;">
        <div style="font-weight:700;font-size:16px;">${esc(r.name)}</div>
        <div style="font-size:12px;color:var(--text2);margin-top:3px;">${days.length} day${days.length!==1?'s':''}: ${days.map(d=>esc(d.name)).join(' · ')}</div>
      </div>
      <button class="btn-inline" onclick="openEditRoutine('${r.id}')">Edit</button>
      <div class="slot-remove" onclick="deleteRoutine('${r.id}')">🗑</div>
    </div>`;
  }).join('');
}

function renderExerciseManageList() {
  const exercises = getExercises();
  const el = document.getElementById('exercise-manage-list');
  if (exercises.length === 0) { el.innerHTML = `<div style="padding:12px 0;color:var(--text2);font-size:14px;">No exercises yet.</div>`; return; }
  el.innerHTML = exercises.map(ex => `<div class="slot-item">
    <div style="flex:1;">
      <div style="font-weight:600;font-size:15px;">${esc(ex.name)}</div>
      ${ex.category?`<div style="font-size:12px;color:var(--text2)">${esc(ex.category)}</div>`:''}
    </div>
    <button class="btn-inline" onclick="openEditExercise('${ex.id}')">Edit</button>
    <div class="slot-remove" onclick="deleteExercise('${ex.id}')">🗑</div>
  </div>`).join('');
}

// ── EXERCISE CRUD ──────────────────────────────────────────

function openAddExercise() {
  editingExerciseId = null;
  document.getElementById('modal-exercise-title').textContent = 'NEW EXERCISE';
  document.getElementById('exercise-name-input').value = '';
  document.getElementById('exercise-cat-input').value = '';
  openModal('modal-exercise');
}

function openEditExercise(id) {
  const ex = getExercises().find(e => e.id === id);
  if (!ex) return;
  editingExerciseId = id;
  document.getElementById('modal-exercise-title').textContent = 'EDIT EXERCISE';
  document.getElementById('exercise-name-input').value = ex.name;
  document.getElementById('exercise-cat-input').value = ex.category || '';
  openModal('modal-exercise');
}

function saveExercise() {
  const name = document.getElementById('exercise-name-input').value.trim();
  const category = document.getElementById('exercise-cat-input').value.trim();
  if (!name) { alert('Enter a name.'); return; }
  const exercises = getExercises();
  if (editingExerciseId) {
    const i = exercises.findIndex(e => e.id === editingExerciseId);
    if (i >= 0) { exercises[i].name = name; exercises[i].category = category; }
  } else {
    exercises.push({ id: uid(), name, category });
  }
  saveExercises(exercises);
  closeModal('modal-exercise');
  renderManage();
}

function deleteExercise(id) {
  if (!confirm('Delete this exercise?')) return;
  saveExercises(getExercises().filter(e => e.id !== id));
  renderManage();
}

// ── ROUTINE CRUD ───────────────────────────────────────────

function openAddRoutine() {
  editingRoutineId = null;
  editingDays = [{ id: uid(), name: 'Day A', slots: [] }];
  activeDayIdx = 0;
  document.getElementById('modal-routine-title').textContent = 'NEW ROUTINE';
  document.getElementById('routine-name-input').value = '';
  renderDayTabs(); renderRoutineSlots();
  openModal('modal-routine');
}

function openEditRoutine(id) {
  const r = getRoutines().find(x => x.id === id);
  if (!r) return;
  editingRoutineId = id;
  if (r.slots && !r.days) {
    // Migrate v1 flat-slot routine
    editingDays = [{ id: uid(), name: 'Day A', slots: r.slots.map(s => ({...s})) }];
  } else {
    editingDays = (r.days || []).map(d => ({ ...d, slots: (d.slots||[]).map(s => ({...s})) }));
  }
  activeDayIdx = 0;
  document.getElementById('modal-routine-title').textContent = 'EDIT ROUTINE';
  document.getElementById('routine-name-input').value = r.name;
  renderDayTabs(); renderRoutineSlots();
  openModal('modal-routine');
}

function renderDayTabs() {
  document.getElementById('routine-day-tabs').innerHTML =
    editingDays.map((d,i) =>
      `<div class="toggle-chip${i===activeDayIdx?' active':''}" onclick="switchEditorDay(${i})">${esc(d.name)}</div>`
    ).join('') +
    `<div class="toggle-chip" onclick="addEditorDay()" style="color:var(--accent);border-color:var(--accent);">+ Day</div>`;
}

function switchEditorDay(idx) {
  activeDayIdx = idx;
  renderDayTabs(); renderRoutineSlots();
}

function addEditorDay() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  editingDays.push({ id: uid(), name: 'Day ' + (letters[editingDays.length] || (editingDays.length+1)), slots: [] });
  activeDayIdx = editingDays.length - 1;
  renderDayTabs(); renderRoutineSlots();
}

function removeEditorDay() {
  if (editingDays.length <= 1) { alert('A routine needs at least one day.'); return; }
  if (!confirm(`Remove "${editingDays[activeDayIdx].name}"?`)) return;
  editingDays.splice(activeDayIdx, 1);
  activeDayIdx = Math.min(activeDayIdx, editingDays.length - 1);
  renderDayTabs(); renderRoutineSlots();
}

function renderRoutineSlots() {
  const day = editingDays[activeDayIdx];
  const exercises = getExercises();
  document.getElementById('routine-day-name-input').value = day.name;

  document.getElementById('routine-slots').innerHTML = (day.slots || []).map((slot, i) => {
    const names = (slot.choices||[]).map(cid => { const ex = exercises.find(e=>e.id===cid); return ex?ex.name:'?'; });
    return `<div class="slot-item" style="flex-direction:column;align-items:stretch;gap:8px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="flex:1;font-size:15px;font-weight:600;">${names.length?names.join(' <span class="or-badge">OR</span> '):'<span style="color:var(--text3)">No exercise</span>'}</div>
        <button class="btn-inline" onclick="openSlotPicker(${i})">Edit</button>
        <div class="slot-remove" onclick="removeSlot(${i})">✕</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <span style="font-size:11px;color:var(--text2);font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Sets</span>
        <input type="number" min="1" max="10" value="${slot.sets||3}"
          style="width:52px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;padding:6px 8px;text-align:center;"
          oninput="editingDays[${activeDayIdx}].slots[${i}].sets=parseInt(this.value)||3" />
        <span style="font-size:11px;color:var(--text2);font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Reps</span>
        ${slot.repMax === 'MAX'
          ? `<span style="font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:800;color:var(--accent);">MAX</span>`
          : `<input type="number" min="1" max="99" value="${slot.repMin||''}" placeholder="min"
              style="width:52px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;padding:6px 8px;text-align:center;"
              oninput="editingDays[${activeDayIdx}].slots[${i}].repMin=parseInt(this.value)||null" />
            <span style="color:var(--text3)">–</span>
            <input type="number" min="1" max="99" value="${slot.repMax||''}" placeholder="max"
              style="width:52px;background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;padding:6px 8px;text-align:center;"
              oninput="editingDays[${activeDayIdx}].slots[${i}].repMax=parseInt(this.value)||null" />`
        }
        <label style="display:flex;align-items:center;gap:4px;font-size:13px;color:var(--text2);cursor:pointer;">
          <input type="checkbox" ${slot.repMax === 'MAX' ? 'checked' : ''}
            onchange="setSlotMaxReps(${i}, this.checked)"
            style="width:16px;height:16px;cursor:pointer;" />
          MAX
        </label>
      </div>
    </div>`;
  }).join('');
}

function setSlotMaxReps(slotIdx, isMax) {
  editingDays[activeDayIdx].slots[slotIdx].repMax = isMax ? 'MAX' : null;
  if (isMax) editingDays[activeDayIdx].slots[slotIdx].repMin = null;
  renderRoutineSlots();
}

function syncDayName() {
  editingDays[activeDayIdx].name = document.getElementById('routine-day-name-input').value.trim() || 'Day';
  renderDayTabs();
}

function addRoutineSlot() {
  if (!editingDays[activeDayIdx].slots) editingDays[activeDayIdx].slots = [];
  editingDays[activeDayIdx].slots.push({ choices: [], sets: 3, repMin: null, repMax: null });
  renderRoutineSlots();
  openSlotPicker(editingDays[activeDayIdx].slots.length - 1);
}

function removeSlot(i) {
  editingDays[activeDayIdx].slots.splice(i, 1);
  renderRoutineSlots();
}

function openSlotPicker(slotIdx) {
  currentSlotIndex = slotIdx;
  const exercises = getExercises();
  const slot = editingDays[activeDayIdx].slots[slotIdx];
  document.getElementById('modal-slot-picker-list').innerHTML = exercises.map(ex => {
    const isIn = (slot.choices||[]).includes(ex.id);
    return `<div class="list-item" onclick="toggleSlotExercise('${ex.id}')">
      <div class="list-item-main"><div class="list-item-title">${esc(ex.name)}</div></div>
      <div style="font-size:22px;color:${isIn?'var(--accent)':'var(--border)'}">${isIn?'✓':'○'}</div>
    </div>`;
  }).join('') || `<div style="padding:20px;color:var(--text2);">No exercises yet. Create some in Manage first.</div>`;
  openModal('modal-slot-picker');
}

function toggleSlotExercise(exId) {
  if (currentSlotIndex === null) return;
  const slot = editingDays[activeDayIdx].slots[currentSlotIndex];
  if (!slot.choices) slot.choices = [];
  const idx = slot.choices.indexOf(exId);
  if (idx >= 0) slot.choices.splice(idx, 1); else slot.choices.push(exId);
  openSlotPicker(currentSlotIndex);
  renderRoutineSlots();
}

function saveRoutine() {
  const name = document.getElementById('routine-name-input').value.trim();
  if (!name) { alert('Enter a routine name.'); return; }
  syncDayName();
  const validDays = editingDays
    .map(d => ({ ...d, slots: (d.slots||[]).filter(s=>(s.choices||[]).length>0).map(s=>({ choices:s.choices, sets:s.sets||3, repMin:s.repMin||null, repMax:s.repMax==='MAX'?'MAX':(s.repMax||null) })) }))
    .filter(d => d.slots.length > 0);
  if (validDays.length === 0) { alert('Add at least one exercise to a day.'); return; }

  const routines = getRoutines();
  if (editingRoutineId) {
    const i = routines.findIndex(r => r.id === editingRoutineId);
    if (i >= 0) { routines[i].name = name; routines[i].days = validDays; delete routines[i].slots; }
  } else {
    routines.push({ id: uid(), name, days: validDays });
  }
  saveRoutines(routines);
  closeModal('modal-routine');
  renderManage(); renderHome();
}

function deleteRoutine(id) {
  if (!confirm('Delete this routine?')) return;
  saveRoutines(getRoutines().filter(r => r.id !== id));
  renderManage(); renderHome();
}

// ── BODYWEIGHT ─────────────────────────────────────────────

function openLogBodyweight() {
  const cur = (getBodyweights().find(b => b.date === todayStr()) || {}).weight || '';
  bwValue = cur ? String(cur) : '';
  document.getElementById('bw-display').textContent = bwValue || '—';
  openModal('modal-bodyweight');
}

function bwKey(k) {
  if (k==='del') bwValue=bwValue.slice(0,-1);
  else if (k==='.'&&bwValue.includes('.')) return;
  else { if(bwValue.length>=6)return; bwValue+=k; }
  document.getElementById('bw-display').textContent = bwValue || '—';
}

function confirmBodyweight() {
  const val = parseFloat(bwValue);
  if (!val||val<=0) { alert('Enter a valid weight.'); return; }
  const bws = getBodyweights(); const today = todayStr();
  const idx = bws.findIndex(b=>b.date===today);
  if (idx>=0) bws[idx].weight=val; else bws.push({date:today,weight:val});
  saveBodyweights(bws);
  if (session) { session.bodyweight=val; renderActiveWorkout(); }
  closeModal('modal-bodyweight');
}

// ── NUMPAD ─────────────────────────────────────────────────

function openNumpad(title, initialVal, allowDecimal, callback) {
  numpadValue = (initialVal!==''&&initialVal!=null) ? String(initialVal) : '';
  numpadAllowDecimal=allowDecimal; numpadCallback=callback;
  document.getElementById('numpad-title').textContent = title;
  document.getElementById('numpad-display').textContent = numpadValue || '—';
  openModal('modal-numpad');
}

function numpadKey(k) {
  if (k==='del') numpadValue=numpadValue.slice(0,-1);
  else if (k==='.') { if(!numpadAllowDecimal||numpadValue.includes('.'))return; if(!numpadValue)numpadValue='0'; numpadValue+='.'; }
  else { if(numpadValue.length>=7)return; numpadValue+=k; }
  document.getElementById('numpad-display').textContent = numpadValue || '—';
}

function closeNumpad() { closeModal('modal-numpad'); }
function confirmNumpad() {
  const val = parseFloat(numpadValue);
  // Allow 0 for bodyweight exercises, just not NaN or negative
  if (!isNaN(val) && val >= 0 && numpadCallback) numpadCallback(val);
  closeModal('modal-numpad');
}

// ── MODALS ─────────────────────────────────────────────────

function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-backdrop').forEach(b => {
  b.addEventListener('click', e => { if(e.target===b) b.classList.remove('open'); });
});

// ── CARDIO ─────────────────────────────────────────────────

const CARDIO_TYPES = [
  { id: 'running',    label: 'Running',     icon: '🏃', hasDistance: true, hasTime: true  },
  { id: 'bjj',        label: 'BJJ',         icon: '🥋', hasDistance: false, hasTime: false },
  { id: 'muaythai',   label: 'Muay Thai',   icon: '🥊', hasDistance: false, hasTime: false },
  { id: 'boxing',     label: 'Boxing',      icon: '🤜', hasDistance: false, hasTime: false },
  { id: 'powertrack', label: 'Power Track', icon: '⚡', hasDistance: false, hasTime: false },
  { id: 'fasttrack',  label: 'Fast Track',  icon: '🚀', hasDistance: false, hasTime: false },
];

function getCardioSessions()   { return load('cardio', []); }
function saveCardioSessions(d) { save('cardio', d); }

let currentCardioType = null;
let cardioChartInstance = null;

function renderCardioScreen() {
  const sessions = getCardioSessions();
  const today = todayStr();

  // Type grid
  const grid = document.getElementById('cardio-type-grid');
  if (grid) {
    grid.innerHTML = CARDIO_TYPES.map(t => {
      const count = sessions.filter(s => s.type === t.id).length;
      const loggedToday = sessions.some(s => s.type === t.id && s.date === today);
      return `<div class="cardio-type-btn${loggedToday ? ' logged-today' : ''}" onclick="openCardioLog('${t.id}')">
        <div class="cardio-type-icon">${t.icon}</div>
        <div class="cardio-type-label">${t.label}</div>
        <div class="cardio-type-count">${count} total${loggedToday ? ' · ✓ today' : ''}</div>
      </div>`;
    }).join('');
  }

  renderCardioChart();
  renderCardioHistory();
}

function openCardioLog(typeId) {
  currentCardioType = CARDIO_TYPES.find(t => t.id === typeId);
  if (!currentCardioType) return;

  document.getElementById('cardio-modal-title').textContent = `LOG ${currentCardioType.label.toUpperCase()}`;

  // Show/hide relevant fields
  const runFields = document.getElementById('cardio-running-fields');
  const otherFields = document.getElementById('cardio-other-fields');
  if (currentCardioType.hasDistance) {
    show('cardio-running-fields'); hide('cardio-other-fields');
  } else {
    hide('cardio-running-fields'); show('cardio-other-fields');
  }

  // Reset fields
  ['cardio-distance','cardio-time','cardio-duration','cardio-notes'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('cardio-date').value = todayStr();

  openModal('modal-cardio-log');
}

function saveCardioSession() {
  if (!currentCardioType) return;
  const date = document.getElementById('cardio-date').value || todayStr();
  const notes = document.getElementById('cardio-notes').value.trim();

  const session = {
    id: uid(),
    date,
    type: currentCardioType.id,
    label: currentCardioType.label,
    icon: currentCardioType.icon,
    notes: notes || null,
  };

  if (currentCardioType.hasDistance) {
    const dist = parseFloat(document.getElementById('cardio-distance').value);
    const time = parseFloat(document.getElementById('cardio-time').value);
    if (dist > 0) session.distance = dist;
    if (time > 0) session.duration = time;
  } else {
    const dur = parseFloat(document.getElementById('cardio-duration').value);
    if (dur > 0) session.duration = dur;
  }

  const sessions = getCardioSessions();
  sessions.push(session);
  sessions.sort((a,b) => a.date.localeCompare(b.date));
  saveCardioSessions(sessions);

  closeModal('modal-cardio-log');
  renderCardioScreen();
}

function renderCardioHistory() {
  const period = document.getElementById('cardio-view-period')?.value || 'week';
  const all = getCardioSessions();
  const filtered = filterCardioByPeriod(all, period);
  const el = document.getElementById('cardio-history-list');
  if (!el) return;

  if (filtered.length === 0) {
    el.innerHTML = `<div class="empty-state" style="padding:30px;"><div class="empty-icon">🏃</div><div class="empty-title">No sessions yet</div></div>`;
    return;
  }

  // Group by date descending
  const byDate = {};
  [...filtered].reverse().forEach(s => {
    if (!byDate[s.date]) byDate[s.date] = [];
    byDate[s.date].push(s);
  });

  el.innerHTML = Object.entries(byDate).sort((a,b) => b[0].localeCompare(a[0])).map(([date, sessions]) => {
    const rows = sessions.map(s => {
      const details = [];
      if (s.distance) details.push(`${s.distance} mi`);
      if (s.duration) details.push(`${s.duration} min`);
      if (s.notes) details.push(s.notes);
      return `<div style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid var(--border);">
        <div style="font-size:24px;">${s.icon}</div>
        <div style="flex:1;">
          <div style="font-weight:600;font-size:15px;">${s.label}</div>
          ${details.length ? `<div style="font-size:13px;color:var(--text2);">${details.join(' · ')}</div>` : ''}
        </div>
        <div style="font-size:12px;color:var(--text3);cursor:pointer;" onclick="deleteCardioSession('${s.id}')">✕</div>
      </div>`;
    }).join('');
    return `<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);margin:0 16px 8px;overflow:hidden;">
      <div style="padding:8px 16px;background:var(--surface2);font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;color:var(--text2);letter-spacing:0.1em;text-transform:uppercase;">${formatDate(date)}</div>
      ${rows}
    </div>`;
  }).join('');
}

function deleteCardioSession(id) {
  if (!confirm('Delete this session?')) return;
  saveCardioSessions(getCardioSessions().filter(s => s.id !== id));
  renderCardioScreen();
}

function filterCardioByPeriod(sessions, period) {
  const now = new Date();
  const today = todayStr();
  if (period === 'all') return sessions;

  let start;
  if (period === 'week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    start = new Date(now.getFullYear(), now.getMonth(), diff);
  } else if (period === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === 'year') {
    start = new Date(now.getFullYear(), 0, 1);
  }

  const startStr = start.toISOString().slice(0,10);
  return sessions.filter(s => s.date >= startStr && s.date <= today);
}

function renderCardioChart() {
  const ctx = document.getElementById('cardio-chart');
  if (!ctx) return;
  if (cardioChartInstance) { cardioChartInstance.destroy(); cardioChartInstance = null; }

  const period = document.getElementById('cardio-view-period')?.value || 'week';
  const all = getCardioSessions();
  const filtered = filterCardioByPeriod(all, period);

  if (filtered.length === 0) return;

  // Count sessions per type
  const counts = {};
  CARDIO_TYPES.forEach(t => { counts[t.id] = 0; });
  filtered.forEach(s => { if (counts[s.type] !== undefined) counts[s.type]++; });

  const active = CARDIO_TYPES.filter(t => counts[t.id] > 0);
  const colors = ['#2563eb','#ea580c','#0891b2','#9333ea','#16a34a','#ca8a04'];

  cardioChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: active.map(t => t.label),
      datasets: [{
        data: active.map(t => counts[t.id]),
        backgroundColor: active.map((_, i) => colors[i % colors.length] + 'cc'),
        borderColor: active.map((_, i) => colors[i % colors.length]),
        borderWidth: 2,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor:'#ffffff', borderColor:'#d8d8d4', borderWidth:1, titleColor:'#2563eb', bodyColor:'#111111', padding:10 }
      },
      scales: {
        x: { ticks: { color:'#666', font:{ family:'Barlow Condensed', size:13, weight:'700' } }, grid:{ display:false } },
        y: { ticks: { color:'#666', font:{ family:'Barlow Condensed', size:13 }, stepSize:1 }, grid:{ color:'#ebebeb' }, beginAtZero:true }
      }
    }
  });
}

const GITHUB_OWNER = 'MaksymMuntyan';
const GITHUB_REPO  = 'lift-app';

function getGithubToken() { return localStorage.getItem('lift_githubToken') || ''; }

function saveGithubToken(token) {
  localStorage.setItem('lift_githubToken', token.trim());
  updateBackupStatus('Token saved.', 'var(--text2)');
}

function updateBackupStatus(msg, color) {
  const el = document.getElementById('github-backup-status');
  if (el) { el.textContent = msg; el.style.color = color || 'var(--text2)'; }
}

function renderGithubToken() {
  const el = document.getElementById('github-token-input');
  if (el) {
    const token = getGithubToken();
    el.value = token ? '••••••••••••••••' : '';
    if (token) updateBackupStatus('Token configured ✓', 'var(--green)');
  }
}

function buildBackupData(userNum) {
  const saved = currentUser;
  currentUser = userNum;
  const data = {
    version: 2, user: userNum,
    userName: USERS[userNum].name,
    exportDate: new Date().toISOString(),
    exercises:   getExercises(),
    routines:    getRoutines(),
    sessions:    getSessions(),
    bodyweights: getBodyweights(),
    cardio:      getCardioSessions()
  };
  currentUser = saved;
  return data;
}

async function pushBackupToGithub(userNum) {
  const token = getGithubToken();
  if (!token) return { ok: false, msg: 'No token configured' };

  const userName = USERS[userNum].name.toLowerCase();
  const filename = `backup-${userName}.json`;
  const content  = JSON.stringify(buildBackupData(userNum), null, 2);
  const encoded  = btoa(encodeURIComponent(content).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
  const apiUrl   = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filename}`;

  // Always fetch a fresh SHA immediately before writing — never use a cached value
  let sha = undefined;
  try {
    const check = await fetch(apiUrl + '?t=' + Date.now(), {
      headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    console.log(`SHA check for ${filename}: status ${check.status}`);
    if (check.ok) {
      const existing = await check.json();
      if (existing.sha) { sha = existing.sha; console.log(`Got SHA: ${sha.slice(0,8)}...`); }
    }
    // 404 = file doesn't exist yet, sha stays undefined — that's correct
  } catch(e) { console.log('SHA fetch error:', e.message); }

  const body = {
    message: `Auto backup ${USERS[userNum].name} ${new Date().toISOString().slice(0,10)}`,
    content: encoded
  };
  if (sha !== undefined) body.sha = sha;
  console.log(`Pushing ${filename}, sha included: ${sha !== undefined}`);

  const res = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (res.ok) return { ok: true };
  
  // If we get a conflict error, retry once with a fresh SHA
  if (res.status === 409 || res.status === 422) {
    try {
      const retry = await fetch(apiUrl + '?t=' + Date.now(), {
        headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
      });
      if (retry.ok) {
        const retryData = await retry.json();
        const retryBody = { ...body, sha: retryData.sha };
        const retryRes = await fetch(apiUrl, {
          method: 'PUT',
          headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
          body: JSON.stringify(retryBody)
        });
        if (retryRes.ok) return { ok: true };
      }
    } catch(e) {}
  }

  const err = await res.json().catch(() => ({}));
  return { ok: false, msg: err.message || `GitHub error ${res.status}` };
}

async function autoBackup() {
  // Called silently after every workout — backs up current user only
  const token = getGithubToken();
  if (!token) return;
  try {
    const result = await pushBackupToGithub(currentUser);
    if (result.ok) console.log(`✓ Auto backup complete for ${USERS[currentUser].name}`);
    else console.warn('Auto backup failed:', result.msg);
  } catch(e) { console.warn('Auto backup error:', e); }
}

async function runManualBackup() {
  const token = getGithubToken();
  if (!token) { updateBackupStatus('No token saved yet. Enter your token first.', 'var(--red)'); return; }
  updateBackupStatus('Backing up...', 'var(--text2)');
  try {
    // Sequential — not parallel — avoids SHA race conditions
    const r1 = await pushBackupToGithub(1);
    const r2 = await pushBackupToGithub(2);
    if (r1.ok && r2.ok) {
      updateBackupStatus('✓ Max and Laura both backed up to GitHub!', 'var(--green)');
    } else {
      const msg = (!r1.ok ? `Max: ${r1.msg} ` : '') + (!r2.ok ? `Laura: ${r2.msg}` : '');
      updateBackupStatus('✗ ' + msg.trim(), 'var(--red)');
    }
  } catch(e) { updateBackupStatus('✗ Error: ' + e.message, 'var(--red)'); }
}

async function restoreFromGithub() {
  if (!confirm('Restore from GitHub? This will overwrite ALL current data for both Max and Laura.')) return;

  updateBackupStatus('Restoring...', 'var(--text2)');

  let restored = 0;
  const errors = [];

  for (const userNum of [1, 2]) {
    const userName = USERS[userNum].name.toLowerCase();
    // Use raw URL — no token needed since repo is public
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/backup-${userName}.json`;

    try {
      const res = await fetch(rawUrl);

      if (!res.ok) {
        if (res.status === 404) errors.push(`${USERS[userNum].name}: no backup found yet — run a backup first`);
        else errors.push(`${USERS[userNum].name}: error ${res.status}`);
        continue;
      }

      const json = await res.json();

      const savedUser = currentUser;
      currentUser = userNum;
      if (json.exercises)   saveExercises(json.exercises);
      if (json.routines)    saveRoutines(json.routines);
      if (json.sessions)    saveSessions(json.sessions);
      if (json.bodyweights) saveBodyweights(json.bodyweights);
      if (json.cardio)      saveCardioSessions(json.cardio);
      currentUser = savedUser;

      restored++;
    } catch(e) {
      errors.push(`${USERS[userNum].name}: ${e.message}`);
    }
  }

  if (restored === 2) {
    updateBackupStatus('✓ Both Max and Laura restored! Reloading...', 'var(--green)');
    setTimeout(() => location.reload(), 1500);
  } else if (restored === 1) {
    updateBackupStatus(`✓ Partial restore. ${errors.join(', ')}`, 'var(--accent2)');
    setTimeout(() => location.reload(), 2000);
  } else {
    updateBackupStatus('✗ Restore failed: ' + errors.join(', '), 'var(--red)');
  }
}

async function testGithubBackup() {
  const token = getGithubToken();
  if (!token) { updateBackupStatus('No token saved yet. Enter your token first.', 'var(--red)'); return; }
  updateBackupStatus('Testing...', 'var(--text2)');
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`, {
      headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    if (res.ok) {
      updateBackupStatus('✓ Token works! Tap "Back Up Now" to run a full backup.', 'var(--green)');
    } else if (res.status === 401) {
      updateBackupStatus('✗ Token invalid or expired. Generate a new one.', 'var(--red)');
    } else if (res.status === 404) {
      updateBackupStatus('✗ Repo not found — make sure it\'s named lift-app.', 'var(--red)');
    } else {
      updateBackupStatus(`✗ GitHub returned ${res.status}.`, 'var(--red)');
    }
  } catch(e) { updateBackupStatus('✗ Network error: ' + e.message, 'var(--red)'); }
}

function exportData() {
  const data = { version:2, user:currentUser, exportDate:new Date().toISOString(),
    exercises:getExercises(), routines:getRoutines(), sessions:getSessions(),
    bodyweights:getBodyweights(), cardio:getCardioSessions() };
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a = Object.assign(document.createElement('a'),{href:URL.createObjectURL(blob),download:`lift-backup-u${currentUser}-${todayStr()}.json`});
  a.click(); URL.revokeObjectURL(a.href);
}

function importData(e) {
  const file=e.target.files[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    try {
      const data=JSON.parse(ev.target.result);
      if(!confirm(`Import data? This will overwrite all current data for User ${currentUser}.`))return;
      if(data.exercises)saveExercises(data.exercises);
      if(data.routines)saveRoutines(data.routines);
      if(data.sessions)saveSessions(data.sessions);
      if(data.bodyweights)saveBodyweights(data.bodyweights);
      if(data.cardio)saveCardioSessions(data.cardio);
      renderAll(); alert('Import successful!');
    } catch { alert('Invalid file.'); }
  };
  reader.readAsText(file); e.target.value='';
}

// ── UTILS ──────────────────────────────────────────────────

function forceUpdate() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(r => r.unregister());
    }).then(() => {
      location.reload(true);
    });
  } else {
    location.reload(true);
  }
}
function hide(id) { document.getElementById(id).classList.add('hidden'); }
function show(id) { document.getElementById(id).classList.remove('hidden'); }

function todayStr() {
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatDate(str) {
  if(!str)return'';
  const[y,m,d]=str.split('-');
  return['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m)-1]+' '+parseInt(d);
}
function esc(str){return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

if('serviceWorker'in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));}