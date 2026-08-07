import m from "mithril";

import * as K         from "../constants.js";
import { Request }    from "../request.js";
import * as U         from "../utils.js";

//========================================================================
const removeHistory = (rec, callbackFn) => {
  if (confirm("Are you sure you want to delete this item?")) {
    Request.delete("/userhistory/" + rec.id,
                   () => {
                     Request.messages("Activity record deleted.");
                     callbackFn();
                   });
  }
};

/**=======================================================================
 * Shows a list of user history records.  Only the last record is
 * editable, and then only if all the records pertain to a single figure.
 *
 * The edit limitation is to facilitate "undo" functionality on the back end,
 * where allowing arbitrary editing could result in nonsensical results.
 * Consider a figure with only the following two records:
 *    2026-04-02 Bought Unpainted 4
 *    2025-10-20 Painted 4
 * If the user deletes the first record, the back end undoes his/her inventory
 * and resets the amount back to 0.  But then the second record makes no sense.
 * More complicated cases are possible.  It seems easier just to disallow
 * editing of any but the last record in the list.
 *
 * Note that the back end doesn't enforce the only-edit-last-record rule!
 *
 * Assumes the owning page has included `m(Dialog)` in its view.
 *
 * @component
 *
 * @vattr {Object[]} list - array of user_figure_history records from the back end
 * @vattr {boolean} hideName - if `true`, the figure name is omitted from
 *     the list; used on the {@link FigureDetails} page where the records
 *     are all referencing that current figure. Edit tools are only available
 *     when this flag is `true`
 * @vattr {function()} callbackFn - function called if any record in `list`
 *     is edited or deleted
 * @vattr {boolean} showTotals - if `true`, totals from `list` are shown
 *     after the records themselves
 */
export const FigureHistoryList = {
  view: ({ attrs: { list, hideName, callbackFn, showTotals } }) => {
    if (!list || list.length === 0) {
      return m("p.text", "None");
    }

    // Force sorting in date increasing order.  This is slightly hinky,
    // in that `op_date` fields don't have to be accurate, so malicious
    // users can force nonsensical order of operations. But ordinary
    // users should be okay.
    list.sort((a, b) => U.cmp(a.op_date, b.op_date));

    return m("table.striped.user-activity",
             list.map((rec, idx) =>
                      m("tr",
                        m("td.nobr", rec.op_date),
                        hideName
                          ? null
                          : m("td",
                              m(m.route.Link,
                                {
                                  href: "/figures/" + rec.figure_id
                                },
                                rec.amount > 1 ? U.pluralName(rec) : rec.name)),
                        m("td", K.USER_FIGURE_OPS[rec.op]),
                        m("td.numeric", rec.amount),
                        hideName && idx === (list.length - 1) // only allow edits on figure details page, and then only for the last record
                          ? m("td",
                              m("span.action",
                                {
                                  onclick: () => removeHistory(rec, callbackFn)
                                },
                                K.ICON_STRINGS.remove))
                          : m("td"),
                        m("td", rec.notes))),
             showTotals
               ? m("tr.totals",
                   m("td[colspan=2]", "Totals"),
                   m("td", ""),
                   m("td", list.reduce((acc, val) => { acc += val.amount; return acc; }, 0)),
                   m("td[colspan=2]", ""))
               : null);
  }
};
