/* global module require */

var m = require("mithril");

var Request = require("request");

var lastUpdateDate = null;
var nextUpdateDate = null;

//======================================================================
const getLastUpdateDate = _ => {
  const now = new Date().getTime();
  const nextCheckDate = new Date(parseInt(localStorage.getItem("header--lastUpdateCheck"), 10));
  nextCheckDate.setDate(nextCheckDate.getDate() + 1);

  if (lastUpdateDate === null || now > nextCheckDate) {
    // Don't keep queueing up requests
    lastUpdateDate = 0;

    Request.get("/newsitem?n=1",
                resp => {
                  lastUpdateDate = resp.data[0].item_date;
                  localStorage.setItem("header--lastUpdateCheck", now);
                });
  }

  return lastUpdateDate;
};

//======================================================================
var Header = {
  view: function() {
    const updateDate = getLastUpdateDate();

    return m(".page-header", [
      m(".title", "Middle Earth SBG Inventory"),
      updateDate
        ? m(".last-update", m(m.route.Link, { href: "/about" }, "Last Update: " + updateDate))
        : null
    ]);
  }
};

module.exports = Header;
