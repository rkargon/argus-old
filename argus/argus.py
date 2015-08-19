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
        """
        Loads an sqlite database from db_path. If the database does not exist, it is created.
        """
        engine = create_engine('sqlite:///%s' % db_path, echo=False)
        Base.metadata.create_all(engine)
        self.Session.configure(bind=engine)

    def new_database(self, db_path, image_folder):
        """
        Loads a new database at db_path, and populates it with data from image_folder.
        image_folder is recursively searched for images,
        and sub-folder names are added as tags to their containing images.
        """
        self.load_database(db_path)
        # TODO load all images in image_folder and add them to db
        pass

    def update_database(self):
        """
        Check an image database for changes to the images (new images, images deleted, and possibly image
        modifications if we get image size / color data.
        """
        # TODO find a way of storing in the db which folder it corresponds to
        pass

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
        image_file.tags.append(tags)
        s.commit()
