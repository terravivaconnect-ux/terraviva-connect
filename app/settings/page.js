'use client';
import { useState } from 'react';
import Shell from '@/components/Shell';
import PasswordInput from '@/components/PasswordInput';
import { supabase, uploadFile } from '@/lib/supabase';
function Inner({ me }) {
  const [f, setF] = useState({ first_name: me.first_name, middle_name: me.middle_name || '', last_name: me.last_name, headline: me.headline || '', bio: me.bio || '', country: me.country || '', region: me.region || '', district: me.district || '', phone: me.phone || '', visibility: me.visibility });
  const [msg, setMsg] = useState(''); const [err, setErr] = useState(''); const [pw, setPw] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const save = async (e) => { e.preventDefault(); setErr(''); const { error } = await supabase.from('profiles').update(f).eq('id', me.id); error ? setErr(error.message) : setMsg('Profile saved.'); };
  const img = (col, bucket) => async (e) => { const file = e.target.files[0]; if (!file) return; try { const url = await uploadFile(bucket, me.id, file); await supabase.from('profiles').update({ [col]: url }).eq('id', me.id); setMsg('Image updated. Refresh to see it.'); } catch (x) { setErr(x.message); } };
  const chpw = async (e) => { e.preventDefault(); const { error } = await supabase.auth.updateUser({ password: pw }); error ? setErr(error.message) : (setMsg('Password changed.'), setPw('')); };
  const deactivate = async () => { if (confirm('Deactivate your account? You can ask an administrator to reactivate it.')) { await supabase.from('profiles').update({ status: 'deactivated' }).eq('id', me.id); await supabase.auth.signOut(); location.href = '/login'; } };
  return (<div><h2>Settings</h2>{err && <div className="err">{err}</div>}{msg && <div className="ok">{msg}</div>}
    <form className="card" onSubmit={save}><h3>Profile</h3>
      <label>Profile photo <input type="file" accept="image/*" onChange={img('avatar_url', 'avatars')} /></label>
      <label>Cover photo <input type="file" accept="image/*" onChange={img('cover_url', 'avatars')} /></label>
      <div className="row"><input placeholder="First name" value={f.first_name} onChange={set('first_name')} required /><input placeholder="Last name" value={f.last_name} onChange={set('last_name')} required /></div>
      <input placeholder="Headline" value={f.headline} onChange={set('headline')} /><textarea rows={4} placeholder="About you" value={f.bio} onChange={set('bio')} />
      <div className="row"><input placeholder="Country" value={f.country} onChange={set('country')} /><input placeholder="Region" value={f.region} onChange={set('region')} /><input placeholder="District" value={f.district} onChange={set('district')} /></div>
      <input placeholder="Phone (never shown publicly)" value={f.phone} onChange={set('phone')} />
      <label>Who can see my profile?<select value={f.visibility} onChange={set('visibility')}><option value="public">Public</option><option value="members">Registered members only</option><option value="connections">Connections only</option><option value="private">Private</option></select></label>
      <button>Save changes</button></form>
    <form className="card" onSubmit={chpw}><h3>Change password</h3><PasswordInput value={pw} onChange={e => setPw(e.target.value)} placeholder="New password" autoComplete="new-password" /><button>Update password</button></form>
    <div className="card"><h3>Account</h3><button className="red" onClick={deactivate}>Deactivate account</button></div></div>);
}
export default function Settings() { return <Shell>{me => <Inner me={me} />}</Shell>; }
