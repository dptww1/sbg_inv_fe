/* global module require */

const m    = require("mithril");
const prop = require("mithril/stream");

let hide = true;
let rec = {};
let errors = [];
let callbackFn;
let instrText;

//========================================================================
const createPrompt = rec => {
  const type = rec.op.indexOf("unpainted") >= 0 || rec.op === "painted"
                 ? "unpainted"
                 : "painted";
  const verb = rec.op.startsWith("buy")
                 ? "buy"
                 : rec.op.startsWith("sell")
                   ? "sell"
                   : "paint";
  return `How many ${type} ${rec.plural_name || rec.name} did you ${verb}?`;
};

//========================================================================
const initDialog = rec => {
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

  if (!rec.amount || rec.amount == 0) {
    errors.push("Amount is required");
  }

  if (!rec.amount.match("^[1-9]\\d*$")) {
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

  createHistory: (figure, op) => {
    rec = {
      amount: "",
      id: figure.id,
      name: figure.name,
      plural_name: figure.plural_name,
      new_owned: figure.owned,
      new_painted: figure.painted,
      notes: "",
      op: op,
      op_date: (new Date()).toISOString().substring(0, 10)
    };

    initDialog(rec);
  },

  editHistory: histRec => {
    rec = histRec;
    initDialog(rec);
  },

  oninit: ({ attrs: { updateCallback } }) => {
    callbackFn = updateCallback;
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
            m(".errors", errors.map(msg => m("span", msg, m("br")))),

          m(".figure-inventory-popup-row",
            m("label.left", "Amount "),
            m("input.left figure-inventory-popup-amount[type=number][name=amt][min=0][max=99999][step=1][pattern=\\d+]",
              {
                onchange: ev => rec.amount = ev.target.value,
                value: rec.amount
              },
              rec.op_date),
            m("label.right", " When "),
            m("input.right figure-inventory-popup-date[type=date][name=date]",
              {
                onchange: ev => rec.op_date = ev.target.value,
                value: rec.op_date
              })),

          m(".figure-inventory-popup-row",
            m("label.left", "Notes")),

          m(".figure-inventory-popup-row",
            m("textarea.figure-inventory-popup-notes[name=notes][rows=5][cols=45]",
              {
                onchange: ev => rec.notes = ev.target.value
              },
              rec.notes))
         ),

        m(".dialog-buttons",
          m("button.overlay-cancel", { onclick: _ => hide = true }, "Cancel"),
          m("button.overlay-update", { onclick: update }, "Save"))
         ))
    ];
  }
};

module.exports = FigureInventoryEditor;
