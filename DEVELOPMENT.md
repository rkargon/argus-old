# argus
## Development
### General
### Database Schema
Three tables:
*image_file*
*tag*
*image_tag_map*
### File Structure
```
 - argus: Python package containing the source code for the project
	- static: Web files for server
	- tests: Directory for testing
		- sample_walls: Sample data of some wallpapers
- bin - Executable scripts, e.g. for easily running the server.
```

### TODO
1. Set up server interface in python so that web development can begin
2. How should we store the folder path in the database? Should we have a 'config' table with a list of attributes, and have a 'path' attribute?
