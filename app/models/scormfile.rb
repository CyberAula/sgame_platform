class Scormfile < ActiveRecord::Base
  include Item
  include Extractable
  acts_as_ordered_taggable
  
  belongs_to :owner, :class_name => 'User', :foreign_key => "owner_id"

  after_destroy :remove_unpackaged_files
  after_destroy :remove_los
  after_create :unpackage
  after_create :extract_los

  has_attached_file :file,
                    :url => '/:class/:id.:extension',
                    :path => ':rails_root/documents/:class/:id_partition/:filename.:extension'
  has_attached_file :thumbnail,
    :styles => SgamePlatform::Application.config.thumbnail_styles

  before_validation :fill_package_params, :only => [:create]
  before_validation :fill_scorm_version
  after_save :fill_thumbnail_url

  validates_attachment_presence :file
  validates_attachment :file, content_type: { content_type: ["application/zip"] }
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


  private

  def fill_thumbnail_url
    if self.thumbnail.exists?
      new_thumbnail_url = self.thumbnail.url(:default, :timestamp => false)
    else
      new_thumbnail_url = "/assets/scormfile_icon.png"
    end
    self.update_column(:thumbnail_url, new_thumbnail_url) if self.thumbnail_url != new_thumbnail_url
  end

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
    scormWrapperFile = DocumentsController.new.render_to_string "show_scorm_wrapper.html.erb", :locals => {:scormPackage => self}, :layout => false
    scormWrapperFilePath = loDirectoryPath + "/scorm_wrapper.html"
    File.open(scormWrapperFilePath, "w"){|f| f << scormWrapperFile }
    
    #LO paths are saved as absolute paths when APP_CONFIG["code_path"] is defined
    loDirectoryPathToSave = loDirectoryPath.dup
    loDirectoryPathToSave.slice! (Rails.root.to_s+"/") if SgamePlatform::Application.config.APP_CONFIG["code_path"].nil?
    self.update_column(:lopath, loDirectoryPathToSave)
  end

  def extract_los
    if self.file.queued_for_write[:original] and File.exists?(self.file.queued_for_write[:original].path)
      zipFile = self.file.queued_for_write[:original]
    else
      zipFile = self.file
    end
    Scorm::Package.open(zipFile, :cleanup => false) do |pkg|
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
    self.update_column(:nscos, self.los.select{|lo| lo.lo_type == "sco"}.length)
    self.update_column(:nassets, self.los.select{|lo| lo.lo_type == "asset"}.length)
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

  def remove_unpackaged_files
    require "fileutils"
    FileUtils.rm_rf(self.lopath) if File.exists? self.lopath
  end
  
end