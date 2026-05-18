import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Database } from "./database.types";

// Read from Expo public env vars (must start with EXPO_PUBLIC_).
const url = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabaseConfigured = Boolean(url && anonKey);

// AsyncStorage adapter — Supabase's auth needs persistence in RN.
const supabaseStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

export const supabase = createClient<Database>(url || "https://placeholder.supabase.co", anonKey || "placeholder", {
  auth: {
    storage: supabaseStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Optional Vercel fallback only. The primary AI API is Supabase Edge Functions.
// Leave this unset unless Vercel is connected to the correct app.
export const apiBase =
  process.env.EXPO_PUBLIC_VYRAL_API_BASE_URL ||
  process.env.EXPO_PUBLIC_API_BASE ||
  "";
