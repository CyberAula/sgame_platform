namespace :db do
	task :populate => :environment do
		desc "Populate database for SGAME Platform"
		t1 = Time.now

		#1: Create demo user
		user = User.new
		user.email = "demo@sgame.dit.upm.es"
		user.password = "demonstration"
		user.name = "Demo"
		user.ui_language = I18n.default_locale
		user.confirmed_at = DateTime.now
		user.skip_confirmation!
		user.save!
		puts "User '" + user.name + "' created with email '" + user.email + "' and password 'demonstration'"

		#2: Create SCORM packages
		zf1 = Zipfile.create! :owner_id => user.id,
			:title  => "Golf",
			:description   => "SCORM package that explains everything about golf",
			:thumbnail_url => "/gallery/images/golf1.jpg",
			:file =>  File.open(File.join(Rails.root, 'public/scorm_examples/golf_n_sco.zip'))

		sf1 = Scormfile.createScormfileFromZip(zf1)

		#3: Create game templates
		system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Onslaught_Arena.zip')
		Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Onslaught_Arena.zip'),File.join(Rails.root, 'public/game_template_examples/Onslaught_Arena'))
		oArena = GameTemplate.create! :owner_id => user.id,
			:title=>"Onslaught Arena", 
			:description=>"Battle hordes of classic medieval monsters in this fast-paced arcade shooter", 
			:thumbnail_url=>"/gallery/game_OnslaughtArena.jpg",
			:file =>  File.open(File.join(Rails.root, 'public/game_template_examples/Onslaught_Arena.zip'))

		#Create the events of the game templates
		#TODO: events should be created by reading a file in the template file
		oArenaEvent1 = GameTemplateEvent.create! :game_template_id=>oArena.id,
			:title=>"Extra weapon",
			:description=>"Event triggered when the player tries to get a new weapon",
			:id_in_game=>1

		#4: Create games
		#oArena
		oArenaInstance = Game.create! :owner_id => user.id,
			:title=>"Onslaught Arena", 
			:description=>"Onslaught Arena instance example", 
			:thumbnail_url=>"/assets//gallery/gameInstance_OnslaughtArena.jpg", 
			:game_template_id=>oArena.id

		#Event mapping for the oArena game
		(sf1.los.map{|lo| lo.id}).uniq.each do |lo_id|
			GameEventMapping.create! :game_id => oArenaInstance.id, 
				:game_template_event_id => oArenaEvent1.id, 
				:lo_id => lo_id
		end
		
		puts "Populate finished"
		t2 = Time.now - t1
		puts "Elapsed time:" + t2.to_s
	end
end