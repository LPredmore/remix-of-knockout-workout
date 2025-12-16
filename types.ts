
export enum ContentType {
  QUOTE = 'quote',
  PROVERB = 'proverb',
  RESEARCH = 'research',
  QUESTIONING = 'questioning'
}

export enum PostStatus {
  DRAFT = 'draft',
  APPROVED = 'approved'
}

export enum ImageMode {
  SINGLE = 'single',
  PER_SLIDE = 'per_slide'
}

export type GuardrailsStrictness = 'Standard' | 'Strict';

export enum AllowedTechnique {
  CURIOSITY = 'curiosity',
  ACTION_STEPS = 'action_steps',
  IDENTITY_ENCOURAGEMENT = 'identity_encouragement',
  CONTRAST_EVIDENCE_BASED = 'contrast_evidence_based',
  NARRATIVE_TENSION = 'narrative_tension',
  NON_FABRICATED_SOCIAL_PROOF = 'non_fabricated_social_proof'
}

export enum BlockedTactic {
  FABRICATED_RESEARCH = 'fabricated_research',
  MEDICAL_DIAGNOSIS_OR_GUARANTEES = 'medical_diagnosis_or_guarantees',
  SHAMING_OR_HARASSMENT = 'shaming_or_harassment',
  GROUP_CONTEMPT = 'group_contempt',
  RAGE_BAIT = 'rage_bait',
  ABSOLUTIST_UNCERTAINTY = 'absolutist_uncertainty',
  FEARMONGERING = 'fearmongering',
  FAKE_SOURCE_BAIT = 'fake_source_bait'
}

export interface UserSettings {
  id?: string;
  user_id: string;
  global_rules: string;
  default_target_audience: string;
  image_mode: ImageMode;
  
  // Guardrails
  guardrails_enabled: boolean;
  guardrails_strictness: GuardrailsStrictness;
  brand_boundaries: string;
  allowed_techniques: string[];
  blocked_tactics: string[];

  // Image Styles
  quotes_image_style_single: string;
  quotes_image_style_per_slide: string;
  proverbs_image_style_single: string;
  proverbs_image_style_per_slide: string;
  research_image_style_single: string;
  research_image_style_per_slide: string;
  questioning_image_style_single: string;
  questioning_image_style_per_slide: string;

  // Legacy Character Limits (kept for type safety, but UI will use ArcRules)
  quotes_char_limit?: number;
  proverbs_char_limit?: number;
  research_char_limit?: number;
  questioning_char_limit?: number;
}

export interface ArcRules {
  id?: number;
  user_id: string;
  slide_1: string;
  slide_2: string;
  slide_3: string;
  slide_4: string;
  slide_5: string;
  slide_6: string;
  slide_7: string;
  slide_character_limits: string; // Stored as text in DB
}

export interface Slide {
  id?: string;
  post_id?: string;
  slide_index: number;
  role: string;
  text: string;
}

export interface MediaAsset {
  id?: string;
  post_id?: string;
  slide_index: number | null; // null means global background
  url: string;
  type: 'image';
}

export interface Post {
  id: string;
  user_id: string;
  content_type: ContentType;
  input_text: string;
  target_audience_override?: string;
  short_caption: string;
  long_description: string;
  keyword_paragraph?: string;
  hashtags: string; // stored as single string "#tag1 #tag2"
  status: PostStatus;
  created_at: string;
  updated_at: string;
  slides?: Slide[];
  media_assets?: MediaAsset[];
}

// Helper types for AI generation responses
export interface GeneratedContentResponse {
  slides: { role: string; text: string }[];
  caption: {
    short: string;
    long: string;
    keywords?: string[]; // Array of strings from AI, converted to paragraph later
    hashtags: string[];
  };
}