
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ContentType, UserSettings, ImageMode, PostStatus, ArcRules } from '../types';
import { DEFAULT_SETTINGS, DEFAULT_ARC_RULES } from '../constants';
import { generatePostContent, generateImage, constructImagePrompt } from '../services/geminiService';
import { Wand2 } from 'lucide-react';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const [idea, setIdea] = useState('');
  const [contentType, setContentType] = useState<ContentType>(ContentType.QUOTE);
  const [targetAudience, setTargetAudience] = useState('');
  const [imageInstructions, setImageInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase.from('settings').select('*').eq('user_id', user.id).single();
    if (data) {
        // Merge with defaults to ensure new fields (Guardrails) are present even if DB is empty
        const mergedSettings = { ...DEFAULT_SETTINGS, ...data };
        setSettings(mergedSettings as UserSettings);
        setTargetAudience(mergedSettings.default_target_audience || '');
    } else {
        setSettings({ user_id: user.id, ...DEFAULT_SETTINGS } as UserSettings);
        setTargetAudience(DEFAULT_SETTINGS.default_target_audience || '');
    }
    setLoadingSettings(false);
  };

  const getRulesTableName = (type: ContentType) => {
      switch(type) {
          case ContentType.QUOTE: return 'quote_post_rules';
          case ContentType.PROVERB: return 'parable_post_rules';
          case ContentType.RESEARCH: return 'research_post_rules';
          case ContentType.QUESTIONING: return 'question_post_rules';
      }
  };

  const handleGenerate = async () => {
    if (!settings) return;
    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 0. Fetch Specific Arc Rules
      setStatusText("Loading configuration...");
      const tableName = getRulesTableName(contentType);
      const { data: rulesData } = await supabase.from(tableName).select('*').eq('user_id', user.id).single();
      const arcRules: ArcRules = rulesData || { user_id: user.id, ...DEFAULT_ARC_RULES[contentType] };

      // 1. Generate Text Content
      setStatusText("Constructing viral arc & caption...");
      const generated = await generatePostContent(contentType, idea, targetAudience, settings, arcRules);

      // 2. Generate Images
      setStatusText("Synthesizing visuals...");
      const mediaAssets = [];
      
      if (settings.image_mode === ImageMode.PER_SLIDE) {
        // Per slide generation: Unique image for each slide
        for (let i = 0; i < generated.slides.length; i++) {
          const slide = generated.slides[i];
          setStatusText(`Generating image for slide ${i + 1}/${generated.slides.length}...`);
          const prompt = constructImagePrompt(contentType, idea, slide.text, settings, imageInstructions);
          const imageUrl = await generateImage(prompt);
          mediaAssets.push({
            slide_index: i + 1,
            url: imageUrl,
            type: 'image'
          });
        }
      } else {
        // Single image generation: One image, but saved as an entry for EVERY slide
        setStatusText("Generating background visual...");
        const prompt = constructImagePrompt(contentType, idea, null, settings, imageInstructions);
        const imageUrl = await generateImage(prompt);
        
        // Loop through slides to create 1-to-1 mapping
        for (let i = 0; i < generated.slides.length; i++) {
            mediaAssets.push({
                slide_index: i + 1,
                url: imageUrl,
                type: 'image'
            });
        }
      }

      // 3. Save to Supabase
      setStatusText("Saving draft...");
      
      // Save Post
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content_type: contentType,
          input_text: idea,
          target_audience_override: targetAudience,
          short_caption: generated.caption.short,
          long_description: generated.caption.long,
          keyword_paragraph: generated.caption.keywords ? generated.caption.keywords.join(', ') : null, // Flatten simple list for now
          hashtags: generated.caption.hashtags.join(' '),
          status: PostStatus.DRAFT
        })
        .select()
        .single();

      if (postError) throw postError;

      // Save Slides
      const slidesPayload = generated.slides.map((s, i) => ({
        post_id: postData.id,
        slide_index: i + 1,
        role: s.role,
        text: s.text
      }));
      await supabase.from('slides').insert(slidesPayload);

      // Save Media
      const mediaPayload = mediaAssets.map(m => ({
        post_id: postData.id,
        ...m
      }));
      await supabase.from('media_assets').insert(mediaPayload);

      navigate(`/post/${postData.id}`);

    } catch (error) {
      console.error(error);
      alert("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loadingSettings) return <Layout><div className="p-10">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Create New Arc</h2>
        <p className="text-textMuted mb-8">Transform a simple idea into a psychologically gripping carousel.</p>

        <div className="space-y-6 bg-surface p-8 rounded-2xl border border-border shadow-lg">
          
          {/* Idea Input */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">The Idea (Quote, Principle, Research Finding)</label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g., You don't need more motivation, you need clarity."
              className="w-full bg-background border border-border rounded-lg p-4 text-text h-32 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Content Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Content Arc</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                className="w-full bg-background border border-border rounded-lg p-3 text-text focus:ring-2 focus:ring-primary outline-none"
              >
                <option value={ContentType.QUOTE}>Contextual Bridge (Quote)</option>
                <option value={ContentType.PROVERB}>Narrative Tension (Proverb)</option>
                <option value={ContentType.RESEARCH}>Counter-Intuitive Insight (Research)</option>
                <option value={ContentType.QUESTIONING}>Dissonance Amplifier (Questioning)</option>
              </select>
            </div>

            <div>
               <label className="block text-sm font-medium text-text mb-2">Target Audience</label>
               <input 
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-3 text-text focus:ring-2 focus:ring-primary outline-none"
               />
            </div>
          </div>

          {/* Image Instructions */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Image Instructions (Optional)</label>
            <textarea 
               value={imageInstructions}
               onChange={(e) => setImageInstructions(e.target.value)}
               placeholder="Specific requests for the image generation (e.g. 'Use a dark red forest background')"
               className="w-full bg-background border border-border rounded-lg p-3 text-text h-20 focus:ring-2 focus:ring-primary outline-none resize-none text-sm"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !idea.trim()}
              className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-primary/20 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                   <span className="animate-spin mr-2">⟳</span>
                   <span>{statusText}</span>
                </>
              ) : (
                <>
                  <Wand2 size={20} />
                  <span>Generate Viral Arc</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreatePost;