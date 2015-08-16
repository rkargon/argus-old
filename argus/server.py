"""
Code for running the server.
"""

from flask import Flask
import sys
from argus import Argus

app = Flask(__name__, static_url_path="/static")
argus = Argus()


@app.route('/')
def serve_ui():
    """ Serve the ui's html.
    """
    return app.send_static_file('index.html')


def main(argv):
    """ Parse arguments, and run the server.
    """
    app.run()

if __name__ == '__main__':
    main(sys.argv)
