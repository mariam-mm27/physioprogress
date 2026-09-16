/**
 * seedMockData.js
 *
 * Generates mock ExercisePlan + SessionLog data for one therapist/patient
 * pair, using the app's own Mongoose models — so it goes through the same
 * validation as the real API (painLevel 1-10, videoSource enum, required
 * fields, etc.).
 *
 * WHERE TO PUT THIS FILE:
 *   backend/scripts/seedMockData.js
 *   (it requires "../models/..." and "../.env" relative to that location —
 *   see the require/dotenv lines below)
 *
 * HOW TO RUN (from the backend/ folder, or repo root — either works since
 * app.js already loads backend/.env and root .env the same way):
 *   node backend/scripts/seedMockData.js
 *
 * It reads MONGODB_URI from your existing .env, exactly like backend/config/db.js.
 *
 * WHAT IT DOES:
 *   1. Deletes any ExercisePlan/SessionLog documents already linked to this
 *      therapistId + patientId pair (so the script is safe to re-run without
 *      piling up duplicates). Comment out `cleanExisting()` below if you'd
 *      rather keep old data and just append more.
 *   2. Inserts 5 ExercisePlan documents (a realistic post-op knee rehab set).
 *   3. Inserts ~60 SessionLog documents spread across the last 60 days,
 *      referencing those plans, with painLevel trending down over time
 *      (recovering patient) and ~90% completed=true.
 *   4. Prints a summary so you can sanity-check the numbers against what
 *      AnalyticsController will compute.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const ExercisePlan = require('../models/ExercisePlan');
const SessionLog = require('../models/SessionLog');

// ---- EDIT THESE TWO IDS IF YOU NEED A DIFFERENT PAIR ----
const THERAPIST_ID = '6aaae26527b39b152f00e823';
const PATIENT_ID = '6aaae36ab061f43acb3535a2';

const NUM_DAYS = 60;
const TARGET_LOG_COUNT = 60;

// ---------- plan templates ----------
// videoUrl values are placeholders — the real ExerciseDB base URL lives in
// process.env.EXERCISE_DB_BASE_URL and isn't something this script knows.
const PLAN_TEMPLATES = [
  {
    title: 'Post-Op Knee Rehab — Phase 1',
    exerciseName: 'Terminal Knee Extensions',
    reps: 15,
    frequencyPerWeek: 3,
    targetMuscle: 'Quadriceps (VMO)',
    videoSource: 'api',
    videoUrl: 'https://exercisedb.example.com/exercises/terminal-knee-extension',
  },
  {
    title: 'Post-Op Knee Rehab — Phase 1',
    exerciseName: 'Single-Leg Isometric Wall Sit',
    reps: 4,
    frequencyPerWeek: 3,
    targetMuscle: 'Patellar Tendon',
    customMuscle: 'Quadriceps tendon / patellar tendon complex',
    videoSource: 'custom',
    videoUrl: 'https://videos.physioprogress.example.com/wall-sit-demo.mp4',
  },
  {
    title: 'Post-Op Knee Rehab — Phase 2',
    exerciseName: 'Eccentric Hamstring Slider Curls',
    reps: 10,
    frequencyPerWeek: 2,
    targetMuscle: 'Hamstrings & Glutes',
    videoSource: 'api',
    videoUrl: 'https://exercisedb.example.com/exercises/hamstring-slider-curl',
  },
  {
    title: 'Post-Op Knee Rehab — Phase 2',
    exerciseName: 'Standing Closed-Chain Calf Raises',
    reps: 20,
    frequencyPerWeek: 4,
    targetMuscle: 'Gastrocnemius',
    videoSource: 'api',
    videoUrl: 'https://exercisedb.example.com/exercises/standing-calf-raise',
  },
  {
    title: 'Post-Op Knee Rehab — Phase 2',
    exerciseName: 'Supine Straight Leg Raises',
    reps: 12,
    frequencyPerWeek: 3,
    targetMuscle: 'Hip Flexors & Core',
    videoSource: 'custom',
    videoUrl: 'https://videos.physioprogress.example.com/straight-leg-raise.mp4',
  },
];

// Notes pooled by rough pain band, so text stays consistent with the number.
const NOTES_BY_BAND = {
  low: [
    'No discomfort noted. Movement felt controlled and stable.',
    'Smooth range of motion, no compensatory movement observed.',
    'Felt strong throughout, minimal fatigue by the last set.',
    'Very manageable today, ready to consider progressing load.',
  ],
  mid: [
    'Some fatigue and mild soreness during the final reps.',
    'Slight stiffness at the start, loosened up after warmup.',
    'Noticeable pull but nothing sharp; stopped at prescribed reps.',
    'Moderate effort required, slower tempo than last session.',
  ],
  high: [
    'Sharp discomfort partway through; shortened the final set.',
    'Significant soreness carried over from yesterday.',
    'Had to reduce range of motion due to pain.',
    'Session was difficult; will mention this to my therapist.',
  ],
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function weightedPlanIndex(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    if (r < weights[i]) return i;
    r -= weights[i];
  }
  return weights.length - 1;
}

function painBand(level) {
  if (level <= 3) return 'low';
  if (level <= 6) return 'mid';
  return 'high';
}

async function cleanExisting() {
  const planFilter = { therapistId: THERAPIST_ID, patientId: PATIENT_ID };
  const existingPlans = await ExercisePlan.find(planFilter).select('_id');
  const planIds = existingPlans.map((p) => p._id);

  const logFilter = { patientId: PATIENT_ID };
  if (planIds.length) logFilter.planId = { $in: planIds };

  const deletedLogs = await SessionLog.deleteMany(logFilter);
  const deletedPlans = await ExercisePlan.deleteMany(planFilter);

  console.log(
    `Cleaned up ${deletedPlans.deletedCount} existing plan(s) and ${deletedLogs.deletedCount} existing log(s) for this pair.`
  );
}

async function seedPlans() {
  const docs = PLAN_TEMPLATES.map((tpl) => ({
    ...tpl,
    therapistId: THERAPIST_ID,
    patientId: PATIENT_ID,
  }));
  const created = await ExercisePlan.insertMany(docs);
  console.log(`Inserted ${created.length} exercise plan(s).`);
  return created;
}

async function seedLogs(plans) {
  const weights = plans.map((p) => p.frequencyPerWeek);
  const now = new Date();
  const logs = [];

  for (let i = 0; i < TARGET_LOG_COUNT; i++) {
    // Spread logs across the window, oldest first, with slight jitter so
    // timestamps aren't perfectly evenly spaced.
    const dayOffset = Math.floor((i / TARGET_LOG_COUNT) * NUM_DAYS) + randomInt(0, 1);
    const loggedAt = new Date(now);
    loggedAt.setDate(loggedAt.getDate() - (NUM_DAYS - dayOffset));
    loggedAt.setHours(randomInt(7, 19), randomInt(0, 59), 0, 0);

    // Pain trends down over the window (recovering patient) with noise,
    // clamped to the schema's 1-10 range.
    const progress = dayOffset / NUM_DAYS; // 0 (start) -> 1 (today)
    const baseline = 7 - progress * 5; // ~7 down to ~2
    const noisy = baseline + (Math.random() * 2 - 1);
    const painLevel = Math.max(1, Math.min(10, Math.round(noisy)));

    const plan = plans[weightedPlanIndex(weights)];
    const completed = Math.random() < 0.9; // ~90% completed
    const notes = pick(NOTES_BY_BAND[painBand(painLevel)]);

    logs.push({
      patientId: PATIENT_ID,
      planId: plan._id,
      completed,
      painLevel,
      notes,
      loggedAt,
    });
  }

  logs.sort((a, b) => a.loggedAt - b.loggedAt);
  const created = await SessionLog.insertMany(logs);
  console.log(`Inserted ${created.length} session log(s) spread over the last ${NUM_DAYS} days.`);
  return created;
}

function printSummary(plans, logs) {
  const avgPain = logs.reduce((a, l) => a + l.painLevel, 0) / logs.length;
  const completedCount = logs.filter((l) => l.completed).length;
  const totalFrequencyPerWeek = plans.reduce((a, p) => a + p.frequencyPerWeek, 0);
  const expectedOver60Days = (totalFrequencyPerWeek * NUM_DAYS) / 7;

  console.log('\n--- Summary ---');
  console.log(`Plans: ${plans.length}, combined frequencyPerWeek: ${totalFrequencyPerWeek}/week`);
  console.log(`Logs: ${logs.length} (${completedCount} completed, ${logs.length - completedCount} not)`);
  console.log(`Average painLevel: ${avgPain.toFixed(2)} / 10`);
  console.log(
    `Expected sessions over ${NUM_DAYS} days (per AnalyticsController's formula): ~${expectedOver60Days.toFixed(1)}`
  );
  console.log(
    `Rough adherence over ${NUM_DAYS} days if all ${logs.length} logs were "completed": ~${(
      (logs.length / expectedOver60Days) *
      100
    ).toFixed(0)}% (actual completedSessions will be a bit lower — see completedCount above)`
  );
  console.log('----------------\n');
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set — check your .env file.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected to ${mongoose.connection.name}`);

  await cleanExisting();
  const plans = await seedPlans();
  const logs = await seedLogs(plans);
  printSummary(plans, logs);

  await mongoose.disconnect();
  console.log('Done. Disconnected.');
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});