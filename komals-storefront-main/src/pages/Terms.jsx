function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 16, marginBottom: 6, color: 'var(--on-surface)' }}>{title}</h2>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--on-surface-variant)' }}>{children}</p>
    </div>
  );
}

export default function Terms() {
  return (
    <div className="container" style={{ padding: '24px 16px 48px', maxWidth: 720 }}>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>Terms &amp; Conditions</h1>

      <Section title="About Us">
        Jayalakshmi Hyper Mart is a retail store located in Koppa. This website is provided to help
        our customers browse our products, check offers, and get in touch with us. By using this
        website, you agree to the terms described below.
      </Section>

      <Section title="Product Prices">
        Prices shown on this website are for reference only and are not final. Prices are subject to
        change without prior notice due to supplier rates, taxes, offers, or other factors. Please
        confirm the final price at the time of purchase, either in-store or with our staff over
        phone/WhatsApp.
      </Section>

      <Section title="Product Availability">
        Product availability shown on the website may not reflect real-time stock. An item listed as
        available may be out of stock at the store, and vice versa. We recommend confirming
        availability before visiting for a specific item.
      </Section>

      <Section title="Offers & Discounts">
        Offers displayed on this website are valid for a limited period and may be withdrawn,
        changed, or extended at our discretion. Offers cannot be combined unless explicitly stated.

      </Section>

      <Section title="Website Use">
        This website is for informational purposes to help you discover our products and store
        details. We do not currently process online payments or online orders through this website.
        All purchases are completed at our physical store in Koppa.
      </Section>

      <Section title="Accuracy of Information">
        We try to keep product details, images, and prices as accurate as possible, but errors can
        occur. We are not liable for any inconvenience caused by such errors and will correct them as
        soon as they are noticed.
      </Section>

      <Section title="Changes to These Terms">
        We may update these terms from time to time. Continued use of this website after changes
        means you accept the updated terms.
      </Section>

      <Section title="Contact Us">
        For any questions about these terms, please reach out to us using the details on our{' '}
        <a href="/contact">Contact page</a>.
      </Section>
    </div>
  );
}
