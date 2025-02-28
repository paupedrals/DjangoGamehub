@echo off
echo Setting up virtual environment...
if not exist venv (
    python -m venv venv
    echo Virtual environment created.
) else (
    echo Virtual environment already exists.
)
call venv\Scripts\activate
echo Installing dependencies from requirements.txt...
cd /d %~dp0
pip install -r requirements.txt
echo Dependencies installed.
echo Starting the server...
echo When it's running, copy the address that starts with "http://"
echo Press Ctrl+C on this window to stop the server.
python .\manage.py runserver
echo Setup complete! Virtual environment is activated, dependencies are installed, and the server is running.
pause