/**
 * Brand logos for social auth providers.
 *
 * These remain hand-rolled SVGs (rather than lucide-react icons) because:
 * - Google brand guidelines require the multi-color "G" with official colors,
 *   which lucide does not provide.
 * - Apple's logo is also a brand asset, not a generic glyph.
 *
 * Every other icon in the app should come from lucide-react.
 */

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AppleIcon() {
  return (
    <svg
      width="16"
      height="18"
      viewBox="0 0 814 1000"
      aria-hidden="true"
      className="fill-current"
    >
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 405.8 15.9 269.3 15.9 139.7c0-99.3 37-131.6 37-131.6 32.5-27.5 55.3-29.2 55.3-29.2 20.1 0 83.3 27 152 27s152.2-32.8 195.2-32.8c42.5 0 135.3 29.2 198.4 100 0 0-29.2 26.9-29.2 71.7 0 50.6 30.5 76.8 47.5 80z" />
    </svg>
  );
}
