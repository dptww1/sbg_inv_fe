/* global require module */

var m = require("mithril");

//==================================================================================================================================
var Cookie = {
    delete: function(name) {
        //console.log("*** DELETE COOKIE " + name);
        document.cookie = name + "=; expires=Wed, 01 Jan 1970";
    },

    read: function(name) {
        var cookies = document.cookie.split(/\s*;\s*/);
        for (var i = 0; i < cookies.length; ++i) {
            if (cookies[i].indexOf(name) == 0) {
                //console.log("*** READ COOKIE " + cookies[i].substring(name.length + 1));
                return cookies[i].substring(name.length + 1);
            }
        }
        return null;
    },

    write: function(name, value) {
        var d = new Date();
        d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
        document.cookie = name + '=' + value + "; expires = " + d.toUTCString();
        //console.log("*** WRITE COOKIE " + document.cookie);
    }
};

//==================================================================================================================================
var Credentials = function() {
    var propCookie = function(cookieName) {
        return function() {
            if (arguments.length > 0) {
                if (arguments[0] === undefined) {
                    Cookie.delete(cookieName);
                } else {
                    Cookie.write(cookieName, arguments[0]);
                }
                return arguments[0];
            } else {
                return Cookie.read(cookieName);
            }
        };
    };

    return {
        name: propCookie("name"),
        email: m.prop(),
        password: m.prop(),
        token: propCookie("token"),
        userId: m.prop(),

        clear: function() {
            Credentials.name(undefined);
            Credentials.token(undefined);
            Credentials.userId(undefined);
        },

        isLoggedIn() {
            return Credentials.token();
        }
    };
}();

module.exports = Credentials;
