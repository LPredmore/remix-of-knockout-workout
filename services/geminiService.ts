import { ContentType, GeneratedContentResponse, UserSettings, ArcRules } from '../types';
import { ARC_DEFINITIONS, CONSTRUCT_GUARDRAILS_BLOCK } from '../constants';

const SUPABASE_URL = 'https://pqnmgstlxmfkrnjyehkk.supabase.co';

export const generatePostContent = async (
  contentType: ContentType,
  idea: string,
  targetAudience: string,
  settings: UserSettings,
  arcRules: ArcRules
): Promise<GeneratedContentResponse> => {
  const arcDef = ARC_DEFINITIONS[contentType];
  
  // Build slide instructions dynamically from the database rules
  let slideInstructions = "";
  for (let i = 1; i <= arcDef.slideCount; i++) {
    const key = `slide_${i}` as keyof ArcRules;
    const rule = arcRules[key] || "No instruction.";
    slideInstructions += `Slide ${i}: ${rule}\n`;
  }

  // Construct Guardrails Block
  const guardrailsBlock = settings.guardrails_enabled 
    ? CONSTRUCT_GUARDRAILS_BLOCK(settings) 
    : "GUARDRAILS DISABLED: Proceed with standard optimization.";

  const systemInstruction = `
    You are a viral content strategist. Your goal is to take a raw idea and convert it into a high-performing social media carousel script and caption.
    
    GLOBAL RULES:
    ${settings.global_rules}
    
    ${guardrailsBlock}

    TARGET AUDIENCE:
    ${targetAudience || settings.default_target_audience}
    
    CONTENT ARC: ${arcDef.name}
    SLIDE COUNT: ${arcDef.slideCount}
    
    SLIDE-BY-SLIDE INSTRUCTIONS:
    ${slideInstructions}
    
    CRITICAL CONSTRAINTS:
    1. Follow the slide-by-slide instructions EXACTLY.
    2. Maintain a cohesive narrative flow.
    3. Ensure readability: Low density slides (8-15 words), Medium density (15-30 words). Hard cap ${arcRules.slide_character_limits} chars per slide.
    
    CAPTION GENERATION & DATA SOURCE:
    You must simulate a retrieval of the current Top 20 trending hashtags from 'https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en'.
    
    1. SHORT CAPTION: < 90 chars, emotional hook.
    
    2. LONG DESCRIPTION: 
       - Paragraphs elaborating on tension and insight.
       - heavily laden with keywords that are specific to our target demographic and the content.
    
    3. HASHTAGS (The array should contain exactly 5 strings):
       - Item 1: The #1 trending hashtag from the Top 20 list you simulated above.
       - Items 2-5: Generate 4 NEW, highly relevant, evergreen hashtags specific to this niche/topic.
    
    4. KEYWORDS (The array should contain exactly 19 strings):
       - Take the remaining 19 hashtags (Indices #2 through #20) from the Top 20 list you simulated.
       - REMOVE the '#' symbol from them.
       - These will be used to build the SEO keyword block.
    
    RESPONSE FORMAT:
    You MUST respond with valid JSON in this exact structure:
    {
      "slides": [
        { "role": "string", "text": "string" }
      ],
      "caption": {
        "short": "string",
        "long": "string",
        "hashtags": ["string"],
        "keywords": ["string"]
      }
    }
  `;

  const prompt = `
    Input Idea: "${idea}"
    
    Generate the carousel content (slides) and caption. Remember to respond with valid JSON only.
  `;

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ systemInstruction, prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate content');
    }

    const data = await response.json();
    return data as GeneratedContentResponse;
  } catch (error) {
    console.error("Content Generation Error:", error);
    throw error;
  }
};

export const generateImage = async (
  prompt: string,
  aspectRatio: "1:1" | "9:16" | "16:9" = "1:1"
): Promise<string> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, aspectRatio }),
    });

    const data = await response.json();
    
    if (data.imageUrl) {
      return data.imageUrl;
    }
    
    // Fallback to placeholder
    console.warn("No image URL in response, using placeholder");
    return `https://picsum.photos/1080/1080?random=${Math.random()}`;
    
  } catch (error) {
    console.error("Image Generation Error:", error);
    // Return placeholder on error to keep UI functional
    return `https://picsum.photos/1080/1080?random=${Math.random()}`;
  }
};

export const constructImagePrompt = (
  contentType: ContentType,
  idea: string,
  slideText: string | null,
  settings: UserSettings,
  customInstruction?: string
): string => {
  let stylePrompt = "";
  let basePrompt = "";
  
  if (slideText) {
    // Per slide mode
     switch(contentType) {
      case ContentType.QUOTE: stylePrompt = settings.quotes_image_style_per_slide; break;
      case ContentType.PROVERB: stylePrompt = settings.proverbs_image_style_per_slide; break;
      case ContentType.RESEARCH: stylePrompt = settings.research_image_style_per_slide; break;
      case ContentType.QUESTIONING: stylePrompt = settings.questioning_image_style_per_slide; break;
    }
    basePrompt = `Create an image representing: "${slideText}".`;
  } else {
    // Single mode (background)
    switch(contentType) {
      case ContentType.QUOTE: stylePrompt = settings.quotes_image_style_single; break;
      case ContentType.PROVERB: stylePrompt = settings.proverbs_image_style_single; break;
      case ContentType.RESEARCH: stylePrompt = settings.research_image_style_single; break;
      case ContentType.QUESTIONING: stylePrompt = settings.questioning_image_style_single; break;
    }
    basePrompt = `Create a cohesive background image for a social media carousel about: "${idea}". No text on image.`;
  }

  const instructionPart = customInstruction ? ` Custom User Instructions: "${customInstruction}".` : "";

  return `${basePrompt} Style: ${stylePrompt}${instructionPart}`;
};
