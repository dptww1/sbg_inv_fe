/* global require module */

const m           = require("mithril");
const prop        = require("mithril/stream");
const Credentials = require("credentials");

const API_URL = "http://127.0.0.1:4000/api";
//const API_URL = "http://scarce-untried-calf.gigalixirapp.com/api";

//===========================================================================
const extractFn = (xhr, xhrOptions) => {
    if (xhr.status === 401) {
        Credentials.clear();
        return Request.errors({ errors: "Authentication failed. Please log in." });

    } else {
        return JSON.parse(xhr.responseText || "{}");  // some legal responses return no data (e.g. HTTP 204)
    }
};

//===========================================================================
const failFn = (resp) => {
    if (resp === null) {
        Request.errors({ errors: "The server appears to be down. Please try again later." });
    } else {
        Request.errors({ errors: resp.errors });
    }
};

//===========================================================================
const request = (httpMethod, url, data, successFn) => {
    Request.errors(null);
    const opts = {
        method: httpMethod,
        url: API_URL + url,
        extract: extractFn,
        timeout: 5000
    };
    if (Credentials.token()) {
        opts.config = function(xhr) {
            xhr.onerror = () => failFn(null),
            xhr.setRequestHeader("authorization", "Token token=" + Credentials.token());
        };
    }
    if (data) {
        opts.data = data;
    }
    return m.request(opts).then(
        resp => successFn(resp),
        resp => failFn(resp)
    );
};

//===========================================================================
const Request = {
    errors: prop(),

    get: (url, successFn) => {
        return request("GET", url, null, successFn);
    },

    post: (url, data, successFn) => {
        return request("POST", url, data, successFn);
    },

    put: (url, data, successFn) => {
        return request("PUT", url, data, successFn);
    }
};

module.exports = Request;
