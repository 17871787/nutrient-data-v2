import { useEffect, useState } from 'react';
import { tenantSkins } from './branding/tenants';
import { enableSainsburysTheme } from './config/designFlags';

interface BrandingState {
  logoUrl: string;
  companyName: string;
}

export function BrandLoader() {
  const [branding, setBranding] = useState<BrandingState | null>(null);

  useEffect(() => {
    const slug = new URLSearchParams(location.search).get('theme');
    const skin = tenantSkins.find(t => t.slug === slug);

    if (skin && (enableSainsburysTheme || slug !== 'sainsburys')) {
      const link = document.createElement('link');
      link.rel  = 'stylesheet';
      link.href = skin.css;
      document.head.appendChild(link);

      // Provide logo + name via context
      setBranding({
        logoUrl: skin.logo,
        companyName: skin.companyName,
      });
    }
  }, []);

  return { branding };
}