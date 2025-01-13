import m from "mithril";
import prop from "mithril/stream";

import * as K          from "./constants.js";
import { Credentials } from "./credentials.js";
import { Header      } from "./header.js";
import { Nav         } from "./nav.js";
import { Request     } from "./request.js";
import { TextArea    } from "./components/text-area.js";
import * as U          from "./utils.js";

let news = [];
let numNewsItems = 5;
let showMore = true;

let resources = [];
let numResources = 5;
let showMoreResources = true;

const newNewsItem = {
  id: null,
  item_date: "",
  item_text: ""
};

//========================================================================
const deleteItem = item => {
  if (confirm(`Are you sure you want to delete the ${item.item_date} item?`)) {
    Request.delete("/newsitem/" + item.id,
                   () => {
                     updateNews();
                   });
  }
};

//========================================================================
const domNews = () => {
  return m("table.news",
           news.map(item =>
             m("tr",
               Credentials.isAdmin()
                 ? m("td",
                     m("span.action",
                       {
                         onclick: () => stageItemForEditing(item)
                       },
                       K.ICON_STRINGS.edit),
                     m("span.action",
                       {
                         onclick: () => deleteItem(item)
                       },
                       K.ICON_STRINGS.remove))
                 : null,
               m("td.nobr", item.item_date),
               m("td", item.item_text))),

           showMore
             ? m("tr",
                 m("td[colspan=4]",
                   m("button",
                     {
                       onclick: () => {
                         numNewsItems += 5;
                         updateNews();
                       }
                     },
                     "Older News")))
             : null,

           Credentials.isAdmin()
             ? m("tr",
                 m("td"),
                 m("td",
                   m("input[type=date][name=item_date]",
                     {
                       onchange: ev => newNewsItem.item_date = ev.target.value,
                       value: newNewsItem.item_date
                     })),
                 m("td",
                   m("input[type=text][name=item_text][size=80]",
                     {
                       onchange: ev => newNewsItem.item_text = ev.target.value,
                       value: newNewsItem.item_text
                     }),
                   " ",
                   m("button", { onclick: addNewsItem }, "Save")))
             : null
          );
};

//========================================================================
const domResources = () => {
  return m("table.resources",
           resources.map(resource =>
                         m("tr",
                           m("td.nobr", resource.date),
                           m("td", m(m.route.Link, { href: "/scenarios/" + resource.scenario_id }, resource.scenario_name)),
                           m("td", m("span.icon", U.resourceIcon(resource))),
                           m("td", m("a", { href: resource.url }, resource.title)))),
           showMoreResources
             ? m("tr", m("td[colspan=2]", m("button", { onclick: updateResources }, "Older Reports")))
             : null);
};

//========================================================================
const addNewsItem = () => {
  Request.putOrPost("/newsitem",
                    newNewsItem.id,
                    { news_item: newNewsItem },
                    () => {
                      const verb = newNewsItem.id ? "Saved" : "Added";
                      newNewsItem.id = null;
                      newNewsItem.item_date = "";
                      newNewsItem.item_text = "";
                      updateNews();
                      Request.messages(`${verb} news item`);
                    });
}

//========================================================================
const stageItemForEditing = item => {
  newNewsItem.id = item.id;
  newNewsItem.item_date = item.item_date;
  newNewsItem.item_text = item.item_text;
};

//========================================================================
const updateNews = () => {
  Request.get("/newsitem?n=" + numNewsItems,
              resp => {
                const oldNumItems = news.length;
                news = resp.data;
                showMore = news.length > oldNumItems;
              });
};

//========================================================================
const updateResources = () => {
  numResources += 5;
  Request.get("/scenarios/-1/resource?n=" + numResources,
              resp => {
                const oldNumResources = resources.length;
                resources = resp.data;
                showMoreResources = resources.length > oldNumResources;
              });
};

//========================================================================
export const About = () => {
  let aboutTextProp = prop();
  let editModeProp = prop(false);

  numNewsItems = 5;
  news = [];
  updateNews();

  numResources = 0;
  resources = [];

  const saveAbout = () => {
    Request.put("/about/-1",
                { about: { body_text: aboutTextProp() } },
                () => Request.message("About text saved"));
  };

  updateResources();

  Request.get("/about", resp => aboutTextProp(resp.data.about));

  return {
    view() {
      return [
        m(Header),
        m(Nav, { selected: "About" }),
        m(".main-content",
          m("div.section-header", "News"),
          domNews(),

          m("div.section-header", "Recent Battle Reports"),
          domResources(),

          m("div.section-header",
            "Welcome! ",
            Credentials.isAdmin() && !editModeProp()
              ? m("span.action",
                  {
                    onclick: () => editModeProp(true)
                  },
                  K.ICON_STRINGS.edit)
              : null),
          m(TextArea,
            {
              prop: aboutTextProp,
              editMode: editModeProp,
              onSave: saveAbout
            }))
    ];
  }
  };
};
