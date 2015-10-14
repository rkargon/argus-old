# Argus
A tool for organizing wallpapers (or other images)  using a platform agnostic tagging system.

### Goals
  - Cloud-storage and colaborative folder/workflow safe and friendly
  - Lightweight
  - 
  
### Installation
  - After `pull`ing the repository, run `pip install -r requirements.txt` to install the required packages. Argus relies on the Flask and SQLAlchemy python packages. 

### Running
  - To run, use the command `./bin/run_server -d /path/to/image/folder/<database_file>`. If the file does not exist, it will be created. /path/to/image/folder/ is the folder that contains the images to be added to the database. 
  - Then, to view the interface open a web browser and go to `http://localhost:5000/`
