source 'https://rubygems.org'

#Bundler
gem 'bundler', '2.3.12' 
# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '= 6.1.5'
# Use postgreSQL as the database for Active Record
gem 'pg', '= 1.3.5'
# Use SCSS for stylesheets
gem 'sass-rails', '6.0.0'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '4.2.0'
# Use CoffeeScript for .coffee assets and views
gem 'coffee-rails', '5.0.0'

# Use jquery as the JavaScript library
gem 'jquery-rails', '4.4.0'
gem 'jquery-ui-rails', '6.0.1'

gem 'acts-as-taggable-on', '9.0.1'
gem 'devise', '4.8.1'
gem "devise-encryptable", '0.2.0'
gem 'warden', '1.2.9'
gem "recaptcha", '5.9.0', require: "recaptcha/rails"
gem 'omniauth', '2.1.0'
gem 'paperclip', '6.1.0'
gem 'rubyzip', '2.3.2'
gem 'rmagick', '4.2.5'
gem 'pdf-reader', '2.9.2'
gem 'font-awesome-sass', '6.1.1'
gem 'cancancan', '3.2.0'
gem 'exception_notification', '4.5.0'

# $ export FORCE_LOCAL_SCORM=scormGemPath
if ENV['FORCE_LOCAL_SCORM']
  gem "scorm", :path => ENV['FORCE_LOCAL_SCORM'], :branch => "master"
else
  gem 'scorm', git: 'https://github.com/agordillo/scorm.git', branch: 'master'
end

group :development do
  # Access an IRB console on exception pages or by using <%= console %> in views
  gem 'web-console'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'pry-rails'
  gem 'thin'
end

gem 'capistrano', '3.17.0'