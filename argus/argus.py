from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from model import Base, image_tag_map, ImageFile, Tag


class Argus:
    """ Represents an instance of the Argus application.
    The instance contains a connection to a database, and an interface for manipulating data in the database.
    """

    def __init__(self):
        # This is a factory that returns DB sessions.
        # Thus, when connecting to a different db, we can simply modify self.Session
        # and other functions that call self.Session() will get a connection to the proper db.
        self.Session = sessionmaker()

    def load_database(self, db_path):
        """ Loads an sqlite database from db_path. If the database does not exist, it is created.
        """
        engine = create_engine('sqlite:///%s' % db_path, echo=False)
        Base.metadata.create_all(engine)
        self.Session.configure(bind=engine)

    def new_database(self, db_path, image_folder):
        """ Loads a new database at db_path, and populates it with data from image_folder.
        image_folder is recursively searched for images,
        and sub-folder names are added as tags to their containing images.
        """
        self.load_database(db_path)
        # TODO load all images in image_folder and add them to db
        pass

    def update_database(self):
        """ Check an image database for changes to the images (new images, images deleted, and possibly image
        modifications if we get image size / color data.
        """
        # TODO find a way of storing in the db which folder it corresponds to
        pass
