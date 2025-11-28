/**
 * Integrations exports - Compatibility layer
 * 
 * This file provides backwards compatibility for code that imports integrations.
 * New code should import directly from supabaseClient.js
 */

import { integrations } from './supabaseClient';

// Re-export integrations for backwards compatibility
export const Core = integrations;

export const InvokeLLM = integrations.InvokeLLM;

export const SendEmail = integrations.SendEmail;

export const SendSMS = integrations.SendSMS;

export const UploadFile = integrations.UploadFile;

export const GenerateImage = integrations.InvokeLLM; // Fallback to LLM

export const ExtractDataFromUploadedFile = integrations.ExtractDataFromUploadedFile;
