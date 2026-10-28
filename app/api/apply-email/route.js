import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dripgfmuekjmocwnrczz.supabase.co';
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyaXBnZm11ZWtqbW9jd25yY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5MzUxOTksImV4cCI6MjEwODUxMTE5OX0.XmkAxN6mdpZ87pvw9SXAEow7WBp4IldnvJOH9bxiAto';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const oneLine = (s) => String(s ?? '').replace(/[\r\n]+/g, ' ').trim();
const isEmail = (s) => /^\S+@\S+\.\S+$/.test((s || '').trim());

// Sends an application that was already saved in the database to the email address of the opportunity.
export async function POST(req) {
  try {
    const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    if (!token) return NextResponse.json({ sent: false, reason: 'unauthorized' }, { status: 401 });
    const { applicationId } = await req.json();

    const sb = createClient(URL, KEY, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: u } = await sb.auth.getUser(token);
    if (!u?.user) return NextResponse.json({ sent: false, reason: 'unauthorized' }, { status: 401 });

    const { data: app } = await sb.from('applications')
      .select('*, opportunity:opportunities(title, organization, apply_url)')
      .eq('id', applicationId).eq('applicant_id', u.user.id).maybeSingle();
    if (!app) return NextResponse.json({ sent: false, reason: 'not_found' }, { status: 404 });
    if (app.email_sent_at) return NextResponse.json({ sent: true, already: true });

    const to = (app.opportunity?.apply_url || '').trim();
    if (!isEmail(to)) return NextResponse.json({ sent: false, reason: 'no_email' });
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return NextResponse.json({ sent: false, reason: 'smtp_not_configured' });

    const port = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com', port, secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    const title = oneLine(app.opportunity?.title);
    const text = [
      `New application received through Terraviva Connect`, ``,
      `Opportunity: ${title}`, `Applicant: ${oneLine(app.full_name)}`, `Email: ${oneLine(app.email)}`,
      app.phone ? `Phone: ${oneLine(app.phone)}` : null, app.cv_url ? `CV / document: ${app.cv_url}` : null, ``, `Message:`, app.message, ``,
      `You can reply directly to this email to contact the applicant.`
    ].filter((x) => x !== null).join('\n');
    const html = `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#1d2b2a">
      <h2 style="color:#0e7c7b;margin-bottom:4px">New application</h2>
      <p style="margin-top:0;color:#667775">received through Terraviva Connect</p>
      <p><b>Opportunity:</b> ${esc(title)}<br><b>Applicant:</b> ${esc(app.full_name)}<br><b>Email:</b> <a href="mailto:${esc(app.email)}">${esc(app.email)}</a>
      ${app.phone ? `<br><b>Phone:</b> ${esc(app.phone)}` : ''}${app.cv_url ? `<br><b>CV / document:</b> <a href="${esc(app.cv_url)}">Open</a>` : ''}</p>
      <div style="white-space:pre-wrap;border-left:4px solid #4a8a1f;padding:8px 14px;background:#f1f5f2;border-radius:6px">${esc(app.message)}</div>
      <p style="color:#667775;font-size:13px">Reply to this email to contact the applicant.</p></div>`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Terraviva Connect" <${process.env.SMTP_USER}>`,
      to, replyTo: `"${oneLine(app.full_name).replace(/"/g, '')}" <${oneLine(app.email)}>`,
      subject: `New application: ${title} - ${oneLine(app.full_name)}`, text, html
    });
    await sb.from('applications').update({ email_sent_at: new Date().toISOString() }).eq('id', app.id);
    return NextResponse.json({ sent: true });
  } catch (e) {
    return NextResponse.json({ sent: false, reason: 'error', message: String(e?.message || e) }, { status: 500 });
  }
}
