source 'https://rubygems.org'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '4.2.9'
# Use postgreSQL as the database for Active Record
gem 'pg', '0.20.0'
# Use SCSS for stylesheets
gem 'sass-rails', '5.0.6'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '3.2.0'
# Use CoffeeScript for .coffee assets and views
gem 'coffee-rails', '4.2.2'

# Use jquery as the JavaScript library
gem 'jquery-rails', '4.3.1'
gem 'jquery-ui-rails', '6.0.1'

gem 'acts-as-taggable-on', '3.4'
gem 'devise', '4.3.0'
gem 'warden', '1.2.7'
gem "recaptcha", '4.3.1', require: "recaptcha/rails"
gem 'omniauth', '1.4.2'
gem 'paperclip', '= 4.3.6'
gem 'rubyzip', '= 1.0.0'
gem 'rmagick', '=2.13.2'
gem 'pdf-reader', '= 1.3.3'
gem 'font-awesome-sass', '4.7.0'
gem 'cancancan', '~> 2.0'
gem 'exception_notification', '=4.1.1'

# $ export FORCE_LOCAL_SCORM=scormGemPath
if ENV['FORCE_LOCAL_SCORM']
  gem "scorm", :path => ENV['FORCE_LOCAL_SCORM'], :branch => "master"
else
  gem "scorm", :git => 'git://github.com/agordillo/scorm.git', :branch => "master"
end

group :development do
  # Access an IRB console on exception pages or by using <%= console %> in views
  gem 'web-console', '2.0.0'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'pry-rails'
  gem 'thin'
end

gem 'capistrano', '= 2.14.2'