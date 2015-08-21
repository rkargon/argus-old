"""
Argus application code.
"""

import mimetypes
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from model import Base, ImageFile, Tag


class Argus:
    """
    Represents an instance of the Argus application.
    The instance contains a connection to a database, and an interface for manipulating data in the database.
    """

    def __init__(self):
        """
        This is a factory that returns DB sessions.
        Thus, when connecting to a different db, we can simply modify self.Session
        and other functions that call self.Session() will get a connection to the proper db.
        """
        self.Session = sessionmaker()
        self._db_path = None
        self._image_folder = None

    def load_database(self, db_path):
        """
        Loads an sqlite database from db_path. If the database does not exist, it is created.
        """
        self._db_path = db_path
        self._image_folder = os.path.dirname(os.path.realpath(db_path))
        engine = create_engine('sqlite:///%s' % db_path, echo=False)
        Base.metadata.create_all(engine)
        self.Session.configure(bind=engine)

    def populate_db(self):
        """
        Recursively searches image directory for new images to add to the db.
        Subdirectory names are added as tags to their containing images.
        """
        directory = self._image_folder

        s = self.Session()
        # keep track of images already in the database
        current_images = s.query(ImageFile).all()
        current_image_paths = set([img.path for img in current_images])

        for current_dir, _, files in os.walk(directory):
            rel_path = os.path.relpath(current_dir, directory)
            if rel_path == '.':
                tags = []
            else:
                # use subdirectory names as tags
                tag_names = rel_path.split('/')
                tags = [Tag(name=tn) for tn in tag_names]
            images = []
            for f in files:
                image_path = os.path.join(current_dir, f)
                if image_path in current_image_paths:
                    continue
                mime_type = mimetypes.guess_type(f)
                if mime_type[0].startswith('image'):
                    image_file = ImageFile(path=image_path)
                    image_file.tags = tags
                    images.append(image_file)
            s.add_all(images)
        s.commit()

    def new_database(self, db_name, image_folder):
        """
        Loads a new database at db_path, and populates it with data from image_folder.
        image_folder is recursively searched for images,
        and sub-folder names are added as tags to their containing images.

        If the db exists already, it is simply loaded and not modified.
        """
        db_path = os.path.join(image_folder, db_name)
        db_exists = os.path.isfile(db_path)
        self.load_database(db_path)
        if db_exists:
            self.populate_db(image_folder)

    def update_database(self):
        """
        Check an image database for changes to the images (new images, images deleted, and possibly image
        modifications if we get image size / color data.
        """
        self.populate_db()
        return

    def get_all_images(self):
        """
        Gets all images files currently in the database.
        Does not return assosciated tag data
        :return: A list of ImageFile objects
        """
        # TODO merge this into a generalized query function
        s = self.Session()
        return s.query(ImageFile).all()

    def get_image_tags(self, image_id):
        """
        Returns the set of tags for an image, given by its imagefile_id.
        """
        s = self.Session()
        img = s.query(ImageFile).filter(ImageFile.imagefile_id == image_id).one()
        return img.tags

    def add_image_tags(self, image_id, tag_names):
        """
        Adds a set of tags to a given image.
        """
        s = self.Session()
        image_file = s.query(ImageFile).filter(ImageFile.imagefile_id == image_id).one()
        tags = [Tag(name=tn) for tn in tag_names]
        image_file.tags.extend(tags)
        s.commit()
