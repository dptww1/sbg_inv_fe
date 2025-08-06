import m from "mithril";

import { AddResourceEditor } from "../admin-components/add-resource-editor.js";
import { FigureListEditor  } from "../admin-components/figure-list-editor.js";
import { FormField         } from "../components/form-field.js";
import { Header            } from "../header.js";
import * as K                from "../constants.js";
import { Nav               } from "../nav.js";
import { ProfileEditor     } from "../admin-components/profile-editor.js";
import { Request           } from "../request.js";
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
const domProfile = r => {
  const fields = [];

  const baseStr = U.resourceReference(r);

  if (U.isNotBlank(baseStr)) {
    fields.push(U.resourceReference(r));

    if (r.name_override) {
      fields.push(" (" + r.name_override + ")");
    }

    if (r.obsolete) {
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
        itemsProp: character.rules,
        renderFn: domProfile
      })),
  m(ProfileEditor, {
    commitFn: profile => character.rules().push(profile)
  })
];

//========================================================================
const domResources = () => [
  m("label", "Resources"),
  m(".character-resources-container",
    character.resources().map((rsrc, idx) => [
      m(".resource",
        m("span.icon", m.trust(K.IMAGE_STRINGS[rsrc.type])),
        U.resourceReference(rsrc)),
      m("div.action",
         {
           onclick: () => character.resources().splice(idx, 1)
         },
        K.ICON_STRINGS.remove)
    ])),
  m(AddResourceEditor, {
    commitFn: resource => character.resources().push(resource),
    options: [
      "-- Choose --=",
      "Painting Guide=painting_guide",
      "Analysis=analysis"
    ]})
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
    },

    onupdate: (/*vnode*/) => {
      const newId = m.route.param("id");
      if (newId != lastId) {
        loadCharacter();
        lastId = newId;
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
