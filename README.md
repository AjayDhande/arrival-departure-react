# arrival-departure-react
# README

* Backend rails "arrival-departure-api"

* Ruby version 2.5.1

  Select RVM 2.5.1

  Run bundle command

* Database creation

  set your username and password for pg in database.yml file

  run "rake db:create" command
  
  run "rake db:migrate" command

  run "touch log/cron_log.log" 
  
  run "whenever --update-crontab"  #this will update cronjob on system level

  run "rails s"

* React App - Frontend "arrival-departure-react"

  cd ../arrival-departure-react

  run "npm install"

  run "npm start"

* ...
