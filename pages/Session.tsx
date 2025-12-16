import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Session, SessionSet, Exercise, Equipment } from '../types';
import { Check, Plus, Save, Trophy } from 'lucide-react';

const SessionPage: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const init = async () => {
      try {
        const active = await db.getActiveSession();
        if (!active) {
            navigate('/'); // No session, go home
            return;
        }
        setSession(active);
        const ex = await db.getExercise(active.exercise_id);
        if (ex) setExercise(ex);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const handleUpdateSet = async (index: number, field: keyof SessionSet, value: string | number | boolean) => {
    if (!session) return;
    
    // Optimistic UI update
    const newSets = [...session.sets];
    // Cast to any to allow dynamic assignment safe in this context
    const currentSet = { ...newSets[index], [field]: value };
    newSets[index] = currentSet;
    setSession({ ...session, sets: newSets });
    
    const setNum = currentSet.set_number;
    const reps = Number(currentSet.reps);
    
    if (field !== 'completed' && reps > 0) {
        // Silent background save attempt
        try {
            await db.saveSessionSet(session.id, setNum, {
                reps: currentSet.reps,
                weight_lbs: currentSet.weight_lbs
            });
        } catch(e) {
            // ignore error during typing
        }
    }
  };

  const toggleSetComplete = async (index: number) => {
    if (!session) return;
    const currentSet = session.sets[index];
    
    // Toggle
    const newStatus = !currentSet.completed; // UI state
    
    // Update Local
    const newSets = [...session.sets];
    newSets[index] = { ...currentSet, completed: newStatus };
    setSession({ ...session, sets: newSets });

    // Sync DB
    try {
        if (newStatus) {
            // Saving as complete implies saving the data
            await db.saveSessionSet(session.id, currentSet.set_number, {
                reps: currentSet.reps,
                weight_lbs: currentSet.weight_lbs
            });
        }
    } catch(e) {
        console.error("Save failed", e);
        // revert
        newSets[index] = currentSet;
        setSession({ ...session, sets: newSets });
    }
  };

  const handleAddSet = async () => {
    if (!session) return;
    const newSet = await db.addSetToSession(session.id);
    if (newSet) {
        setSession({ ...session, sets: [...session.sets, newSet as SessionSet] });
    }
  };

  const handleFinish = async () => {
    if (!session) return;
    setConfirming(true);
  };

  const handleConfirmFinish = async () => {
    if (!session) return;
    await db.completeSession(session.id);
    navigate('/progress');
  };

  const handleDiscard = async () => {
      if(confirm("Are you sure you want to discard this workout?")) {
        if(!session) return;
        await db.deleteSession(session.id);
        navigate('/');
      }
  };

  if (loading || !session || !exercise) return <div className="h-full bg-brand-900 text-white flex items-center justify-center">Loading...</div>;

  // Determine active set index (first incomplete)
  const activeSetIndex = session.sets.findIndex(s => !s.completed);
  const effectiveActiveIndex = activeSetIndex === -1 ? session.sets.length - 1 : activeSetIndex;
  const completedCount = session.sets.filter(s => s.completed).length;

  if (confirming) {
      return (
        <div className="h-full flex flex-col bg-brand-900 text-white p-6 relative overflow-hidden">
            {/* Success gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-success-500/10 to-transparent pointer-events-none" />
            
            <div className="text-center mb-6 relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success-500 rounded-full mb-4 glow-success">
                <Trophy size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold">Workout Complete!</h2>
            </div>
            
            <div className="bg-brand-800 rounded-xl p-4 mb-6 border border-brand-600 relative z-10">
                <h3 className="text-xl text-accent-400 font-bold mb-1">{exercise.name}</h3>
                <p className="text-slate-400 mb-4">{session.sets.filter(s => s.completed).length} sets logged</p>
                
                <div className="space-y-2 max-h-[50vh] overflow-y-auto no-scrollbar">
                    {session.sets.filter(s => s.completed).map((set, i) => (
                        <div key={set.set_number} className="flex justify-between items-center py-2 border-b border-brand-700/50 last:border-0">
                            <span className="text-slate-400 w-8">#{set.set_number}</span>
                            <span className="font-mono text-white">
                                {set.weight_lbs !== null ? `${set.weight_lbs} lbs` : 'BW'} x {set.reps} reps
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-auto space-y-3 relative z-10">
                <button onClick={handleConfirmFinish} className="w-full bg-success-500 hover:bg-success-600 py-4 rounded-xl font-bold text-lg shadow-lg glow-success-sm">
                    Save & Continue
                </button>
                <button onClick={() => setConfirming(false)} className="w-full bg-brand-800 border border-brand-600 py-4 rounded-xl font-bold text-slate-300 hover:bg-brand-700">
                    Back to Edit
                </button>
            </div>
        </div>
      )
  }

  return (
    <div className="h-full flex flex-col bg-brand-900 text-slate-50 relative">
      <header className="p-4 border-b border-brand-700 flex justify-between items-center bg-brand-800 z-10">
        <div className="flex items-center gap-3">
            <span className="font-bold text-lg truncate max-w-[200px]">{exercise.name}</span>
            <span className="text-xs bg-accent-500/20 text-accent-400 px-2 py-1 rounded-full font-medium">
              {completedCount}/{session.sets.length}
            </span>
        </div>
        <button onClick={handleDiscard} className="text-xs text-slate-400 hover:text-red-400 px-2 py-1 border border-brand-600 rounded hover:border-red-500/50">
            Discard
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {session.sets.map((set, index) => {
          const isActive = index === effectiveActiveIndex;
          const isCompleted = set.completed;
          const isBodyWeight = exercise.equipment === Equipment.BodyWeight;
          
          return (
            <div 
              key={set.set_number}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                isActive 
                    ? 'bg-brand-800 border-2 border-accent-500 shadow-lg glow-accent-sm scale-[1.02]' 
                    : isCompleted 
                        ? 'bg-brand-800/50 border border-success-500/30 opacity-80'
                        : 'bg-brand-800/30 border border-brand-700 opacity-50'
              }`}
            >
              <div className={`w-8 text-center font-mono text-sm font-bold ${isCompleted ? 'text-success-400' : isActive ? 'text-accent-400' : 'text-slate-500'}`}>
                {set.set_number}
              </div>

              <div className="flex-1">
                <div className="relative">
                   <input
                    type="number"
                    disabled={isBodyWeight || (!isActive && !isCompleted)}
                    value={set.weight_lbs === null ? '' : set.weight_lbs}
                    onChange={(e) => handleUpdateSet(index, 'weight_lbs', e.target.value === '' ? '' : parseFloat(e.target.value))}
                    onBlur={() => toggleSetComplete(index)}
                    placeholder={isBodyWeight ? 'BW' : '-'}
                    className={`w-full bg-brand-900 border border-brand-600 rounded-lg py-3 px-2 text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 ${isBodyWeight ? 'text-slate-500 italic' : 'text-white'}`}
                  />
                  {!isBodyWeight && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500">lbs</span>}
                </div>
              </div>

              <div className="flex-1">
                 <div className="relative">
                  <input
                    type="number"
                    disabled={!isActive && !isCompleted}
                    value={set.reps}
                    onChange={(e) => handleUpdateSet(index, 'reps', e.target.value === '' ? '' : parseFloat(e.target.value))}
                    onBlur={() => toggleSetComplete(index)}
                    placeholder="0"
                    className="w-full bg-brand-900 border border-brand-600 rounded-lg py-3 px-2 text-center font-mono text-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500">reps</span>
                </div>
              </div>

              <button
                onClick={() => toggleSetComplete(index)}
                disabled={(!isActive && !isCompleted)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isCompleted 
                        ? 'bg-success-500 text-white glow-success-sm' 
                        : isActive
                            ? 'bg-brand-700 text-slate-300 hover:bg-accent-500 hover:text-white border border-brand-600'
                            : 'bg-brand-900 text-slate-600 border border-brand-700'
                }`}
              >
                <Check size={20} strokeWidth={3} />
              </button>
            </div>
          );
        })}

        <button 
            onClick={handleAddSet}
            className="w-full py-3 border-2 border-dashed border-brand-600 text-slate-400 rounded-xl hover:bg-brand-800 hover:text-accent-400 hover:border-accent-500/50 flex items-center justify-center font-medium"
        >
            <Plus size={18} className="mr-2" /> Add Set
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-brand-900 border-t border-brand-700">
        <button 
            onClick={handleFinish}
            className="w-full bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 rounded-xl shadow-lg hover:glow-accent-sm flex items-center justify-center"
        >
            <Save size={20} className="mr-2" /> Finish Workout
        </button>
      </div>
    </div>
  );
};

export default SessionPage;
