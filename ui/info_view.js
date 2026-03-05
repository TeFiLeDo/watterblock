const GH_PRIV_URL =
  "https://docs.github.com/de/site-policy/privacy-policies" +
  "/github-general-privacy-statement";
const REPO_GITEA = "https://git.tfld.dev/tfld/watterblock";
const REPO_GH = "https://github.com/TeFiLeDo/watterblock";

export default class InfoView {
  view() {
    return m(".wb-box.-no-width", [
      m("h2._positioned-top", "Infos"),
      m("p",
        "Des is a Webseitn, auf dea du ganz oanfach deine Watta-Spiele ",
        "mitschreim kannst. Und hier kannst a paar Infos dazu nachlesn."
      ),
      m("p",
        "Zerst'amal isses so, dass de Datn was du eingibsch nur direkt in ",
        "deim Browser gspeichert wern. Beim Aufmachn von da Seitn muas se ",
        "aba east vom Serva gladn werdn. Dea is von GitHub, und da findest ",
        "eanare ", m("a", { href: GH_PRIV_URL}, "Datnschut-Erklärung"), "."
      ),
      m("p",
        "Den Kod fia de Seitn findest ",
        m("a", { href: REPO_GITEA }, "oamal da"), " und weils so schean war a ",
        m("a", { href: REPO_GH }, "noamal da"), ". Dea ganze Spaß steht unta",
        "da MIT-Lizenz, daher kannst damit sogar fast alles machn was ",
        "willst, unta a boa minimale Bedingungen."
      ),
      m("h3", "Fragn"),
      m("ol._unpadded", [
        m("li", { lang: "de-AT" }, [
          m("strong",
            "Warum ist diese Webseite in solch seltsamer Schrift verfasst?"),
          m("br"),
          "Das ist ganz einfach eine schriftliche Annäherung an den ",
          m("em", "Tiroler Dialekt"), ", den ich spreche",
        ]),
        m("li", [
          m("strong", "Wo find i denn die Lizenzn von die verwendetn Sachn?"),
          m("br"),
          "In da ", m("a", { href: "/README.md" }, "README-Datei"), ", de du ",
          "a in scheanara Variante ", m("a", { href: REPO_GITEA }, "da"), " ",
          "oda ", m("a", { href: REPO_GH }, "da"), " anschaugn kannst.",
        ]),
        m("li", [
          m("strong", "Fridattn- oda Kasspressknedlsuppn?"), m("br"),
          "Kimmt drauf un. Wenn di Fridattn kloan gnuag gschnittn sen, dass ",
          "se ganz aufm Löffl platz habn, dann de. Ansonstn liaba nit.",
        ]),
      ]),
    ]);
  }
}
