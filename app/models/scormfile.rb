class Scormfile < ActiveRecord::Base
  include Item
  include Extractable
  acts_as_ordered_taggable
  
  belongs_to :owner, :class_name => 'User', :foreign_key => "owner_id"

  has_attached_file :file,
                    :url => '/:class/:id.:extension',
                    :path => ':rails_root/documents/:class/:id_partition/:filename.:extension'
  has_attached_file :thumbnail,
                    :styles => SgamePlatform::Application.config.thumbnail_styles

  before_validation :fill_package_params, :only => [:create]
  before_validation :fill_scorm_version
  before_save :check_changes
  after_save :fill_thumbnail_url
  after_save :updateScormfileIfNeeded
  after_destroy :remove_unpackaged_files
  after_destroy :remove_los

  validates_attachment_presence :file
  validates_attachment :file, content_type: { content_type: ["application/zip","application/x-zip-compressed"] }
  validates_presence_of :owner_id
  validate :owner_validation
  validates_presence_of :title
  validates_presence_of :lohref
  validates_inclusion_of :scorm_version, in: ["1.2","2004"], :allow_blank => false, :message => "Invalid SCORM version. Only SCORM 1.2 and 2004 are supported"
  validates_presence_of :schema, :message => "Invalid SCORM package. Schema is not defined."
  validates_presence_of :schema_version, :message => "Invalid SCORM package. Schema version is not defined."


  def url_full
    SgamePlatform::Application.config.full_code_domain + "/code/scormfiles/" + self.id.to_s + "/scorm_wrapper.html"
  end

  def resource_version
    self.schema + " " + self.schema_version
  end

  def updateScormfile
    self.extract_los
    self.unpackage
  end

  def extract_los
    if self.file.queued_for_write[:original] and File.exists?(self.file.queued_for_write[:original].path)
      zipFile = self.file.queued_for_write[:original]
    else
      zipFile = self.file
    end
    currentLos = self.los
    addedHrefs = []
    Scorm::Package.open(zipFile, :cleanup => true, :force_cleanup_on_close => true) do |pkg|
      pkg.manifest.resources.each_with_index do |resource,i|
        lo = currentLos.find_by_resource_identifier(resource.id)
        lo = Lo.new if lo.nil?
        lo.resource_identifier = resource.id
        lo.container_type = self.class.name
        lo.container_id = self.id
        lo.standard = "SCORM"
        lo.standard_version = self.scorm_version
        lo.schema_version = self.schema_version
        lo.lo_type = resource.scorm_type if ["sco","asset"].include? resource.scorm_type
        lo.rdata = (lo.lo_type == "sco" and self.rdata)
        lo.resource_index = i+1
        lo.href = resource.href
        lo.hreffull = SgamePlatform::Application.config.full_code_domain + "/code/scormfiles/" + self.id.to_s + "/" + lo.href

        loMetadata = {}
        if !resource.metadata.blank?
          loMetadata = resource.metadata
        elsif (i===0 && pkg.manifest && !pkg.manifest.metadata.blank? && pkg.manifest.resources.length === 1)
          loMetadata = pkg.manifest.metadata
        end
        loMetadata = Scormfile.parse_metadata(loMetadata)
        lo.metadata = loMetadata.nil? ? {}.to_json : loMetadata

        lo.save!
        addedHrefs.push(lo.href)
      end
    end
    if addedHrefs.length > 0
      losToDestroy = self.los.where("href not in (?)", addedHrefs)
    else
      losToDestroy = self.los
    end

    losToDestroy.each do |lo|
      lo.destroy
    end

    self.update_column(:nscos, self.los.select{|lo| lo.lo_type == "sco"}.length)
    self.update_column(:nassets, self.los.select{|lo| lo.lo_type == "asset"}.length)
  end

  def unpackage
    require "fileutils"

    #Create folders
    if SgamePlatform::Application.config.APP_CONFIG["code_path"].nil?
      scormPackagesDirectoryPath = Rails.root.join('public', 'code', 'scormfiles').to_s
    else
      scormPackagesDirectoryPath = SgamePlatform::Application.config.APP_CONFIG["code_path"] + "/scormfiles"
    end
    FileUtils.mkdir_p(scormPackagesDirectoryPath)
    loDirectoryPath = scormPackagesDirectoryPath + "/" + self.id.to_s
    FileUtils.rm_rf(loDirectoryPath) if File.exists? loDirectoryPath

    #Unpackage zip file
    if self.file.queued_for_write[:original] and File.exists?(self.file.queued_for_write[:original].path)
      zipFile = self.file.queued_for_write[:original]
    else
      zipFile = self.file
    end
    Scorm::Package.open(zipFile, :cleanup => true) do |pkg|
      FileUtils.move pkg.path, loDirectoryPath
    end

    self.update_column(:lohreffull, SgamePlatform::Application.config.full_code_domain + "/code/scormfiles/" + self.id.to_s + "/" + self.lohref)

    #Add SCORM Wrapper (scorm_wrapper.html)
    scormWrapperFile = DocumentsController.new.render_to_string "documents/show_scorm_wrapper", :locals => {:scormPackage => self}, :layout => false
    scormWrapperFilePath = loDirectoryPath + "/scorm_wrapper.html"
    File.open(scormWrapperFilePath, "w"){|f| f << scormWrapperFile }
    
    #LO paths are saved as absolute paths when APP_CONFIG["code_path"] is defined
    loDirectoryPathToSave = loDirectoryPath.dup
    loDirectoryPathToSave.slice! (Rails.root.to_s+"/") if SgamePlatform::Application.config.APP_CONFIG["code_path"].nil?
    self.update_column(:lopath, loDirectoryPathToSave)
  end

  def self.parse_metadata(metadata)
    json_metadata = JSON.parse((YAML.load(YAML.dump(metadata))).to_json) rescue nil
    return nil if json_metadata.nil?
    adapt_json_metadata(json_metadata).to_json rescue nil
  end

  def self.adapt_json_metadata(field)
    if field.is_a? Hash
      keys = field.keys
      if keys.include?("langstrings") and field["langstrings"].is_a? Hash
        lKeys = field["langstrings"].keys
        if lKeys.blank?
          field = ""
        elsif lKeys.length === 1
          field = field["langstrings"][lKeys[0]]
        elsif
          #Multiple langstrings
          if keys.include?("default_lang") and !field["langstrings"][field["default_lang"]].blank?
            field = field["langstrings"][field["default_lang"]]
          else
            field = field["langstrings"][lKeys[0]]
          end
        end 
      elsif keys.include?("string")
        field = adapt_json_metadata(field["string"])
      else
        keys.each do |key|
          field[key] = adapt_json_metadata(field[key])
        end
      end
    end
    field
  end


  private

  def fill_package_params
    begin
      if self.file.queued_for_write[:original] and File.exists?(self.file.queued_for_write[:original].path)
        zipFile = self.file.queued_for_write[:original]
      else
        zipFile = self.file
      end
      Scorm::Package.open(zipFile, :cleanup => true) do |pkg|
        self.schema = pkg.manifest.schema
        self.schema_version = pkg.manifest.schema_version
        self.lohref = pkg.manifest.resources.first.href
      end
    rescue
    end
  end

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

  def check_changes
    @scormfile_has_changes = (self.file.dirty? or self.rdata_changed?)
    true
  end

  def fill_thumbnail_url
    if self.thumbnail.exists?
      new_thumbnail_url = self.thumbnail.url(:default, :timestamp => false)
    else
      new_thumbnail_url = "/assets/scormfile_icon.png"
    end
    self.update_column(:thumbnail_url, new_thumbnail_url) if self.thumbnail_url != new_thumbnail_url
  end

  def updateScormfileIfNeeded
    self.updateScormfile if @scormfile_has_changes
  end

  def remove_unpackaged_files
    require "fileutils"
    FileUtils.rm_rf(self.lopath) if File.exists? self.lopath
  end
  
end