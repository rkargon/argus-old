"""
Code for running the server.
"""

from flask import Flask
from argus import Argus

app = Flask(__name__, static_url_path="/static")
argus = Argus()

@app.route('/')
def serve_ui():
    """
    Serve the ui's html.
    """
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run()
