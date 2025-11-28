/**
 * Base44 Compatibility Layer
 * 
 * This file provides backwards compatibility for code that imports from base44Client.
 * All functionality is now provided by supabaseClient.js.
 * 
 * This is a TEMPORARY shim - new code should import directly from supabaseClient.js
 */

export { base44 } from './supabaseClient';
