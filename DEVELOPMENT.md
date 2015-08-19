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

### TODO
1. Set up server interface in python so that web development can begin
1. Error handling/reporting for server endpoints
	2. What kinds of output should server requests produce? Status codes enough?
1. When creating new database, actually add images, assign tags, etc. 
1. Right now the folder a db corresponds to is stored in the `config` table, as an absolute path. Clearly for syncing between different computers this will be a problem. We could use a relative path from the db file, but this will only work in some cases. Is there a better way to associate database to image folder? (**ALSO**: We should make sure store image paths relative to the image folder in the db)
1. How to query for tags? Should it be OR based (i.e. return all images that have at least one tag) or AND based (i.e. return all images that have all the given tags?)
	2.  Perhaps have the user create expressions wit NOTs (`!` or `~`), ANDs, (`^` or `&`) and ORs (`|`) that gets parsed by server?
		3. e.g. `tag1 & (tag2 | ~tag3)`
		3. This could be very powerful, but also easy for basic use (just AND a bunch of things, for instance)
	2. What about 'images with ONLY this tag' vs 'images with AT LEAST this tag' ?
	2. Should an empty query be NO images or ALL images? ALL might be more intuitive
		3. or have an `*` symbol in queries that represents getting ALL tags. 
1. Convert Flask server routes into a standard, RESTful API *(low priority) *
1. Should `Argus` object expose its DB Session? This would allow clients to do custom queries that we might not anticipate, but could also be a security issue. I'm leaning towards no, the basic set of stuff we allow will be more than sufficient (e.g. get images by tags, or add tag to image)
1.  Figure out how SQLAlchemy handles adding of duplicate items (what kinds of errors it throws, etc. Should throw an IntegrityError, too lazy to check it right now)
1. How to make sure we don't load non-images into the db? Right now we just used mime-type checking, based on file extension. Should we do something more advanced, like trying to load the image?  This is costly, but eventually I'm planning on loading the image anyway, to get resolution / color data, so that would kinda happen anyways. 
1. FoRight now storing 
