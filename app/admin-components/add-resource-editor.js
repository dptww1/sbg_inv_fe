import m from "mithril";
import prop from "mithril/stream";

import { BookFormatResourceEditor } from "./book-format-resource-editor.js";
import { FormField                } from "../components/form-field.js";
import * as K                       from "../constants.js";
import { UrlFormatResourceEditor  } from "./url-format-resource-editor.js";
import * as U                       from "../utils.js";

const FORMAT_OPTIONS = [
  "-- Choose --=",
  "Book=book",
  "URL=url"
];

//========================================================================
export const AddResourceEditor = () => {
  let expanded = false;

  let prevFormatEditor = null;

  // This is a union of the `character_resources` and `scenario_resources`
  // database types, with the fields needed by URL and Book formats.
  // It's unfortunate that the type field is named differently in
  // the two tables, hence the duplication of `type` and `resource_type`.
  const resource = {
    type: prop(),
    resource_type: prop(),
    book: prop(),
    issue: prop(),
    page: prop(),
    title: prop(),
    url: prop()
  };

  // Tracks whether we're editing a book reference or a URL reference
  const resourceFormat = prop();

  //========================================================================
  const domExpanded = vnode => {

    const formatEditor = resourceFormat() === "book"
      ? BookFormatResourceEditor
      : resourceFormat() === "url"
        ? UrlFormatResourceEditor
        : null;

    // Clear out dangling fields when the resource format changes.
    if (formatEditor !== prevFormatEditor && prevFormatEditor !== null) {
      U.emptyOutObject(resource);
    }
    prevFormatEditor = formatEditor;

    return m(".add-resource-editor-content.add-resource-editor-expanded",

      m(".add-resource-editor-expanded-title", "Add New Resource"),

      FormField.select(resource.type, "Resource Type", { options: vnode.attrs.options }),

      FormField.select(resourceFormat, "Format", { options: FORMAT_OPTIONS }),

      formatEditor !== null ? m(formatEditor, { initialData: resource, embedded: true, fieldsOnly: true }) : null,

      m(".button-bar",
        m("button",
          {
            disabled: !isValid(formatEditor),
            onclick: () => {
              // Synchronize the type fields
              resource.resource_type(resource.type());
              vnode.attrs.commitFn(U.unpropertize(resource));
              initializeResource();
            }
          },
          "Save"),

        m("button",
          {
            onclick: () => {
              initializeResource();
              expanded = false;
            }
          },
          "Cancel")));
  };

  //========================================================================
  const domMinimized = () =>
    m(".add-resource-editor-content.add-resource-editor-minimized",
      m("span.action",
        {
          onclick: () => expanded = true
        },
        K.ICON_STRINGS.plus),
      m("a",
        {
          onclick: () => expanded = true
        },
        "Add New Resource"));

  //========================================================================
  const initializeResource = () => {
    U.emptyOutObject(resource);
    resourceFormat("");
  };

  //========================================================================
  const isValid = formatEditor =>
    U.isNoneBlank(
      resource.type(),
      resourceFormat())
      && formatEditor.isValid(resource);

  //========================================================================
  return {
    oninit: () => initializeResource(),

    view: vnode => expanded ? domExpanded(vnode) : domMinimized(vnode)
    }
};
