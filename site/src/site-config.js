// Site-wide settings. Everything Joschka may want to switch lives here.

export const SITE = {
  name: 'FreemanMacroScope',
  defaultCountry: 'us',

  // Required for the Impressum (Swiss/EU law) as soon as the site is commercial (ads).
  // Leave empty until filled in – the page then shows a placeholder.
  contact: {
    name: '',
    address: '',
    email: '',
  },

  // Advertising. Keep `enabled: false` until the AdSense account is approved.
  // Consent (GDPR / Swiss FADP) is handled by Google's own certified consent
  // message: AdSense → Privacy & messaging → enable the GDPR message.
  // Preview the ad placements any time with ?adpreview=1 in the URL.
  ads: {
    enabled: false,
    client: '',            // e.g. 'ca-pub-1234567890123456'
    slots: {               // AdSense ad-unit IDs per placement
      overview: '',
      indicator: '',
      footer: '',
    },
  },

  // Optional paid ad-free version – prepared, not active.
  // When activated, `isPro()` in ads.js must verify a real licence (e.g. Stripe/Lemon Squeezy).
  pro: {
    enabled: false,
    price: { de: 'CHF 15 / Jahr', en: 'CHF 15 / year' },
    checkoutUrl: '',
  },
};
