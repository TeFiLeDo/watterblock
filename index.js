"use strict";

import Layout from "/ui/layout.js";
import BaseView from "/ui/base_view.js";

m.route.prefix = "";
m.route(document.body, "/", {
  "/": {
    render: function() {
      return m(Layout, m(BaseView));
    },
  },
});
