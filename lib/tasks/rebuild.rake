namespace :sgame_platform do
	#bundle exec rake sgame_platform:rebuild
	#bundle exec rake sgame_platform:rebuild RAILS_ENV=production
	task :rebuild do
		desc "Rebuild"
		system "rake sgame_platform:reset"
		system "rake db:populate"
		puts "Rebuild finished"
	end

	#bundle exec rake sgame_platform:install
	#bundle exec rake sgame_platform:install RAILS_ENV=production
	#rvmsudo -H -u www-data bash -c 'bundle exec rake sgame_platform:install RAILS_ENV=production'
	task :install do
		desc "Install"
		system "rake sgame_platform:reset"
		system "rake db:install"
		puts "Install finished"
	end

	task :reset do
		desc "Reset"
		system "rake db:drop"
		system "rake db:create" 
		system "rake db:migrate"
		system "rm -rf public/scorm/12/games/*"
		system "rm -rf public/scorm/12/presentations/*"
		system "rm -rf public/scorm/2004/games/*"
		system "rm -rf public/scorm/2004/presentations/*"
		system "rm -rf documents/*"
		system "rm -rf public/code/*"
		system "rm -rf public/system/*"
		system "rm -rf public/tmp/scorm/*"
		system "rm -rf public/tmp/json/*"
		system "rm -rf public/tmp/qti/*"
		system "rm -rf public/tmp/moodlequizxml/*"
		puts "Reset finished"
	end
end