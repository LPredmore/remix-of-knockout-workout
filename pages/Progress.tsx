import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { db } from '../services/db';
import { Session, Exercise, Equipment, MuscleGroup } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Flame } from 'lucide-react';

const Progress: React.FC = () => {
  const [history, setHistory] = useState<Session[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [filterEquipment, setFilterEquipment] = useState<Equipment | 'all'>('all');
  const [filterMuscle, setFilterMuscle] = useState<MuscleGroup | 'all'>('all');

  const hasActiveFilters = filterEquipment !== 'all' || filterMuscle !== 'all' || search.trim() !== '';

  const clearFilters = () => {
    setFilterEquipment('all');
    setFilterMuscle('all');
    setSearch('');
  };

  const getEquipmentLabel = (eq: Equipment): string => {
    return eq === Equipment.BodyWeight ? 'Body Weight' : eq;
  };
  
  useEffect(() => {
    const load = async () => {
      try {
        const sess = await db.getHistory();
        const ex = await db.getExercises();
        setHistory(sess);
        setExercises(ex);
        if (ex.length > 0) setSelectedExerciseId(ex[0].id);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  // Filter exercises based on search and filters
  useEffect(() => {
    let result = exercises;
    
    if (filterEquipment !== 'all') {
      result = result.filter(e => e.equipment === filterEquipment);
    }
    
    if (filterMuscle !== 'all') {
      result = result.filter(e => e.muscle_group === filterMuscle);
    }
    
    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter(e => 
        e.name.toLowerCase().includes(lower) || 
        e.muscle_group.toLowerCase().includes(lower)
      );
    }
    
    setFilteredExercises(result);
  }, [search, filterEquipment, filterMuscle, exercises]);

  // Auto-select first visible exercise if current selection is filtered out
  useEffect(() => {
    if (filteredExercises.length > 0 && !filteredExercises.find(e => e.id === selectedExerciseId)) {
      setSelectedExerciseId(filteredExercises[0].id);
    }
  }, [filteredExercises, selectedExerciseId]);

  // Compute stats for chart
  const getChartData = () => {
    if (!selectedExerciseId) return [];
    
    // Filter sessions for this exercise, sort by date
    const relevantSessions = history
        .filter(s => s.exercise_id === selectedExerciseId && s.completed_at)
        .sort((a,b) => new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime());
    
    const exercise = exercises.find(e => e.id === selectedExerciseId);
    if (!exercise) return [];

    return relevantSessions.map(s => {
        const firstSet = s.sets && s.sets.length > 0 ? s.sets[0] : null;
        if (!firstSet) return null;

        // Metric Calculation
        let metric = 0;
        if (exercise.equipment === Equipment.BodyWeight) {
             metric = Number(firstSet.reps) || 0; // Max Reps
        } else {
             // Epley 1RM
             const w = Number(firstSet.weight_lbs) || 0;
             const r = Number(firstSet.reps) || 0;
             metric = w * (1 + r / 30);
        }

        return {
            date: new Date(s.completed_at!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            metric: Math.round(metric),
            volume: s.sets.reduce((acc, curr) => {
                const w = curr.weight_lbs === null ? 1 : Number(curr.weight_lbs || 0);
                const r = Number(curr.reps || 0);
                // For BW volume, just sum reps. For Weighted, sum load.
                if (exercise.equipment === Equipment.BodyWeight) return acc + r;
                return acc + (w * r);
            }, 0)
        };
    }).filter(Boolean);
  };

  const chartData = getChartData();
  const currentEx = exercises.find(e => e.id === selectedExerciseId);

  // Calendar Heatmap Logic (Basic Last 30 Days)
  const getCalendarDays = () => {
      const days = [];
      const today = new Date();
      for(let i=29; i>=0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const dateStr = d.toDateString();
          
          const hasWorkout = history.some(s => s.completed_at && new Date(s.completed_at).toDateString() === dateStr);
          days.push({ date: d, hasWorkout });
      }
      return days;
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-white">Progress</h1>

        {/* Calendar Strip */}
        <div className="bg-brand-800 rounded-xl p-4 border border-brand-600 mb-8">
            <h3 className="text-slate-300 text-sm font-bold uppercase mb-3 flex items-center gap-2">
              <Flame size={16} className="text-accent-500" />
              Last 30 Days Consistency
            </h3>
            <div className="flex flex-wrap gap-1 justify-center">
                {getCalendarDays().map((d, i) => (
                    <div 
                        key={i} 
                        className={`w-2.5 h-2.5 rounded-full ${d.hasWorkout ? 'bg-success-500 glow-success-sm' : 'bg-brand-600'}`}
                        title={d.date.toDateString()}
                    />
                ))}
            </div>
            <div className="mt-4 text-center">
                <span className="text-3xl font-bold text-white">{history.length}</span>
                <span className="text-slate-400 text-sm ml-2">total sessions</span>
            </div>
        </div>

        {/* Exercise Filter */}
        <div className="bg-brand-800 rounded-xl p-4 border border-brand-600 mb-6">
          <label className="text-sm text-slate-300 block mb-3">Select Exercise</label>
          
          {/* Search Input */}
          <div className="relative mb-3">
            <input 
              type="text" 
              placeholder="Search exercises..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-brand-900 border border-brand-600 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:ring-2 focus:ring-accent-500 focus:border-accent-500 focus:outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex gap-2 mb-3">
            <select
              value={filterMuscle}
              onChange={(e) => setFilterMuscle(e.target.value as MuscleGroup | 'all')}
              className="flex-1 bg-brand-900 border border-brand-600 rounded-lg py-2 px-3 text-sm text-white focus:ring-2 focus:ring-accent-500 focus:outline-none"
            >
              <option value="all">All Muscles</option>
              {Object.values(MuscleGroup).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              value={filterEquipment}
              onChange={(e) => setFilterEquipment(e.target.value as Equipment | 'all')}
              className="flex-1 bg-brand-900 border border-brand-600 rounded-lg py-2 px-3 text-sm text-white focus:ring-2 focus:ring-accent-500 focus:outline-none"
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

          {/* Exercise List */}
          <div className="max-h-48 overflow-y-auto rounded-lg bg-brand-900 border border-brand-600">
            {filteredExercises.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">No exercises found</div>
            ) : (
              filteredExercises.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExerciseId(ex.id)}
                  className={`w-full p-3 text-left border-b border-brand-700/50 last:border-0
                    ${selectedExerciseId === ex.id 
                      ? 'bg-accent-500/20 border-l-2 border-l-accent-500' 
                      : 'hover:bg-brand-800'}`}
                >
                  <div className="font-medium text-white text-sm">{ex.name}</div>
                  <div className="text-xs text-slate-400">
                    {ex.muscle_group} • {getEquipmentLabel(ex.equipment)}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Charts */}
        {chartData.length > 0 ? (
            <div className="space-y-6">
                <div className="bg-brand-800 rounded-xl p-4 border border-brand-600">
                    <h3 className="text-slate-300 font-bold mb-4">
                        {currentEx?.equipment === Equipment.BodyWeight ? 'Max Reps (Set 1)' : 'Est. 1RM (lbs)'}
                    </h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickMargin={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} domain={['auto', 'auto']} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1c1c24', border: '1px solid #2a2a35', color: '#fff', borderRadius: '8px' }}
                                />
                                <Line type="monotone" dataKey="metric" stroke="#f97316" strokeWidth={2} dot={{r: 4, fill: '#f97316'}} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-brand-800 rounded-xl p-4 border border-brand-600">
                    <h3 className="text-slate-300 font-bold mb-4">Total Volume</h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickMargin={10} />
                                <YAxis stroke="#94a3b8" fontSize={10} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1c1c24', border: '1px solid #2a2a35', color: '#fff', borderRadius: '8px' }}
                                />
                                <Line type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={2} dot={{r: 4, fill: '#10b981'}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        ) : (
            <div className="text-center py-10 text-slate-500 bg-brand-800 rounded-xl border border-brand-600">
                No data available for this exercise yet.
            </div>
        )}
      </div>
    </Layout>
  );
};

export default Progress;
