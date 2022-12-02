/* global module require */

const m = require("mithril");

const K       = require("constants.js");
const Dialog  = require("components/figure-inventory-dialog");
const Request = require("request.js");

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
const FigureHistoryList = {
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
                                rec.amount > 1 && rec.plural_name ? rec.plural_name : rec.name)),
                        m("td", K.USER_FIGURE_OPS[rec.op]),
                        m("td.numeric", rec.amount),
                        m("td",
                          m("span.action",
                            {
                              onclick: _ => Dialog.editHistory(rec, _ => updateHistory(rec, callbackFn))
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

module.exports = FigureHistoryList;
