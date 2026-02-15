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
3. **Browser based development:** I don't want to spend a lot of time on build tools, transpilers,
   and similar things. All code has to be able to run in the browser in the form it is written. All
   dev tools (like the testing framework) have to be able to run in the browser.
4. **Targetting Baseline:** The limited time for maintenance means I won't be able to do testing
   for all browser/version/os tripples. Instead, I'll target "baseline widely available" and rely
   on it's correctness for portability. I'll also use features that are "baseline newly available",
   but only with feature checking, which I'll only do for them.
5. **Extensive tests:** I don't want to spend a lot of time on bug hunting, therefore everything
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
