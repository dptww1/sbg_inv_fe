import m from "mithril";

import * as U      from "../utils.js";

let callbackFn;
let curPrompt;
let errors = [];
let hide = true;
let initialRec = {}; // saves initial amount/op_date/notes values
let rec; // reference to caller's history/inventory record

//========================================================================
const cancel = () => {
  rec.amount = initialRec.amount;
  rec.op_date = initialRec.op_date;
  rec.notes = initialRec.notes;
  hide = true;
};

//========================================================================
// Assumes `rec` has been filled out with at least these fields
// - rec.op
// - rec.name
// - rec.plural_name
// - rec.op_date
// - rec.notes
//------------------------------------------------------------------------
const initDialog = callback => {
  initialRec.amount = rec.amount;
  initialRec.op_date = rec.op_date;
  initialRec.notes = rec.notes;

  callbackFn = callback;
  errors = [];

  hide = false;
};

//========================================================================
const initPromptHistory = () => {
  curPrompt = `Edit activity on ${U.pluralName(rec)}`;
};

//========================================================================
const initPromptInventory = op => {
  switch (op) {
  case "buy_unpainted":
    curPrompt = `Add how many new ${U.pluralName(rec)}?`;
    break;

  case "sell_unpainted":
    curPrompt = `Subtract how many ${U.pluralName(rec)}?`;
    break;

  case "buy_painted":
    curPrompt = `Add how many painted ${U.pluralName(rec)}?`;
    break;

  case "sell_painted":
    curPrompt = `Subtract how many painted ${U.pluralName(rec)}?`;
    break;

  case "paint":
    curPrompt = `Paint how many ${U.pluralName(rec)}?`;
    break;

  default:
    throw `Unsupported edit operation [${rec.op}]`;
  }
};

//========================================================================
const swallowEvents = ev => {
  ev.stopPropagation();
  return false;
};

//========================================================================
const validate = () => {
  errors = [];

  if (!rec.amount) {
    errors.push("Amount is required");
  }

  if (!(String(rec.amount).match("^[1-9]\\d*$"))) {
    errors.push("Amount must be a positive number!");
  }

  if (!rec.op_date) {
    errors.push("Date is required");
  }

  if (!rec.op_date.match("^\\d{4}-\\d{2}-\\d{2}$")) {
    errors.push("Bad date format (expected YYYY-MM-DD, got " + rec.op_date + ")");
  }

  if (errors.length == 0) {
    if (callbackFn(rec)) {
      hide = true;
    }
  }
};

//========================================================================
// Markup and basic validation logic needed to edit inventory records
// and history records.
//
// The callback parameter (function(rec) => boolean) in the methods below
// receives the edited .amount, .date, and .notes values in the `rec`
// parameter when the dialog's [Save] button is clicked.  It can then do
// additional validation if desired, and should return `true` if processing
// should continue normally, or `false` if invalid data is detected.
//
// No methods here actually store any data. That's what the callback
// methods are for.
//
// To use the API methods, clients must add this module's markup to their
// page code using `m(EditDialog)`.
//
// API:
//
// - EditDialog.addError(msg)
//   Utility method for callback functions to add an error message
//
// - EditDialog.editHistory(historyRec, callback)
//   Shows the editing dialog for a history record.
//     historyRec: history record as returned from the history APIs; passed
//         on to the callback method.  Will not be modified if the dialog is
//         cancelled.
//     callback: function per above
//
// - EditDialog.editInventory(figure, op, callback)
//   Shows the editing dialog for a specific figure/op combination.
//     figure: figure record, having .id, .name, and .plural_name
//     op: inventory operation as returned from the services
//         . "buy_unpainted"
//         . "sell_unpainted"
//         . "buy_painted"
//         . "sell_painted"
//         . "paint"
//     callback: function per above
//------------------------------------------------------------------------
export const EditDialog = {
  addError: msg => errors.push(msg),

  editHistory: (historyRec, callback) => {
    rec = historyRec;
    initPromptHistory();
    initDialog(callback);
  },

  editInventory: (figure, op, callback) => {
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

    initPromptInventory(op);
    initDialog(callback);
  },

  view: () => {
    if (hide) {
      return null;
    }

    return [
      m(".figure-inventory-overlay", { onclick: cancel }),
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
          m("button.overlay-cancel", { onclick: cancel }, "Cancel"),
          m("button.overlay-update", { onclick: validate }, "Save"))
         )
    ];
  }
};
