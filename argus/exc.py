"""
File for representing argus-specific exceptions.
"""


class ArgusException(Exception):
    """
    Exception class for the Argus application
    """
    pass


class ImageLoadException(ArgusException):
    """
    Exception raised when an image file could not be loaded
    """
    pass
