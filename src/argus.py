import sys
from flask import Flask, url_for

app = Flask(__name__, static_url_path="/static")


@app.route('/')
def serve_ui():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run()