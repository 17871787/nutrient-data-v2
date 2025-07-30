export interface TenantSkin {
  slug: string;
  css:  string;           // path to theme file
  logo: string;           // square or wide SVG
  companyName: string;
}

export const tenantSkins: TenantSkin[] = [
  {
    slug: 'sainsburys',
    css:  '/themes/sainsburys.css',
    logo: '/logo.svg',
    companyName: "Sainsbury's",
  },
];