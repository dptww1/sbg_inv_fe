/* global module require */

/**
 * FigureInventoryEditor2
 *
 * Component for editing user inventory of a particular figure.
 *
 * Alternative to FigureInventoryEditor which doesn't handle all operations
 * allowed by the /userfigure API call.  Implementing just the most common ops
 * seems a good compromise allowing inventory editing on the figure-list.js screen
 * without muddying the UI there with additional widgets which would be needed to
 * handle the full range of operations (which the other FigureInventoryEditor does).
 *
 *   .createPaintedHistory(figure, callback)
 *       For user to paint unpainted models (but not buying/selling of painted figures)
 *
 *   .createUnpaintedHistory(figure, callback)
 *       For user to buy or sell unpainted (only) models
 *
 * `figure`: a figure record with user information as returned from the backend API.
 * `callback`: method to call after inventory is updated.
 */

const m    = require("mithril");
const prop = require("mithril/stream");

const Request = require("request.js");
const U       = require("utils.js");

let hide = true;
let rec = {};
let errors = [];
let callbackFn;
let instrText;

//========================================================================
const initDialog = (rec, callback) => {
  callbackFn = callback;
  hide = false;
  errors = [];
  instrText = rec.op === "paint"
    ? `How many ${rec.plural_name || rec.name} did you paint?`
    : `Enter the amount to change your unpainted ${rec.plural_name || rec.name}?`
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

  if (!("" + rec.amount).match("^-?[1-9]\\d*$")) {
    errors.push("Amount must be a non-zero number");
  }

  let amt = parseInt(rec.amount, 10);

  if (rec.op == "paint") {
    if (amt < 0) {
      errors.push("You can't unpaint models. Click the figure name and update your inventory there.");
    }
    if (amt + rec.new_painted > rec.new_owned) {
      errors.push("You can't paint more models than you have.");
    }
  }

  // Negative buying is the same as selling
  if (amt < 0 && rec.op == "buy_unpainted" && -amt > rec.new_owned) {
      errors.push("You can't have less than 0 figures");
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

  // No errors. Now safe to patch up rec.
  if (rec.op == "paint") {
    rec.new_painted += amt;
  } else {
    rec.new_owned += amt;
  }

  if (amt < 0 && rec.op == "buy_unpainted") {
    rec.amount = -amt;
    rec.op = "sell_unpainted";
  }

  hide = true;

  Request.post("/userfigure",
               { user_figure: rec },
               resp => callbackFn()
              );
};

//========================================================================
const FigureInventoryEditor2 = {
  createPaintedHistory: (figure, updateCallback) => {
    rec = {
      amount: "",
      id: figure.id,
      name: figure.name,
      plural_name: figure.plural_name,
      new_owned: figure.owned,
      new_painted: figure.painted,
      notes: "",
      op: "paint",
      op_date: U.currentDate()
    };

    initDialog(rec, updateCallback);
  },

  createUnpaintedHistory: (figure, updateCallback) => {
    rec = {
      amount: "",
      id: figure.id,
      name: figure.name,
      plural_name: figure.plural_name,
      new_owned: figure.owned,
      new_painted: figure.painted,
      notes: "",
      op: "buy_unpainted",
      op_date: U.currentDate()
    };

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

          m(".figure-inventory-popup-row",
            m("label.left", "Amount "),
            m("input.left figure-inventory-popup-amount[type=number][name=amt][min=-9999][max=9999][step=1][pattern=\\d+]",
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
            m("textarea.figure-inventory-popup-notes[name=notes][rows=5][cols=29]",
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

module.exports = FigureInventoryEditor2;
