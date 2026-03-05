"use strict";

import BaseView from "/ui/base_view.js";
import InfoView from "/ui/info_view.js";
import Layout from "/ui/layout.js";

m.route.prefix = "";
m.route(document.body, "/", {
  "/": {
    render: function(vnode) {
      let newSession = vnode.attrs.newSession ?? false;
      let session = newSession ? null : parseInt(vnode.attrs.session);
      session = isNaN(session) ? null : session;

      return m(
        Layout,
        { backHref: session ? "/" : null },
        m(BaseView, { newSession, session })
      );
    },
  },
  "/info": {
    render: function() {
      return m(Layout, { backHref: "/" }, m(InfoView));
    }
  }
});
