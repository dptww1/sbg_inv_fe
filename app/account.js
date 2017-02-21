/* global module require */

var m           = require("mithril");
var prop        = require("mithril/stream");

var Credentials = require("credentials");
var Request     = require("request");

//========================================================================
var AccountScreen = function() {
    var errors = prop("");
    var message = prop("");

    var update = () => {
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
                        message("Account updated.");
                        m.route.set("/account");
                    },
                    AccountScreen);
    };

    var errorText = () => {
        var msgs = [];
        var errObj = errors().errors;
        for (var key in errObj) {
            msgs.push(key + ": " + errObj[key].join(", "));
        }
        return m.trust(msgs.join("<br/>"));
    };

    return {
        setError(str) {
            if (typeof(str) === "string") {
                errors({errors: {"Error": [str]}});
            } else {
                errors({errors: str});
            }
        },

        view() {
            return [
                m(require("header")),
                m(require("nav"), { selected: "Account" }),
                errors() ? m("div.errors", errorText()) : null,
                message() ? m("div.message", message()) : null,
                m("div.main-content", [
                    m("div", "Use this form to update your email address and/or password"),
                    m("table", [
                        m("tr", [
                            m("td", "Name"),
                            m("td", Credentials.name())
                        ]),
                        m("tr", [
                            m("td", "Email"),
                            m("td", [
                                m("input[type=text][name=email]", { onchange: m.withAttr("value", Credentials.email) })
                            ])
                        ]),
                        m("tr", [
                            m("td", "New Password"),
                            m("td", [
                                m("input[type=password][name=password]", { onchange: m.withAttr("value", Credentials.password) })
                            ]),
                            m("td", m("span.field-note", "(leave empty to keep the same password)"))
                        ]),
                        m("tr", [
                            m("td", ""),
                            m("button[value=Update][name=update]", { onclick: () => update() }, "Update My Account")
                        ])
                    ])
                ])
            ];
        }
    };
}();

module.exports = AccountScreen;
