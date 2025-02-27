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
pip install -r requirements.txt

echo Setup complete! Virtual environment is activated and dependencies installed.
pause