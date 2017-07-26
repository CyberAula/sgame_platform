class Scormfile < ActiveRecord::Base
  include Item
  include Extractable
  acts_as_ordered_taggable
  
  belongs_to :owner, :class_name => 'User', :foreign_key => "owner_id"

  before_destroy :remove_files #This callback need to be before has_attached_file, to be executed before paperclip callbacks
  after_destroy :remove_los

  has_attached_file :file,
                    :url => '/:class/:id.:extension',
                    :path => ':rails_root/documents/:class/:id_partition/:filename.:extension'

  validates_attachment_presence :file
  validates_attachment :file, content_type: { content_type: ["application/zip"] }
  validates_presence_of :owner_id
  validate :owner_validation
  validates_presence_of :title
  validates_presence_of :lohref
  validates_inclusion_of :scorm_version, in: ["1.2","2004"], :allow_blank => false, :message => "Invalid SCORM version. Only SCORM 1.2 and 2004 are supported"
  validates_presence_of :schema, :message => "Invalid SCORM package. Schema is not defined."
  validates_presence_of :schema_version, :message => "Invalid SCORM package. Schema version is not defined."
  before_validation :fill_scorm_version

  def self.createScormfileFromZip(zipfile)
    begin
      resource = Scormfile.new
      resource.owner_id = zipfile.owner_id
      resource.title = zipfile.title
      resource.description = zipfile.description
      resource.thumbnail_url = zipfile.thumbnail_url

      #Copy attachment
      resource.file = zipfile.file

      #Unpack the SCORM package and fill the lourl, lopath, zipurl and zippath fields
      #If the Package is not correct, SCORM::Package.open will raise an exception
      pkgPath = nil
      Scorm::Package.open(zipfile.file, :cleanup => true) do |pkg|
        resource.schema = pkg.manifest.schema
        resource.schema_version = pkg.manifest.schema_version
        resource.lohref = pkg.manifest.resources.first.href
        pkgPath = pkg.path
      end

      raise "No resource has been found" if pkgPath.nil? or resource.lohref.nil?

      #Save the resource to get its id
      resource.save!

      resource.updateScormfile(pkgPath)

      resource.extract_los

      #Remove previous ZIP file
      zipfile.destroy

      return resource
    rescue Exception => e
      begin
        #Remove previous ZIP file
        zipfile.destroy
      rescue
      end

      errorMsgMaxLength = 255
      if e.message.length > errorMsgMaxLength
        errorMsg =  e.message[0,errorMsgMaxLength] + "..."
      else
        errorMsg = e.message
      end
      return "Invalid SCORM package (" + errorMsg + ")"
    end
  end

  def updateScormfile(pkgPath=nil)

    #Deal with blank pkgPath or undefined mandatory fields
    if pkgPath.blank? or ["schema","schema_version","lohref"].select{|f| self.send(f).blank?}.length > 1
      #We need to unpack the SCORM file
      unless self.file.blank?
        Scorm::Package.open(self.file, :cleanup => true) do |pkg|
          self.schema = pkg.manifest.schema
          self.schema_version = pkg.manifest.schema_version
          self.lohref = pkg.manifest.resources.first.href
          pkgPath = pkg.path
        end
      else
        raise "No file has been found. This SCORM package is corrupted."
      end
    end
    loURLRoot = SgamePlatform::Application.config.full_code_domain + "/code/scormfiles/" + self.id.to_s

    #Create folders
    if SgamePlatform::Application.config.APP_CONFIG["code_path"].nil?
      scormPackagesDirectoryPath = Rails.root.join('public', 'code', 'scormfiles').to_s
    else
      scormPackagesDirectoryPath = SgamePlatform::Application.config.APP_CONFIG["code_path"] + "/scormfiles"
    end
    loDirectoryPath = scormPackagesDirectoryPath + "/" + self.id.to_s
    
    require "fileutils"
    FileUtils.mkdir_p(scormPackagesDirectoryPath)
    FileUtils.rm_rf(loDirectoryPath) if File.exists? loDirectoryPath
    FileUtils.move pkgPath, loDirectoryPath

    #URLs are saved as absolute URLs
    #ZIP paths are always saved as relative paths (the same as the rest of the documents)
    #LO paths are saved as absolute paths when APP_CONFIG["code_path"] is defined
    resourceRelativePath = self.file.path
    resourceRelativePath.slice! Rails.root.to_s

    loDirectoryPathToSave = loDirectoryPath.dup
    loDirectoryPathToSave.slice! Rails.root.to_s if SgamePlatform::Application.config.APP_CONFIG["code_path"].nil?

    self.zipurl = SgamePlatform::Application.config.full_domain + "/" + self.file.url[1..-1]
    self.zippath = resourceRelativePath
    self.lopath = loDirectoryPathToSave
    self.lourl = loURLRoot + "/scorm_wrapper.html"
    self.lohreffull = loURLRoot + "/" + self.lohref

    #Generate wrapper HTML (scorm_wrapper.html)
    scormWrapperFile = DocumentsController.new.render_to_string "show_scorm_wrapper.html.erb", :locals => {:scormPackage => self}, :layout => false
    scormWrapperFilePath = loDirectoryPath + "/scorm_wrapper.html"
    File.open(scormWrapperFilePath, "w"){|f| f << scormWrapperFile }

    self.save!
  end

  #Return version to show in metadata UI
  def resource_version
    self.schema + " " + self.schema_version
  end

  def getZipPath
    # ZIP paths are always saved as relative paths (the same as the rest of the documents)
    # return Rails.root.to_s + self.zippath
    self.file.path
  end

  def getLoPath
    #LO paths are saved as relative paths when APP_CONFIG["code_path"] is not defined
    return Rails.root.to_s + self.lopath if SgamePlatform::Application.config.APP_CONFIG["code_path"].nil?
    #LO paths are saved as absolute paths when APP_CONFIG["code_path"] is defined
    return self.lopath
  end

  def thumbnail_url
    "/assets/scormfile_icon.png"
  end

  def extract_los
    Scorm::Package.open(self.file, :cleanup => false) do |pkg|
      pkg.manifest.resources.each do |resource|
        lo = Lo.new
        lo.container_type = self.class.name
        lo.container_id = self.id
        lo.standard = "SCORM"
        lo.standard_version = self.scorm_version
        lo.schema_version = self.schema_version
        if ["sco","asset"].include? resource.scorm_type
          lo.lo_type = resource.scorm_type
        end
        if lo.lo_type == "asset"
          lo.rdata = false
        else
          lo.rdata = true
        end
        lo.href = resource.href
        lo.hreffull = SgamePlatform::Application.config.full_code_domain + "/code/scormfiles/" + self.id.to_s + "/" + lo.href
        lo.metadata = Scormfile.parse_metadata(resource.metadata)
        lo.save!
      end
    end
  end

  def self.parse_metadata(metadata)
    metadata = YAML.dump(metadata)
    metadata = JSON.parse({}.merge(YAML.load(metadata)).to_json) rescue nil
    return nil if metadata.nil?
    parse_metadata_field(metadata)
  end

  def self.parse_metadata_field(field)
    if field.is_a? Hash
      field.keys.each do |key|
        field[key] = parse_metadata_field(field[key])
      end
    else
      field = field.gsub(/'/,"").gsub(/\"/,"") if field.is_a? String
    end
    field
  end


  private

  def fill_scorm_version
    if self.schema == "ADL SCORM" and !self.schema_version.blank?
      if (self.schema_version.scan(/2004\s[\w]+\sEdition/).length > 0) or (self.schema_version == "CAM 1.3")
        self.scorm_version = "2004"
      else
        self.scorm_version = self.schema_version
      end
    end
    if self.schema.blank? and self.schema_version.blank?
      #Some ATs create SCORM 1.2 Packages without specifying schema data
      self.schema = "ADL SCORM"
      self.schema_version = "1.2"
      self.scorm_version = "1.2" 
    end
  end

  def remove_files
    #Remove SCORM files from the public folder
    require "fileutils"
    FileUtils.rm_rf(self.getLoPath())
  end
  
end