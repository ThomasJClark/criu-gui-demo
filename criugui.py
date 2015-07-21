#!/usr/bin/env python2

import web
import procs

urls = (
    "/", "index",
    "/procs", "procs.Procs"
)


class index:
    def GET(self):
        return open("index.html").read()

if __name__ == "__main__":
    app = web.application(urls, globals())
    app.internalerror = web.debugerror
    app.run()
