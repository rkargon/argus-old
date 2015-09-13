"""
Classes representing database objects.
"""
from datetime import datetime
import os
import re
import warnings
from PIL import Image

from sqlalchemy import Column, Integer, String, ForeignKey, Table, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from exc import ImageLoadException

Base = declarative_base()

# mapping from images to tags
image_tag_map = Table('image_tag_map', Base.metadata,
                      Column('image_id', Integer, ForeignKey('imagefile.imagefile_id'), primary_key=True),
                      Column('tag_id', Integer, ForeignKey('tag.tag_id'), primary_key=True)
                      )


class Config(Base):
    """
    Database table for storing db-level settings.
    For instance, the folder that this db points to.
    """
    __tablename__ = 'config'
    attribute_id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    value = Column(String, nullable=False)


class ImageFile(Base):
    """
    Represents a single image file.
    """
    __tablename__ = 'imagefile'

    imagefile_id = Column(Integer, primary_key=True)
    date_modified = Column(Date, default=datetime.utcnow)
    height = Column(Integer)
    path = Column(String, nullable=False, unique=True)
    width = Column(Integer)
    tags = relationship('Tag', secondary=image_tag_map, backref='images')

    def __init__(self, path):
        self.path = path
        self.date_modified = datetime.utcnow()

    def __repr__(self):
        return '<ImageFile(id=%s, path="%s")' % (self.imagefile_id, self.path)

    def as_dict(self):
        return {'imagefile_id': self.imagefile_id, 'path': self.path, 'tags': [t.name for t in self.tags]}

    def get_image_stats(self, root_dir):
        fullpath = os.path.join(root_dir, self.path)
        warnings.simplefilter('error', Image.DecompressionBombWarning)
        try:
            img = Image.open(fullpath)
        except Image.DecompressionBombWarning:
            raise ImageLoadException()
        (self.width, self.height) = img.size


class Tag(Base):
    """
    Represents a tag.
    """
    __tablename__ = 'tag'

    tag_id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)

    def __init__(self, name):
        name = re.sub(r'\s+', '-', name.lower().strip().lstrip())
        name = re.sub(r'[^0-9a-z\-]', '', name)
        self.name = name

    def __repr__(self):
        return '<Tag(id=%s, name="%s")' % (self.tag_id, self.name)

    def as_dict(self):
        return {'tag_id': self.tag_id, 'name': self.name}

    @staticmethod
    def sanitize_tag_name(name):
        """
        Sanitizes a tag name by converting to lower case, making spaces into dashes, and removing non-alphanumeric
        characters.
        """
        name = re.sub(r'[^0-9a-z]+', '-', name.lower().strip().lstrip())
        return name
