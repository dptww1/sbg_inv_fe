/* global module require */

const m    = require("mithril");
const prop = require("mithril/stream");

const U = require("utils.js")

let hide = true;
let rec = {};
let errors = [];
let callbackFn;
let instrText;

//========================================================================
const createPrompt = rec => {
  const verb = rec.op.startsWith("buy")
                 ? "buy"
                 : rec.op.startsWith("sell")
                   ? "sell"
                   : "paint";
  const type = verb == "paint"
                   ? ""
                   : rec.op.indexOf("unpainted") >= 0 || rec.op === "painted"
                         ? "unpainted"
                         : "painted";
  return `How many ${type} ${rec.plural_name || rec.name} did you ${verb}?`;
};

//========================================================================
const initDialog = (rec, callback) => {
  callbackFn = callback;
  hide = false;
  errors = [];
  instrText = createPrompt(rec);
};

//========================================================================
const swallowEvents = ev => {
  ev.stopPropagation();
  return false;
};

//========================================================================
const update = _ => {
  errors = [];

  if (!rec.amount) {
    errors.push("Amount is required");
  }

  if (!("" + rec.amount).match("^[1-9]\\d*$")) {
    errors.push("Amount must be a positive integer");
  }

  if (!rec.op_date) {
    errors.push("Date is required");
  }

  if (!rec.op_date.match("^\\d{4}-\\d{2}-\\d{2}$")) {
    errors.push("Bad date format (expected YYYY-MM-DD, got " + rec.op_date + ")");
  }

  if (errors.length > 0) {
    return;
  }

  hide = true;
  if (!callbackFn(rec)) {
    hide = false;
  }
};

//========================================================================
const FigureInventoryEditor = {
  addError: msg => errors.push(msg),

  createHistory: (figure, op, updateCallback) => {
    rec = {
      amount: "",
      id: figure.id,
      name: figure.name,
      plural_name: figure.plural_name,
      new_owned: figure.owned,
      new_painted: figure.painted,
      notes: "",
      op: op,
      op_date: U.currentDate()
    };

    initDialog(rec, updateCallback);
  },

  editHistory: (histRec, updateCallback) => {
    rec = histRec;
    initDialog(rec, updateCallback);
  },

  view: vnode => {
    if (hide) {
      return null;
    }

    return [
      m(".figure-inventory-overlay", { onclick: _ => hide = true }),
      m(".figure-inventory-popup", { onclick: swallowEvents },
        m(".figure-inventory-popup-instructions", ""),

        m("form.figure-inventory-popup-form",

          m(".figure-inventory-popup-row",
            m("label", instrText),
            m(".errors", errors.map(msg => m("span", msg, m("br"))))),

          m(".figure-inventory-popup-row.flex-container",
            m(".stacked-column.field-container-with-label",
              m("label", "Amount "),
              // 'size' needed because even with width set via CSS, following
              // inline elements are rendered as if the input was at its default size.
              m("input#popup-amt[type=number][name=amt][min=1][max=9999][step=1][pattern=\\d+][size=4]",
                {
                  onchange: ev => rec.amount = ev.target.value,
                  value: rec.amount
                },
                rec.op_date)),

            m(".stacked-column.field-container-with-label",
              m("label", " When "),
              m("input[type=date][name=date][id=popup-date]",
                {
                  onchange: ev => rec.op_date = ev.target.value,
                  value: rec.op_date
                }))),

          m(".figure-inventory-popup-row.field-container-with-label",
            m("label[for=foo]", "Notes")),

          m(".figure-inventory-popup-row",
            m("textarea#foo.figure-inventory-popup-notes[name=notes][rows=5]",
              {
                onchange: ev => rec.notes = ev.target.value,
                value: rec.notes
              }))
         ),

        m(".dialog-buttons",
          m("button.overlay-cancel", { onclick: _ => hide = true }, "Cancel"),
          m("button.overlay-update", { onclick: update }, "Save"))
         )
    ];
  }
};

module.exports = FigureInventoryEditor;
