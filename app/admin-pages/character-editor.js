import m from "mithril";

import { FigureListEditor  } from "../admin-components/figure-list-editor.js";
import { FormField         } from "../components/form-field.js";
import { Header            } from "../header.js";
import * as K                from "../constants.js";
import { Nav               } from "../nav.js";
import { ProfileEditor     } from "../admin-components/profile-editor.js";
import { Request           } from "../request.js";
import { ResourceEditor    } from "../admin-components/resource-editor.js";
import { SortableList      } from "../admin-components/sortable-list.js";
import * as U                from "../utils.js";

const character = U.propertize({
  id: null,
  name: null,
  figure_ids: [],
  resources: [],
  rules: []
});

// Array of {id: x, name: "abc"}
const figures = [];

const RESOURCE_EDITOR_OPTIONS = [
  "-- Choose --=",
  "Painting Guide=painting_guide",
  "Analysis=analysis"
];

let editProfileIdx = null;
let editResourceIdx = null;

//========================================================================
const commitProfile = profile => {
  if (profile !== null) {
    const insertIdx = editProfileIdx || character.rules().length;
    const numReplacements = editProfileIdx ? 1 : 0;
    character.rules().splice(insertIdx, numReplacements, profile);
  }
  editProfileIdx = null;
};

//========================================================================
const commitResource = resource => {
  if (resource !== null) {
    const insertIdx = editResourceIdx || character.resources().length;
    const numReplacements = editResourceIdx ? 1 : 0;
    character.resources().splice(insertIdx, numReplacements, resource);
  }
  editResourceIdx = null;
};

//========================================================================
const domFigures = () => [
  m("label", "Figures"),
  m(".figure-list-container",
    m(FigureListEditor,
      {
        onItemSelect: figureSelect,
        exclusions: character.figure_ids()
      }),

    figures.length !== 0
      ? figures.map((f, idx)  =>
        m(".figure-list-figure",
          {
            id: "fig" + f.id
          },
          m(m.route.Link, { href: "/figures/" + f.id }, f.name),
          m("span.action",
            {
              onclick: () => removeFigure(idx)
            },
            K.ICON_STRINGS.remove)
        ))
      : null)
];

//========================================================================
const domProfile = (rsrc, idx) => {
  if (idx === editProfileIdx) {
    return m(ProfileEditor,
             {
               commitFn: commitProfile,
               initialData: rsrc
             });
  }

  const fields = [];

  const baseStr = U.resourceReference(rsrc);

  if (U.isNotBlank(baseStr)) {
    fields.push(baseStr);

    if (rsrc.name_override) {
      fields.push(" (" + rsrc.name_override + ")");
    }

    if (rsrc.obsolete) {
      fields.push(" (obsolete)");
    }
  }

  return m(".sortable-list-content", fields);
};

//========================================================================
const domProfiles = () => [
  m("label", "Profiles"),
  m(".character-profiles-container",
    m(SortableList,
      {
        editFn: idx => editProfileIdx = idx,
        itemsProp: character.rules,
        renderFn: domProfile,
        suppressControls: editProfileIdx !== null
      })),

  editProfileIdx === null
    ? m(ProfileEditor, { commitFn: commitProfile })
    : null
];

//========================================================================
const domResources = () => [
  m("label", "Resources"),
  m(".character-resources-container",
    character.resources().map((rsrc, idx) =>
      editResourceIdx === idx
        ? m(ResourceEditor,
            {
              commitFn: commitResource,
              initialData: rsrc,
              options: RESOURCE_EDITOR_OPTIONS
            })
        : [
            m(".resource",
              m("span.icon", m.trust(K.IMAGE_STRINGS[rsrc.type])),
              U.resourceReference(rsrc)),
            m(".button-bar",
              m("span.action",
                {
                  onclick: () => editResourceIdx = idx
                },
                K.ICON_STRINGS.edit),
              m("span.action",
                {
                  onclick: () => character.resources().splice(idx, 1)
                },
                K.ICON_STRINGS.remove))
        ])),

    editResourceIdx === null
      ? m(ResourceEditor,
          {
            commitFn: commitResource,
            options: RESOURCE_EDITOR_OPTIONS
          })
      : null
];

//========================================================================
const figureSelect = target => {
  if (!target) {
    return;
  }

  figures.push({ id: parseInt(target.dataset.id, 10), name: target.dataset.name });
  character.figure_ids(figures.map(f => f.id));
};

//========================================================================
const loadCharacter = () => {
  U.emptyOutObject(character, { id: null, name: null });
  figures.length = 0;

  const id = m.route.param("id");
  if (U.isBlank(id)) {
    return;
  }

  Request.get("/character/" + id,
    resp => {
      if (U.isNotBlank(resp.data.id)) {
        character.id(resp.data.id);
        character.name(resp.data.name);
        character.figure_ids(resp.data.figures.map(f => f.id));
        character.resources(resp.data.resources);
        character.rules(resp.data.rules);

        resp.data.figures.forEach(f => figures.push({id: f.id, name: f.name }));
      }
    });
};

//========================================================================
const removeFigure = idx => {
  figures.splice(idx, 1);
  character.figure_ids(figures.map(f => f.id));
};

//========================================================================
const saveCharacter = () => {
  if (U.isBlank(character.name())) {
    Request.errors("Name is required");
    return;
  }

  character.rules().forEach((elt, idx) => elt.sort_order = idx + 1);

  Request.putOrPost("/character", character.id(),
    {
      character: U.unpropertize(character)
    },
    () => {
      Request.messages("Saved " + character.name());
    });
};

//========================================================================
export const CharacterEditor = () => {
  let lastId = null;

  return {
    oninit: (/*vnode*/) => {
      loadCharacter();
      lastId = m.route.param("id");
      editProfileIdx = null;
    },

    onupdate: (/*vnode*/) => {
      const newId = m.route.param("id");
      if (newId != lastId) {
        loadCharacter();
        lastId = newId;
        editProfileIdx = null;
      }
    },

    view: () => [
      m(Header),
      m(Nav),
      m(".page-title", (U.isBlank(m.route.param("id")) ? "Add" : "Edit"), " Character"),
      m(".main-content.character-details",

        FormField.text(character.name, "Name"),
        domFigures(),
        domResources(),
        domProfiles(),

        m("button", { onclick: () => saveCharacter() }, "Save"))
    ]
  };
};
