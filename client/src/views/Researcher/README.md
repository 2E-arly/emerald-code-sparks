Add researcher
Main page for researcher role
study data consent interface
student search feature
batch students
search filter to find specific studies
tagging system
# Project README

## Project Features and Screenshots

### 1. Study Creation Tool
- *Screenshot:* ![Study Creation Tool](screenshots/CreateNewStudy.png)
- Description: Lets researchers declare and configure studies, including characteristics and participants, integrating with the assent/consent menu.

### 2. Add Researcher
- *Screenshot:* ![Add Researcher](screenshots/AddResearcher.png)
- Description: Feature to add researchers to the system. Researchers can be added with specific roles and permissions.

### 3. Tagging System
- Description: Enables researchers to classify classrooms for study management, searchable through the sort/search feature.

### 4. Sort/Search Feature
- Description: Comprehensive filters for searching through students.

## Instructions to Run Locally

1. Clone the repository:
    ```bash
    git clone https://github.com/UFWebApps2-0/emerald-code-sparks.git
    cd emerald-code-sparks
    ```

2. Install dependencies:
    ```bash
    cd client
    npm install
    ```

3. Start the development server:
    ```bash
    npm start
    ```

4. Start the Virtual Machine with Docker
    ```bash
    cd ..
    docker-compose up
    ```

4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

5. Open a separate tab and navigate to [http://localhost:1337/admin] (http://localhost:1337/admin).

###
