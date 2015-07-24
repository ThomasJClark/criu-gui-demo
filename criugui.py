#!/usr/bin/env python2

import web
import procs
import dump

urls = (
    "/", "index",
    "/procs", "procs.Procs",
    "/dump", "dump.Dump",
)


class index:
    def GET(self):
        raise web.seeother("/static/index.html")

if __name__ == "__main__":
    app = web.application(urls, globals())
    app.internalerror = web.debugerror
    app.run()
