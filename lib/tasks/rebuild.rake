namespace :sgame_platform do
	#bundle exec rake sgame_platform:rebuild
	#bundle exec rake sgame_platform:rebuild RAILS_ENV=production
	task :rebuild do
		desc "Rebuild..."
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
			system "rake db:populate"
		puts "Rebuild finish"
	end
end