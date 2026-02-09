import m from "mithril";

import * as K          from "./constants.js";
import { Credentials  } from "./credentials.js";
import { EditableText } from "./admin-components/editable-text.js";
import { Header       } from "./header.js";
import { Nav          } from "./nav.js";
import { Request      } from "./request.js";
import { ShowMoreList } from "./components/show-more.js";
import * as U          from "./utils.js";

const newsItemEditBuffer = {
  id: null,
  item_date: "",
  item_text: ""
};

//========================================================================
const domResourceItem = item => [
  m(".resources-date", item.date),
  m(".resources-text",
    m(m.route.Link, { href: "/scenarios/" + item.scenario_id }, item.scenario_name)),
  m("", m("span.icon", U.resourceIcon(item))),
  m("", m("a", { href: item.url }, item.title))
];

//========================================================================
const resetNewsItemEditBuffer = () => {
  newsItemEditBuffer.id = null;
  newsItemEditBuffer.item_date = "";
  newsItemEditBuffer.item_text = "";
};

//=======================================================================
const stageNewsItemForEditing = item => {
  newsItemEditBuffer.id = item.id;
  newsItemEditBuffer.item_date = item.item_date;
  newsItemEditBuffer.item_text = item.item_text;
};

//========================================================================
export const About = () => {
  let aboutModel = {};
  let news = [];
  let resources = [];
  let dirty = false;

  //========================================================================
  const addNewsItem = () => {
    Request.putOrPost("/newsitem",
                      newsItemEditBuffer.id,
                      { news_item: newsItemEditBuffer },
                      () => {
                        const verb = newsItemEditBuffer.id ? "Saved" : "Added";
                        resetNewsItemEditBuffer();
                        updateNews(news.length);
                        Request.messages(`${verb} news item`);
                      });
  };

  //========================================================================
  const deleteItem = item => {
    if (confirm(`Are you sure you want to delete the ${item.item_date} item?`)) {
      Request.delete("/newsitem/" + item.id, () => updateNews(news.length));
    }
  };

  //========================================================================
  const domFaqs = () => {
    if (!aboutModel.faqs) {
      return null;
    }

    return [
      m("div.section-header", "Frequently Asked Questions"),
      aboutModel.faqs.map(f =>
        m("div.faq",
          m("div.faq-question",
            m(EditableText,
              {
                text: f.question,
                commit: newText => {
                  dirty = true;
                  f.question = newText;
                }
              },
              m.trust(f.question))),
          m("div.faq-answer",
            m(EditableText,
              {
                text: f.answer,
                commit: newText => {
                  dirty = true;
                  f.answer = newText;
                }
              },
              m.trust(f.answer)))))
    ];
  };

  //========================================================================
  const domNewsItem = item => [
    m("div.news-date",
      Credentials.isAdmin()
        ? [
            m("span.action",
              {
                onclick: () => stageNewsItemForEditing(item)
              },
              K.ICON_STRINGS.edit),
            m("span.action",
              {
                onclick: () => deleteItem(item)
              },
              K.ICON_STRINGS.remove)
          ]
        : null,
      item.item_date),
    m("div.news-text", m.trust(item.item_text))
  ];

  //========================================================================
  const domNews = () => [
    m("div.section-header", "News"),
    m(ShowMoreList,
      {
        wrapperClasses: "news.news-grid-wrapper",
        items: news,
        buttonText: "Older News",
        renderer: domNewsItem,
        refresher: updateNews
      }),
    Credentials.isAdmin()
      ? m("tr",
          m("td",
            m("input[type=date][name=item_date]",
              {
                onchange: ev => newsItemEditBuffer.item_date = ev.target.value,
                value: newsItemEditBuffer.item_date
              })),
          m("td",
            m("input[type=text][name=item_text][size=80]",
              {
                onchange: ev => newsItemEditBuffer.item_text = ev.target.value,
                value: newsItemEditBuffer.item_text
              }),
            " ",
            m("button", { onclick: addNewsItem }, "Save")))
      : null
    ];

  //========================================================================
  const domResources = () => [
    m("div.section-header", "Recent Battle Reports"),
    m(ShowMoreList,
      {
        wrapperClasses: "resources.resources-grid-wrapper",
        items: resources,
        buttonText: "Older Reports",
        renderer: domResourceItem,
        refresher: updateResources
      })
  ];

  //========================================================================
  const saveAboutAndFAQs = () => {
    Request.put("/about/-1",
                { "about": aboutModel },
                () => {
                  Request.messages("About + FAQs text saved");
                  dirty = false;
                });
  };

  //========================================================================
  const updateNews = numItems => Request.get("/newsitem?n=" + numItems, resp => news = resp.data);

  //========================================================================
  const updateResources = numResources => Request.get("/scenarios/-1/resource?n=" + numResources, resp => resources = resp.data);

  //========================================================================
  // Populate initial data
  updateNews(5);
  updateResources(5);
  Request.get("/about", resp => aboutModel = resp.data);

  //========================================================================
  return {
    view() {
      return [
        m(Header),
        m(Nav, { selected: "About" }),
        m(".main-content",

          domNews(),

          domResources(),

          m("div.section-header", "Welcome! "),
          aboutModel.body_text
            ? m(EditableText,
                {
                  text: aboutModel.body_text,
                  commit: newText => {
                    dirty = true;
                    aboutModel.body_text = newText;
                  }
                })
            : null,

          domFaqs(),

          dirty
            ? m("button", { onclick: saveAboutAndFAQs }, "Save About + FAQs")
            : null )
      ];
    }
  };
};
