
import { ContentType, ImageMode, UserSettings, ArcRules, AllowedTechnique, BlockedTactic } from './types';

export const DEFAULT_SETTINGS: Partial<UserSettings> = {
  global_rules: "Use direct 'you' language. Prefer strong verbs. Maintain controversial, contrarian tone. Avoid hedging words like 'maybe' or 'sort of'.",
  default_target_audience: "Ambitions creators and entrepreneurs feeling stuck.",
  image_mode: ImageMode.SINGLE,
  
  // Guardrails Defaults
  guardrails_enabled: true,
  guardrails_strictness: 'Standard',
  brand_boundaries: "",
  allowed_techniques: [
    AllowedTechnique.CURIOSITY,
    AllowedTechnique.ACTION_STEPS,
    AllowedTechnique.IDENTITY_ENCOURAGEMENT,
    AllowedTechnique.CONTRAST_EVIDENCE_BASED,
    AllowedTechnique.NARRATIVE_TENSION,
    AllowedTechnique.NON_FABRICATED_SOCIAL_PROOF
  ],
  blocked_tactics: [
    BlockedTactic.FABRICATED_RESEARCH,
    BlockedTactic.MEDICAL_DIAGNOSIS_OR_GUARANTEES,
    BlockedTactic.SHAMING_OR_HARASSMENT,
    BlockedTactic.GROUP_CONTEMPT,
    BlockedTactic.RAGE_BAIT,
    BlockedTactic.ABSOLUTIST_UNCERTAINTY,
    BlockedTactic.FEARMONGERING,
    BlockedTactic.FAKE_SOURCE_BAIT
  ],

  quotes_image_style_single: "Minimalist, moody, high contrast, cinematic lighting, monochrome with one accent color.",
  quotes_image_style_per_slide: "Minimalist, abstract representation of the concept.",
  proverbs_image_style_single: "Oil painting style, classical art, dramatic chiaroscuro.",
  proverbs_image_style_per_slide: "Detailed illustration of the narrative scene.",
  research_image_style_single: "Data visualization art, cybernetic aesthetics, clean lines, blueprint style.",
  research_image_style_per_slide: "Scientific diagrammatic overlay on abstract background.",
  questioning_image_style_single: "Bold typography aesthetic, solid black background, high contrast neon text overlay style, moody and aggressive.",
  questioning_image_style_per_slide: "Minimalist abstract geometry, red and black theme, provoking tension.",

  quotes_char_limit: 220,
  proverbs_char_limit: 220,
  research_char_limit: 220,
  questioning_char_limit: 220
};

export const DEFAULT_ARC_RULES: Record<ContentType, Partial<ArcRules>> = {
  [ContentType.QUOTE]: {
    slide_1: "The Symptom (Negative Hook - Loss Aversion). Describe the specific pain point the quote solves. Must be framed as a negative, loss-aversion hook. E.g., 'Stop confusing movement with progress if you ever want to stop feeling exhausted.'",
    slide_2: "The Diagnosis (Validation). Explain why they feel this way. Validate that their current strategy is failing.",
    slide_3: "The Pivot (The Missing Link). Introduce the concept of the quote/principle as the 'missing link' without fully stating it.",
    slide_4: "The Quote (The Hero). Present the quote or principle verbatim, clearly and cleanly.",
    slide_5: "The Application (Actionable Advice). Actionable advice on how to apply the quote today (concrete behavior, not vague mindset).",
    slide_6: "The Identity Bridge (CTA). CTA framed as future-proofing against the original symptom. E.g., 'Save this for the next time you start confusing busyness with progress.'",
    slide_7: "",
    slide_character_limits: "220"
  },
  [ContentType.PROVERB]: {
    slide_1: "Inciting Incident (Hook). Start in the middle of the action, often with dialogue or a charged moment. Must also function as a negative/painful hook or a dangerous situation.",
    slide_2: "The Conflict. Detail the protagonist's struggle; make it relatable to the user's life. Ending should be a cliffhanger or incomplete thought.",
    slide_3: "The Failed Attempt. Show the common mistake; what most people do and why it fails. End with a cliffhanger or unresolved setup.",
    slide_4: "The Twist / Insight. The turning point: master's insight, unexpected event, or key realization.",
    slide_5: "The Moral (Resolution). Extract the core lesson clearly, as a principle.",
    slide_6: "The Mirror. Direct question to the user applying the story to their life. E.g., 'Where are you still pouring more into an already full cup?'",
    slide_7: "The Tribe (CTA). Sharing CTA framed as altruism / social signaling. E.g., 'Share this with someone who refuses to empty their cup.'",
    slide_character_limits: "220"
  },
  [ContentType.RESEARCH]: {
    slide_1: "The Myth (Negative Hook). Directly attack a common belief or practice. Format examples: 'Positive thinking is making you more anxious, not less.'",
    slide_2: "The Study. Introduce the research plainly with year + researcher(s) if available.",
    slide_3: "The Methodology (Visual). Simple, visualizable description of the setup.",
    slide_4: "The Result (Shock). The counter-intuitive finding; highlight contrast vs intuition.",
    slide_5: "The Mechanism. Explain why this happened in simple, intuitive terms.",
    slide_6: "The Takeaway. Concrete advice: how to apply the research finding.",
    slide_7: "The Bookmark (CTA). Engagement bait like 'Comment SOURCE if you want the full study link.'",
    slide_character_limits: "220"
  },
  [ContentType.QUESTIONING]: {
    slide_1: "The Hook. A sharp, polarizing QUESTION. Format: 'If [premise], why [contradiction]?' or similar.",
    slide_2: "The Premise Validation. MUST start with 'THE RULE:'. State the accepted belief clearly.",
    slide_3: "The Dissonance Drop. MUST start with 'THE PROBLEM:'. State the conflicting reality/cost.",
    slide_4: "The Escalator/Amplification. MUST start with 'Choose One:'. Format: 'Choose One: 1. [Option A] OR 2. [Option B] (so the core belief is wrong).'",
    slide_5: "The Comment Trigger (CTA). MUST be aggressive. Format: 'You can't have both. Explain the contradiction below! 👇'",
    slide_6: "",
    slide_7: "",
    slide_character_limits: "220"
  }
};

export const ARC_DEFINITIONS = {
  [ContentType.QUOTE]: {
    name: "Contextual Bridge",
    slideCount: 6,
    roles: [
      "The Symptom", "The Diagnosis", "The Pivot", "The Quote", "The Application", "The Identity Bridge"
    ]
  },
  [ContentType.PROVERB]: {
    name: "Narrative Tension",
    slideCount: 7,
    roles: [
      "Inciting Incident", "The Conflict", "The Failed Attempt", "The Twist / Insight", "The Moral", "The Mirror", "The Tribe"
    ]
  },
  [ContentType.RESEARCH]: {
    name: "Counter-Intuitive Insight",
    slideCount: 7,
    roles: [
      "The Myth", "The Study", "The Methodology", "The Result", "The Mechanism", "The Takeaway", "The Bookmark"
    ]
  },
  [ContentType.QUESTIONING]: {
    name: "Dissonance Amplifier",
    slideCount: 5,
    roles: [
      "The Hook", "The Premise Validation", "The Dissonance Drop", "The Escalator", "The Comment Trigger"
    ]
  }
};

export const CONSTRUCT_GUARDRAILS_BLOCK = (settings: UserSettings): string => {
  const { guardrails_strictness, brand_boundaries, allowed_techniques, blocked_tactics } = settings;
  
  const isStrict = guardrails_strictness === 'Strict';

  return `
    *** GUARDRAILS LAYER (STRICT ENFORCEMENT) ***
    
    STRICTNESS LEVEL: ${guardrails_strictness.toUpperCase()}
    
    BRAND BOUNDARIES: ${brand_boundaries || "None provided."}
    
    ALLOWED TECHNIQUES:
    ${allowed_techniques.map(t => `- ${t.replace(/_/g, ' ')}`).join('\n')}
    
    DISALLOWED TACTICS (MUST BLOCK):
    ${blocked_tactics.map(t => `- ${t.replace(/_/g, ' ')}`).join('\n')}
    
    MANDATORY RULES:
    1. TRUTHFULNESS: Never invent studies, journals, sample sizes, quotes, or named authorities. If research metadata is missing in the input, state uncertainty (e.g., "Studies suggest...") rather than hallucinating a source.
    2. NO CONTEMPT: Avoid shaming, humiliation, insults, or "gotcha" framing. Challenge ideas/behaviors, not identities.
    3. NO GROUP STEREOTYPING: No disparagement or generalizations about protected groups, politics, or religion.
    4. NO MEDICAL GUARANTEES: No medical diagnosis, "cures", or guaranteed health outcomes. Use general wellbeing framing only.
    5. PROPORTIONALITY: Loss aversion is allowed but must be tied to realistic stakes. No unproportional fearmongering.
    6. ENGAGEMENT INTEGRITY: Do NOT use "Comment SOURCE" CTAs unless an actual source URL/Citation is present in the Input Idea. If missing, use a "Save this" or "Share this" CTA instead.
    7. FORMAT INTEGRITY: Do not add extra slides for disclaimers. Weave necessary hedging into the existing slide count.
    
    ${isStrict ? `
    STRICT MODE ADDITIONS:
    - Hedge all probabilistic claims (use "often", "tends to", "can lead to" instead of "always/never").
    - Ensure "Choose One" framing in Questioning arcs is neutral and non-hostile.
    - Soften aggressive hooks to be inviting rather than accusatory.
    ` : ''}
    
    *** END GUARDRAILS LAYER ***
  `;
};