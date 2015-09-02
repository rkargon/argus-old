"""
Code for running the server.
"""
import argparse

from flask import Flask, request, jsonify, send_from_directory

from argus import Argus

app = Flask(__name__)
argus = Argus()


@app.route('/')
def serve_ui():
    """ Serve the ui's html.
    """
    return app.send_static_file('index.html')


@app.route('/load-db/', methods=['POST'])
def load_db():
    """
    Loads an existing DB into the session
    Input JSON: { db_path: <path to db file> }
    :return: database info
    """
    db_path = request.json.get('db_path')
    argus.load_database(db_path)
    return db_status()


@app.route('/new-db/', methods=['POST'])
def new_db():
    """
    Creates a new database file that corresponds to a certain folder
    Input JSON: { db_path: <path to db file>, folder_path: <path to image folder> }
    :return: database info
    """
    db_path = request.json.get('db_name')
    folder_path = request.json.get('folder_path')
    argus.new_database(db_path, folder_path)
    return db_status()


@app.route('/update-db/', methods=['POST'])
def update_db():
    """
    Updates the database, looking for added files and changes to the image files.
    Input JSON: No input required
    :return: 204
    """
    argus.update_database()
    return '', 204


@app.route('/get-all-images/', methods=['GET'])
def get_all_images():
    """
    Returns all images in the database. (But not associated tag data)
    :return: A JSON string {images: [ <images...> ] }
    """
    image_files = argus.get_all_images()
    serialized_image_files = [img.as_dict() for img in image_files]
    return jsonify({'images': serialized_image_files}), 202


@app.route('/get-all-tags/', methods=['GET'])
def get_all_tags():
    """
    Returns a list of all tags in the database.
    :return: A JSON string {tags: [ <tags...> ] }
    """
    tags = argus.get_all_tags()
    serialized_tags = [t.as_dict() for t in tags]
    return jsonify({'tags': serialized_tags}), 202


@app.route('/get-image-tags/<int:img_id>', methods=['GET'])
def get_image_tags(img_id):
    """
    Returns the set of tags for a given image.
    :param img_id: The image file's id.
    :return: A JSON string {tags: [ <tags...> ]}
    """
    tags = argus.get_image_tags(img_id)
    serialized_tags = [t.as_dict() for t in tags]
    return jsonify({'tags': serialized_tags}), 202


@app.route('/set-image-tags/<int:img_id>', methods=['POST'])
def set_image_tags(img_id):
    """
    Adds a set of given tags to the database
    Input JSON: { tag_names: [<tag names...>] }
    :param img_id: The image file's id.
    :return: 202 status
    """
    tag_names = request.json.get('tag_names')
    argus.set_image_tags(img_id, tag_names)
    return '', 202


@app.route('/get-images-by-tags/', methods=['POST'])
def get_images_by_tags():
    """
    Returns all images that contain at least one of the tags in the given tag names
    :return: A JSON string {images: [<images...> ]}
    """
    tag_names = request.json.get('tag_names')
    images = argus.get_images_by_tags(tag_names)
    serialized_images = [img.as_dict() for img in images]
    return jsonify({'images': serialized_images}), 202


@app.route('/db-image/<path:path>')
def db_image(path):
    """
    Serves an image from the image folder.
    :param path: The local path to the image (relative to the image folder)
    :return: An image file.
    """
    return send_from_directory(argus._image_folder, path)


@app.route('/get-db-info/', methods=['GET'])
def db_status():
    """
    Gets info on the database, including the image folder path, the database name, and the number of images in the db.
    :return: Output from Argus.get_db_info()
    """
    return jsonify({'info': argus.get_db_info()}), 202


def main():
    """
    Parse arguments, and run the server.
    """
    parser = argparse.ArgumentParser(description='Run the Argus server')
    parser.add_argument('-p', '--port', type=int, default=5000,
                        help='Specify which port the Argus server should run on.')
    args = parser.parse_args()
    app.run(port=args.port, debug=True)

if __name__ == '__main__':
    main()
