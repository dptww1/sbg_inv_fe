import m          from "mithril";

import { Header  } from "./header.js";
import { Nav     } from "./nav.js";

/**
 * Mithril component for the Email Sent page.
 *
 * Shown after a user submits the {@link ForgotPassword} form.
 *
 * @component
 */
export const EmailSent = {
  view: () => [
    m(Header),
    m(Nav),
    m(".main-content",
      m(".messages.text", "You should receive an email shortly with a link to reset your password."))
  ]
};
