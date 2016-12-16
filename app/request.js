/* global require module */

var m           = require("mithril");
var Credentials = require("credentials");

const API_URL = "http://127.0.0.1:4000/api";

var Request = (function() {
    var extractFn = (xhr, xhrOptions) => {
        if (xhr.status === 401) {
            Credentials.clear();
            return failFn({ errors: "Authentication failed. Please log in."});

        } else {
            return xhr.responseText;
        }
    };

    var failFn = (resp, errorComponent) => {
        var resolvedComponent = errorComponent || require("login");
        if (resp === null) {
            resolvedComponent.setError("The server appears to be down. Please try again later.");
        } else {
            resolvedComponent.setError(resp.errors);
        }
        if (errorComponent) {
            m.route();
        } else {
            m.route("/login");
        }
    };

    return {
        get: function(url, successFn, errorComponent) {
            var opts = { method: "GET", url: API_URL + url, extract: extractFn };
            if (Credentials.token()) {
                opts.config = function(xhr) { xhr.setRequestHeader("authorization", "Token token=" + Credentials.token()); };
            }
            return m.request(opts).then(
                resp => successFn(resp),
                resp => failFn(resp, errorComponent)
            );
        },

        post: function(url, data, successFn, errorComponent) {
            var opts = { method: "POST", url: API_URL + url, data: data, extract: extractFn };
            if (Credentials.token()) {
                opts.config = function(xhr) { xhr.setRequestHeader("authorization", "Token token=" + Credentials.token()); };
            }
            return m.request(opts).then(
                resp => successFn(resp),
                resp => failFn(resp, errorComponent)
            );
        },

        put: function(url, data, successFn, errorComponent) {
            var opts = { method: "PUT", url: API_URL + url, data: data, extract: extractFn };
            if (Credentials.token()) {
                opts.config = function(xhr) { xhr.setRequestHeader("authorization", "Token token=" + Credentials.token()); };
            }
            return m.request(opts).then(
                resp => successFn(resp),
                resp => failFn(resp, errorComponent)
            );
        }
    };
}());

module.exports = Request;

/*******
// courtesy http://ratfactor.com/daves-guide-to-mithril-js
var requestWrapper = function(opts) {
    return new function() {
        var me = this;
        me.opts = opts;
        me.success = me.loading = me.failed = false;
        me.errorStatus = me.errorBody = "";
        me.data = null;
        me.opts.background = true;
        me.opts.extract = function(xhr) {
            if (xhr.status >= 300) {
                me.failed = true;
                me.success = me.loading = false;
                me.errorStatus = xhr.status;
                me.errorBody = xhr.responseText;
                m.redraw();
            }
            return xhr.responseText;
        };
        me.go = function() {
            me = me;
            me.loading = true;
            me.success = me.failed = false;
            m.request(me.opts).then(function(mydata) {
                me.success = true;
                me.failed = me.loading = false;
                me.data = mydata;
                m.redraw();
            });
        };
    };
};
********/
