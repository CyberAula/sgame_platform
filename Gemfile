source 'https://rubygems.org'

#Bundler (sudo gem install bundler -v "1.17.3" && bundle _1.17.3_ install)
gem 'bundler', '1.17.3' 
# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '= 5.2.4.3'
# Use postgreSQL as the database for Active Record
gem 'pg', '= 0.18'
# Use SCSS for stylesheets
gem 'sass-rails'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier'
# Use CoffeeScript for .coffee assets and views
gem 'coffee-rails'

# Use jquery as the JavaScript library
gem 'jquery-rails'
gem 'jquery-ui-rails'

gem 'acts-as-taggable-on'
gem 'devise', '4.7.2'
gem 'warden'
gem "recaptcha", '4.3.1', require: "recaptcha/rails"
gem 'omniauth'
gem 'paperclip'
gem 'rubyzip'
gem 'rmagick'
gem 'pdf-reader'
gem 'font-awesome-sass'
gem 'cancancan'
gem 'exception_notification'
gem 'bigdecimal'

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