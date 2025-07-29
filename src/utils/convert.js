// Conversion utilities for feed calculations

export const annualFromPerCowDay = (kgPerCowDay, cows) =>
  kgPerCowDay * cows * 365 / 1000;

export const annualFromPerL = (kgPerL, milkL) =>
  kgPerL * milkL / 1000;

export const perCowDayFromAnnual = (tAnnual, cows) =>
  cows ? (tAnnual * 1000) / (cows * 365) : 0;

export const perLFromAnnual = (tAnnual, milkL) =>
  milkL ? (tAnnual * 1000) / milkL : 0;