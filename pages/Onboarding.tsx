import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EQUIPMENT_LIST } from '../constants';
import { Equipment } from '../types';
import { db } from '../services/db';
import { Check, Sparkles } from 'lucide-react';

const Onboarding: React.FC = () => {
  const [selected, setSelected] = useState<Equipment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const toggleEquipment = (eq: Equipment) => {
    if (selected.includes(eq)) {
      setSelected(selected.filter(i => i !== eq));
    } else {
      setSelected([...selected, eq]);
    }
  };

  const handleSubmit = async () => {
    if (selected.length === 0) return;
    setSubmitting(true);
    try {
        await db.completeOnboarding(selected);
        
        // Verify update before navigating to prevent race condition
        let retries = 5;
        while(retries > 0) {
            const user = await db.getUser();
            if (user?.onboarding_completed_at) {
                navigate('/');
                return;
            }
            // Wait 500ms before retry
            await new Promise(r => setTimeout(r, 500));
            retries--;
        }

        // If simple navigation fails due to state lag, force a reload to clear App state
        window.location.reload();

    } catch(e) {
        console.error(e);
        alert("Failed to save equipment choice. Please try again.");
        setSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-brand-900 text-white max-w-md mx-auto overflow-y-auto relative">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={24} className="text-accent-500" />
          <h2 className="text-2xl font-bold">What equipment do you have?</h2>
        </div>
        <p className="text-slate-400 mb-6">We'll build a custom routine for you.</p>

        <div className="space-y-3 flex-1">
          {EQUIPMENT_LIST.map((eq) => {
            const isSelected = selected.includes(eq);
            const displayName = eq === Equipment.BodyWeight ? 'Body Weight' : eq;
            
            return (
              <button
                key={eq}
                onClick={() => toggleEquipment(eq)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border ${
                  isSelected 
                    ? 'bg-brand-800 border-accent-500 glow-accent-sm' 
                    : 'bg-brand-800/50 border-brand-600 hover:bg-brand-800 hover:border-brand-500'
                }`}
              >
                <span className="text-lg">{displayName}</span>
                {isSelected && (
                  <div className="bg-accent-500 rounded-full p-1">
                    <Check size={16} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-brand-700">
          <button
            onClick={handleSubmit}
            disabled={selected.length === 0 || submitting}
            className="w-full bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:glow-accent-sm"
          >
            {submitting ? 'Building Routine...' : 'Build My Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
