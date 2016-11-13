/* global module require */

var m       = require("mithril");
var Request = require("request");

//==================================================================================================================================
var StarRating = function() {
    var CELL_WIDTH = 16;

    var highlightClassName = function(idx, userRating) {
        return idx == userRating ? "rating-star-highlight" : "";
    };

    var ratingSpanWidth = function(idx, rating) {
        if (idx <= rating) {
            return "100%";
        }
        return Math.min(1 + ((rating - (idx - 1)) * (CELL_WIDTH - 2)), CELL_WIDTH);
    };

    var updateRating = function(scenario, newRating) {
        Request.post("/userscenarios",
                     { user_scenario: { scenario_id: scenario.id, rating: newRating } },
                     resp => {
                         scenario.rating = resp.avg_rating;
                         scenario.user_scenario.rating = newRating;
                         scenario.num_votes = resp.num_votes;
                     });
    };

    return {
        view: function(ctrl, isActive, scenario) {
            var id = scenario.id;
            var rating = scenario.rating;
            var userRating = scenario.user_scenario.rating;
            var votes = scenario.num_votes;
            //console.log("id: " + id + ", rating: " + rating + ", userRating: " + userRating + ", votes: " + votes);
            rating = Math.max(Math.min(rating, 5), 0);
            var ratingCeiling = Math.ceil(rating);
            if (!isActive) {
                userRating = -1; // don't highlight anything
            }
            return m("div", { class: "rating" + (isActive ? " active" : "") }, [1, 2, 3, 4, 5].map(function(n) {
                return m("div.rating-star-container",
                         { onclick: function(ev) { if (isActive) { updateRating(scenario, n); } } },
                         [
                             m("div", { class: "rating-star " + highlightClassName(n, userRating) }, [
                                 m.trust("&#9734;"),
                                 n <= ratingCeiling ? m("div", {
                                                          class: "rating-star-inner " + highlightClassName(n, userRating),
                                                          style: "width:" + ratingSpanWidth(n, rating) + "px"
                                                        },
                                                        m.trust("&#9733;"))
                                                    : null
                             ])
                         ]);
            }).concat(votes > 0 ? m("span.votes", "(" + votes + ")") : null));
        }
    };
}();

module.exports = StarRating;
