/* global localStorage */

import m from "mithril";

import { Request } from "./request.js";

let lastUpdateDate = null;

//======================================================================
const getLastUpdateDate = () => {
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
/**
 * Mithril component for the page header.
 *
 * @component
 */
export const Header = {
  view() {
    const updateDate = getLastUpdateDate();

    return m(".page-header",
      m(".title", "Middle Earth SBG Inventory", Request.curApi().name === "local" ? "(LOCAL)" : ""),
      m(".last-update",
        "Please support this site on ",
        m("a", { href: "https://www.patreon.com/SBGInventory" }, "Patreon"),
        " | ",
        updateDate
          ? m(m.route.Link, { href: "/about" }, "Last Update: " + updateDate)
        : "...Checking News..."));
  }
};
