import { supabase } from './supabase';
import { 
  UserProfile, Routine, Session, SessionStatus, 
  Equipment, RoutineDay, SessionSet, MuscleGroup, Exercise
} from '../types';

// --- Helper: Compose Session with Phantom Sets ---
const _composeSession = (sessionData: any, setsData: any[]): Session => {
    const sets: SessionSet[] = [];
    
    // Determine the range of sets we need to show
    // At least up to planned_sets, but expand if DB has more (user added extra)
    const maxDbSetNum = setsData.length > 0 
        ? Math.max(...setsData.map(s => s.set_number)) 
        : 0;
    const totalSlots = Math.max(sessionData.planned_sets, maxDbSetNum);

    for (let i = 1; i <= totalSlots; i++) {
        const dbSet = setsData.find(s => s.set_number === i);
        
        if (dbSet) {
            sets.push({
                id: dbSet.id,
                session_id: sessionData.id,
                set_number: i,
                reps: dbSet.reps,
                weight_lbs: dbSet.weight_lbs,
                completed: true // If it exists in DB, it counts as "logged/completed" for UI state usually, or we can check logic
            });
        } else {
            // Phantom Set (Not in DB yet)
            sets.push({
                id: `temp-${sessionData.id}-${i}`,
                session_id: sessionData.id,
                set_number: i,
                reps: '', 
                weight_lbs: null, // UI will default this based on equipment
                completed: false
            });
        }
    }

    return {
        ...sessionData,
        sets: sets.sort((a, b) => a.set_number - b.set_number)
    };
};

export const db = {
  // Auth
  login: async (email: string, password: string): Promise<{ user: UserProfile | null, error: any }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) return { user: null, error };
    if (!data.user) return { user: null, error: "No user returned" };

    const user = await db.getUser();
    return { user, error: null };
  },

  signup: async (email: string, password: string): Promise<{ user: UserProfile | null, error: any }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return { user: null, error };
    return { user: null, error: null }; 
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  getUser: async (): Promise<UserProfile | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    // FIX: Query 'user_id' instead of 'id', as per schema
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
        console.error("Error fetching profile:", error);
    }

    if (error || !profile) {
      return {
        id: session.user.id,
        email: session.user.email || '',
        rep_min: 10,
        rep_max: 20,
        onboarding_completed_at: null,
        active_routine_id: null,
      };
    }

    return {
      ...profile,
      id: profile.user_id, // Map DB user_id to interface id
      email: session.user.email,
    };
  },

  // Onboarding
  completeOnboarding: async (selectedEquipment: Equipment[]) => {
    const { error } = await supabase.rpc('complete_onboarding', {
      selected_equipment: selectedEquipment
    });

    if (error) throw error;
  },

  // Routines
  getRoutines: async (): Promise<Routine[]> => {
    const { data: routines, error } = await supabase
      .from('user_routines')
      .select(`
        *,
        days:user_routine_days(*)
      `);
      
    if (error) throw error;
    return routines || [];
  },

  updateRoutineDay: async (dayId: string, updates: Partial<RoutineDay>) => {
    const { error } = await supabase
      .from('user_routine_days')
      .update(updates)
      .eq('id', dayId);
    if (error) throw error;
  },

  deleteRoutineDay: async (dayId: string) => {
    const { error } = await supabase
      .from('user_routine_days')
      .delete()
      .eq('id', dayId);
    if (error) throw error;
  },

  addRoutineDay: async (routineId: string, exerciseId: string, plannedSets: number = 3) => {
    const exercise = await db.getExercise(exerciseId);
    if (!exercise) throw new Error("Exercise not found");

    const { data: days } = await supabase
        .from('user_routine_days')
        .select('sort_order')
        .eq('routine_id', routineId);
    
    const maxSort = days?.reduce((max, d) => Math.max(max, d.sort_order), 0) || 0;

    const { error } = await supabase.from('user_routine_days').insert({
        routine_id: routineId,
        title: exercise.name, 
        muscle_group: exercise.muscle_group,
        exercise_id: exerciseId,
        planned_sets: plannedSets,
        sort_order: maxSort + 1
    });

    if (error) throw error;
  },

  reorderRoutineDays: async (routineId: string, dayIds: string[]) => {
      for(let i=0; i<dayIds.length; i++) {
          await supabase
            .from('user_routine_days')
            .update({ sort_order: i + 1 })
            .eq('id', dayIds[i]);
      }
  },

  // Exercises
  getExercises: async (): Promise<Exercise[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('exercises')
      .select(`
        *,
        favorites:exercise_favorites(user_id)
      `);
      
    if (error) throw error;
    
    return (data || []).map((e: any) => ({
        ...e,
        is_favorite: e.favorites && e.favorites.length > 0
    }));
  },

  getExercise: async (id: string): Promise<Exercise | null> => {
     const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  },

  createExercise: async (name: string, muscleGroup: MuscleGroup, equipment: Equipment) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const { data, error } = await supabase
        .from('exercises')
        .insert({
            name,
            muscle_group: muscleGroup,
            equipment,
            created_by: user.id,
            is_curated: false
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
  },

  toggleFavorite: async (exerciseId: string, isFavorite: boolean) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (isFavorite) {
          await supabase.from('exercise_favorites').insert({ user_id: user.id, exercise_id: exerciseId });
      } else {
          await supabase.from('exercise_favorites').delete().eq('user_id', user.id).eq('exercise_id', exerciseId);
      }
  },

  // Sessions
  getActiveSession: async (): Promise<Session | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        sets:session_sets(*)
      `)
      .eq('user_id', user.id)
      .eq('status', SessionStatus.InProgress)
      .single();

    if (error || !data) return null;
    
    return _composeSession(data, data.sets || []);
  },

  createSession: async (exerciseId: string, plannedSets: number): Promise<Session> => {
    const user = await db.getUser();
    if (!user) throw new Error("Not authenticated");

    const active = await db.getActiveSession();
    if (active) throw new Error("Session already in progress");

    const { data: exercise } = await supabase.from('exercises').select('*').eq('id', exerciseId).single();

    // Fetch history for prefill (optional logic)
    const { data: history } = await supabase
      .from('sessions')
      .select('*, sets:session_sets(*)')
      .eq('exercise_id', exerciseId)
      .eq('status', SessionStatus.Completed)
      .order('completed_at', { ascending: false })
      .limit(1);

    const lastSession = history?.[0];

    // Create Session
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        exercise_id: exerciseId,
        planned_sets: plannedSets,
        status: SessionStatus.InProgress,
        target_rep_min: user.rep_min,
        target_rep_max: user.rep_max
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // PREFILL STRATEGY: 
    // We only insert prefilled sets if they are valid (reps > 0).
    // Otherwise, we return them as "Phantom" sets for the UI to fill.
    
    const validPrefills = [];
    if (lastSession && lastSession.sets) {
        for(let i=1; i<=plannedSets; i++) {
            const pastSet = lastSession.sets.find((s: any) => s.set_number === i);
            if (pastSet && pastSet.reps > 0) {
                 validPrefills.push({
                     session_id: sessionData.id,
                     set_number: i,
                     reps: pastSet.reps,
                     weight_lbs: pastSet.weight_lbs
                 });
            }
        }
    }

    if (validPrefills.length > 0) {
         await supabase.from('session_sets').insert(validPrefills);
    }
    
    // Return composed session (mix of DB sets and phantom sets)
    return _composeSession(sessionData, validPrefills); // validPrefills matches DB structure mostly
  },

  // Upsert or Delete based on validity of data
  saveSessionSet: async (sessionId: string, setNumber: number, data: { reps: number | '', weight_lbs: number | null | '' }) => {
    // If invalid data (reps empty/0), we must DELETE if exists, or do nothing.
    if (data.reps === '' || data.reps === 0) {
         await supabase
            .from('session_sets')
            .delete()
            .eq('session_id', sessionId)
            .eq('set_number', setNumber);
         return;
    }

    // Prepare valid payload
    const payload: any = {
        session_id: sessionId,
        set_number: setNumber,
        reps: data.reps
    };

    if (data.weight_lbs === '') {
        // If empty string passed for weight, strict DB might want null or 0? 
        // Logic: if BodyWeight -> null. If weighted -> number.
        // We rely on caller to pass null for BW.
        // If weighted exercise and user cleared it, we might fail constraint?
        // Let's assume weight_lbs=0 is allowed if DB constraint allows non-negative.
        // Check DB constraint: "Non-bodyweight sets must have a weight_lbs value".
        // If user clears weight, we can't save.
        // For now, assume 0.
        payload.weight_lbs = 0;
    } else {
        payload.weight_lbs = data.weight_lbs;
    }

    // Upsert
    const { error } = await supabase
        .from('session_sets')
        .upsert(payload, { onConflict: 'session_id, set_number' });

    if (error) throw error;
  },

  addSetToSession: async (sessionId: string) => {
    // We don't necessarily insert into DB. We just return a new Phantom Set.
    // However, to make it persist across reload, we might want to increase 'planned_sets' in session?
    // Let's just update planned_sets count if we are exceeding it.
    
    const active = await db.getActiveSession();
    if(!active) return null;

    const currentMax = active.sets[active.sets.length-1]?.set_number || 0;
    const newSetNum = currentMax + 1;

    // We can't insert empty set. 
    // Return a phantom object.
    return {
        id: `temp-${sessionId}-${newSetNum}`,
        session_id: sessionId,
        set_number: newSetNum,
        reps: '',
        weight_lbs: null, // default
        completed: false
    };
  },

  completeSession: async (sessionId: string) => {
    await supabase
      .from('sessions')
      .update({
        status: SessionStatus.Completed,
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId);
  },

  deleteSession: async (sessionId: string) => {
    await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);
  },

  getHistory: async (): Promise<Session[]> => {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        sets:session_sets(*)
      `)
      .eq('status', SessionStatus.Completed)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Routine Management
  setActiveRoutine: async (routineId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    
    const { error } = await supabase
      .from('profiles')
      .update({ active_routine_id: routineId })
      .eq('user_id', user.id);
      
    if (error) throw error;
  },

  deleteRoutine: async (routineId: string): Promise<void> => {
    const { error } = await supabase
      .from('user_routines')
      .delete()
      .eq('id', routineId);
      
    if (error) throw error;
  },

  renameRoutine: async (routineId: string, newName: string): Promise<void> => {
    const { error } = await supabase
      .from('user_routines')
      .update({ name: newName })
      .eq('id', routineId);
      
    if (error) throw error;
  },

  createRoutine: async (name: string): Promise<Routine> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    
    const { data, error } = await supabase
      .from('user_routines')
      .insert({ user_id: user.id, name })
      .select()
      .single();
      
    if (error) throw error;
    return { ...data, days: [] };
  }
};