/* global module require */

const m           = require("mithril");
const prop        = require("mithril/stream");

const Credentials = require("credentials");
const Editor      = require("components/user-figure-history-editor");
const Header      = require("header");
const K           = require("constants");
const Nav         = require("nav");
const Request     = require("request");

let userHistory = [];

//========================================================================
const domBackEndAdmin = () => {
  return [
    m(".section-header back-end-admin", "Back End Admin"),
    m("select.back-end",
      {
        onchange: ev => Request.setApi(ev.target.value)
      },
      Request.apis.map(api => m("option",
                                {
                                  selected: api.name === Request.curApi().name,
                                  value: api.name
                                },
                                api.name))),
    m("span.back-end-url", Request.curApi().url)
  ];
};

//========================================================================
const removeHistory = id => {
  if (confirm("Are you sure you want to delete this item?")) {
    Request.delete("/userhistory/" + id,
                   resp => {
                     Request.messages("Activity record deleted.");
                   });
  }
};

//========================================================================
const updateAccount = () => {
  var paramMap = {};

  if (Credentials.email()) {
    paramMap["email"] = Credentials.email();
  }

  if (Credentials.password()) {
    paramMap["password"] = Credentials.password();
  }

  Request.put("/users/" + Credentials.userId(),
              { user: paramMap },
              resp => {
                Request.messages("Account updated.");
              });
};

//========================================================================
const refreshHistory = _vnode => {
  if (Credentials.isLoggedIn()) {
    Request.get("/userhistory",
                resp => {
                  userHistory = resp.data;
                  m.redraw();
                });
  }
};

//========================================================================
var AccountScreen = {
  oninit: refreshHistory,

  view: (_vnode) => {
    return [
      m(Header),
      m(Nav, { selected: "Account" }),
      m("div.main-content",

        Credentials.isAdmin() ? domBackEndAdmin() : null,

        m(".section-header", "Activity"),

        m("p.text",
          m("table.user-activity",
            userHistory.map(hist =>
                            m("tr",
                              m("td", hist.op_date),
                              m("td", hist.amount > 1 ? hist.plural_name : hist.name),
                              m("td", K.USER_FIGURE_OPS[hist.op]),
                              m("td", hist.amount),
                              m("td",
                                m("span.icon",
                                  { onclick: _ => Editor.editHistory(hist) },
                                  K.ICON_STRINGS.edit),
                                m("span.icon",
                                  { onclick: _ => removeHistory(hist.id) },
                                  K.ICON_STRINGS.remove)),
                              m("td", hist.notes)))
           )),

        m(Editor, { updateCallback: refreshHistory }),

        m(".section-header", "Account Admin"),

        m("div.text", "Use this form to update your email address and/or password"),

        m("p.text",
          m("table",

            m("tr",
              m("td", "Name"),
              m("td", Credentials.name())),

            m("tr",
              m("td", "Email"),
              m("td", m("input[type=text][name=email][size=40]",
                        { onchange: m.withAttr("value", Credentials.email), value: Credentials.email() }))),

            m("tr",
              m("td", "New Password"),
              m("td", m("input[type=password][name=password][size=40]",
                        { onchange: m.withAttr("value", Credentials.password), value: Credentials.password() })),
              m("td", m("span.field-note", "(leave empty to keep the same password)"))),

            m("tr",
              m("td", ""),
              m("button[value=Update][name=update]", { onclick: updateAccount }, "Update My Account")))))
    ];
  }
};

module.exports = AccountScreen;
