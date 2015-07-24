import web
import tempfile
import socket
import os
import json
from pycriu import rpc as criu


class _DRBase:
    CRIU_ADDR = "/var/run/criu-service.socket"

    def connect(self):
        try:
            self.sock = socket.socket(socket.AF_UNIX, socket.SOCK_SEQPACKET)
            self.sock.connect(self.CRIU_ADDR)
        except socket.error as e:
            result = {"succeeded": False, "why": e.strerror}
            raise web.internalerror(json.dumps(result, separators=",:"))

    def transaction(self, req):
        self.sock.send(req.SerializeToString())

        resp = criu.criu_resp()
        resp.ParseFromString(self.sock.recv(1024))

        if not resp.success:
            result = {"succeeded": False, "why": os.strerror(resp.cr_errno)}
            raise web.internalerror(json.dumps(result, separators=",:"))

        return resp


class Dump(_DRBase):
    """
        This class dumps a process using CRIU when it receives an HTTP POST.
    """

    def POST(self):
        """
            Attempt to dump a process, where the PID is given in the URL
            parameter "pid".
        """

        web.header("Content-Type", "application/json")
        pid = web.input().get("pid")

        if not pid or not pid.isnumeric():
            result = {"succeeded": False, "why": "No PID specified"}
            raise web.badrequest(json.dumps(result, separators=",:"))

        self.connect()

        tempdir = tempfile.mkdtemp()

        # Send a request to dump the specified process
        req = criu.criu_req()
        req.type = criu.DUMP
        req.opts.pid = int(pid)
        req.opts.shell_job = False
        req.opts.images_dir_fd = os.open(tempdir, os.O_DIRECTORY)

        resp = self.transaction(req)
        return json.dumps({"succeeded": True, "dir": tempdir}, separators=",:")


class Restore(_DRBase):
    """
        This class restores a process using CRIU when it receives an HTTP POST.
    """

    def POST(self):
        """
            Attempt to restore a process, where the directory where the
            proccess images are is given in the URL parameter "dir".
        """

        web.header("Content-Type", "application/json")

        if "dir" not in web.input():
            result = {"succeeded": False, "why": "No directory specified"}
            raise web.badrequest(json.dumps(result, separators=",:"))

        try:
            dir_fd = os.open(web.input()["dir"], os.O_DIRECTORY)
        except OSError as e:
            result = {"succeeded": False, "why": e.strerror}
            raise web.badrequest(json.dumps(result, separators=",:"))

        self.connect()

        # Send a request to restore the specified process
        req = criu.criu_req()
        req.type = criu.RESTORE
        req.opts.shell_job = False
        req.opts.images_dir_fd = dir_fd

        resp = self.transaction(req)
        return json.dumps({"succeeded": True}, separators=",:")
