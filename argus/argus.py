"""
Argus application code.
"""

import mimetypes
import os

from sqlalchemy import create_engine, and_
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.exc import NoResultFound
from exc import ImageLoadException, InvalidQueryException

from model import Base, ImageFile, Tag


class Argus:
    """
    Represents an instance of the Argus application.
    The instance contains a connection to a database, and an interface for manipulating data in the database.
    """

    def __init__(self, image_stats=True):
        """
        This is a factory that returns DB sessions.
        Thus, when connecting to a different db, we can simply modify self.Session
        and other functions that call self.Session() will get a connection to the proper db.
        """
        self.Session = sessionmaker()
        self._db_name = None
        self._image_folder = None

        # parameters
        self.image_stats = image_stats

    def load_database(self, db_path):
        """
        Loads an sqlite database from db_path. If the database does not exist, it is created.
        """
        self._db_name = os.path.basename(db_path)
        self._image_folder = os.path.dirname(os.path.abspath(db_path))
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

        # remove images that no longer exist
        for img in s.query(ImageFile).all():
            if not os.path.isfile(img.path):
                s.delete(img)

        # keep track of images already in the database
        current_images = s.query(ImageFile).all()
        current_image_paths = set([img.path for img in current_images])

        images = []
        for current_dir, _, files in os.walk(directory):
            rel_path = os.path.relpath(current_dir, directory)
            if rel_path == '.':
                tags = []
            else:
                # use subdirectory names as tags
                tag_names = rel_path.split('/')
                tag_names = map(Tag.sanitize_tag_name, tag_names)
                tags = [self.get_tag(s, tn) for tn in tag_names]
            for f in files:
                if len(images) % 500 == 0:
                    print len(images)
                image_path = os.path.join(current_dir, f)
                img_local_path = os.path.relpath(image_path, directory)
                if img_local_path in current_image_paths:
                    continue
                mime_type = mimetypes.guess_type(f)
                if mime_type[0] is None:
                    continue
                if mime_type[0].startswith('image'):
                    try:
                        image_file = ImageFile(path=unicode(img_local_path, encoding='utf-8'))
                        if self.image_stats:
                            image_file.get_image_stats(directory)
                        image_file.tags = tags
                    except ImageLoadException:
                        continue
                    else:
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
        if not db_exists:
            self.populate_db()

    def update_database(self):
        """
        Check an image database for changes to the images (new images, images deleted, and possibly image
        modifications if we get image size / color data.
        """
        self.populate_db()
        return

    def get_db_info(self):
        """
        Gets some general info about the database.
        :return: The image folder, the database name, and the number of images in the db.
        """
        info = {
            'image_folder': self._image_folder,
            'db_name': self._db_name,
        }
        if self._db_name is not None:
            s = self.Session()
            info['image_count'] = s.query(ImageFile).count()
        return info

    def get_all_images(self):
        """
        Gets all images files currently in the database.
        Does not return associated tag data
        :return: A list of ImageFile objects
        """
        # TODO merge this into a generalized query function
        s = self.Session()
        return s.query(ImageFile).all()

    def get_all_tags(self):
        """
        Gets all tags currently in the database.
        :return: A list of Tag objects
        """
        # TODO merge this into a generalized query function
        s = self.Session()
        return s.query(Tag).all()

    def get_image_tags(self, image_id):
        """
        Returns the set of tags for an image, given by its imagefile_id.
        """
        s = self.Session()
        img = s.query(ImageFile).filter(ImageFile.imagefile_id == image_id).one()
        return img.tags

    def set_image_tags(self, image_id, tag_names):
        """
        Adds a set of tags to a given image.
        """
        s = self.Session()
        image_file = s.query(ImageFile).filter(ImageFile.imagefile_id == image_id).one()
        tags = [self.get_tag(s, tn) for tn in tag_names]
        image_file.tags = tags
        s.commit()

    def parse_tag_query(self, tag_query):
        if tag_query['type'] == 'db_tag':
            return ImageFile.tags.any(Tag.name == tag_query['name'])
        elif tag_query['type'] == 'size':
            return (ImageFile.width == tag_query['width']) & (ImageFile.height == tag_query['height'])
        elif tag_query['type'] == 'width':
            return ImageFile.width == tag_query['width']
        elif tag_query['type'] == 'height':
            return ImageFile.height == tag_query['height']
        else:
            raise InvalidQueryException

    def get_images_by_query(self, tag_queries):
        s = self.Session()
        query_filters = [self.parse_tag_query(tq) for tq in tag_queries]
        q = s.query(ImageFile).filter(and_(*query_filters))
        images = q.all()
        return images

    @staticmethod
    def get_tag(session, tag_name):
        """
        If a tag exists, return the tag with the name 'tag_name'
        Otherwise, create new tag.
        :return: A Tag object
        """
        try:
            return session.query(Tag).filter(Tag.name == tag_name).one()
        except NoResultFound:
            new_tag = Tag(name=tag_name)
            session.add(new_tag)
            return new_tag
