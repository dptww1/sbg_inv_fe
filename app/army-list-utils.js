/**
 * Computation-related methods shared among several files dealing with
 * army lists.
 */

//========================================================================
export const computeTotals = figureList =>
  figureList.reduce(tallySubListStats, newTotalsStruct());

//========================================================================
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
// Tallies the counts from tallySubListStats().  Since sublist needed
// values have already been capped, we can just do straight addition here.
//------------------------------------------------------------------------
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
