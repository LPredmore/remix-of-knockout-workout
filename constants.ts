import { Equipment, MuscleGroup, StockRoutine } from './types';

// Mock IDs for exercises to ensure consistency
export const EXERCISE_IDS = {
  PUSH_UP: 'ex_pushup',
  SQUAT_BW: 'ex_squat_bw',
  DUMBBELL_PRESS: 'ex_db_press',
  DUMBBELL_ROW: 'ex_db_row',
  PLANK: 'ex_plank',
};

export const MOCK_EXERCISES = [
  { id: EXERCISE_IDS.PUSH_UP, name: 'Push Up', muscle_group: MuscleGroup.Chest, equipment: Equipment.BodyWeight, is_curated: true },
  { id: EXERCISE_IDS.SQUAT_BW, name: 'Air Squat', muscle_group: MuscleGroup.Legs, equipment: Equipment.BodyWeight, is_curated: true },
  { id: EXERCISE_IDS.PLANK, name: 'Plank', muscle_group: MuscleGroup.Abs, equipment: Equipment.BodyWeight, is_curated: true },
  { id: EXERCISE_IDS.DUMBBELL_PRESS, name: 'Dumbbell Bench Press', muscle_group: MuscleGroup.Chest, equipment: Equipment.Dumbbells, is_curated: true },
  { id: EXERCISE_IDS.DUMBBELL_ROW, name: 'Dumbbell Row', muscle_group: MuscleGroup.Back, equipment: Equipment.Dumbbells, is_curated: true },
];

export const STOCK_ROUTINES: StockRoutine[] = [
  {
    id: 'stock_bw',
    equipment: Equipment.BodyWeight,
    name: 'Bodyweight Basics',
    days: [
      { title: 'Push Day', muscle_group: MuscleGroup.Chest, exercise_id: EXERCISE_IDS.PUSH_UP, planned_sets: 3, sort_order: 1 },
      { title: 'Leg Day', muscle_group: MuscleGroup.Legs, exercise_id: EXERCISE_IDS.SQUAT_BW, planned_sets: 4, sort_order: 2 },
      { title: 'Core Day', muscle_group: MuscleGroup.Abs, exercise_id: EXERCISE_IDS.PLANK, planned_sets: 3, sort_order: 3 },
    ]
  },
  {
    id: 'stock_db',
    equipment: Equipment.Dumbbells,
    name: 'Dumbbell Domination',
    days: [
      { title: 'Chest Press', muscle_group: MuscleGroup.Chest, exercise_id: EXERCISE_IDS.DUMBBELL_PRESS, planned_sets: 3, sort_order: 1 },
      { title: 'Back Row', muscle_group: MuscleGroup.Back, exercise_id: EXERCISE_IDS.DUMBBELL_ROW, planned_sets: 3, sort_order: 2 },
    ]
  }
];

export const EQUIPMENT_LIST = Object.values(Equipment);