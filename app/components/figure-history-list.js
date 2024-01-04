import m from "mithril";

import * as K         from "../constants.js";
import { EditDialog } from "./edit-dialog.js";
import { Request }    from "../request.js";
import * as U         from "../utils.js";

//========================================================================
const removeHistory = (rec, callbackFn) => {
  if (confirm("Are you sure you want to delete this item?")) {
    Request.delete("/userhistory/" + rec.id,
                   resp => {
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
              resp => {
                Request.messages("Record updated");
                callbackFn();
              });
  return true;
};

//========================================================================
// caller must add m(Dialog) to its view nodes!
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
                              onclick: _ => EditDialog.editHistory(rec, _ => updateHistory(rec, callbackFn))
                            },
                            K.ICON_STRINGS.edit),
                          m("span.action",
                            {
                              onclick: _ => removeHistory(rec, callbackFn)
                            },
                            K.ICON_STRINGS.remove)),
                        m("td", rec.notes))),
             showTotals
               ? m("tr.totals",
                   m("td[colspan=2]", "Totals"),
                   m("td", ""),
                   m("td", list.reduce((acc, val) => acc += val.amount, 0)),
                   m("td[colspan=2]", ""))
               : null);
  }
};
