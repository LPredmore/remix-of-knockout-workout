
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { Post, Slide, MediaAsset, PostStatus, ImageMode, UserSettings, ContentType, ArcRules } from '../types';
import { Check, RefreshCw, ChevronLeft, ChevronRight, Copy, Download, Trash2, AlertTriangle } from 'lucide-react';
import { generateImage, constructImagePrompt } from '../services/geminiService';
import { toPng } from 'html-to-image';
import { DEFAULT_SETTINGS, DEFAULT_ARC_RULES } from '../constants';

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const slideRef = useRef<HTMLDivElement>(null);
  
  const [post, setPost] = useState<Post | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [arcRules, setArcRules] = useState<ArcRules | null>(null);
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [regeneratingImage, setRegeneratingImage] = useState(false);
  const [regenPrompt, setRegenPrompt] = useState<string>("");
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [regenScope, setRegenScope] = useState<'current' | 'all'>('current');
  
  // New state for combined caption editing
  const [combinedCaption, setCombinedCaption] = useState("");

  useEffect(() => {
    if (id) fetchPostData();
  }, [id]);

  const fetchPostData = async () => {
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (postError) {
       console.error(postError);
       return;
    }

    const { data: slidesData } = await supabase
      .from('slides')
      .select('*')
      .eq('post_id', id)
      .order('slide_index', { ascending: true });

    const { data: mediaData } = await supabase
      .from('media_assets')
      .select('*')
      .eq('post_id', id);

    // Fetch settings for prompts
    const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', postData.user_id)
        .single();
    
    // Fetch Arc Rules for limits
    let rulesTable = 'quote_post_rules';
    switch(postData.content_type) {
        case ContentType.QUOTE: rulesTable = 'quote_post_rules'; break;
        case ContentType.PROVERB: rulesTable = 'parable_post_rules'; break;
        case ContentType.RESEARCH: rulesTable = 'research_post_rules'; break;
        case ContentType.QUESTIONING: rulesTable = 'question_post_rules'; break;
    }

    const { data: rulesData } = await supabase
        .from(rulesTable)
        .select('*')
        .eq('user_id', postData.user_id)
        .single();

    const mergedSettings = { ...DEFAULT_SETTINGS, ...settingsData };
    const mergedRules = rulesData || { ...DEFAULT_ARC_RULES[postData.content_type as ContentType] };

    setPost(postData);
    setSlides(slidesData || []);
    setMedia(mediaData || []);
    setSettings(mergedSettings as UserSettings);
    setArcRules(mergedRules as ArcRules);
    
    // Initialize combined caption
    const parts = [
        postData.short_caption,
        postData.long_description,
        postData.keyword_paragraph,
        postData.hashtags
    ].filter(Boolean);
    setCombinedCaption(parts.join('\n\n'));
    
    setLoading(false);
  };

  const handleSave = async () => {
    if (!post) return;
    setSaving(true);
    
    // We save the entire combined caption into long_description for simplicity in this "One Big Box" mode
    await supabase.from('posts').update({
        short_caption: '', 
        long_description: combinedCaption,
        keyword_paragraph: '', 
        hashtags: '', 
        status: PostStatus.APPROVED,
        updated_at: new Date().toISOString()
    }).eq('id', post.id);

    // Update Slides
    for (const slide of slides) {
        if (slide.id) {
            await supabase.from('slides').update({ text: slide.text }).eq('id', slide.id);
        }
    }
    
    setSaving(false);
    navigate('/');
  };

  const confirmDelete = async () => {
      if (!post) return;
      setDeleting(true);
      setShowDeleteConfirm(false);
      
      try {
          // Manual cascade delete
          await supabase.from('media_assets').delete().eq('post_id', post.id);
          await supabase.from('slides').delete().eq('post_id', post.id);
          const { error } = await supabase.from('posts').delete().eq('id', post.id);
          
          if (error) throw error;
          navigate('/');
      } catch (error) {
          console.error("Error deleting post:", error);
          alert("Failed to delete post. Check console for details.");
          setDeleting(false);
      }
  };

  const openRegenModal = () => {
      if (!post || !settings) return;
      
      const isPerSlide = settings.image_mode === ImageMode.PER_SLIDE;
      const currentSlide = slides[currentSlideIndex];
      
      const prompt = constructImagePrompt(
            post.content_type, 
            post.input_text, 
            isPerSlide ? currentSlide.text : null, 
            settings
        );
      setRegenPrompt(prompt);
      setRegenScope('current'); // Default to current
      setShowRegenModal(true);
  }

  const handleRegenerateImage = async () => {
    if (!post || !settings) return;
    setRegeneratingImage(true);
    setShowRegenModal(false);

    try {
        const isPerSlide = settings.image_mode === ImageMode.PER_SLIDE;
        const currentSlide = slides[currentSlideIndex];

        // 1. CURRENT SLIDE REGENERATION
        if (regenScope === 'current') {
             const finalPrompt = isPerSlide 
                 ? `${regenPrompt} Context: ${currentSlide.text}` 
                 : regenPrompt;
             
             const newUrl = await generateImage(finalPrompt);
             
             const existingMedia = media.find(m => m.slide_index === currentSlide.slide_index);
             
             if (existingMedia && existingMedia.id) {
                 await supabase.from('media_assets').update({ url: newUrl }).eq('id', existingMedia.id);
                 setMedia(prev => prev.map(m => m.id === existingMedia.id ? { ...m, url: newUrl } : m));
             } else {
                 const { data } = await supabase.from('media_assets').insert({
                     post_id: post.id,
                     slide_index: currentSlide.slide_index,
                     url: newUrl,
                     type: 'image'
                 }).select().single();
                 if(data) setMedia(prev => [...prev, data]);
             }
        } 
        // 2. ALL SLIDES REGENERATION
        else {
             if (!isPerSlide) {
                 const newUrl = await generateImage(regenPrompt);
                 await supabase.from('media_assets')
                    .update({ url: newUrl })
                    .eq('post_id', post.id);
                 setMedia(prev => prev.map(m => ({ ...m, url: newUrl })));
                 
             } else {
                 const newMediaState = [...media];
                 for (const slide of slides) {
                     const specificPrompt = `${regenPrompt} Context: ${slide.text}`;
                     const newUrl = await generateImage(specificPrompt);
                     
                     const existingMedia = newMediaState.find(m => m.slide_index === slide.slide_index);
                     
                     if (existingMedia && existingMedia.id) {
                         await supabase.from('media_assets').update({ url: newUrl }).eq('id', existingMedia.id);
                         existingMedia.url = newUrl;
                     } else {
                         const { data } = await supabase.from('media_assets').insert({
                             post_id: post.id,
                             slide_index: slide.slide_index,
                             url: newUrl,
                             type: 'image'
                         }).select().single();
                         if(data) newMediaState.push(data);
                     }
                 }
                 setMedia(newMediaState);
             }
        }

    } catch (e) {
        console.error("Regen failed", e);
        alert("Regeneration failed. Please try again.");
    } finally {
        setRegeneratingImage(false);
    }
  };

  const updateSlideText = (text: string) => {
    const limit = getCharLimit();
    if (text.length > limit) return; // Hard stop
    
    const newSlides = [...slides];
    newSlides[currentSlideIndex].text = text;
    setSlides(newSlides);
  };

  const getCharLimit = () => {
      if (arcRules && arcRules.slide_character_limits) {
          return parseInt(arcRules.slide_character_limits);
      }
      return 220; // Default fallback
  };

  const getCurrentImage = () => {
    const currentSlideNum = slides[currentSlideIndex]?.slide_index;
    const specific = media.find(m => m.slide_index === currentSlideNum);
    return specific ? specific.url : 'https://picsum.photos/1080/1080';
  };

  const downloadSlide = async () => {
      if (slideRef.current === null) return;
      try {
          const dataUrl = await toPng(slideRef.current, { cacheBust: true });
          const link = document.createElement('a');
          link.download = `slide-${currentSlideIndex + 1}.png`;
          link.href = dataUrl;
          link.click();
      } catch (err) {
          console.error("Download failed", err);
          alert("Could not download image. Try again.");
      }
  };

  const copyCaption = () => {
      navigator.clipboard.writeText(combinedCaption);
      alert("Caption copied to clipboard!");
  };

  if (loading || !post) return <Layout><div className="p-10 text-textMuted">Loading editor...</div></Layout>;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-xl md:text-2xl font-bold text-text">Review & Edit</h2>
           <p className="text-sm text-textMuted">{post.content_type} Arc • {post.status}</p>
        </div>
        <div className="flex items-center space-x-3">
             <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
                className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base cursor-pointer z-10"
             >
                <Trash2 size={18} />
                <span className="hidden md:inline">{deleting ? 'Deleting...' : 'Delete'}</span>
             </button>
             <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base"
             >
                {saving ? <span className="animate-spin">⟳</span> : <Check size={18} />}
                <span className="hidden md:inline">Approve & Save</span>
                <span className="md:hidden">Save</span>
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Carousel Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-2xl border border-border p-4 md:p-6 shadow-xl relative overflow-hidden group">
            
            {/* Carousel Display Area to Capture */}
            <div ref={slideRef} className="aspect-square bg-black rounded-lg relative overflow-hidden flex flex-col shadow-2xl">
               <img 
                 src={getCurrentImage()} 
                 alt="Slide Background" 
                 className="absolute inset-0 w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

               <div className="relative z-10 flex-1 flex flex-col justify-center items-center p-6 md:p-12 text-center">
                   <textarea
                      value={slides[currentSlideIndex]?.text || ''}
                      onChange={(e) => updateSlideText(e.target.value)}
                      className="w-full bg-transparent text-white text-lg sm:text-2xl md:text-4xl font-bold text-center resize-none outline-none placeholder-white/50 drop-shadow-[0_4px_4px_rgba(0,0,0,0.9)]"
                      style={{ 
                          textShadow: '0px 2px 4px rgba(0,0,0,0.8), 0px 4px 12px rgba(0,0,0,0.5)',
                          overflow: 'hidden' 
                      }}
                      rows={6}
                   />
               </div>
            </div>

            {/* Navigation Buttons */}
            <button 
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-black/50 p-2 md:p-3 rounded-full text-white hover:bg-black/70 disabled:opacity-0 transition-all z-20 backdrop-blur-md"
            >
                <ChevronLeft size={20} className="md:w-6 md:h-6" />
            </button>
            <button 
                onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                disabled={currentSlideIndex === slides.length - 1}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-black/50 p-2 md:p-3 rounded-full text-white hover:bg-black/70 disabled:opacity-0 transition-all z-20 backdrop-blur-md"
            >
                <ChevronRight size={20} className="md:w-6 md:h-6" />
            </button>
            
            <div className="absolute top-4 left-4 md:top-10 md:left-10 bg-black/60 backdrop-blur-md text-white text-[10px] md:text-xs px-2 py-1 md:px-3 rounded-full border border-white/20 z-20 font-mono pointer-events-none">
                 {slides[currentSlideIndex]?.role}
            </div>

            <div className="absolute bottom-16 md:bottom-24 left-0 right-0 flex justify-center space-x-2 z-20 pointer-events-none">
                  {slides.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all shadow-lg ${
                        idx === currentSlideIndex ? 'bg-white w-4 md:w-6' : 'bg-white/40'
                      }`}
                    />
                  ))}
            </div>

             <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-3">
                <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-start">
                    <span className="text-textMuted text-xs md:text-sm">
                    Slide {currentSlideIndex + 1} of {slides.length}
                    </span>
                    <span className={`text-xs ${slides[currentSlideIndex]?.text.length >= getCharLimit() ? 'text-red-400 font-bold' : 'text-textMuted'}`}>
                        {slides[currentSlideIndex]?.text.length} / {getCharLimit()} chars
                    </span>
                </div>

                <div className="flex space-x-3 w-full md:w-auto justify-center">
                    <button 
                        onClick={downloadSlide}
                        className="flex-1 md:flex-none text-xs flex items-center justify-center space-x-1 text-white hover:text-primary transition-colors border border-white/20 px-3 py-2 rounded-md hover:bg-white/5"
                        >
                        <Download size={14} />
                        <span>Download</span>
                    </button>
                    <button 
                    onClick={openRegenModal}
                    disabled={regeneratingImage}
                    className="flex-1 md:flex-none text-xs flex items-center justify-center space-x-1 text-primary hover:text-primaryHover transition-colors border border-primary/30 px-3 py-2 rounded-md hover:bg-primary/10"
                    >
                    <RefreshCw size={14} className={regeneratingImage ? "animate-spin" : ""} />
                    <span>Regenerate Img</span>
                    </button>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Combined Caption Editor */}
        <div className="space-y-6">
           <div className="bg-surface rounded-xl border border-border p-5 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-text flex items-center space-x-2">
                     <span>Post Caption</span>
                  </h3>
                  <button 
                    onClick={copyCaption}
                    className="text-xs bg-surfaceHighlight hover:bg-white/10 text-white px-3 py-1 rounded border border-border transition-colors flex items-center space-x-1"
                  >
                      <Copy size={12} />
                      <span>Copy Full</span>
                  </button>
              </div>
              
              <div className="flex-1 flex flex-col">
                 <p className="text-xs text-textMuted mb-2">Hook • Body • Hashtags</p>
                 <textarea 
                    value={combinedCaption}
                    onChange={(e) => setCombinedCaption(e.target.value)}
                    className="w-full flex-1 bg-background border border-border rounded-lg p-4 text-sm text-text resize-none focus:ring-1 focus:ring-primary outline-none custom-scrollbar min-h-[300px]"
                    placeholder="Write your caption here..."
                 />
              </div>
           </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-red-500/20 rounded-xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
             <div className="flex items-center space-x-3 text-red-500 mb-4">
                <AlertTriangle size={24} />
                <h3 className="text-xl font-bold text-text">Delete Post?</h3>
             </div>
             <p className="text-textMuted text-sm mb-6">
                Are you sure you want to delete this post? This action cannot be undone and all slides/images will be lost.
             </p>
             <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-textMuted hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  type="button"
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-red-500/20"
                >
                    Yes, Delete
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Regeneration Modal */}
      {showRegenModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl">
                  <h3 className="text-xl font-bold mb-4">Regenerate Image</h3>
                  <p className="text-textMuted text-sm mb-4">Edit the instructions below to adjust the image generation.</p>
                  
                  <div className="flex space-x-4 mb-4">
                      <button 
                        onClick={() => setRegenScope('current')}
                        className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${regenScope === 'current' ? 'bg-primary/20 border-primary text-primary' : 'border-border text-textMuted hover:bg-surfaceHighlight'}`}
                      >
                          Current Slide Only
                      </button>
                      <button 
                        onClick={() => setRegenScope('all')}
                        className={`flex-1 py-2 rounded-lg text-sm border transition-colors ${regenScope === 'all' ? 'bg-primary/20 border-primary text-primary' : 'border-border text-textMuted hover:bg-surfaceHighlight'}`}
                      >
                          All Slides
                      </button>
                  </div>

                  <textarea 
                    value={regenPrompt}
                    onChange={(e) => setRegenPrompt(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg p-4 h-32 mb-6 focus:ring-2 focus:ring-primary outline-none text-sm"
                    placeholder="Describe the image you want..."
                  />
                  <div className="flex justify-end space-x-3">
                      <button 
                        onClick={() => setShowRegenModal(false)}
                        className="px-4 py-2 text-textMuted hover:text-white transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={handleRegenerateImage}
                        className="bg-primary hover:bg-primaryHover text-white px-6 py-2 rounded-lg font-medium"
                      >
                          {regenScope === 'all' ? 'Regenerate All' : 'Regenerate Slide'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </Layout>
  );
};

export default EditPost;
