/* global module require */

var m       = require("mithril");
var Request = require("request");

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
const updateRating = (scenario, newRating, callback) => {
    Request.post("/userscenarios",
                 { user_scenario: { scenario_id: scenario.id, rating: newRating } },
                 resp => {
                     if (callback) {
                         callback.call();
                     } else {
                         scenario.rating = resp.avg_rating;
                         scenario.user_scenario.rating = newRating;
                         scenario.num_votes = resp.num_votes;
                         m.redraw(true);
                     }
                 });
};

//==================================================================================================================================
const StarRating = {
    view: function(vnode) {
        const { isActive, scenario, callback } = vnode.attrs;
        const { id, num_votes: votes } = scenario;
        var { rating, user_scenario: { rating: userRating } } = scenario;

        //console.log("id: " + id + ", rating: " + rating + ", userRating: " + userRating + ", votes: " + votes);

        if (!isActive) {
            userRating = -1; // don't highlight anything
        }
        rating = Math.max(Math.min(rating, 5), 0);

        const ratingCeiling = Math.ceil(rating);

        return m("div",
                 { class: `rating ${isActive ? "active" : ""}` },
                 [1, 2, 3, 4, 5].map( n => {
                     return m("div.rating-star-container",
                              isActive ? { onclick: ev => updateRating(scenario, n, callback) } : {},
                              m("div", { class: `rating-star ${highlightClassName(n, userRating)}` },
                                STAR_OUTLINE,
                                n <= ratingCeiling ? domStarSolid(n, rating, userRating) : null));
                 }),
                 votes > 0 ? m("span.votes", "(" + votes + ")") : null);
    }
};

module.exports = StarRating;
