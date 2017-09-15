# Call this script with the following syntax:
# bundle exec cap deploy DEPLOY=myEnvironment
# Where myEnvironment is the name of the xml file (config/deploy/myEnvironment.xml) which defines the deployment.

require 'yaml'
require "bundler/capistrano"

begin
  config = YAML.load_file(File.expand_path('../deploy/' + ENV['DEPLOY'] + '.yml', __FILE__))
  puts config["message"] unless config["message"].nil?
  repository = config["repository"]
  server_url = config["server_url"]
  username = config["username"]
  keys = config["keys"]
  branch = config["branch"] || "master"
rescue Exception => e
  # puts e.message
  puts "Sorry, the file config/deploy/" + ENV['DEPLOY'] + '.yml does not exist.'
  exit
end

# Where we get the app from and all...
set :scm, :git
set :repository, repository

puts "Using branch: '" + branch + "'"
set :branch, fetch(:branch, branch)

# Some options
default_run_options[:pty] = true
ssh_options[:forward_agent] = true
ssh_options[:keys] = keys if keys

# Servers to deploy to
set :application, "sgame_platform"
set :user, username

set :keep_releases, 2

role :web, server_url # Your HTTP server, Apache/etc
role :app, server_url # This may be the same as your `Web` server
role :db,  server_url, :primary => true # This is where Rails migrations will run

after 'deploy:update_code', "deploy:link_files"
after "deploy:link_files", "deploy:precompile_sgame_assets"
after "deploy:precompile_sgame_assets", "deploy:fix_file_permissions"
after "deploy:restart", "deploy:cleanup"

namespace(:deploy) do
  # Tasks for passenger mod_rails
  task :start do ; end
  task :stop do ; end
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
  end

  task :link_files do
    run "ln -s #{shared_path}/database.yml #{release_path}/config/database.yml"
    run "ln -s #{shared_path}/application_config.yml #{release_path}/config/application_config.yml"
    run "ln -s #{shared_path}/code #{release_path}/public/"
    run "ln -s #{shared_path}/documents #{release_path}/"
    run "ln -s #{shared_path}/exception_notification.rb #{release_path}/config/initializers"
  end

  task :precompile_sgame_assets do
    run "cd #{release_path} && bundle exec \"rake assets:precompile --trace RAILS_ENV=production\""
  end

  task :fix_file_permissions do
    run "#{try_sudo} touch #{release_path}/log/production.log"
    run "#{try_sudo} /bin/chmod 666 #{release_path}/log/production.log"
    # config.ru
    sudo "/bin/chown www-data #{release_path}/config.ru"
    # TMP
    run "/bin/chmod -R g+w #{release_path}/tmp"
    sudo "/bin/chgrp -R www-data #{release_path}/tmp"
    run "#{try_sudo} /bin/chmod -R 777 #{release_path}/public/tmp/json"
    run "#{try_sudo} /bin/chmod -R 777 #{release_path}/public/tmp/scorm"
    run "#{try_sudo} /bin/chmod -R 777 #{release_path}/public/tmp/qti"
    run "#{try_sudo} /bin/chmod -R 777 #{release_path}/public/tmp/moodlequizxml"
    # SCORM
    run "#{try_sudo} /bin/chmod -R 777 #{release_path}/public/scorm/12"
    run "#{try_sudo} /bin/chmod -R 777 #{release_path}/public/scorm/2004"
    # Other
    run "#{try_sudo} /bin/chmod -R 777 #{release_path}/public/game_template_examples"
    run "#{try_sudo} /bin/chmod 777 #{release_path}/db/schema.rb"
  end

end