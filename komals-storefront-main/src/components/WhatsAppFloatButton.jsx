import { useSettings } from '../lib/useSettings.js';
import WhatsAppIcon from './WhatsAppIcon.jsx';

export default function WhatsAppFloatButton() {
  const settings = useSettings();
  if (!settings?.whatsappNumber) return null;

  return (
    <a
      href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Message us on WhatsApp"
      style={{
        position: 'fixed',
        right: 18,
        bottom: 18,
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: '#25D366',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px -4px rgba(0,0,0,0.4)',
        zIndex: 30,
      }}
    >
      <WhatsAppIcon size={26} />
    </a>
  );
}
