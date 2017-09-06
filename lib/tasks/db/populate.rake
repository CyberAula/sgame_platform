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
			:thumbnail=> File.open(File.join(Rails.root, 'public/scorm_examples/golf_n_sco_thumbnail.jpg')),
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/scorm_examples/golf_n_sco.zip'))

		sf2 = Scormfile.create! :owner_id => user.id,
			:title  => "Ancient Weapons",
			:description   => "Quiz about ancient weapons",
			:thumbnail=> File.open(File.join(Rails.root, 'public/scorm_examples/AncientWeaponsQuiz_thumbnail.jpg')),
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/scorm_examples/AncientWeaponsQuiz.zip'))

		sf3 = Scormfile.create! :owner_id => user.id,
			:title  => "Weapons Timeline",
			:description   => "Weapons Timeline Quiz",
			:thumbnail=> File.open(File.join(Rails.root, 'public/scorm_examples/WeaponsTimelineQuiz_thumbnail.jpg')),
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/scorm_examples/WeaponsTimelineQuiz.zip'))

		sf4 = Scormfile.create! :owner_id => user.id,
			:title  => "Iberian Lynx",
			:description   => "Iberian Lynx",
			:thumbnail=> File.open(File.join(Rails.root, 'public/scorm_examples/iberian_lynx_thumbnail.jpg')),
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/scorm_examples/iberian_lynx.zip'))

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

		system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Space_Invaders.zip')
		Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Space_Invaders.zip'),File.join(Rails.root, 'public/game_template_examples/Space_Invaders'))
		spaceInvaders = GameTemplate.create! :owner_id => user.id,
			:title=>"Space Invaders",
			:description=>"Defeat waves of aliens with a laser cannon to earn as many points as possible in this arcade shooting game.",
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Space_Invaders/thumbnail.png')),
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/game_template_examples/Space_Invaders.zip'))

		system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Floppybird.zip')
		Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Floppybird.zip'),File.join(Rails.root, 'public/game_template_examples/Floppybird'))
		floppybird = GameTemplate.create! :owner_id => user.id,
			:title=>"Floppy Bird",
			:description=>"Experience the adventure of Floppy Bird, the flying floppy disk, through the world by dodging obstacles.",
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Floppybird/thumbnail.png')),
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/game_template_examples/Floppybird.zip'))

		system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Elemental_One.zip')
		Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Elemental_One.zip'),File.join(Rails.root, 'public/game_template_examples/Elemental_One'))
		elementalOne = GameTemplate.create! :owner_id => user.id,
			:title=>"Elemental One",
			:description=>"A simple platformer game.",
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Elemental_One/thumbnail.png')),
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/game_template_examples/Elemental_One.zip'))

		#4: Create games
		#With oArena template
		oArenaInstance = Game.create! :owner_id => user.id,
			:game_template_id=>oArena.id,
			:title=>"Onslaught Arena",
			:description=>"Example of educational game based on Onslaught Arena", 
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Onslaught_Arena/thumbnail.jpg')),
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
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_thumbnails/devilAvatar.gif')),
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
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Natural_Park/thumbnail.png')),
			:certified => true
	
		#Event mapping for nParkInstance
		((sf4.los).map{|lo| lo.id}).uniq.each do |lo_id|
			GameEventMapping.create! :game_id => nParkInstance.id, 
				:game_template_event_id => nPark.events.first.id, 
				:lo_id => lo_id
		end

		#With Space Invaders template
		spaceInvadersInstance = Game.create! :owner_id => user.id,
			:game_template_id=>spaceInvaders.id,
			:title=>"Space Invaders",
			:description=>"Example of educational game based on Space Invaders", 
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Space_Invaders/thumbnail.png')),
			:certified => true
	
		#Event mapping for spaceInvadersInstance
		((sf2.los).map{|lo| lo.id}).uniq.each do |lo_id|
			GameEventMapping.create! :game_id => spaceInvadersInstance.id, 
				:game_template_event_id => spaceInvaders.events.first.id, 
				:lo_id => lo_id
		end

		#With Floppybird template
		floppybirdInstance = Game.create! :owner_id => user.id,
			:game_template_id=>floppybird.id,
			:title=>"Floppy Bird",
			:description=>"Example of educational game based on Floppy Bird", 
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Floppybird/thumbnail.png')),
			:certified => true
	
		#Event mapping for floppybirdInstance
		((sf2.los).map{|lo| lo.id}).uniq.each do |lo_id|
			GameEventMapping.create! :game_id => floppybirdInstance.id, 
				:game_template_event_id => floppybird.events.first.id, 
				:lo_id => lo_id
		end

		#With ElementalOne template
		elementalOneInstance = Game.create! :owner_id => user.id,
			:game_template_id=>elementalOne.id,
			:title=>"Elemental One",
			:description=>"Example of educational game based on Elemental One", 
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Elemental_One/thumbnail.png')),
			:certified => true
	
		#Event mapping for elementalOneInstance
		((sf2.los).map{|lo| lo.id}).uniq.each do |lo_id|
			GameEventMapping.create! :game_id => elementalOneInstance.id, 
				:game_template_event_id => elementalOne.events.first.id, 
				:lo_id => lo_id
		end

		puts "Populate finished"
		t2 = Time.now - t1
		puts "Elapsed time:" + t2.to_s
	end
end