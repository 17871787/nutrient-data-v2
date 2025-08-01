// Pure unit helpers for forage calculations
export const freshToDryT = (freshT, dmPct) =>
  freshT * (dmPct / 100);

// Calculate protein tonnes from fresh tonnes, DM%, and CP% on DM basis
export const proteinTonnes = (freshT, dmPct, cpDmPct) =>
  freshT * (dmPct / 100) * (cpDmPct / 100);

export const proteinToNkg = (proteinT) =>
  proteinT * 1000 * 0.16;   // 16% N in CP