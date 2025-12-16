import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { db } from '../services/db';
import { Routine, UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { Check, Edit2, Trash2, Plus, X, ChevronRight, LogOut } from 'lucide-react';

const Routines: React.FC = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const user = await db.getUser();
      const allRoutines = await db.getRoutines();
      
      setRoutines(allRoutines);
      setActiveRoutineId(user?.active_routine_id || null);
    } catch (e) {
      console.error("Failed to load routines", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSetActive = async (routineId: string) => {
    if (routineId === activeRoutineId) return;
    
    try {
      await db.setActiveRoutine(routineId);
      setActiveRoutineId(routineId);
    } catch (e) {
      console.error(e);
      alert("Could not switch routine.");
    }
  };

  const handleStartRename = (routine: Routine) => {
    setEditingId(routine.id);
    setEditName(routine.name);
  };

  const handleSaveRename = async () => {
    if (!editingId || !editName.trim()) return;
    
    try {
      await db.renameRoutine(editingId, editName.trim());
      setRoutines(routines.map(r => 
        r.id === editingId ? { ...r, name: editName.trim() } : r
      ));
      setEditingId(null);
      setEditName('');
    } catch (e) {
      console.error(e);
      alert("Could not rename routine.");
    }
  };

  const handleDelete = async (routineId: string) => {
    if (routines.length <= 1) {
      alert("Cannot delete your last routine.");
      return;
    }
    
    if (routineId === activeRoutineId) {
      alert("Cannot delete your active routine. Switch to another routine first.");
      return;
    }
    
    if (!confirm("Delete this routine? This cannot be undone.")) return;
    
    try {
      await db.deleteRoutine(routineId);
      setRoutines(routines.filter(r => r.id !== routineId));
    } catch (e) {
      console.error(e);
      alert("Could not delete routine.");
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    
    try {
      const newRoutine = await db.createRoutine(newName.trim());
      setRoutines([...routines, newRoutine]);
      setIsCreating(false);
      setNewName('');
    } catch (e) {
      console.error(e);
      alert("Could not create routine.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center text-slate-400">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-white">My Routines</h1>
          <p className="text-slate-400 text-sm">Manage your workout routines</p>
        </header>

        <div className="space-y-3 pb-24">
          {routines.map((routine) => (
            <div 
              key={routine.id}
              className={`bg-brand-800 rounded-xl p-4 border ${
                routine.id === activeRoutineId 
                  ? 'border-accent-500 glow-accent-sm' 
                  : 'border-brand-600'
              }`}
            >
              {editingId === routine.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-brand-900 border border-brand-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                  />
                  <button
                    onClick={handleSaveRename}
                    className="p-2 bg-success-500 rounded-lg text-white hover:bg-success-600"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => { setEditingId(null); setEditName(''); }}
                    className="p-2 bg-brand-700 rounded-lg text-slate-400 hover:bg-brand-600"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleSetActive(routine.id)}
                    className="flex-1 text-left flex items-center gap-3"
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      routine.id === activeRoutineId 
                        ? 'border-accent-500 bg-accent-500' 
                        : 'border-slate-500'
                    }`}>
                      {routine.id === activeRoutineId && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{routine.name}</h3>
                      <p className="text-slate-500 text-sm">
                        {routine.days?.length || 0} exercises
                      </p>
                    </div>
                  </button>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartRename(routine)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-brand-700 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(routine.id)}
                      className={`p-2 rounded-lg ${
                        routine.id === activeRoutineId || routines.length <= 1
                          ? 'text-slate-600 cursor-not-allowed'
                          : 'text-slate-400 hover:text-red-400 hover:bg-brand-700'
                      }`}
                      disabled={routine.id === activeRoutineId || routines.length <= 1}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => navigate(`/routines/${routine.id}`)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-brand-700 rounded-lg"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Create New Routine */}
          {isCreating ? (
            <div className="bg-brand-800 rounded-xl p-4 border border-accent-500/50">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="New routine name..."
                  className="flex-1 bg-brand-900 border border-brand-500 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="p-2 bg-accent-500 rounded-lg text-white hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => { setIsCreating(false); setNewName(''); }}
                  className="p-2 bg-brand-700 rounded-lg text-slate-400 hover:bg-brand-600"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-4 border-2 border-dashed border-brand-600 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-accent-400 hover:border-accent-500/50 hover:bg-brand-800/50"
            >
              <Plus size={20} />
              <span className="font-medium">Create New Routine</span>
            </button>
          )}

          {/* Logout */}
          <div className="mt-6 pt-6 border-t border-brand-700">
            <button
              onClick={() => {
                db.logout().then(() => window.location.reload());
              }}
              className="w-full py-3 flex items-center justify-center gap-2 text-slate-400 hover:text-red-400 bg-brand-800 hover:bg-brand-700 border border-brand-600 rounded-xl"
            >
              <LogOut size={18} />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Routines;
