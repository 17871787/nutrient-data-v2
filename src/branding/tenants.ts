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
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Sainsbury%27s.svg',
    companyName: "Sainsbury's",
  },
];