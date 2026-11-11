import { supabase } from '@/lib/supabase';

const fail = (error) => {
  if (error) throw new Error(error.message || 'Something went wrong');
};

/* ---------- Beji: watumiaji ---------- */

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

/* ---------- Beji: Admin ---------- */

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
    .ilike('username', username.trim().replace(/^@/, ''))
    .limit(1)
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

/* ---------- Walioangalia wasifu wangu ---------- */

export async function fetchProfileViewers(limit = 100) {
  const { data, error } = await supabase.rpc('get_profile_viewers', { p_limit: limit });
  fail(error);
  return data || [];
}
