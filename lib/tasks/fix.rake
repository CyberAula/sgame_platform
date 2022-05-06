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

    #Wave 3
    system "rm -rf " + File.join(Rails.root, 'public/game_template_examples/Infinite_Mario.zip')
    Utils.zip_folder(File.join(Rails.root, 'public/game_template_examples/Infinite_Mario.zip'),File.join(Rails.root, 'public/game_template_examples/Infinite_Mario'))
    gt = GameTemplate.find_by_title("Infinite Mario")
    unless gt.nil?
      gt.file = File.open(File.join(Rails.root, 'public/game_template_examples/Infinite_Mario.zip'))
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
          #puts "Document with title '" + d.title + "'. Days since last access (>" + maxDays.to_s + "): " + diffInDays.to_s + ". URL: " + d.file.url
          d.destroy
        end
      else
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

  #Usage
  #Development:   bundle exec rake fix:cleanUnusedScormfiles
  #In production: bundle exec rake fix:cleanUnusedScormfiles RAILS_ENV=production
  task :cleanUnusedScormfiles => :environment do
    printTitle("Cleaning unused scormfiles")
    maxDays = 500

    Scormfile.all.each do |sf|
      if File.file?(sf.file.path)
        folderPath = File.dirname(sf.file.path)

        Dir[folderPath + "/*"].select{|path| path != sf.file.path}.each do |path|
          require 'fileutils'
          if File.directory?(path)
            FileUtils.rm_rf(path)
          end
        end

        unpackagedScormPath = Rails.root.join('public', 'code', 'scormfiles', sf.id.to_s).to_s
        if File.directory?(unpackagedScormPath)
          atime = Dir[unpackagedScormPath + "/*"].map{|f| File.atime(f)}.max || 0
          diffInDays = ((Time.now - atime)/(86400)).round(0)
          if diffInDays > maxDays
            sf.destroy
          end
        end
      else
        sf.destroy
      end
    end

    printTitle("Task Finished")
  end

  #Usage
  #Development:   bundle exec rake fix:gameEditorDataForV2
  #In production: bundle exec rake fix:gameEditorDataForV2 RAILS_ENV=production
  task :gameEditorDataForV2 => :environment do
    printTitle("Fixing game settings")
    
    Game.all.each do |g|
      if g.editor_data
        needUpdate = false
        editor_data = JSON(g.editor_data)
        if editor_data["settings"] and editor_data["settings"]["completion_notification"] === "all_los_succesfully_consumed"
          editor_data["settings"]["completion_notification"] = "all_los_successfully_consumed"
          needUpdate = true
        end
        if editor_data["sequencing"] and editor_data["sequencing"]["sequence"] and ["linear_success","linear_completion"].include?(editor_data["sequencing"]["approach"])
          editor_data["sequencing"]["sequence"].each do |groupId,group|
            if group.key?("condition") == false and group.key?("conditions") == true
              multipleCondition = {id:1, type: "multiple", operator: "AND", conditions: group["conditions"]}
              multipleCondition[:conditions].each_with_index do |condition,index|
                multipleCondition[:conditions][index]["id"] = (index+2)
                multipleCondition[:conditions][index]["type"] = "single"
              end
              group["condition"] = multipleCondition
              group.delete("conditions")
              editor_data["sequencing"]["sequence"][groupId] = group
              needUpdate = true
            end
          end
        end
        g.update_column :editor_data, editor_data.to_json if needUpdate
      end
    end

    printTitle("Task Finished")
  end

  #Usage
  #Development:   bundle exec rake fix:domain
  #In production: bundle exec rake fix:domain RAILS_ENV=production
  task :domain => :environment do
    printTitle("Changing domain")
    
    oldDomain = "sgame.dit.upm.es"
    newDomain = "sgame.etsisi.upm.es"

    #Presentations
    Presentation.all.each do |p|
      unless p.thumbnail_url.blank?
        p.update_column :thumbnail_url, p.thumbnail_url.gsub(oldDomain, newDomain)
      end
      p.update_column :json, p.json.gsub(oldDomain, newDomain)
    end

    #SCORM files
    Scormfile.all.each do |sc|
      sc.update_column :lohreffull, sc.lohreffull.gsub(oldDomain, newDomain)
      scLoPath = sc.lopath
      if File.exists? scLoPath
        ["scorm_wrapper.html","imsmanifest.xml","presentation.html"].each do |file|
          filePath = scLoPath + "/" + file
          system "sed -i 's/" + oldDomain + "/" + newDomain + "/g' " + filePath if File.exists? filePath
        end

        scFilePath = sc.file.path rescue nil
        if scFilePath.nil? == false and File.exists? scFilePath
          FileUtils.rm_rf(scFilePath)
          Utils.zip_folder(scFilePath,scLoPath)
        end
      end
    end

    Lo.all.each do |lo|
      lo.update_column :hreffull, lo.hreffull.gsub(oldDomain, newDomain) unless lo.hreffull.blank?
      lo.update_column :metadata, lo.metadata.gsub(oldDomain, newDomain) unless lo.metadata.blank?
    end

    Game.all.each do |g|
      g.update_column :editor_data, g.editor_data.gsub(oldDomain, newDomain) unless g.editor_data.blank?
    end
    
    printTitle("Task Finished")
  end

  #Usage
  #Development:   bundle exec rake fix:removeFilesFromDeletedScormfiles
  #In production: bundle exec rake fix:removeFilesFromDeletedScormfiles RAILS_ENV=production
  task :removeFilesFromDeletedScormfiles => :environment do
    printTitle("Removing files from deleted scormfiles")
    
    scormFiles = Scormfile.all
    scormfilesDirectory = Rails.root.join('documents', 'scormfiles').to_s
    if File.directory?(scormfilesDirectory)
      Dir[scormfilesDirectory  + "/*/*/*"].each do |sf|
        unless scormFiles.select{|s| s.file.path.include? sf}.length > 0
          #Remove file
          FileUtils.rm_rf(sf)
        end
      end
    end

    printTitle("Task Finished")
  end

  #Usage
  #Development:   bundle exec rake fix:removeFoldersFromScormfiles
  #In production: bundle exec rake fix:removeFoldersFromScormfiles RAILS_ENV=production
  task :removeFoldersFromScormfiles => :environment do
    printTitle("Removing unzipped folders from scormfiles")
    
    scormFiles = Scormfile.all
    scormfilesDirectory = Rails.root.join('documents', 'scormfiles').to_s
    if File.directory?(scormfilesDirectory)
      Dir[scormfilesDirectory  + "/*/*/*/*"].each do |f|
        FileUtils.rm_rf(f) if File.directory? f
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