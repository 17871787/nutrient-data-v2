// Pure unit helpers for forage calculations
export const freshToDryT = (freshT, dmPct) =>
  freshT * (dmPct / 100);

export const proteinTonnes = (freshT, cpFwPct) =>
  freshT * (cpFwPct / 100);

export const cpPercentDM = (dmPct, cpFwPct) =>
  dmPct > 0 ? cpFwPct / (dmPct / 100) : 0;

export const proteinToNkg = (proteinT) =>
  proteinT * 1000 * 0.16;   // 16% N in CP