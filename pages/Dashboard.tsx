import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import RoutineEditor from '../components/RoutineEditor';
import RoutineSelector from '../components/RoutineSelector';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { Routine, RoutineDay, Exercise } from '../types';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      // Parallel fetch - all independent operations at once
      const [session, allRoutines, allExercises] = await Promise.all([
        db.getActiveSession(),
        db.getRoutines(),
        db.getExercises()
      ]);

      // Check for active session first
      if (session) {
        navigate('/session');
        return;
      }

      setRoutines(allRoutines);
      setExercises(allExercises);

      // Use user from context instead of fetching again
      const userActiveId = user?.active_routine_id;
      setActiveRoutineId(userActiveId || null);
      
      if (userActiveId) {
        setActiveRoutine(allRoutines.find(r => r.id === userActiveId) || allRoutines[0]);
      } else {
        setActiveRoutine(allRoutines[0]);
      }
    } catch (e) {
      console.error("Failed to load dashboard data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [navigate, user?.active_routine_id]);

  const handleStartSession = async (day: RoutineDay) => {
    if (isEditing) return;
    try {
      await db.createSession(day.exercise_id, day.planned_sets);
      navigate('/session');
    } catch (e) {
      console.error(e);
      alert("Could not start session.");
    }
  };

  const handleUpdateSets = async (dayId: string, sets: number) => {
      if (sets < 1 || sets > 20) return;
      // Optimistic
      if(activeRoutine) {
          const updatedDays = activeRoutine.days.map(d => d.id === dayId ? {...d, planned_sets: sets} : d);
          setActiveRoutine({...activeRoutine, days: updatedDays});
          await db.updateRoutineDay(dayId, { planned_sets: sets });
      }
  };

  const handleDeleteDay = async (dayId: string) => {
      if (!confirm("Delete this day from routine?")) return;
      if (activeRoutine) {
          const updatedDays = activeRoutine.days.filter(d => d.id !== dayId);
          setActiveRoutine({...activeRoutine, days: updatedDays});
          await db.deleteRoutineDay(dayId);
      }
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
      if (!activeRoutine) return;
      const days = [...activeRoutine.days].sort((a,b) => a.sort_order - b.sort_order);
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (newIndex < 0 || newIndex >= days.length) return;

      // Swap
      const temp = days[index];
      days[index] = days[newIndex];
      days[newIndex] = temp;

      // Reassign sort orders locally
      const reordered = days.map((d, i) => ({ ...d, sort_order: i + 1 }));
      setActiveRoutine({...activeRoutine, days: reordered});

      // Save to DB (simplified: update all sort orders)
      await db.reorderRoutineDays(activeRoutine.id, reordered.map(d => d.id));
  };

  

  const handleSwitchRoutine = async (routineId: string) => {
    if (routineId === activeRoutineId) return;
    
    try {
      await db.setActiveRoutine(routineId);
      setActiveRoutineId(routineId);
      const newRoutine = routines.find(r => r.id === routineId);
      if (newRoutine) {
        setActiveRoutine(newRoutine);
      }
    } catch (e) {
      console.error(e);
      alert("Could not switch routine.");
    }
  };

  if (loading) return <Layout><div className="p-6 text-center text-slate-400">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="p-6 relative">
        {/* Header gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-header pointer-events-none" />
        
        <header className="mb-6 flex justify-between items-end relative z-10">
          <div>
            <h1 className="text-3xl font-bold text-white text-glow-accent">KnockOut</h1>
            <p className="text-slate-400 text-sm">Today's Focus</p>
          </div>
          <button 
            onClick={() => setShowSelector(true)}
            className="text-xs font-mono text-accent-400 uppercase tracking-wider border border-accent-500/50 px-2 py-1 rounded flex items-center gap-1 hover:bg-accent-500/10 hover:border-accent-500"
          >
            {activeRoutine?.name || 'No Routine'}
            <ChevronDown size={12} />
          </button>
        </header>

        {activeRoutine ? (
          <RoutineEditor
            routine={activeRoutine}
            exercises={exercises}
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing(!isEditing)}
            onUpdateSets={handleUpdateSets}
            onDeleteDay={handleDeleteDay}
            onReorder={handleReorder}
            onAddExercise={() => navigate(`/library?mode=select_routine&routineId=${activeRoutine.id}&returnTo=/`)}
            onStartSession={handleStartSession}
            showStartButton={true}
          />
        ) : (
          <div className="text-center py-10 text-slate-500">
            No routine selected.
          </div>
        )}

        {!isEditing && (
          <div className="mt-8">
            <h3 className="text-slate-500 text-sm uppercase tracking-wider font-bold mb-3">Quick Actions</h3>
            <button 
              onClick={() => navigate('/library')}
              className="w-full bg-brand-800 border border-brand-600 text-slate-300 py-3 rounded-xl font-medium hover:bg-brand-700 hover:border-brand-500"
            >
              Start Extra Workout
            </button>
          </div>
        )}
      </div>

      {showSelector && (
        <RoutineSelector
          routines={routines}
          activeRoutineId={activeRoutineId}
          onSelect={handleSwitchRoutine}
          onClose={() => setShowSelector(false)}
        />
      )}
    </Layout>
  );
};

export default Dashboard;
