import m from "mithril";

import { EditDialog } from "./edit-dialog.js";
import { Request } from "../request.js";
import * as U from "../utils.js";

let callbackFn;

//========================================================================
const update = rec => {
  let errors = [];

  // At this point, rec.new_owned and rec.new_painted still
  // have the values set when the dialog was initialized.

  let amt = parseInt(rec.amount, 10);
  if (rec.op === "sell_unpainted") {
    if (rec.new_owned < rec.new_painted + amt) {
      errors.push("You can't sell more unpainted models than you own.");
    } else {
      amt = -amt;
    }

  } else if (rec.op === "sell_painted") {
    if (rec.new_painted < amt) {
      errors.push("You can't sell more painted models than you own.");
    } else {
      amt = -amt;
    }

  } else if (rec.op === "paint") {
    if (amt + rec.new_painted > rec.new_owned) {
      errors.push("You can't paint more models than you have unpainted models.");
    }
  }

  if (errors.length > 0) {
    errors.forEach(EditDialog.addError(errors));
    return false;
  }

  // No errors. Now safe to patch up rec.new_owned and new_painted

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
                 callbackFn();
               });

  return true;
};

//========================================================================
// Wrapper around EditDialog, providing extra validation logic appropriate
// to inventory editing but not history record editing.
//
// API:
// - EditInventoryDialog.show(figure, op, callback)
//   Entry point to show the editing dialog to adjust the user's inventory
//   for a specific figure. Unlike EditDialog, when the user clicks [Save]
//   their inventory is actually updated.
//     figure: the figure being inventoried
//     op: inventory options, per EditDialog#editInventory
//     callback: no-parameter function called after the database update
//       completes
//
// Client code must add the EditDialog markup to their page using
// `m(EditDialog)`.
//------------------------------------------------------------------------
export const EditInventoryDialog = {
  show: (figure, op, callback) => {
    callbackFn = callback;
    EditDialog.editInventory(figure, op, update);
  }
};
