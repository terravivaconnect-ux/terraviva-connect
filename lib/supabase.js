import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dripgfmuekjmocwnrczz.supabase.co';
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyaXBnZm11ZWtqbW9jd25yY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5MzUxOTksImV4cCI6MjEwODUxMTE5OX0.XmkAxN6mdpZ87pvw9SXAEow7WBp4IldnvJOH9bxiAto';
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'tbw0dfhd';
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'terraviva-connect-unsigned';

export const supabase = createClient(URL, KEY);

export const fullName = (p) => p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.username : '';
export const initials = (p) => (fullName(p) || '?').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
export const timeAgo = (d) => {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return 'now';
  if (s < 3600) return Math.floor(s / 60) + 'm';
  if (s < 86400) return Math.floor(s / 3600) + 'h';
  return Math.floor(s / 86400) + 'd';
};

// Limits match Cloudinary's free plan: 10 MB images/documents, 100 MB videos.
const LIMITS_MB = { image: 10, video: 100, document: 10 };
const DOC_EXT = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
export function checkFile(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const kind = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : DOC_EXT.includes(ext) ? 'document' : null;
  if (!kind) return `"${file.name}": this file type is not allowed. Use images, videos, PDF, Word, Excel or PowerPoint.`;
  if (file.size > LIMITS_MB[kind] * 1024 * 1024) return `"${file.name}" is too large. Maximum for ${kind === 'document' ? 'documents' : kind + 's'} is ${LIMITS_MB[kind]} MB.`;
  return null;
}

// All media/documents are stored on Cloudinary (unsigned upload preset).
export async function uploadFile(_bucket, _uid, file) {
  const bad = checkFile(file);
  if (bad) throw new Error(bad);
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/auto/upload`, { method: 'POST', body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error?.message || 'Upload failed. Check file size and type.');
  return json.secure_url;
}
