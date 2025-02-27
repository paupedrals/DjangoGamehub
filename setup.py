import os
import subprocess
import sys

def setup_environment():
    # Define virtual environment path
    venv_path = os.path.join(os.getcwd(), "venv")
    activate_script = "Scripts/activate.bat" if os.name == "nt" else "bin/activate"

    # Create virtual environment if it doesn’t exist
    if not os.path.exists(venv_path):
        print("Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)
        print("Virtual environment created.")
    else:
        print("Virtual environment already exists.")

    # Activate and install dependencies (platform-specific)
    if os.name == "nt":  # Windows
        activate_cmd = os.path.join(venv_path, activate_script)
        install_cmd = f"call {activate_cmd} && pip install -r requirements.txt"
    else:  # macOS/Linux
        activate_cmd = os.path.join(venv_path, activate_script)
        install_cmd = f"source {activate_cmd} && pip install -r requirements.txt"

    print("Activating virtual environment and installing dependencies...")
    subprocess.run(install_cmd, shell=True, check=True)
    print("Setup complete! Note: You may need to manually activate the environment afterward.")

if __name__ == "__main__":
    try:
        setup_environment()
    except subprocess.CalledProcessError as e:
        print(f"An error occurred: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")