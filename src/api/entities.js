/**
 * Entity exports - Compatibility layer
 * 
 * This file provides backwards compatibility for code that imports entities.
 * New code should import directly from supabaseClient.js
 */

import { base44, auth } from './supabaseClient';

// Re-export entities for backwards compatibility
export const Query = base44.entities;

// auth sdk:
export const User = auth;
