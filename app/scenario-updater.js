import m from "mithril";

import { Request } from "./request.js";

const observers = [];

//========================================================================
export const ScenarioUpdater = {
    // fn(id, newAvgRating, userRating, newNumVotes)
    // id and userRating are the same as the parameters to update(), which just passes them through.
    addObserver: (fn) => {
        observers.push(fn);
    },

    update: (id, userRating) => {
        Request.post("/userscenarios",
                     { user_scenario: { scenario_id: id, rating: userRating } },
                     resp => {
                         observers.forEach(o => o(id, resp.avg_rating, userRating, resp.num_votes));
                     });
    }
};
