watterblock
===========

This project is a web based notepad specialized for keeping score in the game of watten. It is not
an online version of the game, and it has no social features. It is only intended to replace a
piece of paper.

Principles
----------

This is a hobby project, and I don't want to spend a lot of time maintaining it. Therefore, the
following principles will guide its development.

1. **No feature creep:** For the time beeing, this project will not grow beyond being a simple
   score keeping tool. Logical expansions, like synching a session between users / devices, will
   not be implemented, because they would be too complicated for the time I intend to spend on
   maintenance.
2. **Simple and stable dependencies:** I have learned in past projects that fast moving
   environments, like many modern JS frameworks, are very tedious to keep up with. Therefore all
   libraries must be stable and consistent. Also, I don't want to spend much time wrangling npm.
   Therefore all dependencies must be vendorable as a couple of files.
3. **Baseline HTML, CSS, JS:** I don't want to spend a lot of time on build tools, transpilers,
   and similar things. Therefore all code I write has to be in one of the three fundamental web
   languages. Also, I target _baseline widely available_, nothing else. All dev tools used have to
   be able to run in the browser.
4. **Extensive tests:** I don't want to spend a lot of time on bug hunting, therefore everything
   that can be tested automatically should be.

Structure
---------

1. `index.html` is the main HTML file bootstraping everything.
2. `style.css` defines how to present the notepad.
3. `models/` contains the "business logic", i.e. classes representing the current state and its
   behaviour at runtime.
4. `data/` contains components to store that state in persistent storage for later access.
5. `ui/` contains UI components.
6. `service-worker.js` is a ServiceWorker-Script, allowing for offline usage.
7. `manifest.json` makes it possible to install the notepad as an app.
8. `test.html` is a unit test runner, that runs the tests in `test.js`. That in turn loads tests
   from various `*.test.js` files from across the project.
9. `vendored/` contains copies of external dependencies, for direct use.
