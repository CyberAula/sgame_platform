# encoding: utf-8

class Utils

  #################
  # Languages Utils
  #################

  def self.valid_locale?(locale)
    locale.is_a? String and I18n.available_locales.include? locale.to_sym
  end

  def self.getAllLanguages
    I18n.available_locales.map{|l| l.to_s}
  end

  #Translate ISO 639-1 codes to readable language names
  def self.getReadableLanguage(lanCode="")
    I18n.t("languages." + lanCode.to_s, :default => lanCode.to_s)
  end

  #Change URLs to https when clientProtocol is HTTPs
  def self.checkUrlProtocol(url,clientProtocol)
    return url unless url.is_a? String and clientProtocol.include?("https")
    protocolMatch = url.scan(/^https?:\/\//)
    return url if protocolMatch.blank?

    urlProtocol = protocolMatch[0].sub(":\/\/","")
    clientProtocol = clientProtocol.sub(":\/\/","")

    if (urlProtocol != clientProtocol)
      case(clientProtocol)
        when "https"
          #Try to load HTTP url over HTTPs
          url = "https" + url.sub(urlProtocol,"") #replace first
        when "http"
          #Try to load HTTPs url over HTTP. Do nothing.
        else
         #Document is not loaded over HTTP or HTTPs. Do nothing.
        end
    end
    return url
  end

  def self.getResourceTypes
    ["Presentation","Document","Scormfile","Game"]
  end

  #ZipFile Utils
  def self.extract_folder(zipFilePath,destination)
    require "fileutils"
    FileUtils.mkdir_p(destination)
    
    Zip::File.open(zipFilePath) { |zip_file|
      zip_file.each { |f|
        f_path = File.join(destination, f.name)
        FileUtils.mkdir_p(File.dirname(f_path))
        zip_file.extract(f, f_path) unless File.exist?(f_path)
      }
    }
  end

  def self.zip_folder(zipFilePath,root,dir=nil)
    dir = root unless dir

    folderNames = []
    fileNames = []
    Dir.entries(dir).reject{|i| i.start_with?(".")}.each do |itemName|
      itemPath = "#{dir}/#{itemName}"
      if File.directory?(itemPath)
        folderNames << itemName
      elsif File.file?(itemPath)
        fileNames << itemName
      end
    end

    #Subdirectories
    folderNames.each do |subFolderName|
      zip_folder(zipFilePath,root,"#{dir}/#{subFolderName}")
    end

    #Files
    if fileNames.length > 0
      Zip::File.open(zipFilePath, Zip::File::CREATE) { |zipfile|
        fileNames.each do |fileName|
          filePathInZip = String.new("#{dir}/#{fileName}").sub(root + "/","")
          zipfile.add(filePathInZip,"#{dir}/#{fileName}")
        end
      }
    end
  end

end