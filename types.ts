export enum MuscleGroup {
  Chest = 'Chest',
  Back = 'Back',
  Abs = 'Abs',
  Shoulders = 'Shoulders',
  Biceps = 'Biceps',
  Triceps = 'Triceps',
  Legs = 'Legs',
  Calves = 'Calves',
}

export enum Equipment {
  BodyWeight = 'BodyWeight',
  Dumbbells = 'Dumbbells',
  Barbells = 'Barbells',
  Cable = 'Cable',
  Bands = 'Bands',
  Kettlebell = 'Kettlebell',
}

export enum SessionStatus {
  InProgress = 'in_progress',
  Completed = 'completed',
}

export interface UserProfile {
  id: string;
  email: string;
  rep_min: number;
  rep_max: number;
  onboarding_completed_at: string | null;
  active_routine_id: string | null;
}

export interface Exercise {
  id: string;
  name: string;
  muscle_group: MuscleGroup;
  equipment: Equipment;
  is_curated: boolean;
  created_by?: string;
  is_favorite?: boolean; // UI helper
}

export interface RoutineDay {
  id: string;
  routine_id: string;
  title: string;
  muscle_group: MuscleGroup;
  exercise_id: string;
  planned_sets: number;
  sort_order: number;
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  days: RoutineDay[];
}

export interface SessionSet {
  id: string;
  session_id: string;
  set_number: number;
  reps: number | '';
  weight_lbs: number | '' | null; // Null if BodyWeight
  completed: boolean;
}

export interface Session {
  id: string;
  user_id: string;
  exercise_id: string;
  status: SessionStatus;
  started_at: string;
  completed_at: string | null;
  planned_sets: number;
  sets: SessionSet[];
  target_rep_min: number;
  target_rep_max: number;
}

// For Onboarding Logic
export interface StockRoutine {
  id: string;
  equipment: Equipment;
  name: string;
  days: Omit<RoutineDay, 'id' | 'routine_id'>[];
}