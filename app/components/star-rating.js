import m from "mithril";

// Based on ideas from https://codepen.io/FredGenkin/pen/eaXYGV

const STAR_SOLID   = "\u2605"; // ★

//========================================================================
const domStar = (starType, isUserRating, activeFn, partialVal) => {
  const attrs = {}
  const extraClassNames = ["star", `star-${starType}`];

  let starChar = STAR_SOLID;

  if (isUserRating) {
    extraClassNames.push("user-rating");
  }

  if (activeFn) {
    extraClassNames.push("clickable");
    attrs.onclick = activeFn
  }

  if (partialVal) {
    attrs.style = `--pct: calc(${partialVal} * 100%)`
    starChar = "";
  }

  attrs.class = extraClassNames.join(" ");

  return m("span", attrs, starChar);
};

//========================================================================
/**
 * Mithril component for rendering and interacting with ratings stars.
 *
 * @component
 *
 * @vattr {string} id - unique id passed back in `callback`
 * @vattr {boolean} active - if `true`, user can click on a star to invoke `callback`
 * @vattr {number} votes - # of votes cast for `id`
 * @vattr {number} rating - floating point # rating average among all users
 * @vattr {number} userRating - user's rating for item `id`, 0 if none or 1..5
 * @vattr {function(id:string, newRating:number)} callback - function called
 *   when user interacts with the stars
 */
export const StarRating = {
  view: vnode => {
    const { id, active, votes, callback } = vnode.attrs;
    let   { rating, userRating = -1 }     = vnode.attrs;

    if (!active) {
      userRating = -1; // don't highlight anything
    }
    rating = Math.max(Math.min(rating, 5), 0);

    // All stars up to and including this one are completely solid
    // lastSolidStar + 1 is either partial or off-scale (i.e. 6)
    // lastSolidStar + 2 (etc) is empty
    const lastSolidStar = Math.floor(rating);

    // The star at lastSolidStar + 1 is probably a partial. We need just the
    // fractional part of the rating to determine how much of that star
    // to fill in.  "Probably a partial" because the rating could
    // be an exact integer, in which case the ratingFrac is 0
    // and there's no partial information to show.  The computation
    // of `starType` accounts for this.
    const ratingFrac = rating - lastSolidStar;

    return m(".star-rating",
      [1, 2, 3, 4, 5].map(n => {
        const isUserRating = n === userRating;
        const activeFn = active ? () => callback(id, isUserRating ? 0 : n) : null;
        const starType =
          n <= lastSolidStar
            ? "full"
            : !ratingFrac || n > lastSolidStar + 1
              ? "empty"
              : "partial";

        return domStar(starType, isUserRating, activeFn, starType === "partial" ? ratingFrac : null);
      }),
      votes > 0 ? m("span.votes", `(${votes})`) : null);
  }
};
