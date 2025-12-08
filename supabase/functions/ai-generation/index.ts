// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { fal } from "npm:@fal-ai/client";

interface ImageReq {
  id: string;
  text_prompt: string;
  input_images: string[];
  settings: {
    numberOfImages: number;
    outputFormat: "webp" | "png" | "jpg";
    aspectRatio: "1:1" | "4:3" | "3:4" | "16:9" | "9:16";
  };
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FAL_API_KEY =
  "880da09d-2a5a-4a18-9f98-1e4dcc3fa6b1:5248ae48d8db899162ba39afbbe9ca0e"; //Deno.env.get("FAL_API_KEY"); // <-- Set in Supabase dashboard

// Configure Fal client
fal.config({
  credentials: FAL_API_KEY,
});

console.log(`Function "ai-generation" up and running!`);

serve(async (req) => {
  // 🔥 MUST HANDLE PREFLIGHT OPTIONS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const body = (await req.json()) as ImageReq;

    // Use Fal client subscribe method - automatically handles polling
    const result = await fal.subscribe("fal-ai/nano-banana/edit", {
      input: {
        prompt: body.text_prompt,
        num_images: body.settings.numberOfImages,
        aspect_ratio: body.settings.aspectRatio,
        output_format: body.settings.outputFormat,
        image_urls: body.input_images,
      },

      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    // Return the generated images
    return new Response(JSON.stringify(result.data), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message || String(err) }),
      { status: 500, headers: corsHeaders },
    );
  }
});
