/*global BOOK_INFO */

import m from "mithril";

import { FigureListEditor } from "../admin-components/figure-list-editor.js";
import { FormField        } from "../components/form-field.js";
import { Header           } from "../header.js";
import * as K               from "../constants.js";
import { Nav              } from "../nav.js";
import { Request          } from "../request.js";
import { SortableList     } from "../admin-components/sortable-list.js";
import * as U               from "../utils.js";

const character = U.propertize({
  id: null,
  name: null,
  figure_ids: [],
  resources: [],
  rules: []
});

// Array of {id: x, name: "abc"}
const figures = [];

// The profile currently being edited
const stagingProfile = {
  name_override: "",
  book: null,
  issue: null,
  page: null,
  url: "",
  obsolete: null,
  sort_order: null
};

// The resource currently being edited
const stagingResource = {
  title: "",
  book: null,
  issue: "",
  page: null,
  type: "",
  url: ""
};

//========================================================================
const addResource = () => {
  character.resources.push(Object.assign({}, stagingResource)); // shallow copy
  resetStagingResource();
};

//========================================================================
const addProfile = () => {
  stagingProfile.sort_order = character.rules.length;
  character.rules.push(Object.assign({}, stagingProfile));
  resetStagingProfile();
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
      }))
  /*  m("b", "Add New Profile"),
  m("br"),

  m("table",
    m("tr",
      m("td", "Name Override"),
      m("td",
        m("input[type=text][name=name_override][size=40]",
          {
            value: stagingProfile.name_override,
            onchange: ev => stagingProfile.name_override = ev.target.value
          }))),

    m("tr",
      m("td", "Book"),
      m("td", m(SelectBook,
        {
          value: stagingProfile.book,
          callback: value => stagingProfile.book = value
        }))),
    m("tr",
      m("td", "Issue"),
      m("td",
        m("input[type=text][name=profile_issue][size=15]",
          {
            value: stagingProfile.issue,
            onchange: ev => stagingProfile.issue = ev.target.value
          }))),

    m("tr",
      m("td", "Page"),
      m("td",
        m("input[type=number][name=profile_page][size=5]",
          {
            value: stagingProfile.page,
            onchange: ev => stagingProfile.page = ev.target.value
          }))),

    m("tr",
      m("td", "URL"),
      m("td",
        m("input[type=text][name=profile_url][size=80]",
          {
            value: stagingProfile.url,
            onchange: ev => stagingProfile.url = ev.target.value
          }))),

    m("tr",
      m("td", "Obsolete?"),
      m("td",
        m("input[type=checkbox][value=true]",
          {
            checked: stagingProfile.obsolete,
            onchange: ev => stagingProfile.obsolete = ev.target.checked
          }))),

    m("tr",
      m("td"),
      m("td",
        m("button",
          {
            disabled: !isProfileValid(),
            onclick: () => addProfile()
          },
          "Add Profile"))))*/
];

//========================================================================
const domResource = r => {
  const fields = [ m("span.icon", m.trust(K.IMAGE_STRINGS[r.type])) ];

  if (r.url) {
    fields.push([ " ", m("a", { href: r.url }, r.title) ]);
  }

  if (r.book) {
    fields.push(" " + BOOK_INFO.byKey(r.book).name);
  }

  if (r.issue) {
    fields.push(" #" + r.issue);
  }

  if (r.page) {
    fields.push(" p." + r.page);
  }

  return fields;
};

//========================================================================
const domResources = () => [
  m("label", "Resources"),
  m(".character-resources-container",
    character.resources().map((rsrc, idx) => [
      m(".resource", domResource(rsrc)),
      m("div.action",
         {
           onclick: () => character.resources().splice(idx, 1)
         },
        K.ICON_STRINGS.remove)
    ]),
  )
];

  /* m("b", "Add New Resource"),
    m("br"),

    m("table",
      m("tr",
        m("td", "Type "),
        m("td",
          m("select[name=type]",
            {
              value: stagingResource.type,
              onchange: ev => stagingResource.type = ev.target.value
            },
            m("option", { value: "painting_guide", selected: stagingResource.type == "painting_guide" }, "Painting Guide"),
            m("option", { value: "analysis", selected: stagingResource.type == "analysis" }, "Analysis")))),

      m("tr",
        m("td", "Title"),
        m("td",
          m("input[type=text][name=title][size=40]",
            {
              value: stagingResource.title,
              onchange: ev => stagingResource.title = ev.target.value
            }))),

      m("tr",
        m("td", "Book"),
        m("td", m(SelectBook,
                  {
                    value: stagingResource.book,
                    callback: value => stagingResource.book = value
                  }))),

      m("tr",
        m("td", "Issue"),
        m("td",
          m("input[type=text][name=issue][size=15]",
            {
              value: stagingResource.issue,
              onchange: ev => stagingResource.issue = ev.target.value
            }))),

      m("tr",
        m("td", "Page"),
        m("td",
          m("input[type=number][name=page][size=5]",
            {
              value: stagingResource.page,
              onchange: ev => stagingResource.page = ev.target.value
            }))),

      m("tr",
        m("td", "URL"),
        m("td",
          m("input[type=text][name=url][size=80]",
            {
              value: stagingResource.url,
              onchange: ev => stagingResource.url = ev.target.value
            }))),

      m("tr",
        m("td"),
        m("td",
          m("button",
            {
              onclick: () => addResource()
            },
            "Add Resource")))),

    m("br"),
    m("br"),
    ];*/

//========================================================================
const figureSelect = target => {
  if (!target) {
    return;
  }

  figures.push({ id: parseInt(target.dataset.id, 10), name: target.dataset.name });
  character.figure_ids(figures.map(f => f.id));
};

//========================================================================
const isProfileValid = () => stagingProfile.url || (stagingProfile.book && stagingProfile.page);

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
const resetStagingProfile = () => U.emptyOutObject(stagingProfile, { book: null });

//========================================================================
const resetStagingResource = () => U.emptyOutObject(stagingResource, { book: null });

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
