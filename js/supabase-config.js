// ============================================================
// GABIEMPRESAS — Configuración de Supabase
//
// 1. En tu proyecto de Supabase, ve a Project Settings > API.
// 2. Copia "Project URL" y "anon public" key.
// 3. Pega esos valores reemplazando los de abajo.
//
// Instrucciones completas en README.md
// ============================================================

const SUPABASE_URL = "https://plmfizoagykfocsamffu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_XRhAv-9aRwn894wF-i4niA_TW4J8drU";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
