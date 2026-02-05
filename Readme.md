My program consist of a browser extension for google chrome, and a python server.


1. in bash terminal to execute python server: go to backend directory, activate the enviromint (venv) and run server.py. 
cd backend
source venv/bin/acivate
python server.py

2. open google chrome 

3. then click 'extensions' (puzzle icon in top right corner) - open 'manage extensions'

3. then 'load unpacked' - browse for 'AIAcademicAssistantExtension'

4. to test if backend server is running: 'http://localhost:7700/health'
 if running, status will return 'healthy'