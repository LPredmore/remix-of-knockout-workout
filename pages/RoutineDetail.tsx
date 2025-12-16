import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import RoutineEditor from '../components/RoutineEditor';
import { db } from '../services/db';
import { Routine, Exercise, RoutineDay } from '../types';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Star } from 'lucide-react';

const RoutineDetail: React.FC = () => {
  const { routineId } = useParams<{ routineId: string }>();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isActiveRoutine, setIsActiveRoutine] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const navigate = useNavigate();

  const loadData = async () => {
    if (!routineId) return;
    
    try {
      const user = await db.getUser();
      const allRoutines = await db.getRoutines();
      const allExercises = await db.getExercises();
      
      const foundRoutine = allRoutines.find(r => r.id === routineId);
      setRoutine(foundRoutine || null);
      setExercises(allExercises);
      setIsActiveRoutine(user?.active_routine_id === routineId);
    } catch (e) {
      console.error("Failed to load routine", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [routineId]);

  const handleUpdateSets = async (dayId: string, sets: number) => {
    if (sets < 1 || sets > 20 || !routine) return;
    
    const updatedDays = routine.days.map(d => 
      d.id === dayId ? { ...d, planned_sets: sets } : d
    );
    setRoutine({ ...routine, days: updatedDays });
    await db.updateRoutineDay(dayId, { planned_sets: sets });
  };

  const handleDeleteDay = async (dayId: string) => {
    if (!confirm("Delete this exercise from routine?") || !routine) return;
    
    const updatedDays = routine.days.filter(d => d.id !== dayId);
    setRoutine({ ...routine, days: updatedDays });
    await db.deleteRoutineDay(dayId);
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    if (!routine) return;
    
    const days = [...routine.days].sort((a, b) => a.sort_order - b.sort_order);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= days.length) return;

    const temp = days[index];
    days[index] = days[newIndex];
    days[newIndex] = temp;

    const reordered = days.map((d, i) => ({ ...d, sort_order: i + 1 }));
    setRoutine({ ...routine, days: reordered });

    await db.reorderRoutineDays(routine.id, reordered.map(d => d.id));
  };

  const handleSetActive = async () => {
    if (!routine || isActiveRoutine) return;
    
    try {
      await db.setActiveRoutine(routine.id);
      setIsActiveRoutine(true);
    } catch (e) {
      console.error(e);
      alert("Could not set routine as active.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center text-slate-400">Loading...</div>
      </Layout>
    );
  }

  if (!routine) {
    return (
      <Layout>
        <div className="p-6 text-center text-slate-400">Routine not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 pb-32">
        {/* Header */}
        <header className="mb-6">
          <button 
            onClick={() => navigate('/routines')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Routines</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{routine.name}</h1>
              <p className="text-slate-400 text-sm">
                {routine.days?.length || 0} exercises
              </p>
            </div>
            {isActiveRoutine && (
              <div className="flex items-center gap-1 text-accent-500 text-sm">
                <Star size={14} fill="currentColor" />
                <span>Active</span>
              </div>
            )}
          </div>
        </header>

        {/* Routine Editor */}
        <RoutineEditor
          routine={routine}
          exercises={exercises}
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing(!isEditing)}
          onUpdateSets={handleUpdateSets}
          onDeleteDay={handleDeleteDay}
          onReorder={handleReorder}
          onAddExercise={() => navigate(`/library?mode=select_routine&routineId=${routine.id}&returnTo=/routines/${routine.id}`)}
          showStartButton={false}
        />
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-brand-900 via-brand-900 to-transparent">
        {isActiveRoutine ? (
          <div className="w-full py-4 bg-brand-800 border border-accent-500/30 rounded-xl flex items-center justify-center gap-2 text-accent-500">
            <Check size={20} />
            <span className="font-medium">This is your active routine</span>
          </div>
        ) : (
          <button
            onClick={handleSetActive}
            className="w-full py-4 bg-accent-500 hover:bg-accent-600 rounded-xl flex items-center justify-center gap-2 text-white font-bold transition-colors"
          >
            <Star size={20} />
            <span>Set as Active Routine</span>
          </button>
        )}
      </div>
    </Layout>
  );
};

export default RoutineDetail;
