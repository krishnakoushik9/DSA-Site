import { differenceInDays } from 'date-fns';

export const WORKOUT_START_DATE = new Date('2026-03-04T00:00:00');

export interface WorkoutExercise {
    name: string;
    sets: string;
    reps: string;
    notes?: string;
}

export interface WorkoutPlan {
    title: string;
    phase: string;
    isRest: boolean;
    exercises: WorkoutExercise[];
}

export function isWorkoutActive(date: Date): boolean {
    return differenceInDays(date, WORKOUT_START_DATE) >= 0;
}

export function getWorkoutForDate(date: Date): WorkoutPlan | null {
    if (!isWorkoutActive(date)) return null;

    const daysPassed = differenceInDays(date, WORKOUT_START_DATE);
    const totalWeeks = Math.floor(daysPassed / 7);
    const dayOfCycle = daysPassed % 7; // 0 to 6

    // Max 6 months ~ 26 weeks. If more, keep at max phase
    const weekIndex = Math.min(totalWeeks, 25);

    // Progression Phases
    let phase = "";
    let intensityMultiplier = 1;
    let pushupVariant = "Standard Push-ups";
    let pullVariant = "Dumbbell Rows (1-9kg)";
    let squatVariant = "Bodyweight Squats";
    let coreVariant = "Planks";

    if (weekIndex < 4) {
        phase = "Phase 1: Foundation (Weeks 1-4)";
        intensityMultiplier = 1;
    } else if (weekIndex < 8) {
        phase = "Phase 2: Hypertrophy & Stress (Weeks 5-8)";
        intensityMultiplier = 1.2;
        pushupVariant = "Decline/Diamond Push-ups";
        squatVariant = "Jump Squats & DB Goblet Squats";
        coreVariant = "Hollow Body Holds";
    } else if (weekIndex < 16) {
        phase = "Phase 3: Calisthenics Intro (Weeks 9-16)";
        intensityMultiplier = 1.5;
        pushupVariant = "Archer Push-ups & Pike Push-ups";
        pullVariant = "Commando Pull-ups / Heavy DB Rows";
        squatVariant = "Pistol Squat Progressions";
        coreVariant = "L-Sit Progressions";
    } else {
        phase = "Phase 4: Advanced Calisthenics Growth (Weeks 17-26)";
        intensityMultiplier = 2;
        pushupVariant = "Pseudo Planche Push-ups & HSPU Progressions";
        pullVariant = "Front Lever Tucks / Max DB Rows";
        squatVariant = "Weighted Pistol Squats (1-9kg DB)";
        coreVariant = "Full L-Sit / Dragon Flag Negatives";
    }

    const calcReps = (baseReps: string) => {
        if (baseReps.includes('-')) {
            const [min, max] = baseReps.split('-').map(Number);
            return `${Math.floor(min * intensityMultiplier)}-${Math.floor(max * intensityMultiplier)}`;
        }
        if (baseReps.includes('s')) {
            const secs = parseInt(baseReps);
            return `${Math.floor(secs * intensityMultiplier)}s`;
        }
        return `${Math.floor(Number(baseReps) * intensityMultiplier)}`;
    };

    if (dayOfCycle === 6) {
        return {
            title: "Rest / Active Recovery",
            phase,
            isRest: true,
            exercises: [
                { name: "Light Stretching", sets: "1", reps: "15m", notes: "Focus on mobility" },
                { name: "Shoulder Dislocations (Towel)", sets: "3", reps: "10" }
            ]
        };
    }

    const plan: WorkoutPlan = {
        title: "",
        phase,
        isRest: false,
        exercises: []
    };

    switch (dayOfCycle) {
        case 0:
            plan.title = "Upper Body (Push & Pull)";
            plan.exercises = [
                { name: pushupVariant, sets: "4", reps: calcReps("8-12"), notes: "Slow eccentric, max tension" },
                { name: pullVariant, sets: "4", reps: calcReps("10-15"), notes: "Squeeze back at the top" },
                { name: "DB Lateral Raises (1-9kg)", sets: "3", reps: calcReps("12-15") },
                { name: "DB Bicep Curls (1-9kg)", sets: "3", reps: calcReps("10-12") },
                { name: "Overhead DB Triceps Press", sets: "3", reps: calcReps("10-15") },
            ];
            break;
        case 1:
            plan.title = "Lower Body Strict";
            plan.exercises = [
                { name: squatVariant, sets: "4", reps: calcReps("10-15"), notes: "Explosive concentric phase" },
                { name: "DB Romanian Deadlifts (1-9kg)", sets: "4", reps: calcReps("12-15"), notes: "Feel hamstring stretch" },
                { name: "Lunges or Bulgarian Split Squats", sets: "3", reps: calcReps("8-12"), notes: "Per leg" },
                { name: "Calf Raises (Bodyweight/DB)", sets: "4", reps: calcReps("20-25") }
            ];
            break;
        case 2:
            plan.title = "Core & Conditioning";
            plan.exercises = [
                { name: coreVariant, sets: "4", reps: calcReps("45s"), notes: "Keep core absolutely tight" },
                { name: "Russian Twists with DB", sets: "3", reps: calcReps("20") },
                { name: "Burpees", sets: "4", reps: calcReps("10-15"), notes: "High intensity, minimum rest" },
                { name: "Mountain Climbers", sets: "3", reps: calcReps("45s") }
            ];
            break;
        case 3:
            plan.title = "Upper Body (Calisthenics Focus)";
            plan.exercises = [
                { name: "Handstand Wall Holds / Pike Pushups", sets: "4", reps: calcReps("45s"), notes: "Focus on shoulder strength" },
                { name: "Wide Grip Pushups", sets: "3", reps: calcReps("10-15") },
                { name: "DB Floor Press or Pushup variations", sets: "3", reps: calcReps("12-15") },
                { name: "DB Concentration Curls", sets: "3", reps: calcReps("10"), notes: "Strict form" },
                { name: "Tricep Dips (Chair/Bench)", sets: "4", reps: calcReps("12-15") }
            ];
            break;
        case 4:
            plan.title = "Lower Body Plyometrics & DB";
            plan.exercises = [
                { name: "Jump Lunges", sets: "4", reps: calcReps("12-16"), notes: "Keep balance" },
                { name: "DB Goblet Squats (1-9kg string/heavy)", sets: "4", reps: calcReps("12-15") },
                { name: "Glute Bridges (Single leg/DB)", sets: "3", reps: calcReps("15") },
                { name: "Wall Sit", sets: "3", reps: calcReps("45s") }
            ];
            break;
        case 5:
            plan.title = "Full Body Muscle Growth Annihilation";
            plan.exercises = [
                { name: `Super-set: ${pushupVariant} & ${squatVariant}`, sets: "4", reps: calcReps("10-12"), notes: "No rest between exercises" },
                { name: `Super-set: ${pullVariant} & Lunges`, sets: "4", reps: calcReps("10-12") },
                { name: "DB Thrusters (Squat to Press)", sets: "3", reps: calcReps("12-15") },
                { name: coreVariant, sets: "3", reps: "Failure", notes: "Go until failure" }
            ];
            break;
    }

    return plan;
}
