# config valid for current version and patch releases of Capistrano
lock "~> 3.17.0"

require 'yaml'
begin
  config = YAML.load_file(File.expand_path('../deploy/' + ENV['DEPLOY'] + '.yaml', __FILE__))
  puts config["message"] unless config["message"].nil?
  repository = config["repository"]
  server_url = config["server_url"]
  username = config["username"]
  keys = config["keys"]
  branch = config["branch"] || "master"
rescue Exception => e
  # puts e.message
  puts "Sorry, the file config/deploy/" + ENV['DEPLOY'] + '.yaml does not exist.'
  exit
end

server server_url, user: username, roles: %w{app db web}

set :application, "sgame"
set :repo_url, repository

puts "Using branch: '" + branch + "'"
set :branch, branch

# Default deploy_to directory is /var/www/my_app_name
set :deploy_to, "/u/apps/#{fetch(:application)}"

# Default value for :format is :airbrussh.
# set :format, :airbrussh

# You can configure the Airbrussh format using :format_options.
# These are the defaults.
# set :format_options, command_output: true, log_file: "log/capistrano.log", color: :auto, truncate: :auto

# Default value for :pty is false
set :pty, true

# Default value for :linked_files is []
append :linked_files, "config/database.yml", "config/application_config.yml", "tmp/restart.txt", "config/initializers/exception_notification.rb"

# Default value for linked_dirs is []
append :linked_dirs, "log", "tmp/pids", "tmp/cache", "tmp/sockets", "tmp/webpacker", "public/system", "public/code", "vendor", "storage", "documents" 

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for local_user is ENV['USER']
set :local_user, username

# Default value for keep_releases is 5
set :keep_releases, 3

# Uncomment the following to require manually verifying the host key before first deploy.
set :ssh_options, verify_host_key: :never

set :ssh_options, forward_agent: true
set :ssh_options, keys: keys if keys

set :passenger_restart_with_touch, true