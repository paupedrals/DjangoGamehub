import os
import subprocess
import sys

def main():
    # Get the script's directory
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Define the virtual environment path
    venv_path = os.path.join(script_dir, "venv")

    # Create the virtual environment if it doesn't exist
    if not os.path.exists(venv_path):
        print("Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", "venv"], cwd=script_dir)
        print("Virtual environment created.")
    else:
        print("Virtual environment already exists.")

    # Use the virtual environment's Python directly
    venv_python = os.path.join(venv_path, "Scripts", "python.exe") if os.name == "nt" else os.path.join(venv_path, "bin", "python")

    # Install dependencies
    print("Installing dependencies from requirements.txt...")
    subprocess.run([venv_python, "-m", "pip", "install", "-r", "requirements.txt"], cwd=script_dir)

    # Run the server
    print("Starting the server...")
    print("To close the server press Ctrl+C.")

    subprocess.run([venv_python, "manage.py", "runserver"], cwd=script_dir)

if __name__ == "__main__":
    main()