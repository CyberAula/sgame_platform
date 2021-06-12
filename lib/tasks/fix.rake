# encoding: utf-8

namespace :fix do

  #Usage
  #Development:   bundle exec rake fix:resetScormTimestamps
  #In production: bundle exec rake fix:resetScormTimestamps RAILS_ENV=production
  task :resetScormTimestamps => :environment do
    printTitle("Reset SCORM timestamps")

    Presentation.all.map { |p| 
      p.update_column :scorm2004_timestamp, nil
      p.update_column :scorm12_timestamp, nil
    }
    Game.all.map { |g| 
      g.update_column :scorm2004_timestamp, nil
      g.update_column :scorm12_timestamp, nil
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

    #Wave 2
    system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Captain_Rogers.zip')
    Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Captain_Rogers.zip'),File.join(Rails.root, 'public/game_template_examples/Captain_Rogers'))
    gt = GameTemplate.find_by_title("Captain Rogers")
    unless gt.nil?
      gt.file = File.open(File.join(Rails.root, 'public/game_template_examples/Captain_Rogers.zip'))
      gt.save!
    end

    system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Circus.zip')
    Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Circus.zip'),File.join(Rails.root, 'public/game_template_examples/Circus'))
    gt = GameTemplate.find_by_title("Circus Charly")
    unless gt.nil?
      gt.file = File.open(File.join(Rails.root, 'public/game_template_examples/Circus.zip'))
      gt.save!
    end

    system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/SudokuJS.zip')
    Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/SudokuJS.zip'),File.join(Rails.root, 'public/game_template_examples/SudokuJS'))
    gt = GameTemplate.find_by_title("Sudoku")
    unless gt.nil?
      gt.file = File.open(File.join(Rails.root, 'public/game_template_examples/SudokuJS.zip'))
      gt.save!
    end
    
    printTitle("Task finished")
  end

  #Usage
  #Development:   bundle exec rake fix:removeResourcesWithoutOwner
  #In production: bundle exec rake fix:removeResourcesWithoutOwner RAILS_ENV=production
  task :removeResourcesWithoutOwner => :environment do
    printTitle("Remove resources without owner")
    ["Presentation","Document","Scormfile","Pdfp","Game","GameTemplate"].each do |c|
      c.constantize.select{|r| r.owner.nil?}.each do |r| 
        r.destroy 
      end
    end

    printTitle("Task Finished")
  end

  #Usage
  #Development:   bundle exec rake fix:cleanUnusedDocuments
  #In production: bundle exec rake fix:cleanUnusedDocuments RAILS_ENV=production
  task :cleanUnusedDocuments => :environment do
    printTitle("Cleaning unused documents")
    maxDays = 500

    Document.all.each do |d|
      if File.file?(d.file.path)
        atime = File.atime(d.file.path)
        diffInDays = ((Time.now - atime)/(86400)).round(0)
        if diffInDays > maxDays
          puts "Document with title '" + d.title + "'. Days since last access (>" + maxDays.to_s + "): " + diffInDays.to_s + ". URL: " + d.file.url
          d.destroy
        end
      else
        puts "Destroy document wihtout file " + d.title
        d.destroy
      end
    end

    printTitle("Task Finished")
  end

  #Usage
  #Development:   bundle exec rake fix:cleanUnusedPdfps
  #In production: bundle exec rake fix:cleanUnusedPdfps RAILS_ENV=production
  task :cleanUnusedPdfps => :environment do
    printTitle("Cleaning unused pdfps")
    maxDays = 500

    Pdfp.all.each do |pdfp|
      if File.file?(pdfp.attach.path)
        folderPath = File.dirname(pdfp.attach.path)
        imgs = Dir.glob("#{folderPath}/*.jpg")
        removedImgs = 0
        imgs.each do |img|
          atime = File.atime(img)
          diffInDays = ((Time.now - atime)/(86400)).round(0)
          if diffInDays > maxDays
            system ("rm "+ img) if File.exists? (img)
            removedImgs = removedImgs + 1
          end
        end
        if removedImgs == imgs.length
          pdfp.destroy
        end
      else
        pdfp.destroy
      end
    end

    printTitle("Task Finished")
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