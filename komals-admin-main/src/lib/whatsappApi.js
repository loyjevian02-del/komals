import axios from 'axios';
import { api } from './api.js';

export const WA_API_BASE = import.meta.env.VITE_WHATSAPP_API_URL || 'http://localhost:3000/api';

export const waApi = axios.create({
  baseURL: WA_API_BASE,
  timeout: 15000,
});

// Known technical error substrings from Meta/wacrm, mapped to plain
// language a store manager can actually act on. Checked in order —
// first match wins.
const KNOWN_ERROR_PATTERNS = [
  [/not in allowed list/i, "This phone number can't receive messages yet. In test mode, Meta only allows numbers you've added to the recipient list — add it in Meta's WhatsApp API Setup page, or switch to a production number."],
  [/session has expired|access token.*expired|expired.*access token/i, 'Your WhatsApp connection has expired. Go to WhatsApp Config and enter a fresh access token from Meta.'],
  [/access_token and phone_number_id are required|whatsapp.*not connected/i, "WhatsApp isn't connected yet. Go to WhatsApp Config and enter your credentials first."],
  [/re-?engage|24.?hour|outside.*window/i, "This contact hasn't messaged you recently, so WhatsApp won't allow a plain text reply. Send an approved Template message instead to restart the conversation."],
  [/template.*not (found|approved)|template.*rejected/i, "That template isn't approved yet. Check its status in Templates, or sync templates from Meta."],
  [/invalid.*phone|phone.*invalid/i, "That phone number doesn't look valid. Double check the country code and digits."],
  [/rate limit|too many requests/i, "Too many requests sent too quickly. Wait a moment and try again."],
];

/**
 * Turn an axios error from any `/admin/crm/**` call into one plain-
 * language sentence, safe to show directly in an alert/toast. Never
 * surfaces raw JSON, stack traces, or (if wacrm itself 500s and
 * returns an HTML error page instead of JSON) a giant HTML dump.
 */
export function friendlyError(err, action) {
  if (!err?.response) {
    return 'Could not reach the server. Check your internet connection and try again.';
  }

  const { status, data } = err.response;
  const raw = typeof data?.error === 'string' ? data.error
    : typeof data?.message === 'string' ? data.message
    : typeof data === 'string' ? data
    : '';

  // Guard against HTML error pages / oversized dumps leaking into the UI.
  const isPlainShortText = raw && raw.length < 300 && !raw.trim().startsWith('<');

  if (isPlainShortText) {
    for (const [pattern, friendly] of KNOWN_ERROR_PATTERNS) {
      if (pattern.test(raw)) return friendly;
    }
  }

  if (status === 401) return 'Your session has expired. Please log in again.';
  if (status === 403) return "You don't have permission to do this.";
  if (status === 404) return `${action} couldn't be found — it may have already been removed.`;
  if (status >= 500) return `Something went wrong on the server while trying to ${action.toLowerCase()}. Please try again in a moment.`;

  return isPlainShortText ? raw : `Failed to ${action.toLowerCase()}. Please try again.`;
}

// Every method below is proxied through jmart-backend's `/admin/crm/**`
// controllers (not wacrm directly), authenticated with your normal
// jmart-admin JWT login — no separate wacrm login needed. `waApi`
// (direct-to-wacrm) is kept exported above only for any remaining
// unmigrated caller; new code should not use it.
export const whatsappService = {
  // Conversations & Live Chat
  getConversations: async (params = {}) => {
    const res = await api.get('/admin/crm/conversations', { params });
    return res.data?.conversations || [];
  },

  getMessages: async (conversationId) => {
    const res = await api.get(`/admin/crm/conversations/${conversationId}/messages`);
    return res.data?.messages || [];
  },

  sendMessage: async (conversationId, payload) => {
    // Send via standard send endpoint or conversation message endpoint
    const res = await api.post('/admin/crm/messages/send', {
      conversationId,
      ...payload,
    });
    return res.data;
  },

  // Contacts & Leads
  getContacts: async (params = {}) => {
    const res = await api.get('/admin/crm/contacts', { params });
    return res.data?.contacts || [];
  },

  createContact: async (data) => {
    const res = await api.post('/admin/crm/contacts', data);
    return res.data;
  },

  deleteContact: async (id) => {
    const res = await api.delete(`/admin/crm/contacts/${id}`);
    return res.data;
  },

  // Broadcasts & Campaigns
  getBroadcasts: async () => {
    try {
      const res = await api.get('/admin/crm/broadcasts');
      return res.data?.broadcasts || [];
    } catch {
      return [];
    }
  },

  createBroadcast: async (payload) => {
    const res = await api.post('/admin/crm/broadcasts', payload);
    return res.data;
  },

  // Templates
  getTemplates: async () => {
    const res = await api.get('/admin/crm/templates');
    return res.data?.templates || [];
  },

  syncTemplates: async () => {
    const res = await api.post('/admin/crm/templates/sync');
    return res.data;
  },

  createTemplate: async (payload) => {
    const res = await api.post('/admin/crm/templates/submit', payload);
    return res.data;
  },

  deleteTemplate: async (id) => {
    const res = await api.delete(`/admin/crm/templates/${id}`);
    return res.data;
  },

  // Pipelines & Deals
  getPipelines: async () => {
    const res = await api.get('/admin/crm/pipelines');
    return res.data?.pipelines || [];
  },

  getPipelineStages: async (pipelineId) => {
    if (!pipelineId) return [];
    const res = await api.get(`/admin/crm/pipelines/${pipelineId}/stages`);
    return res.data?.stages || [];
  },

  getDeals: async (pipelineId) => {
    if (!pipelineId) return [];
    const res = await api.get(`/admin/crm/pipelines/${pipelineId}/deals`);
    return res.data?.deals || [];
  },

  createDeal: async (pipelineId, data) => {
    const res = await api.post(`/admin/crm/pipelines/${pipelineId}/deals`, data);
    return res.data;
  },

  updateDeal: async (dealId, patch) => {
    const res = await api.patch(`/admin/crm/deals/${dealId}`, patch);
    return res.data;
  },

  deleteDeal: async (dealId) => {
    const res = await api.delete(`/admin/crm/deals/${dealId}`);
    return res.data;
  },

  // WhatsApp Cloud API Configuration — proxied through jmart-backend
  // (not wacrm directly), authenticated with your normal jmart-admin
  // login. No separate wacrm login needed.
  getConfig: async () => {
    const res = await api.get('/admin/crm/whatsapp-config');
    return res.data || {};
  },

  updateConfig: async (data) => {
    const res = await api.post('/admin/crm/whatsapp-config', data);
    return res.data;
  },
};
