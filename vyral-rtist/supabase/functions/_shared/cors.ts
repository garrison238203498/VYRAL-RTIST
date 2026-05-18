// Shared CORS headers for browser/RN invocations of Edge Functions.
// React Native fetch doesn't strictly need CORS, but including them is harmless
// and means we can also call these from the Vite web build during testing.

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function preflight() {
  return new Response("ok", { headers: corsHeaders });
}
