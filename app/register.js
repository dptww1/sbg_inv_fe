/* global module require */

const m           = require("mithril");
const prop        = require("mithril/stream");

const Credentials = require("credentials");
const Header      = require("header");
const Nav         = require("nav");
const Request     = require("request");

//========================================================================
const errorText = () => {
    var msgs = [];
    var errObj = Request.errors().errors;
    for (var key in errObj) {
        msgs.push(key + ": " + errObj[key].join(", "));
    }
    return m.trust(msgs.join("<br/>"));
};

//========================================================================
const login = () => {
    Request.post("/sessions",
                 { user: { email: Credentials.email(), password: Credentials.password() } },
                 resp => {
                     Credentials.token(resp.data.token);
                     console.log(resp.data.token);
                     m.route.set("/scenarios");
                 });
};

//========================================================================
const register = () => {
    Request.post("/users",
                 { user: { name: Credentials.name(), email: Credentials.email(), password: Credentials.password() } },
                 login);
};

//========================================================================
const RegisterScreen = {
    view: (/*vnode*/) => {
        return [
            m(Header),
            m(Nav, { selected: "Login" }),
            m("p.text",
              "Please fill in all fields completely. I encourage your to use your real name here so that I know ",
              "who is using the service.  Your name and/or email will not be displayed anywhere on the site, nor be ",
              "sold, traded, or otherwise used and anything other than a way to provide login credentials."),

            m("div.main-content register text",
                m("table",
                    Request.errors() ? m("tr", m("td"), m("td.errors", errorText())) : null,

                    m("tr",
                      m("td", "Name"),
                      m("td", m("input[type=text][name=name][size=40]", { onchange: m.withAttr("value", Credentials.name) }))),

                    m("tr",
                      m("td", "Email"),
                      m("td", m("input[type=text][name=email][size=40]", { onchange: m.withAttr("value", Credentials.email) }))),

                    m("tr",
                      m("td", "Password"),
                      m("td",
                        m("input[type=password][name=password][size=40]", { onchange: m.withAttr("value", Credentials.password) }))),

                    m("tr",
                      m("td", ""),
                      m("button[value=Sign In][name=signin]", { onclick: () => register() }, "Sign Up!"))))
        ];
    }
};

module.exports = RegisterScreen;
