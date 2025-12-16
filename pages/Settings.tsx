
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { UserSettings, ImageMode, ArcRules, ContentType, AllowedTechnique, BlockedTactic } from '../types';
import { DEFAULT_SETTINGS, DEFAULT_ARC_RULES } from '../constants';
import { Save, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

type Tab = 'global' | 'guardrails' | ContentType;

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('global');
  const [settings, setSettings] = useState<UserSettings | null>(null);
  
  // Rules for each arc type
  const [quoteRules, setQuoteRules] = useState<ArcRules | null>(null);
  const [proverbRules, setProverbRules] = useState<ArcRules | null>(null);
  const [researchRules, setResearchRules] = useState<ArcRules | null>(null);
  const [questioningRules, setQuestioningRules] = useState<ArcRules | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Fetch Main Settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (settingsData) {
      // Merge defaults to handle new columns (like guardrails) if they are missing/null in retrieved object initially
      setSettings({ ...DEFAULT_SETTINGS, ...settingsData });
    } else {
      setSettings({ user_id: user.id, ...DEFAULT_SETTINGS } as UserSettings);
    }

    // 2. Fetch Rules Helper
    const fetchRules = async (table: string, type: ContentType, setter: React.Dispatch<React.SetStateAction<ArcRules | null>>) => {
        const { data, error } = await supabase.from(table).select('*').eq('user_id', user.id).single();
        if (data) {
            setter(data);
        } else {
            // Use defaults if no record exists
            setter({ user_id: user.id, ...DEFAULT_ARC_RULES[type] } as ArcRules);
        }
    };

    await Promise.all([
        fetchRules('quote_post_rules', ContentType.QUOTE, setQuoteRules),
        fetchRules('parable_post_rules', ContentType.PROVERB, setProverbRules),
        fetchRules('research_post_rules', ContentType.RESEARCH, setResearchRules),
        fetchRules('question_post_rules', ContentType.QUESTIONING, setQuestioningRules),
    ]);

    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings || !quoteRules || !proverbRules || !researchRules || !questioningRules) return;
    setSaving(true);
    setMessage(null);

    try {
        // Save Main Settings
        const { error: sErr } = await supabase.from('settings').upsert(settings, { onConflict: 'user_id' });
        if (sErr) throw sErr;

        // Save Rules
        const { error: qErr } = await supabase.from('quote_post_rules').upsert(quoteRules, { onConflict: 'user_id' });
        if (qErr) throw qErr;

        const { error: pErr } = await supabase.from('parable_post_rules').upsert(proverbRules, { onConflict: 'user_id' });
        if (pErr) throw pErr;

        const { error: rErr } = await supabase.from('research_post_rules').upsert(researchRules, { onConflict: 'user_id' });
        if (rErr) throw rErr;

        const { error: quErr } = await supabase.from('question_post_rules').upsert(questioningRules, { onConflict: 'user_id' });
        if (quErr) throw quErr;

        setMessage({ type: 'success', text: 'All settings and rules saved successfully.' });

    } catch (error: any) {
        console.error(error);
        setMessage({ type: 'error', text: 'Failed to save settings: ' + error.message });
    } finally {
        setSaving(false);
    }
  };

  const handleChange = (key: keyof UserSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const toggleArrayItem = (key: 'allowed_techniques' | 'blocked_tactics', item: string) => {
    if (!settings) return;
    const currentList = settings[key] || [];
    if (currentList.includes(item)) {
        handleChange(key, currentList.filter(i => i !== item));
    } else {
        handleChange(key, [...currentList, item]);
    }
  };

  const handleRuleChange = (
      setter: React.Dispatch<React.SetStateAction<ArcRules | null>>, 
      rules: ArcRules | null, 
      key: keyof ArcRules, 
      value: string
  ) => {
      if (!rules) return;
      setter({ ...rules, [key]: value });
  };

  const renderArcTab = (
      label: string, 
      contentType: ContentType, 
      rules: ArcRules | null, 
      setRules: React.Dispatch<React.SetStateAction<ArcRules | null>>,
      imageStyleSingleKey: keyof UserSettings,
      imageStylePerSlideKey: keyof UserSettings
    ) => {
      if (!rules) return <div>Loading rules...</div>;
      
      return (
          <div className="space-y-8 animate-fadeIn">
              {/* Character Limit */}
              <section className="bg-surface p-6 rounded-xl border border-border">
                  <h3 className="text-xl font-semibold mb-4 text-text">{label} Constraints</h3>
                  <div className="w-full md:w-1/3">
                      <label className="block text-sm font-medium text-textMuted mb-2">Character Limit per Slide</label>
                      <input 
                          type="text"
                          value={rules.slide_character_limits || "220"}
                          onChange={(e) => handleRuleChange(setRules, rules, 'slide_character_limits', e.target.value)}
                          className="w-full bg-background border border-border rounded-lg p-3 text-text focus:ring-2 focus:ring-primary outline-none"
                      />
                  </div>
              </section>

              {/* Text Generation Rules */}
              <section className="bg-surface p-6 rounded-xl border border-border">
                  <h3 className="text-xl font-semibold mb-4 text-text">Slide Generation Instructions</h3>
                  <p className="text-sm text-textMuted mb-6">Define exactly what the AI should write for each slide in the {label} arc.</p>
                  
                  <div className="space-y-6">
                      {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                          const key = `slide_${num}` as keyof ArcRules;
                          return (
                              <div key={num}>
                                  <label className="block text-sm font-medium text-blue-400 mb-2">Slide {num} Instruction</label>
                                  <textarea 
                                      value={rules[key] as string || ''}
                                      onChange={(e) => handleRuleChange(setRules, rules, key, e.target.value)}
                                      className="w-full bg-background border border-border rounded-lg p-3 text-text h-24 focus:ring-1 focus:ring-primary outline-none text-sm"
                                  />
                              </div>
                          );
                      })}
                  </div>
              </section>

              {/* Image Styles */}
              <section className="bg-surface p-6 rounded-xl border border-border">
                  <h3 className="text-xl font-semibold mb-4 text-text">Image Styles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-medium text-textMuted mb-2">Single Mode Prompt (Background)</label>
                          <textarea
                              value={settings?.[imageStyleSingleKey] as string || ''}
                              onChange={(e) => handleChange(imageStyleSingleKey, e.target.value)}
                              className="w-full bg-background border border-border rounded-lg p-3 text-text h-32 focus:ring-1 focus:ring-primary outline-none text-sm"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-textMuted mb-2">Per-Slide Mode Style Prompt</label>
                          <textarea
                              value={settings?.[imageStylePerSlideKey] as string || ''}
                              onChange={(e) => handleChange(imageStylePerSlideKey, e.target.value)}
                              className="w-full bg-background border border-border rounded-lg p-3 text-text h-32 focus:ring-1 focus:ring-primary outline-none text-sm"
                          />
                      </div>
                  </div>
              </section>
          </div>
      );
  };

  if (loading) return <Layout><div className="flex justify-center p-10 text-textMuted">Loading configuration...</div></Layout>;

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-text">Configuration</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-primary hover:bg-primaryHover text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex space-x-1 md:space-x-2 overflow-x-auto pb-2 mb-6 border-b border-border">
          <button
              onClick={() => setActiveTab('global')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'global' ? 'bg-surface text-primary border-b-2 border-primary' : 'text-textMuted hover:text-text'}`}
          >
              Global & General
          </button>
          <button
              onClick={() => setActiveTab('guardrails')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'guardrails' ? 'bg-surface text-yellow-500 border-b-2 border-yellow-500' : 'text-textMuted hover:text-text'}`}
          >
              Guardrails
          </button>
          <button
              onClick={() => setActiveTab(ContentType.QUOTE)}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${activeTab === ContentType.QUOTE ? 'bg-surface text-blue-400 border-b-2 border-blue-400' : 'text-textMuted hover:text-text'}`}
          >
              Quotes
          </button>
          <button
              onClick={() => setActiveTab(ContentType.PROVERB)}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${activeTab === ContentType.PROVERB ? 'bg-surface text-purple-400 border-b-2 border-purple-400' : 'text-textMuted hover:text-text'}`}
          >
              Proverbs
          </button>
          <button
              onClick={() => setActiveTab(ContentType.RESEARCH)}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${activeTab === ContentType.RESEARCH ? 'bg-surface text-green-400 border-b-2 border-green-400' : 'text-textMuted hover:text-text'}`}
          >
              Research
          </button>
          <button
              onClick={() => setActiveTab(ContentType.QUESTIONING)}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${activeTab === ContentType.QUESTIONING ? 'bg-surface text-red-500 border-b-2 border-red-500' : 'text-textMuted hover:text-text'}`}
          >
              Questioning
          </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
          {activeTab === 'global' && settings && (
              <div className="space-y-8 animate-fadeIn">
                  <section className="bg-surface p-6 rounded-xl border border-border">
                      <h3 className="text-xl font-semibold mb-4 text-text">Global Rules</h3>
                      <p className="text-sm text-textMuted mb-2">Instructions applied to EVERY generation, regardless of arc.</p>
                      <textarea
                          value={settings.global_rules}
                          onChange={(e) => handleChange('global_rules', e.target.value)}
                          className="w-full bg-background border border-border rounded-lg p-3 text-text h-32 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                  </section>

                  <section className="bg-surface p-6 rounded-xl border border-border">
                      <h3 className="text-xl font-semibold mb-4 text-text">Target Audience</h3>
                      <p className="text-sm text-textMuted mb-2">Default audience profile (can be overridden per post).</p>
                      <input
                          type="text"
                          value={settings.default_target_audience}
                          onChange={(e) => handleChange('default_target_audience', e.target.value)}
                          className="w-full bg-background border border-border rounded-lg p-3 text-text focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                  </section>

                  <section className="bg-surface p-6 rounded-xl border border-border">
                    <h3 className="text-xl font-semibold mb-4 text-text">Image Configuration</h3>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-textMuted mb-2">Generation Mode</label>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleChange('image_mode', ImageMode.SINGLE)}
                          className={`px-4 py-2 rounded-lg border transition-all ${
                            settings.image_mode === ImageMode.SINGLE 
                              ? 'bg-primary/20 border-primary text-primary' 
                              : 'border-border text-textMuted hover:bg-surfaceHighlight'
                          }`}
                        >
                          Single Image (Background)
                        </button>
                        <button
                          onClick={() => handleChange('image_mode', ImageMode.PER_SLIDE)}
                          className={`px-4 py-2 rounded-lg border transition-all ${
                            settings.image_mode === ImageMode.PER_SLIDE 
                              ? 'bg-primary/20 border-primary text-primary' 
                              : 'border-border text-textMuted hover:bg-surfaceHighlight'
                          }`}
                        >
                          Image Per Slide
                        </button>
                      </div>
                    </div>
                  </section>
              </div>
          )}

          {activeTab === 'guardrails' && settings && (
            <div className="space-y-8 animate-fadeIn">
               <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                     <ShieldAlert className="text-yellow-500" size={24} />
                     <h3 className="text-xl font-bold text-text">Guardrails Layer</h3>
                  </div>
                  <p className="text-sm text-textMuted mb-6 max-w-2xl">
                    Define non-negotiable constraints to prevent low-quality, unethical, or hallucinatory output. These rules are injected into the generator prompt with high priority.
                  </p>
                  
                  <div className="flex items-center space-x-4 mb-6">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={settings.guardrails_enabled}
                          onChange={(e) => handleChange('guardrails_enabled', e.target.checked)}
                          className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary"
                        />
                        <span className="font-medium text-text">Enable Guardrails</span>
                      </label>
                  </div>

                  {settings.guardrails_enabled && (
                    <div className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-textMuted mb-2">Strictness Level</label>
                            <select
                              value={settings.guardrails_strictness}
                              onChange={(e) => handleChange('guardrails_strictness', e.target.value)}
                              className="w-full bg-background border border-border rounded-lg p-3 text-text focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="Standard">Standard (Balanced)</option>
                                <option value="Strict">Strict (High Caution & Hedging)</option>
                            </select>
                            <p className="text-xs text-textMuted mt-2">Strict mode forces hedging on all probabilistic claims.</p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-textMuted mb-2">Brand Boundaries (Optional)</label>
                            <input
                              type="text"
                              value={settings.brand_boundaries}
                              onChange={(e) => handleChange('brand_boundaries', e.target.value)}
                              placeholder="e.g. No swearing, keep tone professional"
                              className="w-full bg-background border border-border rounded-lg p-3 text-text focus:ring-2 focus:ring-primary outline-none"
                            />
                          </div>
                       </div>
                    </div>
                  )}
               </div>

               {settings.guardrails_enabled && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Allowed Techniques */}
                    <div className="bg-surface p-6 rounded-xl border border-border">
                       <div className="flex items-center space-x-2 mb-4 text-green-400">
                          <CheckCircle size={20} />
                          <h3 className="text-lg font-semibold">Allowed Persuasion Techniques</h3>
                       </div>
                       <div className="space-y-3">
                          {Object.values(AllowedTechnique).map((tech) => (
                             <label key={tech} className="flex items-start space-x-3 cursor-pointer group p-2 hover:bg-surfaceHighlight rounded-lg transition-colors">
                                <input 
                                  type="checkbox"
                                  checked={settings.allowed_techniques.includes(tech)}
                                  onChange={() => toggleArrayItem('allowed_techniques', tech)}
                                  className="mt-1 w-4 h-4 rounded border-border bg-background text-green-500 focus:ring-green-500"
                                />
                                <div className="text-sm">
                                   <span className="text-text block capitalize">{tech.replace(/_/g, ' ')}</span>
                                </div>
                             </label>
                          ))}
                       </div>
                    </div>

                    {/* Blocked Tactics */}
                    <div className="bg-surface p-6 rounded-xl border border-border">
                       <div className="flex items-center space-x-2 mb-4 text-red-400">
                          <XCircle size={20} />
                          <h3 className="text-lg font-semibold">Disallowed Tactics (Blocked)</h3>
                       </div>
                       <div className="space-y-3">
                          {Object.values(BlockedTactic).map((tactic) => (
                             <label key={tactic} className="flex items-start space-x-3 cursor-pointer group p-2 hover:bg-surfaceHighlight rounded-lg transition-colors">
                                <input 
                                  type="checkbox"
                                  checked={settings.blocked_tactics.includes(tactic)}
                                  onChange={() => toggleArrayItem('blocked_tactics', tactic)}
                                  className="mt-1 w-4 h-4 rounded border-border bg-background text-red-500 focus:ring-red-500"
                                />
                                <div className="text-sm">
                                   <span className="text-text block capitalize">{tactic.replace(/_/g, ' ')}</span>
                                </div>
                             </label>
                          ))}
                       </div>
                    </div>
                 </div>
               )}
            </div>
          )}

          {activeTab === ContentType.QUOTE && renderArcTab('Quotes', ContentType.QUOTE, quoteRules, setQuoteRules, 'quotes_image_style_single', 'quotes_image_style_per_slide')}
          {activeTab === ContentType.PROVERB && renderArcTab('Proverbs', ContentType.PROVERB, proverbRules, setProverbRules, 'proverbs_image_style_single', 'proverbs_image_style_per_slide')}
          {activeTab === ContentType.RESEARCH && renderArcTab('Research', ContentType.RESEARCH, researchRules, setResearchRules, 'research_image_style_single', 'research_image_style_per_slide')}
          {activeTab === ContentType.QUESTIONING && renderArcTab('Questioning', ContentType.QUESTIONING, questioningRules, setQuestioningRules, 'questioning_image_style_single', 'questioning_image_style_per_slide')}
      </div>
    </Layout>
  );
};

export default Settings;