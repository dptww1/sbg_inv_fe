/**
 * Computation-related methods shared among several files dealing with
 * army lists.
 */

//========================================================================
/**
 * Compute the totals of needed/collected/painted models for a user
 *     within a army list.
 *
 * @param {Object[]} figureList - army list structure returned from the
 *     back end, where figures are sorted into type-specific lists
 *
 * @return {Object} totals structure (see {@link newTotalsStruct})
 */
export const computeTotals = figureList =>
  figureList.reduce(tallySubListStats, newTotalsStruct());

//========================================================================
/**
 * Creates a new structure for tallying the models needed for an army list.
 *
 * Fields:
 *
 * | Field Name | Description |
 * | ---------- | ----------- |
 * | `needed`   | # of figures of this type needed by the scenario |
 * | `owned`    | # of figures of this type owned by the user |
 * |  `painted` | # of figures of this type painted by the user |
 * |  `neededOwned` | `0..min(needed,owned)` |
 * |  `neededPainted` | `0..min(needed,painted)` |
 *
 * @return {Object} the initialized structure
 */
export const newTotalsStruct = () => {
  return {
    needed: 0,
    owned: 0,
    painted: 0,
    neededOwned: 0,
    neededPainted: 0
  };
};

//========================================================================
/**
 * Accumulate counts from a totals structure. This is helpful for rolling
 * up the stats for an army list.
 *
 * This assumes that any capping of amounts to the `needed` field has
 * already been accounted for in the passed-in parameters.
 *
 * @param {Object} acc - existing counts; fields will be updated
 * @param {Object} val - new totals struct to add to the existing counts
 *
 * @return {Object} the `acc` parameter
 */
export const tallyStats = (acc, val) => {
  acc.needed += val.needed;
  acc.owned += val.owned;
  acc.painted += val.painted;
  acc.neededOwned += val.neededOwned;
  acc.neededPainted += val.neededPainted;

  return acc;
};

//========================================================================
// Tallies one of the sublists of figures (warriors, heroes, monsters, etc).
// We have to cap the "needed" values because when we show the Needed
// pie chart, we don't want overages compensating for other underages.
// Example: Fig A is owned: 3, needed: 2; Fig B is owned: 1, needed: 2.
// We can't just add the owned and needed columns, which would result in
// owned: 4, needed 4, since that shows the user has 100% of the needed
// figures.  The actual result should be owned: 3, needed 4 = 75%.
//------------------------------------------------------------------------
const tallySubListStats = (acc, val) => {
  acc.needed += val.needed;
  acc.owned += val.owned;
  acc.painted += val.painted;

  if (val.needed > 0) {
    acc.neededOwned += Math.min(val.needed, val.owned);
    acc.neededPainted += Math.min(val.needed, val.painted);
  }

  return acc;
};
