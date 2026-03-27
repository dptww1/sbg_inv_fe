import m from "mithril";

import { Header } from "./header.js";
import { Nav    } from "./nav.js";

/**
 * Mithril component for the Page404 (Not Found) page.
 *
 * @component
 */
export const Page404 = {
  view: () => {
    return [
      m(Header),
      m(Nav),
      m("div.main-content",
        m("div.text",
          "Sorry, there's no such page."))
    ];
  }
};
