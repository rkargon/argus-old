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


class InvalidQueryException(ArgusException):
    """
    Exception raised when Argus is given a query that it can't parse
    """
    pass
