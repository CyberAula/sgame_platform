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