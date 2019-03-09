/* global module require */

const m          = require("mithril");
const prop       = require("mithril/stream");
const rome       = require("rome");

const Request    = require("request");

const amt       = prop(0);
const date      = prop((new Date()).toISOString().substring(0, 10));
const id        = prop(null);
const instrText = prop("");
const notes     = prop("");

let hist = {};
let dateVnode;
let callbackFn;

//========================================================================
const hidePopup = () => {
  // Rome seems to bypass the `onchange` handler on the date widget, though it still works if the user
  // manually enters the date.  So we have to copy the value manually when we are sure we want it.
  date(document.getElementsByName("date")[0].value);
  document.getElementsByClassName("figure-inventory-popup")[0].style.display = "none";
  document.getElementsByClassName("figure-inventory-overlay")[0].style.display = "none";
}

//========================================================================
const setUpRome = vnode => {
  rome(vnode.dom, {
    dayFormat: "D",
    initialValue: hist.op_date,
    inputFormat: "YYYY-MM-DD",
    time: false
  });
};

//========================================================================
const showPopup = _ => {
  setUpRome(dateVnode);
  document.getElementsByClassName("figure-inventory-popup-instructions")[0].textContent = instrText;
  document.getElementsByClassName("figure-inventory-popup")[0].style.display = "block";
  document.getElementsByClassName("figure-inventory-overlay")[0].style.display = "block";
  document.getElementsByClassName("errors")[0].textContent = "";
  document.getElementsByClassName("figure-inventory-popup-notes")[0].value = "";
};

//========================================================================
const swallowEvents = ev => {
  ev.stopPropagation();
  return false;
};

//========================================================================
const updateFigureInventory = _ => {
  if (hist.amount <= 0) {
    document.getElementsByClassName("errors")[0].textContent = "Amount is required";
    return;
  }

  // Rome seems to bypass the `onchange` handler on the date widget, though it still works if the user
  // manually enters the date.  So we have to copy the value manually when we are sure we want it.
  hist.op_date = document.getElementsByName("date")[0].value;

  hidePopup();
  Request.put("/userhistory/" + hist.id,
              {
                history: hist
              },
              resp => {
                Request.messages("Record updated");
                callbackFn();
              });
};

//========================================================================
const UserFigureHistoryEditor = {
  createHistory: (type, verb) => {
    hist = {
      amount: 0,
      op_date: (new Date()).toISOString().substring(0, 10)
    };
  },

  editHistory: histRec => {
    hist = histRec;
    const type = histRec.op.indexOf("unpainted") >= 0 || histRec.op === "painted"
                   ? "unpainted"
                   : "painted";
    const verb = histRec.op.startsWith("buy")
                   ? "buy"
                   : histRec.op.startsWith("sell")
                     ? "sell"
                     : "paint";
    instrText(`How many ${type} ${histRec.plural_name || histRec.name} did you ${verb}?`);
    showPopup();
  },

  oninit: ({ attrs: { updateCallback } }) => {
    callbackFn = updateCallback;
  },

  view: vnode => {
    return [
      m(".figure-inventory-overlay", { onclick: hidePopup }),
      m(".figure-inventory-popup", { onclick: swallowEvents },
        m(".figure-inventory-popup-instructions", ""),

        m("form.figure-inventory-popup-form",

          m(".figure-inventory-popup-row",
            m("label"),
            m(".errors", "")),

          m(".figure-inventory-popup-row",
            m("label.left", "Amount "),
            m("input.left figure-inventory-popup-amount[type=number][name=amt][min=0][max=99999]",
              {
                onchange: ev => hist.amount = ev.target.value,
                value: hist.amount
              },
              hist.op_date),
            m("label.right", " When "),
            m("input.right figure-inventory-popup-date[type=date][name=date]",
              {
                oncreate: vnode => dateVnode = vnode,
                onchange: ev => hist.op_date = ev.target.value,
                value: hist.op_date
              })),

          m(".figure-inventory-popup-row",
            m("label.left", "Notes")),

          m(".figure-inventory-popup-row",
            m("textarea.figure-inventory-popup-notes[name=notes][rows=5][cols=45]",
              {
                onchange: ev => hist.notes = ev.target.value
              },
              hist.notes))
         ),

        m(".dialog-buttons",
          m("button.overlay-cancel", { onclick: hidePopup }, "Cancel"),
          m("button.overlay-update", { onclick: updateFigureInventory }, "Update"))
       )
    ];
  }
};

module.exports = UserFigureHistoryEditor;
