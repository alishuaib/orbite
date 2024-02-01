Copy the /orbite folder to your /local plugins folder in Moodle

Update the end point in /orbite/classes/api.php to point to your Orbite instance

Run a update to install (Usually happens on its own when you start the docker container and navigate to site [localhost:8000])

Head to Settings > Site administration > Plugins > Local plugins > Orbite

Enter the API key from you Orbite account (Need to pull from DB as it's not in the settings page yet, found under AUTH > API_KEY)

Create a new Course and upload some content

Chat button should become visible on the bottom right after Sync & Parse is complete (Can check in the Orbite Plugin page)