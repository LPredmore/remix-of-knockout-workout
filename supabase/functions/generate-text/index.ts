import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { systemInstruction, prompt } = await req.json();
    const apiKey = Deno.env.get('OPENROUTER_API_KEY');

    if (!apiKey) {
      console.error('OPENROUTER_API_KEY not configured');
      throw new Error('API key not configured');
    }

    console.log('Calling OpenRouter API for text generation...');
    console.log('Prompt length:', prompt.length);
    console.log('System instruction length:', systemInstruction.length);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Carousel Generator',
      },
      body: JSON.stringify({
        model: 'google/gemma-3-27b-it:free',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenRouter response received');

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error('No content in response:', JSON.stringify(data));
      throw new Error('No content in API response');
    }

    // Parse and validate JSON
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', content);
      throw new Error('Invalid JSON response from API');
    }

    // Validate structure
    if (!parsedContent.slides || !Array.isArray(parsedContent.slides)) {
      console.error('Invalid slides structure:', parsedContent);
      throw new Error('Response missing slides array');
    }

    if (!parsedContent.caption) {
      console.error('Invalid caption structure:', parsedContent);
      throw new Error('Response missing caption object');
    }

    console.log('Successfully generated content with', parsedContent.slides.length, 'slides');

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-text function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
