"""
Code for running the server.
"""

from flask import Flask, request, jsonify
import sys
from argus import Argus

app = Flask(__name__, static_url_path="/static")
argus = Argus()


@app.route('/')
def serve_ui():
    """ Serve the ui's html.
    """
    return app.send_static_file('index.html')


@app.route('/load-db', methods=['POST'])
def load_db():
    """
    Loads an existing DB into the session
    Input JSON: { db_path: <path to db file> }
    :return: 202 status
    """
    db_path = request.json.get('db_path')
    argus.load_database(db_path)
    return 202


@app.route('/new-db', methods=['POST'])
def new_db():
    """
    Creates a new database file that corresponds to a certain folder
    Input JSON: { db_path: <path to db file>, folder_path: <path to image folder> }
    :return: 202 status
    """
    db_path = request.json.get('db_name')
    folder_path = request.json.get('folder_path')
    argus.new_database(db_path, folder_path)
    return 202


@app.route('/update-db', methods=['POST'])
def update_db():
    """
    Updates the database, looking for added files and changes to the image files.
    Input JSON: No input required
    :return: 202
    """
    argus.update_database()
    return 202


@app.route('/get-all-images', methods=['GET'])
def get_all_images():
    """
    Returns all images in the database. (But not associated tag data)
    :return: A JSON string {images: [ <images...> ] }
    """
    image_files = argus.get_all_images()
    serialized_image_files = [img.as_dict() for img in image_files]
    return jsonify({'images': serialized_image_files}), 202


@app.route('/get-image-tags/<int:id>', methods=['GET'])
def get_image_tags(id):
    """
    Returns the set of tags for a given image.
    :param id: The image file's id.
    :return: A JSON string {tags: [ <tags...> ]}
    """
    tags = argus.get_image_tags(id)
    serialized_tags = [t.as_dict for t in tags]
    return jsonify({'tags': serialized_tags}), 202


@app.route('/add-image-tags/<int:id>', methods=['POST'])
def add_image_tags(id):
    """
    Adds a set of given tags to the database
    Input JSON: { tag_names: [<tag names...>] }
    :param id: The image file's id.
    :return: 202 status
    """
    tag_names = request.json.get('tag_names')
    argus.add_image_tags(id, tag_names)
    return 202


def main(argv):
    """
    Parse arguments, and run the server.
    """
    app.run()

if __name__ == '__main__':
    main(sys.argv)
