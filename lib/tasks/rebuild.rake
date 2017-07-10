namespace :sgame do
	task :rebuild do
		desc "Rebuild..."
			system "rake db:drop"
			system "rake db:create" 
			system "rake db:migrate"
			# system "rm -rf public/scorm/*"
			# system "rake db:populate"
		puts "Rebuild finish"
	end
end