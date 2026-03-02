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
6. **Good documentation:** I'll most certainly forget how some things work at some point. Thus it
   is paramount to keep a good documentation, so I won't have to read through everything again.

Structure
---------

1. `index.html` is the main HTML file bootstraping everything.
2. `style.css` defines how to present the notepad.
3. `index.js` is the JS file bootstraping the actual behaviour.
4. `models/` contains the "business logic", i.e. classes representing the current state and its
   behaviour at runtime.
5. `data/` contains components to store that state in persistent storage for later access.
6. `ui/` contains the user interface.
7. `service-worker.js` is a ServiceWorker-Script, allowing for offline usage.
8. `manifest.json` makes it possible to install the notepad as an app.
9. `test.html` loads and runs the unit tests from the various `*.test.js` files across the project.
   Those files are co-located with the stuff they contain tests for, to make them easier to manage.
10. `vendored/` contains copies of external dependencies, for direct use.

Dependencies
------------

### QUnit

**QUnit** is a JS unit testing framework. It was chosen because it is easy to use and can be run in
the browser. It consists of `vendored/qunit-2.25.0.js` and `vendored/qunit-2.25.0.css`. This is
it's license:

    Copyright OpenJS Foundation and other contributors, https://openjsf.org/

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

### Mithril

**Mithril** is a JS single page framework. It was chosen because it is rather simple, easy to
understand, and developed with the expectation of being used like this, not needing a build tool.
It consists of `vendored/mithril-2.3.8.js`. This is it's license:

    The MIT License (MIT)

    Copyright (c) 2017 Leo Horie

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

### normalize.css

**normalize.css** makes styles more consistent across browser, thus simplifying custom styling. It
consists of `vendored/normalize-8.0.1.css`. This is it's license:

    # The MIT License (MIT)

    Copyright © Nicolas Gallagher and Jonathan Neal

    Permission is hereby granted, free of charge, to any person obtaining a copy of
    this software and associated documentation files (the "Software"), to deal in
    the Software without restriction, including without limitation the rights to
    use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
    of the Software, and to permit persons to whom the Software is furnished to do
    so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
