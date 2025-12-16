import { 
  UserProfile, Routine, Session, Exercise, SessionStatus, 
  Equipment, RoutineDay, SessionSet, StockRoutine 
} from '../types';
import { MOCK_EXERCISES, STOCK_ROUTINES, EXERCISE_IDS } from '../constants';

const KEYS = {
  USER: 'knockout_user',
  ROUTINES: 'knockout_routines',
  SESSIONS: 'knockout_sessions',
  EXERCISES: 'knockout_exercises',
};

// --- Helpers ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const getStorage = <T>(key: string, defaultVal: T): T => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultVal;
};

const setStorage = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// --- Mock Service API ---

export const mockDb = {
  // Auth
  login: async (email: string): Promise<UserProfile> => {
    await delay(500);
    let user = getStorage<UserProfile | null>(KEYS.USER, null);
    if (!user) {
      // Create new user if not exists (Auto-signup for demo)
      user = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email,
        rep_min: 10,
        rep_max: 20,
        onboarding_completed_at: null,
        active_routine_id: null,
      };
      setStorage(KEYS.USER, user);
      
      // Seed curated exercises
      const existingEx = getStorage<Exercise[]>(KEYS.EXERCISES, []);
      if (existingEx.length === 0) {
        setStorage(KEYS.EXERCISES, MOCK_EXERCISES);
      }
    }
    return user;
  },

  getUser: (): UserProfile | null => {
    return getStorage<UserProfile | null>(KEYS.USER, null);
  },

  updateUser: (updates: Partial<UserProfile>) => {
    const user = getStorage<UserProfile | null>(KEYS.USER, null);
    if (user) {
      const updated = { ...user, ...updates };
      setStorage(KEYS.USER, updated);
      return updated;
    }
    return null;
  },

  logout: async () => {
    localStorage.removeItem(KEYS.USER);
  },

  // Onboarding
  completeOnboarding: async (selectedEquipment: Equipment[]) => {
    await delay(800);
    const user = getStorage<UserProfile>(KEYS.USER, {} as UserProfile);
    const userRoutines: Routine[] = getStorage(KEYS.ROUTINES, []);
    
    // Copy stock routines
    let firstRoutineId: string | null = null;
    
    selectedEquipment.forEach(eq => {
      // Find matching stock routine or default to a generic structure if stock missing
      const stock = STOCK_ROUTINES.find(sr => sr.equipment === eq);
      
      if (stock) {
        const newRoutineId = 'routine_' + Math.random().toString(36).substr(2, 9);
        if (!firstRoutineId) firstRoutineId = newRoutineId;
        
        const newDays: RoutineDay[] = stock.days.map((d, i) => ({
            ...d,
            id: 'day_' + Math.random().toString(36).substr(2, 9),
            routine_id: newRoutineId,
        }));

        userRoutines.push({
          id: newRoutineId,
          user_id: user.id,
          name: stock.name,
          days: newDays,
        });
      }
    });

    setStorage(KEYS.ROUTINES, userRoutines);
    
    // Update user
    const updatedUser = {
      ...user,
      onboarding_completed_at: new Date().toISOString(),
      active_routine_id: firstRoutineId || user.active_routine_id
    };
    setStorage(KEYS.USER, updatedUser);
    return updatedUser;
  },

  // Routines
  getRoutines: async (): Promise<Routine[]> => {
    return getStorage(KEYS.ROUTINES, []);
  },

  // Exercises
  getExercises: async (): Promise<Exercise[]> => {
    return getStorage(KEYS.EXERCISES, MOCK_EXERCISES);
  },

  getExercise: (id: string): Exercise | undefined => {
    const ex = getStorage<Exercise[]>(KEYS.EXERCISES, MOCK_EXERCISES);
    return ex.find(e => e.id === id);
  },

  // Sessions
  getActiveSession: async (): Promise<Session | null> => {
    const sessions = getStorage<Session[]>(KEYS.SESSIONS, []);
    return sessions.find(s => s.status === SessionStatus.InProgress) || null;
  },

  createSession: async (exerciseId: string, plannedSets: number): Promise<Session> => {
    const user = getStorage<UserProfile>(KEYS.USER, {} as UserProfile);
    const sessions = getStorage<Session[]>(KEYS.SESSIONS, []);
    const exercises = getStorage<Exercise[]>(KEYS.EXERCISES, MOCK_EXERCISES);
    const exercise = exercises.find(e => e.id === exerciseId);

    // Single focus rule check
    if (sessions.some(s => s.status === SessionStatus.InProgress)) {
      throw new Error("Session already in progress");
    }

    // Prefill logic
    const history = sessions
      .filter(s => s.exercise_id === exerciseId && s.status === SessionStatus.Completed)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());
    
    const lastSession = history[0];
    const initialSets: SessionSet[] = [];

    for (let i = 1; i <= plannedSets; i++) {
      let reps: number | '' = '';
      let weight: number | '' | null = exercise?.equipment === Equipment.BodyWeight ? null : '';

      if (lastSession && lastSession.sets[i-1]) {
        // Prefill from history if available
        reps = lastSession.sets[i-1].reps;
        weight = lastSession.sets[i-1].weight_lbs;
      }

      initialSets.push({
        id: 'set_' + Math.random().toString(36).substr(2, 9),
        session_id: 'temp', // Updated below
        set_number: i,
        reps: '', // Requirement says prefill logic, but often blanking reps encourages doing the work. Let's stick to spec:
                  // "If last completed session has fewer sets... prefill only those completed"
                  // Actually, strictly following spec: "prefill only the first N rows".
                  // I will prefill Weight but keep Reps blank to encourage tracking, OR prefill both if that's the habit builder way.
                  // Spec says "prefill only those completed". Implies copying values. 
        weight_lbs: weight,
        completed: false
      });
      
      // Logic fix: Only prefill values if they exist.
      if (lastSession && lastSession.sets[i-1]) {
           initialSets[i-1].reps = lastSession.sets[i-1].reps;
           initialSets[i-1].weight_lbs = lastSession.sets[i-1].weight_lbs;
      }
    }

    const newSession: Session = {
      id: 'sess_' + Math.random().toString(36).substr(2, 9),
      user_id: user.id,
      exercise_id: exerciseId,
      status: SessionStatus.InProgress,
      started_at: new Date().toISOString(),
      completed_at: null,
      planned_sets: plannedSets,
      sets: initialSets.map(s => ({...s, session_id: 'sess_' /* placeholder fixed */})),
      target_rep_min: user.rep_min || 10,
      target_rep_max: user.rep_max || 20,
    };
    // Fix session IDs in sets
    newSession.sets.forEach(s => s.session_id = newSession.id);

    sessions.push(newSession);
    setStorage(KEYS.SESSIONS, sessions);
    return newSession;
  },

  updateSessionSet: async (sessionId: string, setIndex: number, updates: Partial<SessionSet>) => {
    const sessions = getStorage<Session[]>(KEYS.SESSIONS, []);
    const sessionIdx = sessions.findIndex(s => s.id === sessionId);
    if (sessionIdx === -1) return;

    const session = sessions[sessionIdx];
    if (session.sets[setIndex]) {
        session.sets[setIndex] = { ...session.sets[setIndex], ...updates };
        setStorage(KEYS.SESSIONS, sessions);
    }
  },

  addSetToSession: async (sessionId: string) => {
    const sessions = getStorage<Session[]>(KEYS.SESSIONS, []);
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    // Copy last set values or blank
    const lastSet = session.sets[session.sets.length - 1];
    const newSet: SessionSet = {
        id: 'set_' + Math.random().toString(36).substr(2, 9),
        session_id: sessionId,
        set_number: session.sets.length + 1,
        reps: lastSet ? lastSet.reps : '',
        weight_lbs: lastSet ? lastSet.weight_lbs : (session.sets[0]?.weight_lbs === null ? null : ''),
        completed: false
    };
    session.sets.push(newSet);
    setStorage(KEYS.SESSIONS, sessions);
    return newSet;
  },

  completeSession: async (sessionId: string) => {
    const sessions = getStorage<Session[]>(KEYS.SESSIONS, []);
    const sessionIdx = sessions.findIndex(s => s.id === sessionId);
    if (sessionIdx === -1) return;

    sessions[sessionIdx].status = SessionStatus.Completed;
    sessions[sessionIdx].completed_at = new Date().toISOString();
    setStorage(KEYS.SESSIONS, sessions);
  },

  deleteSession: async (sessionId: string) => {
    let sessions = getStorage<Session[]>(KEYS.SESSIONS, []);
    sessions = sessions.filter(s => s.id !== sessionId);
    setStorage(KEYS.SESSIONS, sessions);
  },

  getHistory: async (): Promise<Session[]> => {
    const sessions = getStorage<Session[]>(KEYS.SESSIONS, []);
    return sessions.filter(s => s.status === SessionStatus.Completed);
  }
};