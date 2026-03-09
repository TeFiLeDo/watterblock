"use strict";

import BaseView from "/ui/base_view.js";
import InfoView from "/ui/info_view.js";
import Layout from "/ui/layout.js";


try {
  navigator.storage.persisted().then((persistent) => {
    if (!persistent && navigator.vendor === "Apple Computer, Inc.") {
      const question =
        "S'schaut so aus als würdest du an Safari-Browser benutzn. S'isch " +
        "leida aba so, dass dea manchmoi selbstständig oanfach Datn löscht, " +
        "wenn ma a Seitn z'lang nit heanimmt. Des is füa an Watterblock " +
        "natürlich eha schlecht.\n" +
        "\n" +
        "Wennst magst kannt ma aba probian ob ma des Löschn fian Block " +
        "ausschaltn kenna. Wennst magst klick oanfach auf \"Ok\"!\n" +
        "\n" +
        "Wenns gangen is kimsch danach glei zum Block, und falls nit " +
        "bekommst dazu no a extra Nachricht.";

      const failure =
        "S'isch leida nit gangen, Safari hat na gsagt. Du kansch entweda an " +
        "andern Browser heanemmen, oder halt damit Leben wenn Safari deine " +
        "Datn löscht.\n" +
        "\n" +
        "#JustSafariThings";

      if (window.confirm(question)) {
        navigator.storage.persist().then((persistent) => {
          if (!persistent)
            window.alert(failure);
        });
      }
    }
  });
} catch (error) {
  console.error("failed to try to persist in safary: ", error);
}

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
