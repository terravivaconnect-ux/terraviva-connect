'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useT } from '@/lib/i18n';

/** Washa au zima hali ya matengenezo. Ikiwa imewashwa, wasimamizi (admin na moderator) pekee ndio wanaweza kutumia app. */
export default function AdminMaintenance() {
  const { lang } = useT();
  const L = (en, sw) => (lang === 'sw' ? sw : en);
  const [on, setOn] = useState(null); const [en, setEn] = useState(''); const [sw, setSw] = useState(''); const [eta, setEta] = useState('');
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [ok, setOk] = useState('');

  const load = async () => {
    const { data, error } = await supabase.rpc('get_app_status');
    if (error) return setErr(error.message);
    const s = Array.isArray(data) ? data[0] : data;
    setOn(!!s?.maintenance); setEn(s?.message_en || ''); setSw(s?.message_sw || ''); setEta(s?.eta || '');
  };
  useEffect(() => { load(); }, []);

  const apply = async (turnOn) => {
    if (turnOn && !confirm(L('Turn ON maintenance? Members will be locked out immediately. Only admins and moderators can use the app.', 'Washa matengenezo? Wanachama watazuiwa mara moja. Wasimamizi (admin na moderator) pekee ndio wataweza kutumia app.'))) return;
    setBusy(true); setErr(''); setOk('');
    const { error } = await supabase.rpc('set_maintenance', { p_on: turnOn, p_message_en: en, p_message_sw: sw, p_eta: eta });
    setBusy(false);
    if (error) return setErr(error.message);
    setOk(turnOn ? L('Maintenance is ON. Members now see the message.', 'Matengenezo yamewashwa. Wanachama sasa wanaona ujumbe.') : L('Maintenance is OFF. Members can use the app again.', 'Matengenezo yamezimwa. Wanachama wanaweza kutumia app tena.'));
    load();
  };

  if (on === null) return err ? <div className="err">{err}</div> : <p className="muted">{L('Loading…', 'Inapakia…')}</p>;

  return (
    <div>
      <div className="card" style={{ borderColor: on ? 'var(--red)' : 'var(--bd)' }}>
        <h3>{L('Maintenance mode', 'Hali ya matengenezo')}: <span className={'bstat ' + (on ? 'bad' : 'good')}>{on ? L('ON', 'IMEWASHWA') : L('OFF', 'IMEZIMWA')}</span></h3>
        <p className="muted">{L('When ON, members who log in see the message below. Admins and moderators can still use the app normally and see a banner reminding them that maintenance is on.', 'Ikiwa imewashwa, wanachama wanaoingia wanaona ujumbe ulio hapa chini. Admin na moderator wanaendelea kutumia app kama kawaida na wanaona tangazo la kuwakumbusha kuwa matengenezo yanaendelea.')}</p>
        {err && <div className="err">{err}</div>}
        {ok && <div className="ok">{ok}</div>}
        <label><small className="muted">{L('Message in Swahili', 'Ujumbe kwa Kiswahili')}</small>
          <textarea rows={3} value={sw} onChange={e => setSw(e.target.value)} maxLength={600} /></label>
        <label><small className="muted">{L('Message in English', 'Ujumbe kwa Kiingereza')}</small>
          <textarea rows={3} value={en} onChange={e => setEn(e.target.value)} maxLength={600} /></label>
        <label><small className="muted">{L('Expected back (optional), e.g. "Today 6:00 PM"', 'Tunatarajia kurudi (si lazima), mfano "Leo saa 12 jioni"')}</small>
          <input value={eta} onChange={e => setEta(e.target.value)} maxLength={80} /></label>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          {!on
            ? <button className="red" disabled={busy} onClick={() => apply(true)}>🛠 {L('Turn ON maintenance', 'Washa matengenezo')}</button>
            : <>
                <button disabled={busy} onClick={() => apply(false)}>✅ {L('Turn OFF: let members back in', 'Zima: waruhusu wanachama kuingia')}</button>
                <button className="sec" disabled={busy} onClick={() => apply(true)}>{L('Save message', 'Hifadhi ujumbe')}</button>
              </>}
        </div>
      </div>

      <div className="card">
        <h3>{L('What members will see', 'Wanachama wataona nini')}</h3>
        <div className="quote">
          <b>🛠️ {L('We will be back soon', 'Tutarejea hivi karibuni')}</b>
          <p style={{ whiteSpace: 'pre-wrap' }}>{lang === 'sw' ? sw : en}</p>
          {eta && <p><b>{L('Expected back', 'Tunatarajia kurudi')}:</b> {eta}</p>}
        </div>
      </div>

      <div className="card">
        <h3>{L('Suggested routine', 'Utaratibu unaopendekezwa')}</h3>
        <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>
          <li>{L('Announce the planned time in a post first (so nobody is surprised).', 'Tangaza muda uliopangwa kwenye chapisho kwanza (ili hakuna anayeshangazwa).')}</li>
          <li>{L('Turn maintenance ON and make your changes.', 'Washa matengenezo kisha ufanye mabadiliko yako.')}</li>
          <li>{L('Test as admin (you can still use everything).', 'Jaribu kama admin (bado unaweza kutumia kila kitu).')}</li>
          <li>{L('Turn maintenance OFF. Members on the message page are let in automatically within about 30 seconds.', 'Zima matengenezo. Wanachama walio kwenye ukurasa wa ujumbe wanaingia wenyewe ndani ya takriban sekunde 30.')}</li>
        </ol>
      </div>
    </div>
  );
}
