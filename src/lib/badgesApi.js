// Badilisha njia ya import hii ikiwa supabase client yako iko mahali pengine.
import { supabase } from './supabase';

const fail = (error) => {
  if (error) throw new Error(error.message || 'Hitilafu imetokea');
};

/* ---------- Badges: watumiaji ---------- */

export async function fetchBadgeTypes() {
  const { data, error } = await supabase
    .from('badge_types')
    .select('id,name,category,tone,rank,requestable,active')
    .eq('active', true)
    .order('rank', { ascending: true });
  fail(error);
  return data || [];
}

export async function fetchMyBadges(userId) {
  const { data, error } = await supabase
    .from('user_badges')
    .select('id,badge_id,status,detail,verified_at,expires_at,revoked_at,created_at,updated_at,badge_private(message_to_user)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  fail(error);
  return data || [];
}

export async function requestBadge({ badgeId, detail, evidenceText, evidenceUrl }) {
  const { data, error } = await supabase.rpc('request_badge', {
    p_badge: badgeId,
    p_detail: detail || '',
    p_evidence_text: evidenceText || '',
    p_evidence_url: evidenceUrl || '',
  });
  fail(error);
  return data;
}

export async function withdrawBadgeRequest(userBadgeId) {
  const { error } = await supabase.rpc('withdraw_badge_request', { p_id: userBadgeId });
  fail(error);
}

/* ---------- Badges: Admin ---------- */

export async function checkIsAdmin() {
  const { data, error } = await supabase.rpc('is_admin');
  if (error) return false;
  return data === true;
}

export async function fetchBadgeRequests(status) {
  let q = supabase
    .from('user_badges')
    .select(
      'id,user_id,badge_id,status,detail,verified_at,expires_at,created_at,updated_at,' +
        'profiles!user_badges_user_id_fkey(username,first_name,last_name,headline,avatar_url),' +
        'badge_private(evidence_text,evidence_url,consent_at,message_to_user)'
    )
    .order('updated_at', { ascending: false })
    .limit(200);
  if (status && status !== 'all') q = q.eq('status', status);
  const { data, error } = await q;
  fail(error);
  return data || [];
}

export async function reviewBadge({ id, status, message, notes, expires }) {
  const { error } = await supabase.rpc('review_badge', {
    p_id: id,
    p_status: status,
    p_message: message || null,
    p_notes: notes || null,
    p_expires: expires ? new Date(expires).toISOString() : null,
  });
  fail(error);
}

export async function findProfileByUsername(username) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,username,first_name,last_name')
    .eq('username', username.trim().replace(/^@/, ''))
    .maybeSingle();
  fail(error);
  return data;
}

export async function grantBadge({ userId, badgeId, detail, expires, notes }) {
  const { error } = await supabase.rpc('grant_badge', {
    p_user: userId,
    p_badge: badgeId,
    p_detail: detail || null,
    p_expires: expires ? new Date(expires).toISOString() : null,
    p_notes: notes || null,
  });
  fail(error);
}

/* ---------- Walioangalia profile yangu ---------- */

export async function fetchProfileViewers(limit = 100) {
  const { data, error } = await supabase.rpc('get_profile_viewers', { p_limit: limit });
  fail(error);
  return data || [];
}

/* ---------- Muda kwa Kiswahili ---------- */

export function timeAgoSw(iso) {
  if (!iso) return '';
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'sasa hivi';
  const m = Math.floor(s / 60);
  if (m < 60) return `dakika ${m} zilizopita`;
  const h = Math.floor(m / 60);
  if (h < 24) return `saa ${h} zilizopita`;
  const d = Math.floor(h / 24);
  if (d < 7) return `siku ${d} zilizopita`;
  if (d < 30) return `wiki ${Math.floor(d / 7)} zilizopita`;
  return new Date(iso).toLocaleDateString('sw-TZ', { day: 'numeric', month: 'short', year: 'numeric' });
}
