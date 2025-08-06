import m from "mithril";
import prop from "mithril/stream";

import { FormField  } from "../components/form-field.js";
import * as U         from "../utils.js";

/**
 * Mithril component for creating and editing URL-format resources.
 */
export const UrlFormatResourceEditor = () => {
  const PARAMS = [ "title", "url" ];

  let resource = {
    title: prop(),
    url: prop()
  }

  //========================================================================
  return {
    oninit: vnode => {
      if (vnode.attrs.embedded) {
        // If resource is embedded, we assume the client code is
        // already using prop() for the attributes
        resource = vnode.attrs.initialData;
      } else {

        const initData = vnode.attrs.initialData;
        if (initData) {
          // If not embedded and initial data is provided, assume
          // that data is *not* props, and slurp it into our local
          // shadow buffer for editing.
          PARAMS.forEach(p => resource[p] = prop(initData[p]));

        } else {
          // Not embedded and no initial data provided; set up resource
          PARAMS.forEach(p => resource[p] = prop());
        }
      }
    },

    view: vnode => {
      const formFields = [
        FormField.text(resource.title, "Title"),

        FormField.text(resource.url, "URL"),

        vnode.attrs.embedded || vnode.attrs.fieldsOnly
          ? null
          : m("button",
            {
              disabled: UrlFormatResourceEditor.isValid(resource),
              onclick: () => vnode.attrs.commitFn(resource)
            },
            "Add")
      ];

      return vnode.attrs.fieldsOnly
        ? formFields
        :  m("url-resource-editor-form", formFields);
    }
  }
};

//========================================================================
UrlFormatResourceEditor.isValid = resource =>
  U.isNotBlank(U.getByPath(resource, "title"))
    && U.isNotBlank(U.getByPath(resource, "url"));
