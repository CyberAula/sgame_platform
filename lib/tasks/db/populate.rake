namespace :db do

	#bundle exec rake db:populate
	task :populate => :environment do
		desc "Populate database for SGAME Platform in a development environment"
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
			:description   => "Timeline quiz about ancient weapons",
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
			:description=>"Defeat waves of aliens with a laser cannon to earn as many points as possible in this arcade shooting game",
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Space_Invaders/thumbnail.png')),
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/game_template_examples/Space_Invaders.zip'))

		system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Floppybird.zip')
		Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Floppybird.zip'),File.join(Rails.root, 'public/game_template_examples/Floppybird'))
		floppybird = GameTemplate.create! :owner_id => user.id,
			:title=>"Floppy Bird",
			:description=>"Experience the adventure of Floppy Bird, the flying floppy disk, through the world by dodging obstacles",
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Floppybird/thumbnail.png')),
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/game_template_examples/Floppybird.zip'))

		system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Elemental_One.zip')
		Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Elemental_One.zip'),File.join(Rails.root, 'public/game_template_examples/Elemental_One'))
		elementalOne = GameTemplate.create! :owner_id => user.id,
			:title=>"Elemental One",
			:description=>"A simple platformer game",
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Elemental_One/thumbnail.png')),
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/game_template_examples/Elemental_One.zip'))

		system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Pacman.zip')
		Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Pacman.zip'),File.join(Rails.root, 'public/game_template_examples/Pacman'))
		pacman = GameTemplate.create! :owner_id => user.id,
			:title=>"Pac-Man",
			:description=>"Pac-Man: The classic arcade game",
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Pacman/thumbnail.png')),
			:language => "en",
			:height => 750,
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/game_template_examples/Pacman.zip'))

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
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_thumbnails/devilAvatar.png')),
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

		#With Pacman template
		pacmanInstance = Game.create! :owner_id => user.id,
			:game_template_id=>pacman.id,
			:title=>"Pac-Man",
			:description=>"Example of educational game based on Pac-Man", 
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Pacman/thumbnail.png')),
			:certified => true
	
		#Event mapping for pacmanInstance
		((sf2.los).map{|lo| lo.id}).uniq.each do |lo_id|
			GameEventMapping.create! :game_id => pacmanInstance.id, 
				:game_template_event_id => pacman.events.first.id, 
				:lo_id => lo_id
		end

		#Create editor data
		Rake::Task["fix:createEditorData"].invoke

		puts "Populate finished"
		t2 = Time.now - t1
		puts "Elapsed time:" + t2.to_s
	end

	#bundle exec rake db:install
	task :install => :environment do
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
		sfTablaPeriodica = Scormfile.create! :owner_id => user.id,
			:title  => "Tabla Periódica",
			:description   => "Paquete SCORM para aprender la tabla periódica",
			:thumbnail=> File.open(File.join(Rails.root, 'public/scorm_examples/tabla_periodica_thumbnail.png')),
			:language => "es",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/scorm_examples/tabla_periodica.zip'))

		sfReciclaje = Scormfile.create! :owner_id => user.id,
			:title  => "Reciclaje",
			:description   => "Recurso educativo para aprender sobre los diferentes contenedores de reciclaje",
			:thumbnail=> File.open(File.join(Rails.root, 'public/scorm_examples/reciclaje_thumbnail.png')),
			:language => "es",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/scorm_examples/reciclaje.zip'))

		sfPlanta = Scormfile.create! :owner_id => user.id,
			:title  => "Partes de una planta",
			:description   => "Infografía interactiva y cuestionarios para aprender las partes de una planta",
			:thumbnail=> File.open(File.join(Rails.root, 'public/scorm_examples/planta_partes_thumbnail.png')),
			:language => "es",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/scorm_examples/planta_partes.zip'))

		sfMaths1 = Scormfile.create! :owner_id => user.id,
			:title  => "Math Pack 1",
			:description   => "Pack de recursos educativos para aprender matemáticas: sumas, restas, multiplicaciones, etc.",
			:thumbnail=> File.open(File.join(Rails.root, 'public/scorm_examples/maths_pack1_thumbnail.jpg')),
			:language => "es",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/scorm_examples/maths_pack1.zip'))

		sfEnglish1 = Scormfile.create! :owner_id => user.id,
			:title  => "English Pack 1",
			:description   => "Pack de recursos educativos para aprender inglés: animales, colores, partes del cuerpo, etc.",
			:thumbnail=> File.open(File.join(Rails.root, 'public/scorm_examples/english_pack1_thumbnail.jpg')),
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/scorm_examples/english_pack1.zip'))

		sfAncientWeapons1 = Scormfile.create! :owner_id => user.id,
			:title  => "Ancient Weapons",
			:description   => "Quiz about ancient weapons",
			:thumbnail=> File.open(File.join(Rails.root, 'public/scorm_examples/AncientWeaponsQuiz_thumbnail.jpg')),
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/scorm_examples/AncientWeaponsQuiz.zip'))

		sfAncientWeapons2 = Scormfile.create! :owner_id => user.id,
			:title  => "Weapons Timeline",
			:description   => "Timeline quiz about ancient weapons",
			:thumbnail=> File.open(File.join(Rails.root, 'public/scorm_examples/WeaponsTimelineQuiz_thumbnail.jpg')),
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/scorm_examples/WeaponsTimelineQuiz.zip'))
		
		sfLince = Scormfile.create! :owner_id => user.id,
			:title  => "El Lince Ibérico",
			:description   => "Recurso educativo sobre el lince ibérico, el felino en mayor peligro de extinción. ¿Cómo es un lince ibérico? ¿Cuánto mide, cuánto pesa, cuáles son sus características principales?",
			:thumbnail=> File.open(File.join(Rails.root, 'public/scorm_examples/lince_iberico_thumbnail.jpg')),
			:language => "es",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/scorm_examples/lince_iberico.zip'))

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

		system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Floppybird.zip')
		Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Floppybird.zip'),File.join(Rails.root, 'public/game_template_examples/Floppybird'))
		floppybird = GameTemplate.create! :owner_id => user.id,
			:title=>"Floppy Bird",
			:description=>"Experience the adventure of Floppy Bird, the flying floppy disk, through the world by dodging obstacles",
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Floppybird/thumbnail.png')),
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/game_template_examples/Floppybird.zip'))

		system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Elemental_One.zip')
		Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Elemental_One.zip'),File.join(Rails.root, 'public/game_template_examples/Elemental_One'))
		elementalOne = GameTemplate.create! :owner_id => user.id,
			:title=>"Elemental One",
			:description=>"A simple platformer game",
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Elemental_One/thumbnail.png')),
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/game_template_examples/Elemental_One.zip'))

		system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Pacman.zip')
		Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Pacman.zip'),File.join(Rails.root, 'public/game_template_examples/Pacman'))
		pacman = GameTemplate.create! :owner_id => user.id,
			:title=>"Pac-Man",
			:description=>"Pac-Man: The classic arcade game",
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Pacman/thumbnail.png')),
			:language => "en",
			:height => 750,
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/game_template_examples/Pacman.zip'))

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
			:description=>"Defeat waves of aliens with a laser cannon to earn as many points as possible in this arcade shooting game",
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Space_Invaders/thumbnail.png')),
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/game_template_examples/Space_Invaders.zip'))

		#4: Create games
		#With oArena template
		oArenaTablaPeriodica = Game.create! :owner_id => user.id,
			:game_template_id=>oArena.id,
			:title=>"Aprende la tabla periódica con Onslaught Arena",
			:description=>"Juego educativo basado en el juego Onslaught Arena para aprender los elementos de la tabla periódica",
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Onslaught_Arena/thumbnail.jpg')),
			:language => "es",
			:certified => true
			
		#Event mapping for oArenaTablaPeriodica
		((sfTablaPeriodica.los).map{|lo| lo.id}).uniq.each do |lo_id|
			GameEventMapping.create! :game_id => oArenaTablaPeriodica.id, 
				:game_template_event_id => oArena.events.first.id, 
				:lo_id => lo_id
		end

		oArenaWeapons = Game.create! :owner_id => user.id,
			:game_template_id=>oArena.id,
			:title=>"Onslaught Arena: Ancient Weapons",
			:description=>"Example of educational game based on Onslaught Arena",
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Onslaught_Arena/thumbnail.jpg')),
			:language => "en",
			:certified => true
			
		#Event mapping for oArenaWeapons
		((sfAncientWeapons1.los + sfAncientWeapons2.los).map{|lo| lo.id}).uniq.each do |lo_id|
			GameEventMapping.create! :game_id => oArenaWeapons.id, 
				:game_template_event_id => oArena.events.first.id, 
				:lo_id => lo_id
		end

		#With Sokoban template
		sokobanReciclaje = Game.create! :owner_id => user.id,
			:game_template_id=>sokoban.id,
			:title=>"Sokoban",
			:description=>"Aprende a reciclar jugando a Sokoban", 
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_thumbnails/devilAvatar.png')),
			:certified => true

		#Event mapping for sokobanReciclaje
		((sfReciclaje.los).map{|lo| lo.id}).uniq.each do |lo_id|
			GameEventMapping.create! :game_id => sokobanReciclaje.id, 
				:game_template_event_id => sokoban.events.first.id, 
				:lo_id => lo_id
		end

		#With Natural Park template
		nParkLince = Game.create! :owner_id => user.id,
			:game_template_id=>nPark.id,
			:title=>"Parque Natural",
			:description=>"Explora un parque natural y aprende sobre el lince ibérico", 
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Natural_Park/thumbnail.png')),
			:language => "es",
			:certified => true
	
		#Event mapping for nParkLince
		((sfLince.los).map{|lo| lo.id}).uniq.each do |lo_id|
			GameEventMapping.create! :game_id => nParkLince.id, 
				:game_template_event_id => nPark.events.first.id, 
				:lo_id => lo_id
		end

		#With Space Invaders template
		spaceInvadersReciclaje = Game.create! :owner_id => user.id,
			:game_template_id=>spaceInvaders.id,
			:title=>"Aprende a reciclar con Space Invaders",
			:description=>"Aprende sobre los diferentes contenedores de reciclaje jugando a Space Invaders", 
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Space_Invaders/thumbnail.png')),
			:certified => true
	
		#Event mapping for spaceInvadersReciclaje
		((sfReciclaje.los).map{|lo| lo.id}).uniq.each do |lo_id|
			GameEventMapping.create! :game_id => spaceInvadersReciclaje.id, 
				:game_template_event_id => spaceInvaders.events.first.id, 
				:lo_id => lo_id
		end

		#With Floppybird template
		floppybirdTablaPeriodica = Game.create! :owner_id => user.id,
			:game_template_id=>floppybird.id,
			:title=>"Aprende la tabla periódica con Floppy Bird",
			:description=>"Juego educativo basado en Floppy Bird para aprender los elementos de la tabla periódica", 
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Floppybird/thumbnail.png')),
			:language => "es",
			:certified => true
	
		#Event mapping for floppybirdTablaPeriodica
		((sfTablaPeriodica.los).map{|lo| lo.id}).uniq.each do |lo_id|
			GameEventMapping.create! :game_id => floppybirdTablaPeriodica.id, 
				:game_template_event_id => floppybird.events.first.id, 
				:lo_id => lo_id
		end

		floppybirdMaths1 = Game.create! :owner_id => user.id,
			:game_template_id=>floppybird.id,
			:title=>"Aprende matemáticas con Floppy Bird",
			:description=>"Juego educativo basado en Floppy Bird para aprender matemáticas", 
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Floppybird/thumbnail.png')),
			:language => "es",
			:certified => true
	
		#Event mapping for floppybirdMaths1
		((sfMaths1.los).map{|lo| lo.id}).uniq.each do |lo_id|
			GameEventMapping.create! :game_id => floppybirdMaths1.id, 
				:game_template_event_id => floppybird.events.first.id, 
				:lo_id => lo_id
		end

		#With ElementalOne template
		elementalOnePlanta = Game.create! :owner_id => user.id,
			:game_template_id=>elementalOne.id,
			:title=>"Aprende las partes de una planta con Elemental One",
			:description=>"Juego educativo basado en Elemental One para aprender las partes de una planta mediante una infografía interactiva y cuestionarios", 
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Elemental_One/thumbnail.png')),
			:certified => true
	
		#Event mapping for elementalOnePlanta
		((sfPlanta.los).map{|lo| lo.id}).uniq.each do |lo_id|
			GameEventMapping.create! :game_id => elementalOnePlanta.id, 
				:game_template_event_id => elementalOne.events.first.id, 
				:lo_id => lo_id
		end

		elementalOneReciclaje = Game.create! :owner_id => user.id,
			:game_template_id=>elementalOne.id,
			:title=>"Aprende a reciclar con Elemental One",
			:description=>"Juego educativo basado en Elemental One para aprender sobre los diferentes contenedores de reciclaje", 
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Elemental_One/thumbnail.png')),
			:certified => true

		#Event mapping for elementalOneReciclaje
		((sfReciclaje.los).map{|lo| lo.id}).uniq.each do |lo_id|
			GameEventMapping.create! :game_id => elementalOneReciclaje.id, 
				:game_template_event_id => elementalOne.events.first.id, 
				:lo_id => lo_id
		end

		#With Pacman template
		pacmanEnglish = Game.create! :owner_id => user.id,
			:game_template_id=>pacman.id,
			:title=>"Learn English playing Pacman",
			:description=>"Learn english vocabulary while playing with Pac-Man, the classic arcade game",
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Pacman/thumbnail.png')),
			:language => "en",
			:certified => true
	
		#Event mapping for pacmanEnglish
		((sfEnglish1.los).map{|lo| lo.id}).uniq.each do |lo_id|
			GameEventMapping.create! :game_id => pacmanEnglish.id, 
				:game_template_event_id => pacman.events.first.id, 
				:lo_id => lo_id
		end

		#Wave 2
		Rake::Task["db:install_wave2"].invoke

		#Create editor data
		Rake::Task["fix:createEditorData"].invoke

		puts "Populate finished"
		t2 = Time.now - t1
		puts "Elapsed time:" + t2.to_s
	end

	#bundle exec rake db:install_wave2
	task :install_wave2 => :environment do
		desc "Populate database for SGAME Platform (Wave 2)"
		t1 = Time.now

		#1: Get Demo user
		#1: Create demo user
		user = User.find_by_email("demo@sgame.dit.upm.es")

		#2: Create SCORM packages and Learning Objects

		#3: Create game templates
		# Events of the game templates are created based on the sgame_events_json.json file
		system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Captain_Rogers.zip')
		Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Captain_Rogers.zip'),File.join(Rails.root, 'public/game_template_examples/Captain_Rogers'))
		cRogers = GameTemplate.create! :owner_id => user.id,
			:title=>"Captain Rogers",
			:description=>"It's simple, yet very engaging game about brave Captain Rogers and his escape through an asteroid field. Tap the screen to fly up, release to fly down. Collect the stars and shields, avoid asteroids and mines. Grab the bomb to blow up everything on screen!", 
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Captain_Rogers/thumbnail.png')),
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/game_template_examples/Captain_Rogers.zip'))

		system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Circus.zip')
		Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Circus.zip'),File.join(Rails.root, 'public/game_template_examples/Circus'))
		cCircus = GameTemplate.create! :owner_id => user.id,
			:title=>"Circus Charly",
			:description=>"Circus Charly is an arcade platform game in which the player controls a clown who has to avoid obstacles such as fire rings", 
			:thumbnail=> File.open(File.join(Rails.root, 'public/game_template_examples/Circus/thumbnail.png')),
			:language => "en",
			:certified => true,
			:file =>  File.open(File.join(Rails.root, 'public/game_template_examples/Circus.zip'))

		puts "Populate finished"
		t2 = Time.now - t1
		puts "Elapsed time:" + t2.to_s
	end

end