# argus

## Development
Notes on development. Documentation, TODOs, etc. 

### General
1.  `SQLAlchemy` is used as an ORM for this project, and `Flask` for the server.
1. The `Argus` class represents a session of the application, and contains a DB connection and an interface for manipulating the DB. There is one connection at a time, an `Argus` instance can switch between different databases, like opening / closing files in an application. 
1. One can connect different interfaces to the `Argus` object. We could have a web interface using the Flask server, and a command-line interface for testing. 

### File Structure
 * `argus`: Python package containing the source code for the project
	* `static`: Web files for server
	* `tests`: Directory for testing
		* `sample_walls`: Sample data of some wallpapers
 * `bin`:  Executable scripts, e.g. for easily running the server.
 
### Database Schema
We use three tables: One to store images, one to store tags, and a junction table to map the first to the second.

#### **config**

Contains database settings, as a list of key-value pairs. 
e.g. the image folder to which a database corresponds could be stored here.

| name | type | description | constraints
| --- | --- | --- | --- |
| name | string | attribute name | unique, not-null
| value | string | attribute value | not-null

 --- 
#### **image\_file**

Contains file info

| name | type | description | constraints
| --- | --- | --- |  --- |
| imagefile\_id | int | file id | primary key
| path | string | file path in system | unique, not-null

 ---
#### **tag**

Contains the set of tags used by the DB

| name | type | description | constraints
| --- | --- | --- |  --- |
| tag\_id | int | tag id | primary key
| name | string | the tag name | unique, not-null

 ---
#### **image\_tag\_map**

Maps images to tags

| name | type | description | constraints
| --- | --- | --- |  --- |
| image\_id | int | id of image | primary key
| tag\_id | int | id of tag | primary ket

 ---
 
### Server endpoints 
Right now, just see `argus/server.py`. It's pretty clearly documented there, eventually we'll add docs here. 
