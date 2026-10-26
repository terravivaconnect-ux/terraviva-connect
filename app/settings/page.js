'use client';
import { useState } from 'react';
import Shell from '@/components/Shell';
import PasswordInput from '@/components/PasswordInput';
import { supabase, uploadFile } from '@/lib/supabase';
import { useT } from '@/lib/i18n';
function Inner({ me }) {
  const { t } = useT();
  const [f, setF] = useState({ first_name: me.first_name, middle_name: me.middle_name || '', last_name: me.last_name, headline: me.headline || '', bio: me.bio || '', country: me.country || '', region: me.region || '', district: me.district || '', phone: me.phone || '', visibility: me.visibility });
  const [msg, setMsg] = useState(''); const [err, setErr] = useState(''); const [pw, setPw] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const save = async (e) => { e.preventDefault(); setErr(''); const { error } = await supabase.from('profiles').update(f).eq('id', me.id); error ? setErr(error.message) : setMsg('Profile saved.'); };
  const img = (col, bucket) => async (e) => { const file = e.target.files[0]; if (!file) return; try { const url = await uploadFile(bucket, me.id, file); await supabase.from('profiles').update({ [col]: url }).eq('id', me.id); setMsg('Image updated. Refresh to see it.'); } catch (x) { setErr(x.message); } };
  const chpw = async (e) => { e.preventDefault(); const { error } = await supabase.auth.updateUser({ password: pw }); error ? setErr(error.message) : (setMsg('Password changed.'), setPw('')); };
  const exportData = async () => {
    const [pr, po, co, sv] = await Promise.all([supabase.from('profiles').select('*').eq('id', me.id), supabase.from('posts').select('*').eq('author_id', me.id), supabase.from('comments').select('*').eq('author_id', me.id), supabase.from('saved_posts').select('*').eq('user_id', me.id)]);
    const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), profile: pr.data, posts: po.data, comments: co.data, saved: sv.data }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'terraviva-my-data.json'; a.click();
  };
  const requestDelete = async () => {
    if (!confirm('Request permanent deletion of your account and data? Your account will be deactivated now and an administrator will delete it.')) return;
    await supabase.from('reports').insert({ reporter_id: me.id, target_type: 'user', target_id: me.id, reason: 'ACCOUNT DELETION REQUEST' });
    await supabase.from('profiles').update({ status: 'deactivated' }).eq('id', me.id); await supabase.auth.signOut(); location.href = '/login';
  };
  const deactivate = async () => { if (confirm('Deactivate your account? You can ask an administrator to reactivate it.')) { await supabase.from('profiles').update({ status: 'deactivated' }).eq('id', me.id); await supabase.auth.signOut(); location.href = '/login'; } };
  return (<div><h2>{t("Settings")}</h2>{err && <div className="err">{err}</div>}{msg && <div className="ok">{msg}</div>}
    <form className="card" onSubmit={save}><h3>{t("Profile")}</h3>
      <label>Profile photo <input type="file" accept="image/*" onChange={img('avatar_url', 'avatars')} /></label>
      <label>Cover photo <input type="file" accept="image/*" onChange={img('cover_url', 'avatars')} /></label>
      <div className="row"><input placeholder={t("First name")} value={f.first_name} onChange={set('first_name')} required /><input placeholder={t("Last name")} value={f.last_name} onChange={set('last_name')} required /></div>
      <input placeholder="Headline" value={f.headline} onChange={set('headline')} /><textarea rows={4} placeholder="About you" value={f.bio} onChange={set('bio')} />
      <div className="row"><input placeholder={t("Country")} value={f.country} onChange={set('country')} /><input placeholder="Region" value={f.region} onChange={set('region')} /><input placeholder="District" value={f.district} onChange={set('district')} /></div>
      <input placeholder="Phone (never shown publicly)" value={f.phone} onChange={set('phone')} />
      <label>Who can see my profile?<select value={f.visibility} onChange={set('visibility')}><option value="public">Public</option><option value="members">Registered members only</option><option value="connections">Connections only</option><option value="private">Private</option></select></label>
      <button>{t("Save changes")}</button></form>
    <form className="card" onSubmit={chpw}><h3>{t("Change password")}</h3><PasswordInput value={pw} onChange={e => setPw(e.target.value)} placeholder="New password" autoComplete="new-password" /><button>{t("Update password")}</button></form>
    <div className="card"><h3>Your data and account</h3>
      <button className="sec" onClick={exportData}>⬇ Download my data</button>{' '}
      <button className="red" onClick={deactivate}>Deactivate account</button>{' '}
      <button className="red" onClick={requestDelete}>Request permanent deletion</button></div></div>);
}
export default function Settings() { return <Shell>{me => <Inner me={me} />}</Shell>; }
