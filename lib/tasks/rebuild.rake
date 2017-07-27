namespace :sgame_platform do
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
			system "rake db:populate"
		puts "Rebuild finish"
	end
end