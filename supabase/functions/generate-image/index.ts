// @ts-nocheck
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
    const { prompt, aspectRatio = "1:1" } = await req.json();
    const apiKey = Deno.env.get('OPENROUTER_API_KEY');

    if (!apiKey) {
      console.error('OPENROUTER_API_KEY not configured');
      throw new Error('API key not configured');
    }

    console.log('Calling OpenRouter API for image generation...');
    console.log('Prompt:', prompt.substring(0, 100) + '...');
    console.log('Aspect ratio:', aspectRatio);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Carousel Generator',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { 
            role: 'user', 
            content: `Generate an image with aspect ratio ${aspectRatio}: ${prompt}` 
          }
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenRouter image response received');

    // Extract image from response
    const message = data.choices?.[0]?.message;
    
    // Check for images array (OpenRouter format)
    if (message?.images && message.images.length > 0) {
      const imageUrl = message.images[0]?.image_url?.url;
      if (imageUrl) {
        console.log('Successfully generated image');
        return new Response(JSON.stringify({ imageUrl }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Check for inline_data in content parts
    if (message?.content && Array.isArray(message.content)) {
      for (const part of message.content) {
        if (part.type === 'image_url' && part.image_url?.url) {
          console.log('Successfully generated image (content array)');
          return new Response(JSON.stringify({ imageUrl: part.image_url.url }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    console.warn('No image found in response, returning placeholder');
    console.log('Response structure:', JSON.stringify(data, null, 2));
    
    // Return placeholder URL
    const placeholderUrl = `https://picsum.photos/1080/1080?random=${Math.random()}`;
    return new Response(JSON.stringify({ imageUrl: placeholderUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-image function:', error);
    // Return placeholder on error to keep UI functional
    const placeholderUrl = `https://picsum.photos/1080/1080?random=${Math.random()}`;
    return new Response(JSON.stringify({ imageUrl: placeholderUrl, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
