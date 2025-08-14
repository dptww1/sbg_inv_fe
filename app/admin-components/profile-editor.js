import m from "mithril";
import prop from "mithril/stream";

import { BookFormatResourceEditor } from "./book-format-resource-editor.js";
import { FormField                } from "../components/form-field.js";
import * as K                       from "../constants.js";
import * as U                       from "../utils.js";

//========================================================================
export const ProfileEditor = () => {
  let expanded = false;

  const profile = {
    name_override: prop(),
    book: prop(),
    issue: prop(),
    page: prop(),
    obsolete: prop(),
    sort_order: prop()
  };

  let title = null;

  //========================================================================
  const domExpanded = vnode => {

    return m(".profile-editor-content.profile-editor-expanded",

      m(".profile-editor-expanded-title", title),

      FormField.text(profile.name_override, "Name Override"),

      m(BookFormatResourceEditor, { initialData: profile, embedded: true, fieldsOnly: true }),

      FormField.checkbox(profile.obsolete, "Obsolete?"),

      //FormField.numeric(profile.sort_order, "Sort Order"),

      m(".button-bar",
        m("button",
          {
            disabled: !isValid(),
            onclick: () => {
              vnode.attrs.commitFn(U.unpropertize(profile));
              initializeProfile(vnode);
            }
          },
          "Save"),

        m("button",
          {
            onclick: () => {
              vnode.attrs.commitFn(null);
              initializeProfile(vnode);
              expanded = false;
            }
          },
          "Cancel")));
  };

  //========================================================================
  const domMinimized = () =>
    m(".profile-editor-content.profile-editor-minimized",
      m("span.action",
        {
          onclick: () => expanded = true
        },
        K.ICON_STRINGS.plus),
      m("a",
        {
          onclick: () => expanded = true
        },
        "Add New Profile"));

  //========================================================================
  const initializeProfile = vnode => {
    U.emptyOutObject(profile);
    title = "Add New Profile";

    const initData = vnode.attrs.initialData;
    if (initData) {
      profile.name_override(initData.name_override);
      profile.book(initData.book);
      profile.issue(initData.issue);
      profile.page(initData.page);
      profile.obsolete(initData.obsolete);
      profile.sort_order(initData.sort_order);

      title = "Edit Profile";

      expanded = true;
    }
  };

  //========================================================================
  const isValid = () =>
    U.isNoneBlank(
      profile.book(),
      profile.page());

  //========================================================================
  return {
    oninit: vnode => initializeProfile(vnode),

    view: vnode => expanded ? domExpanded(vnode) : domMinimized(vnode)
    }
};
