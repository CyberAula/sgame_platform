namespace :db do
	task :populate => :environment do
		desc "Populate database for SGAME Platform"

		#1: Create SCORM packages
		zf1 = Zipfile.create :title  => "Golf",
			:description   => "SCORM package that explains everything about golf",
			:thumbnail_url => "/gallery/images/golf1.jpg",
			:file =>  File.open(File.join(Rails.root, 'public/scorm_examples/golf_n_sco.zip'))

		sf1 = Scormfile.createScormfileFromZip(zf1)

		#2: Create game templates
		oArena = GameTemplate.create! :title=>"Onslaught Arena", 
			:description=>"Battle hordes of classic medieval monsters in this fast-paced arcade shooter", 
			:thumbnail_url=>"/gallery/game_OnslaughtArena.jpg"

		#Create the events of the game templates
		oArenaEvent1 = GameTemplateEvent.create! :title=>"Extra weapon", 
			:description=>"Event triggered when the player tries to get a new weapon", 
			:game_template_id=>oArena.id, 
			:id_in_game=>1

		#3: Create games
		#oArena
		oArenaInstance = Game.create! :title=>"Onslaught Arena", 
			:description=>"Onslaught Arena instance example", 
			:thumbnail_url=>"/gallery/gameInstance_OnslaughtArena.jpg", 
			:game_template_id=>oArena.id

		#Event mapping for the oArena game
		(sf1.los.map{|lo| lo.id}).uniq.each do |lo_id|
			GameEventMapping.create! :game_id => oArenaInstance.id, 
				:game_template_event_id => oArenaEvent1.id, 
				:lo_id => lo_id
		end
		
		puts "Populate finish"
	end
end