"""
Classes representing database objects.
"""

from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

# mapping from images to tags
image_tag_map = Table('image_tag_map', Base.metadata,
                      Column('image_id', Integer, ForeignKey('imagefile.imagefile_id')),
                      Column('tag_id', Integer, ForeignKey('tag.tag_id'))
                      )


class ImageFile(Base):
    """ Represents a single image file.
    """
    __tablename__ = 'imagefile'

    imagefile_id = Column(Integer, primary_key=True)
    path = Column(String, unique=True)
    tags = relationship('Tag', secondary=image_tag_map, backref='images')

    def __repr__(self):
        return '<ImageFile(id=%d, path="%s")' % (self.imagefile_id, self.path)


class Tag(Base):
    """ Represents a tag.
    """
    __tablename__ = 'tag'

    tag_id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)

    def __repr__(self):
        return '<Tag(id=%d, name="%s")' % (self.tag_id, self.name)

