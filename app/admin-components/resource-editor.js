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

let title = "Add New Resource";

/**
 * Mithril component to create or edit a resource.  Since the caller provides
 * the options, it can handle scenario & character resources.
 *
 * Required vnode attributes:
 *   - commitFn(rsrc) callback when user finishes with the resource
 *   - options array of 'option name" or "option name=value" strings
 *
 * Optional vnode attributes:
 *   - initialData raw (not stream) initial values for the fields in the editor
 */
export const ResourceEditor = () => {
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

      m(".add-resource-editor-expanded-title", title),

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
              initializeResource(vnode);
            }
          },
          "Save"),

        m("button",
          {
            onclick: () => {
              vnode.attrs.commitFn(null);
              initializeResource(vnode);
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
        title));

  //========================================================================
  const initializeResource = vnode => {
    U.emptyOutObject(resource);
    resourceFormat("");
    title = "Add New Resource";
    expanded = false;

    const initData = vnode.attrs.initialData;
    if (initData) {
      resource.type(initData.type || initData.resource_type);
      resource.resource_type(initData.type || initData.resource_type);
      resource.book(initData.book);
      resource.issue(initData.issue);
      resource.page(initData.page);
      resource.title(initData.title);
      resource.url(initData.url);

      if (U.isNotBlank(initData.url)) {
        resourceFormat("url");

      } else {
        resourceFormat("book");
      }

      title = "Edit Resource";

      expanded = true;
    }
  };

  //========================================================================
  const isValid = formatEditor =>
    U.isNoneBlank(
      resource.type(),
      resource.title(), // sorting code assumes this is not null
      resourceFormat())
      && formatEditor.isValid(resource);

  //========================================================================
  return {
    oninit: vnode => initializeResource(vnode),

    view: vnode => expanded ? domExpanded(vnode) : domMinimized(vnode)
    }
};
