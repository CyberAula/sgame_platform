# encoding: utf-8

namespace :fix do

  #Usage
  #Development:   bundle exec rake fix:resetScormTimestamps
  #In production: bundle exec rake fix:resetScormTimestamps RAILS_ENV=production
  task :resetScormTimestamps => :environment do
    printTitle("Reset SCORM timestamps")

    Presentation.all.map { |ex| 
      ex.update_column :scorm2004_timestamp, nil
      ex.update_column :scorm12_timestamp, nil
    }
    Game.all.map { |ex| 
      ex.update_column :scorm2004_timestamp, nil
      ex.update_column :scorm12_timestamp, nil
    }

    printTitle("Task Finished")
  end

  #Usage
  #Development:   bundle exec rake fix:updateCodeResources
  #In production: bundle exec rake fix:updateCodeResources RAILS_ENV=production
  task :updateCodeResources => :environment do
    printTitle("Updating code resources")
    Rake::Task["fix:updateScormPackages"].invoke
    printTitle("Task finished")
  end

  #Usage
  #Development:   bundle exec rake fix:updateScormPackages
  #In production: bundle exec rake fix:updateScormPackages RAILS_ENV=production
  task :updateScormPackages => :environment do
    printTitle("Updating SCORM Packages")
    Scormfile.record_timestamps=false

    Scormfile.all.each do |scormfile|
      begin
        scormfile.updateScormfile
      rescue Exception => e
        puts "Exception in Scormfile with id '" + scormfile.id.to_s + "'. Exception message: " + e.message
      end
    end

    Rake::Task["fix:resetScormTimestamps"].invoke

    Scormfile.record_timestamps=true
    printTitle("Task finished")
  end

  #Usage
  #Development:   bundle exec rake fix:createEditorData
  #In production: bundle exec rake fix:createEditorData RAILS_ENV=production
  task :createEditorData => :environment do
    printTitle("Creating data for the SGAME authoring tool for editing the game templates")

    Game.where("editor_data is NULL").each do |g|
      g.create_editor_data
    end

    printTitle("Task finished")
  end

  #Usage
  #Development:   bundle exec rake fix:updateGameTemplates
  #In production: bundle exec rake fix:updateGameTemplates RAILS_ENV=production
  task :updateGameTemplates => :environment do
    printTitle("Updating game templates")

    system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Onslaught_Arena.zip')
    Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Onslaught_Arena.zip'),File.join(Rails.root, 'public/game_template_examples/Onslaught_Arena'))
    gt = GameTemplate.find_by_title("Onslaught Arena")
    gt.file = File.open(File.join(Rails.root, 'public/game_template_examples/Onslaught_Arena.zip'))
    gt.save!

    system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Floppybird.zip')
    Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Floppybird.zip'),File.join(Rails.root, 'public/game_template_examples/Floppybird'))
    gt = GameTemplate.find_by_title("Floppy Bird")
    gt.file = File.open(File.join(Rails.root, 'public/game_template_examples/Floppybird.zip'))
    gt.save!

    system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Elemental_One.zip')
    Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Elemental_One.zip'),File.join(Rails.root, 'public/game_template_examples/Elemental_One'))
    gt = GameTemplate.find_by_title("Elemental One")
    gt.file = File.open(File.join(Rails.root, 'public/game_template_examples/Elemental_One.zip'))
    gt.save!

    system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Pacman.zip')
    Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Pacman.zip'),File.join(Rails.root, 'public/game_template_examples/Pacman'))
    gt = GameTemplate.find_by_title("Pac-Man")
    gt.file = File.open(File.join(Rails.root, 'public/game_template_examples/Pacman.zip'))
    gt.save!

    system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Sokoban.zip')
    Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Sokoban.zip'),File.join(Rails.root, 'public/game_template_examples/Sokoban'))
    gt = GameTemplate.find_by_title("Sokoban")
    gt.file = File.open(File.join(Rails.root, 'public/game_template_examples/Sokoban.zip'))
    gt.save!

    system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Natural_Park.zip')
    Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Natural_Park.zip'),File.join(Rails.root, 'public/game_template_examples/Natural_Park'))
    gt = GameTemplate.find_by_title("Natural Park")
    gt.file = File.open(File.join(Rails.root, 'public/game_template_examples/Natural_Park.zip'))
    gt.save!

    system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Space_Invaders.zip')
    Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Space_Invaders.zip'),File.join(Rails.root, 'public/game_template_examples/Space_Invaders'))
    gt = GameTemplate.find_by_title("Space Invaders")
    gt.file = File.open(File.join(Rails.root, 'public/game_template_examples/Space_Invaders.zip'))
    gt.save!
    
    printTitle("Task finished")
  end

  ####################
  #Task Utils
  ####################

  def printTitle(title)
    if !title.nil?
      puts "#####################################"
      puts title
      puts "#####################################"
    end
  end

  def printSeparator
    puts ""
    puts "--------------------------------------------------------------"
    puts ""
  end

end