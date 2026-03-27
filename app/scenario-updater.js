import { Request } from "./request.js";

const observers = [];

//========================================================================
/**
 * Namespace for methods coordinating the {@link ScenarioDetails} and
 * {@link ScenarioList} pages.
 *
 * Without using these methods, updating scenario ratings on one page
 * wasn't propagating to the other.  There's probably a better way to do
 * this, but this was one of the first bits of the site that I wrote.
 */
export const ScenarioUpdater = {
  /**
   * Adds a method called back when `update` is called.
   *
   * @param {function(id:number, newAvgRating:float, userRating:number, newNumVotes:number)} fn - the callback function
   *     where `id` is the scenario id, and the other parameters should be self-explanatory
   *
   * return {void}
   */
  addObserver: (fn) => {
    observers.push(fn);
  },

  /**
   * Updates the observers added from `addObserver` with new scenario ratings.
   *
   * @param {number} id - the scenario id
   * @param {number} userRating - 1..5 or `null`
   *
   * return {void}
   */
  update: (id, userRating) => {
    Request.post("/userscenarios",
      { user_scenario: { scenario_id: id, rating: userRating } },
      resp => {
        observers.forEach(o => o(id, resp.avg_rating, userRating, resp.num_votes));
      });
  }
};
