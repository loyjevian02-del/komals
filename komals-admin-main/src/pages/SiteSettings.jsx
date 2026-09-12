import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { ImageUploader } from '../components/ImageUploader.jsx';

const empty = {
  siteName: '', logo: '', contactPhone: '', supportPhone: '', contactEmail: '', address: '', mapsUrl: '',
  whatsappNumber: '', whatsappCommunityUrl: '', facebookUrl: '', instagramUrl: '', storeHours: '', storyEyebrow: '', storyHeading: '', storyBody: '', storyImage: ''

};

export default function SiteSettings() {
  const [form, setForm] = useState(empty);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then((r) => setForm({ ...empty, ...r.data }));
  }, []);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function save(e) {
    e.preventDefault();
    const res = await api.put('/admin/settings', form);
    setForm(res.data);
    setSaved(true);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Site Settings</h1>
      </div>
      <form onSubmit={save} className="card" style={{ maxWidth: 560 }}>
        <div className="field">
          <label>Site Name</label>
          <input required value={form.siteName} onChange={(e) => set('siteName', e.target.value)} />
        </div>
        <div className="field">
          <label>Logo</label>
          <ImageUploader value={form.logo} onChange={(url) => set('logo', url)} accept="image/jpeg,image/png,image/svg+xml,image/webp" />
        </div>
        <h2 style={{ fontSize: 15, margin: '20px 0 4px', fontWeight: 650 }}>Our Story Section</h2>
        <div className="field">
          <label>Story Eyebrow</label>
          <input value={form.storyEyebrow || ''} onChange={(e) => set('storyEyebrow', e.target.value)} placeholder="Our Story" />
        </div>
        <div className="field">
          <label>Story Heading</label>
          <input value={form.storyHeading || ''} onChange={(e) => set('storyHeading', e.target.value)} placeholder="A Legacy of Sweet Moments" />
        </div>
        <div className="field">
          <label>Story Body Text</label>
          <textarea value={form.storyBody || ''} onChange={(e) => set('storyBody', e.target.value)} />
        </div>
        <div className="field">
          <label>Story Image</label>
          <ImageUploader value={form.storyImage} onChange={(url) => set('storyImage', url)} accept="image/*" />
        </div>
        <h2 style={{ fontSize: 15, margin: '20px 0 4px', fontWeight: 650 }}>Contact Info</h2>
        <div className="field-row" style={{ display: 'flex', gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Business Phone Number</label>
            <input value={form.contactPhone || ''} onChange={(e) => set('contactPhone', e.target.value)} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Support Query Number</label>
            <input value={form.supportPhone || ''} onChange={(e) => set('supportPhone', e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={form.contactEmail || ''} onChange={(e) => set('contactEmail', e.target.value)} />
        </div>
        <div className="field">
          <label>Address</label>
          <textarea value={form.address || ''} onChange={(e) => set('address', e.target.value)} />
        </div>
        <div className="field">
          <label>Google Maps URL</label>
          <input value={form.mapsUrl || ''} onChange={(e) => set('mapsUrl', e.target.value)} placeholder="https://maps.google.com/?q=..." />
        </div>
        <div className="field">
          <label>Store Hours (e.g. "Mon–Sun: 8am – 10pm")</label>
          <input value={form.storeHours || ''} onChange={(e) => set('storeHours', e.target.value)} />
        </div>
        <div className="field">
          <label>WhatsApp Number</label>
          <input value={form.whatsappNumber || ''} onChange={(e) => set('whatsappNumber', e.target.value)} />
        </div>
        <div className="field">
          <label>WhatsApp Community URL</label>
          <input value={form.whatsappCommunityUrl || ''} onChange={(e) => set('whatsappCommunityUrl', e.target.value)} placeholder="https://chat.whatsapp.com/..." />
        </div>
        <div className="field-row" style={{ display: 'flex', gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Facebook URL</label>
            <input value={form.facebookUrl || ''} onChange={(e) => set('facebookUrl', e.target.value)} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Instagram URL</label>
            <input value={form.instagramUrl || ''} onChange={(e) => set('instagramUrl', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
          <button type="submit" className="btn btn-primary">Save</button>
          {saved && <span style={{ fontSize: 13, color: 'var(--secondary)', fontWeight: 600 }}>Saved</span>}
        </div>
      </form>
    </div>
  );
}
