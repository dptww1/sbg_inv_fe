/* global module require */

const m = require("mithril");

const Request = require("request");
const U       = require("utils");

let callbackFn;
let curPrompt;
let errors = [];
let hide = true;
let rec = {};

//========================================================================
const initDialog = (figure, prompt, callback) => {
  callbackFn = callback;
  curPrompt = prompt;
  errors = [];

  rec = {
    amount: "",
    id: figure.id,
    name: figure.name,
    plural_name: figure.plural_name,
    new_owned: figure.owned,
    new_painted: figure.painted,
    notes: "",
    op: null,
    op_date: U.currentDate()
  };
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
    errors.push("Amount must be a positive number!");
  }

  let amt = parseInt(rec.amount, 10);
  if (rec.op.match("^sell.*")) {
    amt = -amt;
  }

  if (rec.op == "paint") {
    if (amt + rec.new_painted > rec.new_owned) {
      errors.push("You can't paint more models than you have.");
    }
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
  if (rec.op === "buy_painted" || rec.op === "sell_painted") {
    rec.new_painted += amt;
    rec.new_owned += amt;

  } else if (rec.op === "paint") {
    rec.new_painted += amt;

  } else {
    rec.new_owned += amt;
  }

  Request.post("/userfigure",
               { user_figure: rec },
               resp => {
                 hide = true;
                 callbackFn();
               });
};

//========================================================================
const FigureInventoryDialog = {
  editHistory: (historyRec, callbackFn) => {
    rec = historyRec;
  },

  updatePainted: (figure, callbackFn, selling) => {
    rec.op = selling ? "sell_painted" : "buy_painted";
    const prompt = selling
          ? `Subtract how many painted ${U.pluralName(figure)}?`
          : `Add how many painted ${U.pluralName(figure)}?`;

    initDialog(figure, prompt, callbackFn);
    hide = false;
  },

  updatePainting: (figure, callbackFn) => {
    rec.op = "paint";
    initDialog(figure, `How many ${U.pluralName(figure)} did you paint?`, callbackFn);
    hide = false;
  },

  updateUnpainted: (figure, callbackFn, selling) => {
    rec.op = selling ? "sell_unpainted" : "buy_unpainted";
    const prompt = selling
          ? `Subtract how many ${U.pluralName(figure)}?`
          : `Add how many new ${U.pluralName(figure)}?`;

    initDialog(figure, prompt, callbackFn);
    hide = false;
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
            m("label", curPrompt),
            m(".errors", errors.map(msg => m("span", msg, m("br"))))),

          m(".figure-inventory-popup-row.flex-container",
            m(".stack-column.field-container-with-label",
              m("label", "Amount "),
              // 'size' needed because even with width set via CSS, following
              // inline elements are rendered as if the input was at its default size.
              m("input#popup-amt[type=number][name=amt][min=1][max=9999][step=1][pattern=\\d+][size=3]",
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

module.exports = FigureInventoryDialog;
