/* global module require */

const m       = require("mithril");

const CELL_WIDTH   = 16;
const STAR_OUTLINE = "\u2606"; // ☆
const STAR_SOLID   = "\u2605"; // ★

//==================================================================================================================================
const domStarSolid = (n, rating, userRating) => {
    return m("div",
             {
                 class: `rating-star-inner ${highlightClassName(n, userRating)}`,
                 style: `width: ${ratingSpanWidth(n, rating)}px`
             },
             STAR_SOLID);
}

//==================================================================================================================================
const highlightClassName = (idx, userRating) => idx == userRating ? "rating-star-highlight" : "";

//==================================================================================================================================
const ratingSpanWidth = (idx, userRating) =>
      idx <= userRating ? "100%" : Math.min(1 + ((userRating - (idx - 1)) * (CELL_WIDTH - 2)), CELL_WIDTH);

//==================================================================================================================================
// m(StarRating, { id: <val>, active: <bool>, votes: <n>, rating: <n>, userRating: <n>, callback: fn(id, newRating) })
//----------------------------------------------------------------------------------------------------------------------------------
const StarRating = {
    view: function(vnode) {
        const { id, active, votes, callback } = vnode.attrs;
        var   { rating, userRating = -1 }     = vnode.attrs;

        if (!active) {
            userRating = -1; // don't highlight anything
        }
        rating = Math.max(Math.min(rating, 5), 0);

        const ratingCeiling = Math.ceil(rating);

        return m("div",
                 { class: `rating ${active ? "active" : ""}` },
                 [1, 2, 3, 4, 5].map( n => {
                     return m("div.rating-star-container",
                              active ? { onclick: ev => callback(id, n) } : {},
                              m("div", { class: `rating-star ${highlightClassName(n, userRating)}` },
                                STAR_OUTLINE,
                                n <= ratingCeiling ? domStarSolid(n, rating, userRating) : null));
                 }),
                 votes > 0 ? m("span.votes", "(" + votes + ")") : null);
    }
};

module.exports = StarRating;
