// Base UOM values coming from the excel import (e.g. "Numbers", "SquareFeet") are normalized
// and only some are worth surfacing to shoppers — "Numbers" just means priced per piece, so we
// show plain price for it and a "per <unit>" suffix for anything else (e.g. SquareFeet).
const HIDDEN_UNITS = new Set(['numbers', 'number', 'nos', 'pcs', 'piece', 'pieces']);

const UNIT_LABELS = {
  squarefeet: 'Square Feet',
  sqft: 'Square Feet',
};

export function unitLabel(unit) {
  if (!unit) return null;
  const normalized = unit.trim().toLowerCase().replace(/[\s_-]+/g, '');
  if (!normalized || HIDDEN_UNITS.has(normalized)) return null;
  return UNIT_LABELS[normalized] || unit.trim();
}
