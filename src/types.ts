/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: "Chest" | "Back" | "Shoulders" | "Biceps" | "Triceps" | "Legs" | "Core" | "Cardio";
  equipment: string;
  difficulty: "beginner" | "intermediate";
}

export interface SetLog {
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  sets: SetLog[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  durationMinutes: number;
  exercises: WorkoutExercise[];
  timestamp: number;
}

export interface ProfileSettings {
  restTimerDefault: number; // e.g., 90
  weightUnit: "kg" | "lbs";
  theme: "dark" | "light";
}

export interface BodyWeightLog {
  date: string; // YYYY-MM-DD
  weightKg: number;
}

export interface BodyMeasurementsLog {
  date: string; // YYYY-MM-DD
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  leftArmCm?: number;
  rightArmCm?: number;
  leftThighCm?: number;
  rightThighCm?: number;
}

export interface WeeklyPlan {
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
}

export const INITIAL_EXERCISES: Exercise[] = [
  // CHEST (8)
  { id: "bench_press", name: "Bench Press", muscleGroup: "Chest", equipment: "Barbell", difficulty: "beginner" },
  { id: "incline_db_press", name: "Incline Dumbbell Press", muscleGroup: "Chest", equipment: "Dumbbells", difficulty: "beginner" },
  { id: "push_ups", name: "Push-ups", muscleGroup: "Chest", equipment: "Bodyweight", difficulty: "beginner" },
  { id: "cable_fly", name: "Cable Fly", muscleGroup: "Chest", equipment: "Cables", difficulty: "intermediate" },
  { id: "chest_press_machine", name: "Chest Press Machine", muscleGroup: "Chest", equipment: "Machine", difficulty: "beginner" },
  { id: "dumbbell_fly", name: "Dumbbell Fly", muscleGroup: "Chest", equipment: "Dumbbells", difficulty: "intermediate" },
  { id: "pec_deck", name: "Pec Deck Fly", muscleGroup: "Chest", equipment: "Machine", difficulty: "beginner" },
  { id: "decline_press", name: "Decline Bench Press", muscleGroup: "Chest", equipment: "Barbell", difficulty: "intermediate" },

  // BACK (8)
  { id: "lat_pulldown", name: "Lat Pulldown", muscleGroup: "Back", equipment: "Machine", difficulty: "beginner" },
  { id: "seated_cable_row", name: "Seated Cable Row", muscleGroup: "Back", equipment: "Cables", difficulty: "beginner" },
  { id: "dumbbell_row", name: "Dumbbell Row", muscleGroup: "Back", equipment: "Dumbbells", difficulty: "beginner" },
  { id: "deadlift", name: "Deadlift", muscleGroup: "Back", equipment: "Barbell", difficulty: "intermediate" },
  { id: "pull_ups", name: "Pull-ups", muscleGroup: "Back", equipment: "Bodyweight", difficulty: "intermediate" },
  { id: "chin_ups", name: "Chin-ups", muscleGroup: "Back", equipment: "Bodyweight", difficulty: "beginner" },
  { id: "t_bar_row", name: "T-Bar Row", muscleGroup: "Back", equipment: "Barbell", difficulty: "intermediate" },
  { id: "hyperextensions", name: "Back Hyperextensions", muscleGroup: "Back", equipment: "Bodyweight", difficulty: "beginner" },

  // SHOULDERS (8)
  { id: "overhead_press", name: "Overhead Press", muscleGroup: "Shoulders", equipment: "Barbell", difficulty: "intermediate" },
  { id: "lateral_raises", name: "Lateral Raises", muscleGroup: "Shoulders", equipment: "Dumbbells", difficulty: "beginner" },
  { id: "face_pulls", name: "Face Pulls", muscleGroup: "Shoulders", equipment: "Cables", difficulty: "beginner" },
  { id: "front_raises", name: "Front Raises", muscleGroup: "Shoulders", equipment: "Dumbbells", difficulty: "beginner" },
  { id: "arnold_press", name: "Arnold Press", muscleGroup: "Shoulders", equipment: "Dumbbells", difficulty: "intermediate" },
  { id: "shrugs", name: "Dumbbell Shrugs", muscleGroup: "Shoulders", equipment: "Dumbbells", difficulty: "beginner" },
  { id: "rear_delt_fly", name: "Dumbbell Rear Delt Fly", muscleGroup: "Shoulders", equipment: "Dumbbells", difficulty: "intermediate" },
  { id: "reverse_pec_deck", name: "Reverse Pec Deck Fly", muscleGroup: "Shoulders", equipment: "Machine", difficulty: "beginner" },

  // BICEPS (8)
  { id: "barbell_curl", name: "Barbell Curl", muscleGroup: "Biceps", equipment: "Barbell", difficulty: "beginner" },
  { id: "hammer_curl", name: "Hammer Curl", muscleGroup: "Biceps", equipment: "Dumbbells", difficulty: "beginner" },
  { id: "incline_db_curl", name: "Incline Dumbbell Curl", muscleGroup: "Biceps", equipment: "Dumbbells", difficulty: "intermediate" },
  { id: "cable_curl", name: "Cable Curl", muscleGroup: "Biceps", equipment: "Cables", difficulty: "beginner" },
  { id: "preacher_curl", name: "Preacher Curl", muscleGroup: "Biceps", equipment: "Barbell", difficulty: "intermediate" },
  { id: "concentration_curl", name: "Concentration Curl", muscleGroup: "Biceps", equipment: "Dumbbells", difficulty: "beginner" },
  { id: "ez_bar_curl", name: "EZ Bar Curl", muscleGroup: "Biceps", equipment: "Barbell", difficulty: "beginner" },
  { id: "chin_up_bicep", name: "Underhand Chin-up", muscleGroup: "Biceps", equipment: "Bodyweight", difficulty: "intermediate" },

  // TRICEPS (8)
  { id: "tricep_pushdown", name: "Tricep Pushdown", muscleGroup: "Triceps", equipment: "Cables", difficulty: "beginner" },
  { id: "skull_crushers", name: "Skull Crushers", muscleGroup: "Triceps", equipment: "Barbell", difficulty: "intermediate" },
  { id: "overhead_extension", name: "Overhead Tricep Extension", muscleGroup: "Triceps", equipment: "Dumbbells", difficulty: "beginner" },
  { id: "bench_dips", name: "Bench Dips", muscleGroup: "Triceps", equipment: "Bodyweight", difficulty: "beginner" },
  { id: "close_grip_press", name: "Close-Grip Bench Press", muscleGroup: "Triceps", equipment: "Barbell", difficulty: "intermediate" },
  { id: "kickbacks", name: "Tricep Kickbacks", muscleGroup: "Triceps", equipment: "Dumbbells", difficulty: "beginner" },
  { id: "rope_pushdown", name: "Rope Pushdown", muscleGroup: "Triceps", equipment: "Cables", difficulty: "beginner" },
  { id: "diamond_pushups", name: "Diamond Push-ups", muscleGroup: "Triceps", equipment: "Bodyweight", difficulty: "intermediate" },

  // LEGS (11)
  { id: "squat", name: "Barbell Squat", muscleGroup: "Legs", equipment: "Barbell", difficulty: "intermediate" },
  { id: "leg_press", name: "Leg Press", muscleGroup: "Legs", equipment: "Machine", difficulty: "beginner" },
  { id: "romanian_deadlift", name: "Romanian Deadlift", muscleGroup: "Legs", equipment: "Barbell", difficulty: "intermediate" },
  { id: "leg_curl", name: "Seated Leg Curl", muscleGroup: "Legs", equipment: "Machine", difficulty: "beginner" },
  { id: "leg_extension", name: "Leg Extension", muscleGroup: "Legs", equipment: "Machine", difficulty: "beginner" },
  { id: "hip_thrust", name: "Hip Thrust", muscleGroup: "Legs", equipment: "Barbell", difficulty: "intermediate" },
  { id: "goblet_squat", name: "Goblet Squat", muscleGroup: "Legs", equipment: "Dumbbells", difficulty: "beginner" },
  { id: "lunges", name: "Walking Lunges", muscleGroup: "Legs", equipment: "Dumbbells", difficulty: "beginner" },
  { id: "calf_raises", name: "Standing Calf Raises", muscleGroup: "Legs", equipment: "Machine", difficulty: "beginner" },
  { id: "glute_kickback", name: "Cable Glute Kickbacks", muscleGroup: "Legs", equipment: "Cables", difficulty: "beginner" },
  { id: "bulgarian_split_squat", name: "Bulgarian Split Squat", muscleGroup: "Legs", equipment: "Dumbbells", difficulty: "intermediate" },

  // CORE (7)
  { id: "plank", name: "Plank", muscleGroup: "Core", equipment: "Bodyweight", difficulty: "beginner" },
  { id: "crunch", name: "Abdominal Crunch", muscleGroup: "Core", equipment: "Bodyweight", difficulty: "beginner" },
  { id: "hanging_knee_raise", name: "Hanging Knee Raise", muscleGroup: "Core", equipment: "Bodyweight", difficulty: "beginner" },
  { id: "russian_twist", name: "Russian Twist", muscleGroup: "Core", equipment: "Dumbbells", difficulty: "beginner" },
  { id: "leg_raises", name: "Lying Leg Raises", muscleGroup: "Core", equipment: "Bodyweight", difficulty: "beginner" },
  { id: "cable_woodchop", name: "Cable Woodchop", muscleGroup: "Core", equipment: "Cables", difficulty: "intermediate" },
  { id: "ab_wheel", name: "Ab Wheel Rollout", muscleGroup: "Core", equipment: "Bodyweight", difficulty: "intermediate" },

  // CARDIO (5)
  { id: "treadmill", name: "Treadmill Running", muscleGroup: "Cardio", equipment: "Machine", difficulty: "beginner" },
  { id: "cycling", name: "Stationary Cycling", muscleGroup: "Cardio", equipment: "Machine", difficulty: "beginner" },
  { id: "stairmaster", name: "Stairmaster Clamber", muscleGroup: "Cardio", equipment: "Machine", difficulty: "beginner" },
  { id: "elliptical", name: "Elliptical Trainer", muscleGroup: "Cardio", equipment: "Machine", difficulty: "beginner" },
  { id: "rowing_machine", name: "Rowing Machine Sprints", muscleGroup: "Cardio", equipment: "Machine", difficulty: "intermediate" }
];
