import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabaseConfigured = Boolean(url && anonKey);

const supabaseStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

export const supabase = createClient(url || "https://placeholder.supabase.co", anonKey || "placeholder", {
  auth: {
    storage: supabaseStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const apiBase =
  process.env.EXPO_PUBLIC_VYRAL_API_BASE_URL ||
  process.env.EXPO_PUBLIC_API_BASE ||
  "";
