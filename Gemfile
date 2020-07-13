source 'https://rubygems.org'

#Bundler
gem 'bundler', '2.1.4' 
# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '= 5.2.4.3'
# Use postgreSQL as the database for Active Record
gem 'pg', '= 0.18'
# Use SCSS for stylesheets
gem 'sass-rails', '6.0.0'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '4.2.0'
# Use CoffeeScript for .coffee assets and views
gem 'coffee-rails', '5.0.0'

# Use jquery as the JavaScript library
gem 'jquery-rails', '4.4.0'
gem 'jquery-ui-rails', '6.0.1'

gem 'acts-as-taggable-on', '6.5.0'
gem 'devise', '4.7.2'
gem "devise-encryptable", '0.2.0'
gem 'warden', '1.2.8'
gem "recaptcha", '4.3.1', require: "recaptcha/rails"
gem 'omniauth', '1.9.1'
gem 'paperclip', '6.1.0'
gem 'rubyzip', '2.3.0'
gem 'rmagick', '4.1.2'
gem 'pdf-reader', '2.4.0'
gem 'font-awesome-sass', '5.13.0'
gem 'cancancan', '3.1.0'
gem 'exception_notification', '4.4.3'

# $ export FORCE_LOCAL_SCORM=scormGemPath
if ENV['FORCE_LOCAL_SCORM']
  gem "scorm", :path => ENV['FORCE_LOCAL_SCORM'], :branch => "master"
else
  gem "scorm", :git => 'git://github.com/agordillo/scorm.git', :branch => "master"
end

group :development do
  # Access an IRB console on exception pages or by using <%= console %> in views
  gem 'web-console'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'pry-rails'
  gem 'thin'
end

gem 'capistrano'