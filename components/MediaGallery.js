'use client';
import { useState } from 'react';
import { useT } from '@/lib/i18n';

const ext = (m) => ((m.name || m.url).split('?')[0].split('.').pop() || '').toLowerCase();
const isOffice = (m) => ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext(m));
const docSrc = (m) => ext(m) === 'pdf' ? m.url + '#toolbar=1&navpanes=0&view=FitH'
  : isOffice(m) ? 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(m.url) : null;

// Cloudinary can generate a real picture of a video frame for us.
const posterOf = (m) => {
  if (m.poster_url) return m.poster_url;
  if (m.url && m.url.includes('res.cloudinary.com') && m.url.includes('/video/upload/'))
    return m.url.replace('/video/upload/', '/video/upload/so_1,w_960,c_limit/').replace(/\.[a-z0-9]+(\?.*)?$/i, '.jpg');
  return undefined;
};

export default function MediaGallery({ media, compact = false }) {
  const { t } = useT();
  const [lb, setLb] = useState(null);
  const [full, setFull] = useState(null);
  const [toggled, setToggled] = useState({});
  if (!media?.length) return null;
  const list = [...media].sort((a, b) => (a.position || 0) - (b.position || 0));
  const imgs = list.filter(m => m.kind === 'image');
  const vids = list.filter(m => m.kind === 'video');
  const docs = list.filter(m => m.kind === 'document');
  const move = (d) => setLb((lb + d + imgs.length) % imgs.length);

  return (<div className={'media' + (compact ? ' compact' : '')}>
    {imgs.length > 0 && <div className={'igrid n' + Math.min(imgs.length, 4)}>
      {imgs.slice(0, 4).map((m, i) => (
        <div key={m.id || m.url} className="icell" onClick={() => setLb(i)}>
          <img src={m.url} alt="" loading="lazy" />
          {i === 3 && imgs.length > 4 && <div className="more">+{imgs.length - 4}</div>}
        </div>))}
    </div>}

    {vids.map(m => {
      const poster = posterOf(m);
      return (<video key={m.id || m.url} className="vid" controls playsInline preload="metadata"
        poster={poster} src={poster ? m.url : m.url + '#t=0.5'} />);
    })}

    {docs.map(m => {
      const src = docSrc(m);
      const open = src && (compact ? !!toggled[m.url] : !toggled[m.url]);
      return (<div className="doc" key={m.id || m.url}>
        <div className="doc-h">
          <span>{ext(m) === 'pdf' ? '📕' : '📄'} <b>{m.name || 'Document'}</b></span>
          <span>
            {src && <button type="button" className="link" onClick={() => setToggled({ ...toggled, [m.url]: !toggled[m.url] })}>{open ? t("Hide") : t("Show")}</button>}
            {src && <button type="button" className="link" onClick={() => setFull(src)}>{t("⤢ Full screen")}</button>}
            <a className="btn sec" style={{ padding: '.2rem .7rem' }} href={m.url} target="_blank" rel="noreferrer">{t("Download")}</a>
          </span>
        </div>
        {open && <iframe className="doc-f" src={src} title={m.name || 'document'} loading="lazy" />}
      </div>);
    })}

    {lb !== null && <div className="overlay" onClick={() => setLb(null)}>
      <button type="button" className="x" onClick={() => setLb(null)}>✕</button>
      {imgs.length > 1 && <button type="button" className="nav-l" onClick={(e) => { e.stopPropagation(); move(-1); }}>‹</button>}
      <img src={imgs[lb].url} alt="" onClick={(e) => e.stopPropagation()} />
      {imgs.length > 1 && <button type="button" className="nav-r" onClick={(e) => { e.stopPropagation(); move(1); }}>›</button>}
    </div>}
    {full && <div className="overlay" onClick={() => setFull(null)}>
      <button type="button" className="x" onClick={() => setFull(null)}>✕</button>
      <iframe className="full-f" src={full} title="document" onClick={(e) => e.stopPropagation()} />
    </div>}
  </div>);
}
