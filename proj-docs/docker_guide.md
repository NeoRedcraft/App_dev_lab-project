## How to Run the App with Docker

If you want to run the project in a containerized environment using Docker, follow these steps:

1. **Install** Docker Desktop
    - Download and install Docker Desktop from https://www.docker.com/products/docker-desktop
    - Make sure the Docker daemon is running. You should see the Docker whale icon in your system tray.
    - Update WSL if needed.

2. **Build** and Start the Docker Container
    - Make sure you are in my-app if not use this command: 
    cd D:/GitProjects/App_dev_lab-project/my-app
    - Then in the terminal do: 
    docker-compose up --build

3. **Verifying** the Docker Container
    - Open the docker desktop app with the container name "my-app" running
    - Open http://localhost:5174/ in your browser.
    - You should see the login page.