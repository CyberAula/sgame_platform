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

		#2: Create SCORM packages and Learning Objects
		sf1 = Scormfile.create! :owner_id => user.id,
			:title  => "Golf",
			:description   => "SCORM package that explains everything about golf",
			:thumbnail_url => "/assets/gallery/golf1.jpg",
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/scorm_examples/golf_n_sco.zip'))

		sf2 = Scormfile.create! :owner_id => user.id,
			:title  => "Ancient Weapons",
			:description   => "Quiz about ancient weapons",
			:thumbnail_url => "/assets/gallery/weapons.jpg",
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/scorm_examples/AncientWeaponsQuiz.zip'))

		sf3 = Scormfile.create! :owner_id => user.id,
			:title  => "Weapons Timeline",
			:description   => "Weapons Timeline Quiz",
			:thumbnail_url => "/assets/gallery/battle.jpg",
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/scorm_examples/WeaponsTimelineQuiz.zip'))

		sf4 = Scormfile.create! :owner_id => user.id,
			:title  => "Iberian Lynx",
			:description   => "Iberian Lynx",
			:thumbnail_url => "/assets/gallery/iberian_lynx.jpg",
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/scorm_examples/iberianlynx.zip'))

		#3: Create game templates
		# Events of the game templates are created based on the sgame_events_json.json file
		system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Onslaught_Arena.zip')
		Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Onslaught_Arena.zip'),File.join(Rails.root, 'public/game_template_examples/Onslaught_Arena'))
		oArena = GameTemplate.create! :owner_id => user.id,
			:title=>"Onslaught Arena", 
			:description=>"Battle hordes of classic medieval monsters in this fast-paced arcade shooter", 
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Onslaught_Arena/thumbnail.jpg')),
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/game_template_examples/Onslaught_Arena.zip'))

		system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Sokoban.zip')
		Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Sokoban.zip'),File.join(Rails.root, 'public/game_template_examples/Sokoban'))
		sokoban = GameTemplate.create! :owner_id => user.id,
			:title=>"Sokoban", 
			:description=>"Sokoban is a type of puzzle game, in which the player pushes diamonds around in a warehouse", 
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Sokoban/thumbnail.png')),
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/game_template_examples/Sokoban.zip'))

		system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Natural_Park.zip')
		Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Natural_Park.zip'),File.join(Rails.root, 'public/game_template_examples/Natural_Park'))
		nPark = GameTemplate.create! :owner_id => user.id,
			:title=>"Natural Park", 
			:description=>"Go meet and feed the lynxes in this park", 
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Natural_Park/thumbnail.png')),
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/game_template_examples/Natural_Park.zip'))

		#4: Create games
		#With oArena template
		oArenaInstance = Game.create! :owner_id => user.id,
			:game_template_id=>oArena.id,
			:title=>"Onslaught Arena",
			:description=>"Example of educational game based on Onslaught Arena", 
			:thumbnail_url=>"/assets/gallery/gameInstance_OnslaughtArena.jpg",
			:certified => true
			
		#Event mapping for oArenaInstance
		((sf2.los + sf3.los).map{|lo| lo.id}).uniq.each do |lo_id|
			GameEventMapping.create! :game_id => oArenaInstance.id, 
				:game_template_event_id => oArena.events.first.id, 
				:lo_id => lo_id
		end

		#With Sokoban template
		sokobanInstance = Game.create! :owner_id => user.id,
			:game_template_id=>sokoban.id,
			:title=>"Sokoban",
			:description=>"Example of educational game based on Sokoban", 
			:thumbnail_url=>"/assets/gallery/devilAvatar.gif",
			:certified => true

		#Event mapping for sokobanInstance
		((sf1.los).map{|lo| lo.id}).uniq.each do |lo_id|
			GameEventMapping.create! :game_id => sokobanInstance.id, 
				:game_template_event_id => sokoban.events.first.id, 
				:lo_id => lo_id
		end

		#With Natural Park template
		nParkInstance = Game.create! :owner_id => user.id,
			:game_template_id=>nPark.id,
			:title=>"Natural Park",
			:description=>"Example of educational game based on Natural Park", 
			:thumbnail_url=>"/assets/gallery/game_dpark.png",
			:certified => true
	
		#Event mapping for nParkInstance
		((sf4.los).map{|lo| lo.id}).uniq.each do |lo_id|
			GameEventMapping.create! :game_id => nParkInstance.id, 
				:game_template_event_id => nPark.events.first.id, 
				:lo_id => lo_id
		end

		puts "Populate finished"
		t2 = Time.now - t1
		puts "Elapsed time:" + t2.to_s
	end
end