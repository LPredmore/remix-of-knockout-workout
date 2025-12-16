import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { db } from '../services/db';
import { Exercise, Equipment, MuscleGroup } from '../types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, Star, X } from 'lucide-react';

const ExerciseLibrary: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filtered, setFiltered] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [filterEquipment, setFilterEquipment] = useState<Equipment | 'all'>('all');
  const [filterMuscle, setFilterMuscle] = useState<MuscleGroup | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create Form State
  const [newName, setNewName] = useState('');
  const [newMuscle, setNewMuscle] = useState<MuscleGroup>(MuscleGroup.Chest);
  const [newEquipment, setNewEquipment] = useState<Equipment>(Equipment.BodyWeight);
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const mode = searchParams.get('mode'); // 'select_routine' or null
  const routineId = searchParams.get('routineId');
  const returnTo = searchParams.get('returnTo') || '/';

  const hasActiveFilters = filterEquipment !== 'all' || filterMuscle !== 'all' || search.trim() !== '';

  const clearFilters = () => {
    setFilterEquipment('all');
    setFilterMuscle('all');
    setSearch('');
  };

  const getEquipmentLabel = (eq: Equipment): string => {
    return eq === Equipment.BodyWeight ? 'Body Weight' : eq;
  };

  const load = async () => {
    try {
      const ex = await db.getExercises();
      // Sort: Favorites first, then alphabetical
      ex.sort((a, b) => {
          if (a.is_favorite && !b.is_favorite) return -1;
          if (!a.is_favorite && b.is_favorite) return 1;
          return a.name.localeCompare(b.name);
      });
      setExercises(ex);
      setFiltered(ex);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let result = exercises;
    
    // Filter by equipment
    if (filterEquipment !== 'all') {
      result = result.filter(e => e.equipment === filterEquipment);
    }
    
    // Filter by muscle group
    if (filterMuscle !== 'all') {
      result = result.filter(e => e.muscle_group === filterMuscle);
    }
    
    // Filter by text search
    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(e => 
        e.name.toLowerCase().includes(lower) || 
        e.muscle_group.toLowerCase().includes(lower)
      );
    }
    
    setFiltered(result);
  }, [search, filterEquipment, filterMuscle, exercises]);

  const handleSelect = async (ex: Exercise) => {
    if (mode === 'select_routine' && routineId) {
        try {
            await db.addRoutineDay(routineId, ex.id);
            navigate(returnTo);
        } catch(e) {
            alert("Failed to add exercise");
        }
    } else {
        // Start Session Mode
        try {
            await db.createSession(ex.id, 3);
            navigate('/session');
        } catch(e) {
            alert("Active session already exists!");
            navigate('/session');
        }
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, ex: Exercise) => {
      e.stopPropagation();
      const newVal = !ex.is_favorite;
      
      // Optimistic update
      setExercises(prev => prev.map(item => item.id === ex.id ? {...item, is_favorite: newVal} : item));
      
      try {
          await db.toggleFavorite(ex.id, newVal);
          // Reload to ensure sync/sort logic persists correctly eventually
      } catch(e) {
          // Revert on fail
          setExercises(prev => prev.map(item => item.id === ex.id ? {...item, is_favorite: !newVal} : item));
      }
  };

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newName) return;
      setCreating(true);
      try {
          await db.createExercise(newName, newMuscle, newEquipment);
          setShowCreateModal(false);
          setNewName('');
          load(); // Reload list
      } catch(e) {
          alert("Failed to create exercise");
      } finally {
          setCreating(false);
      }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
             <h1 className="text-2xl font-bold text-white">
                 {mode === 'select_routine' ? 'Add to Routine' : 'Exercise Library'}
             </h1>
             <button 
                onClick={() => setShowCreateModal(true)}
                className="text-accent-400 font-medium text-sm hover:text-accent-500"
             >
                 + Create New
             </button>
        </div>
        
        <div className="relative mb-4">
            <input 
                type="text" 
                placeholder="Search exercises..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-brand-800 border border-brand-600 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-accent-500 focus:border-accent-500 focus:outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex gap-2 mb-6">
            <select
                value={filterMuscle}
                onChange={(e) => setFilterMuscle(e.target.value as MuscleGroup | 'all')}
                className="flex-1 bg-brand-800 border border-brand-600 rounded-lg py-2 px-3 text-sm text-white focus:ring-2 focus:ring-accent-500 focus:outline-none"
            >
                <option value="all">All Muscles</option>
                {Object.values(MuscleGroup).map(m => (
                    <option key={m} value={m}>{m}</option>
                ))}
            </select>
            <select
                value={filterEquipment}
                onChange={(e) => setFilterEquipment(e.target.value as Equipment | 'all')}
                className="flex-1 bg-brand-800 border border-brand-600 rounded-lg py-2 px-3 text-sm text-white focus:ring-2 focus:ring-accent-500 focus:outline-none"
            >
                <option value="all">All Equipment</option>
                {Object.values(Equipment).map(eq => (
                    <option key={eq} value={eq}>{getEquipmentLabel(eq)}</option>
                ))}
            </select>
            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    className="px-3 py-2 text-sm text-slate-400 hover:text-accent-400"
                >
                    Clear
                </button>
            )}
        </div>

        <div className="space-y-3 pb-24">
            {filtered.map(ex => (
                <button 
                    key={ex.id}
                    onClick={() => handleSelect(ex)}
                    className="w-full bg-brand-800 border border-brand-600 p-4 rounded-xl flex justify-between items-center group hover:bg-brand-700 hover:border-brand-500 text-left"
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                             <h4 className="font-bold text-slate-200">{ex.name}</h4>
                             {ex.is_curated && <span className="text-[10px] bg-brand-600 text-slate-300 px-1.5 py-0.5 rounded">Stock</span>}
                        </div>
                        <span className="text-xs text-slate-400 bg-brand-900 px-2 py-1 rounded mt-1 inline-block mr-2">
                            {ex.muscle_group}
                        </span>
                        <span className="text-xs text-slate-500">
                            {getEquipmentLabel(ex.equipment)}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div 
                            onClick={(e) => toggleFavorite(e, ex)}
                            className={`p-2 rounded-full ${ex.is_favorite ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'}`}
                        >
                            <Star size={18} fill={ex.is_favorite ? "currentColor" : "none"} />
                        </div>
                        <div className="bg-brand-900 p-2 rounded-full text-slate-500 group-hover:text-accent-500 group-hover:bg-accent-500/20">
                            <Plus size={16} />
                        </div>
                    </div>
                </button>
            ))}
            
            {filtered.length === 0 && (
                <div className="text-center text-slate-500 py-8">
                    No exercises found.
                </div>
            )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
            <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-4">
                <div className="bg-brand-800 w-full max-w-sm rounded-xl p-6 border border-brand-600 shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">Create Exercise</h3>
                        <button onClick={() => setShowCreateModal(false)}><X className="text-slate-400 hover:text-white" /></button>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-400">Name</label>
                            <input 
                                className="w-full bg-brand-900 border border-brand-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-accent-500 focus:border-accent-500 focus:outline-none"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="e.g. Diamond Pushup"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-400">Muscle</label>
                                <select 
                                    className="w-full bg-brand-900 border border-brand-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-accent-500 focus:outline-none"
                                    value={newMuscle}
                                    onChange={e => setNewMuscle(e.target.value as MuscleGroup)}
                                >
                                    {Object.values(MuscleGroup).map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Equipment</label>
                                <select 
                                    className="w-full bg-brand-900 border border-brand-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-accent-500 focus:outline-none"
                                    value={newEquipment}
                                    onChange={e => setNewEquipment(e.target.value as Equipment)}
                                >
                                    {Object.values(Equipment).map(e => (
                                        <option key={e} value={e}>
                                            {e === Equipment.BodyWeight ? 'Body Weight' : e}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={creating || !newName}
                            className="w-full bg-accent-500 hover:bg-accent-600 py-3 rounded-lg font-bold text-white mt-4 disabled:opacity-50"
                        >
                            {creating ? 'Saving...' : 'Save Custom Exercise'}
                        </button>
                    </form>
                </div>
            </div>
        )}
      </div>
    </Layout>
  );
};

export default ExerciseLibrary;
