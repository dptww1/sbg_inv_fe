import m from "mithril";

import * as K         from "../constants.js";
import { EditDialog } from "./edit-dialog.js";
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

//========================================================================
const updateHistory = (hist, callbackFn) => {
  Request.put("/userhistory/" + hist.id,
              {
                history: hist
              },
              () => {
                Request.messages("Record updated");
                callbackFn();
              });
  return true;
};

/**=======================================================================
 * Shows an editable list of user history records.
 *
 * Assumes the owning page has included `m(Dialog)` in its view.
 *
 * @component
 *
 * @vattr {Object[]} list - array of user_figure_history records from the back end
 * @vattr {boolean} hideName - if `true`, the figure name is omitted from
 *     the list; useful on the {@link FigureDetails} page where the records
 *     are all referencing that current figure
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

    return m("table.striped.user-activity",
             list.map(rec =>
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
                        m("td",
                          m("span.action",
                            {
                              onclick: () => EditDialog.editHistory(rec, () => updateHistory(rec, callbackFn))
                            },
                            K.ICON_STRINGS.edit),
                          m("span.action",
                            {
                              onclick: () => removeHistory(rec, callbackFn)
                            },
                            K.ICON_STRINGS.remove)),
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
