import React from 'react';
import { Routine } from '../types';
import { Check, X, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RoutineSelectorProps {
  routines: Routine[];
  activeRoutineId: string | null;
  onSelect: (routineId: string) => void;
  onClose: () => void;
}

const RoutineSelector: React.FC<RoutineSelectorProps> = ({
  routines,
  activeRoutineId,
  onSelect,
  onClose,
}) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="relative w-full max-w-md bg-brand-800 rounded-t-2xl border-t border-brand-600 animate-slide-up">
        <div className="p-4 border-b border-brand-600 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Select Routine</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {routines.map((routine) => (
            <button
              key={routine.id}
              onClick={() => {
                onSelect(routine.id);
                onClose();
              }}
              className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-brand-700/50 ${
                routine.id === activeRoutineId ? 'bg-brand-700/30' : ''
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                routine.id === activeRoutineId 
                  ? 'border-accent-500 bg-accent-500' 
                  : 'border-slate-500'
              }`}>
                {routine.id === activeRoutineId && (
                  <Check size={12} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{routine.name}</p>
                <p className="text-slate-500 text-sm">{routine.days?.length || 0} exercises</p>
              </div>
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-brand-600">
          <button
            onClick={() => {
              onClose();
              navigate('/routines');
            }}
            className="w-full py-3 flex items-center justify-center gap-2 text-slate-400 hover:text-white bg-brand-700 hover:bg-brand-600 rounded-xl border border-brand-600"
          >
            <Settings size={18} />
            <span className="font-medium">Manage Routines</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoutineSelector;
