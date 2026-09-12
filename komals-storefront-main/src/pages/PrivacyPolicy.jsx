function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 16, marginBottom: 6, color: 'var(--on-surface)' }}>{title}</h2>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--on-surface-variant)' }}>{children}</p>
    </div>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="container" style={{ padding: '24px 16px 48px', maxWidth: 720 }}>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Privacy Policy</h1>

      <Section title="Introduction">
        Jayalakshmi Hyper Mart ("we", "us", "our"), a retail store in Koppa, respects your privacy.
        This page explains what information we collect through this website and how it is used.
      </Section>

      <Section title="Information We Collect">
        We may collect basic information you choose to share with us, such as your name, phone
        number, or messages, when you contact us via phone, WhatsApp, or the contact form on this
        website. We do not collect payment or card information through this website, as all purchases
        happen in-store.
      </Section>

      <Section title="How We Use Your Information">
        Any information you share is used only to respond to your queries, assist with orders or
        support, and improve our service. We do not sell or rent your personal information to third
        parties.
      </Section>

      <Section title="WhatsApp Communication">
        If you message us on WhatsApp, your messages and phone number are used to communicate with
        you regarding your queries, offers, and support. Standard WhatsApp terms and privacy policy
        also apply to messages sent via WhatsApp.
      </Section>

      <Section title="Cookies & Analytics">
        This website may use basic, non-invasive tracking (such as visit counts) to understand how
        many people visit our site and to improve it. This data is not used to personally identify
        you.
      </Section>

      <Section title="Data Security">
        We take reasonable steps to protect any information shared with us. However, no method of
        transmission over the internet is 100% secure.
      </Section>

      <Section title="Changes to This Policy">
        We may update this privacy policy from time to time. Any changes will be posted on this page.
      </Section>

      <Section title="Contact Us">
        If you have questions about this privacy policy or how your information is handled, please
        reach out via our <a href="/contact">Contact page</a>.
      </Section>
    </div>
  );
}
