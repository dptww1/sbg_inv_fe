import { EditDialog } from "./edit-dialog.js";
import { Request } from "../request.js";

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
               () => {
                 callbackFn();
               });

  return true;
};

//========================================================================
/**
 * Static instance for managing the dialog allowing the user to
 * change the amounts of owned/painted figures.  Reuses much logic
 * in {@link EditDialog} but has extra validation logic to ensure
 * a user doesn't e.g. paint more figures than they own.
 *
 * Pages using this must include the {@link EditDialog} Mithril
 * component to incorporate the dialog markup.
 *
 * Usage:
 *
 *     EditInventoryDialog.show(figure:Object, op:string, callback:function)
 * - `figure` - a figure structure from the back end services
 * - `op` - one of the strings from {@link USER_FIGURE_OPS}
 * - `callback` - function with no parameters called after the
 *     inventory operation is submitted
 */
export const EditInventoryDialog = {
  show: (figure, op, callback) => {
    callbackFn = callback;
    EditDialog.editInventory(figure, op, update);
  }
};
