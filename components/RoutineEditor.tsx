import React from 'react';
import { Routine, RoutineDay, Exercise } from '../types';
import { Play, Edit2, Check, Trash2, ArrowUp, ArrowDown, Plus, Zap } from 'lucide-react';

interface RoutineEditorProps {
  routine: Routine;
  exercises: Exercise[];
  isEditing: boolean;
  onToggleEdit: () => void;
  onUpdateSets: (dayId: string, sets: number) => void;
  onDeleteDay: (dayId: string) => void;
  onReorder: (index: number, direction: 'up' | 'down') => void;
  onAddExercise: () => void;
  onStartSession?: (day: RoutineDay) => void;
  showStartButton?: boolean;
}

const RoutineEditor: React.FC<RoutineEditorProps> = ({
  routine,
  exercises,
  isEditing,
  onToggleEdit,
  onUpdateSets,
  onDeleteDay,
  onReorder,
  onAddExercise,
  onStartSession,
  showStartButton = false,
}) => {
  const getExerciseName = (id: string) => 
    exercises.find(e => e.id === id)?.name || 'Unknown Exercise';

  const sortedDays = [...(routine.days || [])].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-4">
      {/* Edit Toggle */}
      <div className="flex justify-end">
        <button 
          onClick={onToggleEdit}
          className={`text-xs flex items-center gap-1 px-2 py-1 rounded ${
            isEditing ? 'bg-success-500 text-white' : 'bg-brand-800 text-slate-400 border border-brand-600'
          }`}
        >
          {isEditing ? <Check size={12}/> : <Edit2 size={12}/>}
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>

      {/* Routine Days */}
      {sortedDays.map((day, index) => (
        <div 
          key={day.id} 
          className={`bg-brand-800 rounded-2xl p-4 border shadow-sm relative overflow-hidden group ${
            isEditing ? 'border-accent-500/30' : 'border-brand-600'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="text-slate-200 font-semibold text-lg">{day.title}</h3>
              <div className="text-slate-400 text-sm flex items-center gap-2">
                <span>{day.muscle_group}</span>
                <span>•</span>
                {isEditing ? (
                  <div className="flex items-center gap-2 bg-brand-900 rounded px-2 border border-brand-600">
                    <span className="text-xs">Sets:</span>
                    <input 
                      type="number" 
                      className="w-12 bg-transparent text-white text-center focus:outline-none"
                      value={day.planned_sets}
                      onChange={(e) => onUpdateSets(day.id, parseInt(e.target.value))}
                      min={1} max={20}
                    />
                  </div>
                ) : (
                  <span>{day.planned_sets} Sets</span>
                )}
              </div>
            </div>
            
            {showStartButton && !isEditing && onStartSession && (
              <button 
                onClick={() => onStartSession(day)}
                className="bg-accent-500 text-white rounded-full p-3 shadow-lg hover:bg-accent-600 hover:glow-accent-sm active:scale-95"
              >
                <Play size={20} fill="currentColor" />
              </button>
            )}

            {isEditing && (
              <div className="flex flex-col gap-1 ml-2">
                <button 
                  onClick={() => onReorder(index, 'up')} 
                  className="p-1 bg-brand-700 rounded hover:bg-brand-600 disabled:opacity-30 border border-brand-600" 
                  disabled={index === 0}
                >
                  <ArrowUp size={14} />
                </button>
                <button 
                  onClick={() => onReorder(index, 'down')} 
                  className="p-1 bg-brand-700 rounded hover:bg-brand-600 disabled:opacity-30 border border-brand-600" 
                  disabled={index === sortedDays.length - 1}
                >
                  <ArrowDown size={14} />
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-2 pt-3 border-t border-brand-700/50 flex items-center justify-between text-slate-300">
            <div className="flex items-center">
              <Zap size={14} className="mr-2 text-amber-400" />
              <span className="font-medium">{getExerciseName(day.exercise_id)}</span>
            </div>
            {isEditing && (
              <button 
                onClick={() => onDeleteDay(day.id)}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Add Exercise Button */}
      {isEditing && (
        <button 
          onClick={onAddExercise}
          className="w-full py-4 border-2 border-dashed border-brand-600 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-accent-400 hover:bg-brand-800 hover:border-accent-500/50"
        >
          <Plus size={24} className="mb-1"/>
          <span className="font-bold">Add Exercise to Routine</span>
        </button>
      )}

      {/* Empty State */}
      {sortedDays.length === 0 && !isEditing && (
        <div className="text-center py-10 text-slate-500">
          No exercises in this routine yet.
        </div>
      )}
    </div>
  );
};

export default RoutineEditor;
