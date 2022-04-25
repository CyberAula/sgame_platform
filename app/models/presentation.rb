require 'builder'

class Presentation < ActiveRecord::Base
  include ActionDispatch::Routing::PolymorphicRoutes
  include Rails.application.routes.url_helpers
  include Item
  include Extractable
  acts_as_ordered_taggable

  belongs_to :owner, :class_name => 'User', :foreign_key => "owner_id"

  validates_presence_of :json
  validates_presence_of :owner_id
  validate :owner_validation

  before_save :parse_for_metadata
  before_save :fillTags
  before_save :save_tag_array_text
  after_save :parse_for_metadata_id
  after_save :extract_los
  after_destroy :remove_los
  after_destroy :remove_scorms

  ####################
  ## Model methods
  ####################

  def to_json(options=nil)
    json
  end

  def as_scormfile
    sf = self.as_json( :include => [:los])

    sf["id"] = "presentation_" + self.id.to_s
    sf["schema"] = "ADL SCORM"
    sf["schema_version"] = "2004 4th Edition"
    sf["scorm_version"] = "2004"
    sf["nassets"] = 0
    sf["nscos"] = 1
    sf["preview_url"] = lo_path(sf["los"][0]["id"], :format => :full) rescue presentation_url(self, :format => :full)

    sf["los"].each do |lo|
      lo["container_id"] = sf["id"]
    end

    sf
  end

  def clone_for(user)
    return nil if (user.blank? or (user != self.owner))

    p = Presentation.new
    p.owner = user

    pJson = JSON(self.json)
    pJson["author"] = {name: user.name, vishMetadata:{ id: user.id }}
    pJson.delete("license")
    pJson["vishMetadata"] = {draft: "true"}
    p.json = pJson.to_json

    p.draft=true
    p.save!
    p
  end


  ####################
  ## SCORM Management
  ####################

  def self.scormFolderPath(version)
    return "#{Rails.root}/public/scorm/" + version + "/presentations/"
  end

  def scormFilePath(version)
    Presentation.scormFolderPath(version) + "#{self.id}.zip"
  end

  def to_scorm(controller,version="2004")
    if self.scorm_needs_generate(version)
      folderPath = Presentation.scormFolderPath(version)
      fileName = self.id
      json = JSON(self.json)
      Presentation.createSCORM(version,folderPath,fileName,json,self,controller)
      self.update_column(((version=="12") ? :scorm12_timestamp : :scorm2004_timestamp), Time.now)
    end
  end

  def scorm_needs_generate(version="2004")
    scormTimestam = (version=="12") ? self.scorm12_timestamp : self.scorm2004_timestamp
    scormTimestam.nil? or self.updated_at > scormTimestam or !File.exist?(self.scormFilePath(version))
  end

  def remove_scorms
    ["12","2004"].each do |scormVersion|
      scormFilePath = scormFilePath(scormVersion)
      File.delete(scormFilePath) if File.exist?(scormFilePath)
    end
  end

  def self.createSCORM(version="2004",folderPath,fileName,json,presentation,controller)
    require 'zip'

    # folderPath = "#{Rails.root}/public/scorm/version/presentations/"
    # fileName = self.id
    # json = JSON(self.json)
    t = File.open("#{folderPath}#{fileName}.zip", 'w')

    #Add manifest, main HTML file and additional files
    Zip::OutputStream.open(t.path) do |zos|
      xml_manifest = Presentation.generate_scorm_manifest(version,json,presentation)
      zos.put_next_entry("imsmanifest.xml")
      zos.print xml_manifest.target!()

      zos.put_next_entry("presentation.html")
      zos.print controller.render_to_string "show", :format => :scorm, :locals => {:presentation=>presentation, :json => json}, :layout => false  
    end

    #Add required XSD files and folders
    schemaDirs = []
    schemaFiles = []
    #SCORM schema
    schemaDirs.push("#{Rails.root}/public/schemas/SCORM_" + version)
    #LOM schema
    # schemaDirs.push("#{Rails.root}/public/schemas/lom")
    schemaFiles.push("#{Rails.root}/public/schemas/lom/lom.xsd")
    
    schemaDirs.each do |dir|
      Utils.zip_folder(t.path,dir)
    end

    if schemaFiles.length > 0
      Zip::File.open(t.path, Zip::File::CREATE) { |zipfile|
        schemaFiles.each do |filePath|
          zipfile.add(File.basename(filePath),filePath)
        end
      }
    end

    #Copy SCORM assets (image, javascript and css files)
    dir = "#{Rails.root}/lib/plugins/vish_editor/app/scorm"
    Utils.zip_folder(t.path,dir)

    #Add theme
    themesPath = "#{Rails.root}/lib/plugins/vish_editor/app/assets/images/themes/"
    theme = "theme1" #Default theme
    if json["theme"] and File.exists?(themesPath + json["theme"])
      theme = json["theme"]
    end
    #Copy presentation theme
    Utils.zip_folder(t.path,"#{Rails.root}/lib/plugins/vish_editor/app/assets",themesPath + theme)

    t.close
  end

  def self.generate_scorm_manifest(version,pjson,presentation,options={})
    version = "2004" unless version.is_a? String and ["12","2004"].include?(version)

    #Get manifest resource identifier and LOM identifier
    if presentation and !presentation.id.nil?
      identifier = presentation.id.to_s
      lomIdentifier = Rails.application.routes.url_helpers.presentation_url(:id => presentation.id)
    elsif (pjson["vishMetadata"] and pjson["vishMetadata"]["id"])
      identifier = pjson["vishMetadata"]["id"].to_s
      lomIdentifier = "urn:SGAME:" + identifier
    else    
      identifier = "TmpSCORM_" + Time.now.to_i.to_s
      lomIdentifier = "urn:SGAME:" + identifier
    end

    myxml = ::Builder::XmlMarkup.new(:indent => 2)
    myxml.instruct! :xml, :version => "1.0", :encoding => "UTF-8"

    #Select LOM Header options
    manifestHeaderOptions = {}
    manifestContent = {}

    case version
    when "12"
      #SCORM 1.2
      manifestHeaderOptions = {
        "identifier"=>"SGAME_PRESENTATION_" + identifier,
        "version"=>"1.0",
        "xmlns"=>"http://www.imsproject.org/xsd/imscp_rootv1p1p2",
        "xmlns:adlcp"=>"http://www.adlnet.org/xsd/adlcp_rootv1p2",
        "xmlns:xsi"=>"http://www.w3.org/2001/XMLSchema-instance",
        "xsi:schemaLocation"=>"http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd"
      }
      manifestContent["schemaVersion"] = "1.2"
    when "2004"
      #SCORM 2004 4th Edition
      manifestHeaderOptions =  { 
        "identifier"=>"SGAME_PRESENTATION_" + identifier,
        "version"=>"1.3",
        "xmlns"=>"http://www.imsglobal.org/xsd/imscp_v1p1",
        "xmlns:adlcp"=>"http://www.adlnet.org/xsd/adlcp_v1p3",
        "xmlns:adlseq"=>"http://www.adlnet.org/xsd/adlseq_v1p3",
        "xmlns:adlnav"=>"http://www.adlnet.org/xsd/adlnav_v1p3",
        "xmlns:imsss"=>"http://www.imsglobal.org/xsd/imsss",
        "xmlns:xsi"=>"http://www.w3.org/2001/XMLSchema-instance",
        "xsi:schemaLocation"=>"http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd http://www.adlnet.org/xsd/adlseq_v1p3 adlseq_v1p3.xsd http://www.adlnet.org/xsd/adlnav_v1p3 adlnav_v1p3.xsd http://www.imsglobal.org/xsd/imsss imsss_v1p0.xsd"
      }
      manifestContent["schemaVersion"] = "2004 4th Edition"
    else
      #Future SCORM versions
    end

    myxml.manifest(manifestHeaderOptions) do

      myxml.metadata do
        myxml.schema("ADL SCORM")
        myxml.schemaversion(manifestContent["schemaVersion"])
        #Add LOM metadata
        Presentation.generate_LOM_metadata(pjson,presentation,{:target => myxml, :id => lomIdentifier, :LOMschema => (options[:LOMschema]) ? options[:LOMschema] : "custom", :scormVersion => version})
      end

      myxml.organizations('default'=>"defaultOrganization") do
        myxml.organization('identifier'=>"defaultOrganization") do
          if pjson["title"]
            myxml.title(pjson["title"])
          else
            myxml.title("Untitled")
          end
          itemOptions = {
            'identifier'=>"PRESENTATION_" + identifier,
            'identifierref'=>"PRESENTATION_" + identifier + "_RESOURCE"
          }
          if version == "12"
            itemOptions["isvisible"] = "true"
          end
          myxml.item(itemOptions) do
            if pjson["title"]
              myxml.title(pjson["title"])
            else
              myxml.title("Untitled")
            end
            if version == "12"
              myxml.tag!("adlcp:masteryscore") do
                myxml.text!("50")
              end
            end
          end
        end
      end

      resourceOptions = {
        'identifier'=>"PRESENTATION_" + identifier + "_RESOURCE",
        'type'=>"webcontent",
        'href'=>"presentation.html",
      }
      if version == "12"
        resourceOptions['adlcp:scormtype'] = "sco"
      else
        resourceOptions['adlcp:scormType'] = "sco"
      end

      myxml.resources do         
        myxml.resource(resourceOptions) do
          myxml.file('href'=> "presentation.html")
        end
      end

    end    

    myxml
  end



  ####################
  ## LOM Metadata
  ####################

  # Metadata based on LOM (Learning Object Metadata) standard
  def self.generate_LOM_metadata(pjson, presentation, options={})
    _LOMschema = "custom"

    supportedLOMSchemas = ["custom","loose","SGAME"]
    if supportedLOMSchemas.include? options[:LOMschema]
      _LOMschema = options[:LOMschema]
    end

    if options[:target]
      myxml = ::Builder::XmlMarkup.new(:indent => 2, :target => options[:target])
    else
      myxml = ::Builder::XmlMarkup.new(:indent => 2)
      myxml.instruct! :xml, :version => "1.0", :encoding => "UTF-8"
    end
   
    #Select LOM Header options
    lomHeaderOptions = {}

    case _LOMschema
    when "loose","custom"
      lomHeaderOptions =  { 'xmlns' => "http://ltsc.ieee.org/xsd/LOM",
                            'xmlns:xsi' => "http://www.w3.org/2001/XMLSchema-instance",
                            'xsi:schemaLocation' => "http://ltsc.ieee.org/xsd/LOM lom.xsd"
                          }
    else
      #Extension not supported/recognized
      lomHeaderOptions = {}
    end


    myxml.tag!("lom",lomHeaderOptions) do

      #Calculate some recurrent vars
      #Identifier
      loIdIsURI = false
      loIdIsURN = false
      loId = nil

      if options[:id]
          loId = options[:id].to_s

          begin
            loUri = URI.parse(loId)
            if %w( http https ).include?(loUri.scheme)
              loIdIsURI = true
            elsif %w( urn ).include?(loUri.scheme)
              loIdIsURN = true
            end
          rescue
          end

          if !loIdIsURI and !loIdIsURN
            #Build URN
            loId = "urn:SGAME:"+loId
          end
      end

      #Presentation instance
      presentationInstance = nil
      if presentation
        presentationInstance = presentation
      elsif pjson["vishMetadata"] and pjson["vishMetadata"]["id"]
        presentationInstance = Presentation.find_by_id(pjson["vishMetadata"]["id"])
        presentationInstance = nil unless presentationInstance.public?
      end

      #Location
      loLocation = nil
      unless presentationInstance.nil?
        loLocation = Rails.application.routes.url_helpers.presentation_url(:id => presentationInstance.id) if presentationInstance.draft == false
      end

      #Language (LO language and metadata language)
      loLanguage = Lom.getLoLanguage(pjson["language"], _LOMschema)
      if loLanguage.nil?
        loLanOpts = {}
      else
        loLanOpts = { :language=> loLanguage }
      end
      metadataLanguage = "en"

      #Author name
      authorName = nil
      if pjson["author"] and pjson["author"]["name"]
        authorName = pjson["author"]["name"]
      elsif (!presentation.nil? and !presentation.owner.nil? and !presentation.owner.name.nil?)
        authorName = presentation.owner.name
      end

      # loDate 
      # According to ISO 8601 (e.g. 2014-06-23)
      if presentation
        loDate = presentation.updated_at
      else
        loDate = Time.now
      end
      loDate = (loDate).strftime("%Y-%m-%d").to_s

      #VE version
      atVersion = ""
      if pjson["VEVersion"]
        atVersion = "v." + pjson["VEVersion"] + " "
      end
      atVersion = atVersion + "(http://github.com/ging/vish_editor)"


      #Building LOM XML

      myxml.general do
        
        if !loId.nil?
          myxml.identifier do
            if loIdIsURI
              myxml.catalog("URI")
            else
              myxml.catalog("URN")
            end
            myxml.entry(loId)
          end
        end

        myxml.title do
          if pjson["title"]
            myxml.string(pjson["title"], loLanOpts)
          else
            myxml.string("Untitled", :language=> metadataLanguage)
          end
        end

        if loLanguage
          myxml.language(loLanguage)
        end
        
        myxml.description do
          if pjson["description"]
            myxml.string(pjson["description"], loLanOpts)
          elsif pjson["title"]
            myxml.string(pjson["title"] + ". Web Presentation provided by " + SgamePlatform::Application.config.full_domain + ".", :language=> metadataLanguage)
          else
            myxml.string("Web Presentation provided by " + SgamePlatform::Application.config.full_domain + ".", :language=> metadataLanguage)
          end
        end
        if pjson["tags"] && pjson["tags"].kind_of?(Array)
          pjson["tags"].each do |tag|
            myxml.keyword do
              myxml.string(tag.to_s, loLanOpts)
            end
          end
        end
        #Add subjects as additional keywords
        if pjson["subject"]
          if pjson["subject"].kind_of?(Array)
            pjson["subject"].each do |subject|
              myxml.keyword do
                myxml.string(subject, loLanOpts)
              end 
            end
          elsif pjson["subject"].kind_of?(String)
            myxml.keyword do
                myxml.string(pjson["subject"], loLanOpts)
            end
          end
        end

        myxml.structure do
          myxml.source("LOMv1.0")
          myxml.value("hierarchical")
        end
        myxml.aggregationLevel do
          myxml.source("LOMv1.0")
          myxml.value("2")
        end
      end

      myxml.lifeCycle do
        myxml.version do
          myxml.string("v"+loDate.gsub("-","."), :language=>metadataLanguage)
        end
        myxml.status do
          myxml.source("LOMv1.0")
          if pjson["vishMetadata"] and pjson["vishMetadata"]["draft"]==="true"
            myxml.value("draft")
          else
            myxml.value("final")
          end
        end

        if !authorName.nil?
          myxml.contribute do
            myxml.role do
              myxml.source("LOMv1.0")
              myxml.value("author")
            end
            authorEntity = Lom.generateVCard(authorName)
            myxml.entity(authorEntity)
            
            myxml.date do
              myxml.dateTime(loDate)
              myxml.description do
                myxml.string("This date represents the date the author finished the indicated version of the Learning Object.", :language=> metadataLanguage)
              end
            end
          end
        end
        myxml.contribute do
          myxml.role do
            myxml.source("LOMv1.0")
            myxml.value("technical implementer")
          end
          authoringToolName = "Authoring Tool ViSH Editor " + atVersion
          authoringToolEntity = Lom.generateVCard(authoringToolName)
          myxml.entity(authoringToolEntity)
        end
      end

      myxml.metaMetadata do
        unless presentationInstance.nil?
          myxml.identifier do
            myxml.catalog("URI")
            myxml.entry(Rails.application.routes.url_helpers.presentation_url(:id => presentationInstance.id) + "/metadata.xml")
          end
        end
        unless authorName.nil?
          myxml.contribute do
            myxml.role do
              myxml.source("LOMv1.0")
              myxml.value("creator")
            end
            myxml.entity(Lom.generateVCard(authorName))
            myxml.date do
              myxml.dateTime(loDate)
                myxml.description do
                  myxml.string("This date represents the date the author finished authoring the metadata of the indicated version of the Learning Object.", :language=> metadataLanguage)
                end
            end

          end
        end
        myxml.metadataSchema("LOMv1.0")
        myxml.language(metadataLanguage)
      end

      myxml.technical do
        myxml.format("text/html")
        if !loLocation.nil?
          myxml.location(loLocation)
        end
        myxml.requirement do
          myxml.orComposite do
            myxml.type do
              myxml.source("LOMv1.0")
              myxml.value("browser")
            end
            myxml.name do
              myxml.source("LOMv1.0")
              myxml.value("any")
            end
          end
        end
        myxml.installationRemarks do
          myxml.string("Unzip the zip file and launch presentation.html in your browser.", :language=> metadataLanguage)
        end
        myxml.otherPlatformRequirements do
          otherPlatformRequirements = "HTML5-compliant web browser"
          if pjson["VEVersion"]
            otherPlatformRequirements += " and ViSH Viewer " + atVersion
          end
          otherPlatformRequirements += "."
          myxml.string(otherPlatformRequirements, :language=> metadataLanguage)
        end
      end

      myxml.educational do
        myxml.interactivityType do
          myxml.source("LOMv1.0")
          myxml.value("mixed")
        end

        if !Lom.getLearningResourceType("lecture", _LOMschema).nil?
          myxml.learningResourceType do
            myxml.source("LOMv1.0")
            myxml.value("lecture")
          end
        end
        if !Lom.getLearningResourceType("presentation", _LOMschema).nil?
          myxml.learningResourceType do
            myxml.source("LOMv1.0")
            myxml.value("presentation")
          end
        end
        if !Lom.getLearningResourceType("slide", _LOMschema).nil?
          myxml.learningResourceType do
            myxml.source("LOMv1.0")
            myxml.value("slide")
          end
        end
        presentationElements = VishEditorUtils.getElementTypes(pjson) rescue []
        if presentationElements.include?("text") and !Lom.getLearningResourceType("narrative text", _LOMschema).nil?
          myxml.learningResourceType do
            myxml.source("LOMv1.0")
            myxml.value("narrative text")
          end
        end
        if presentationElements.include?("quiz") and !Lom.getLearningResourceType("questionnaire", _LOMschema).nil?
          myxml.learningResourceType do
            myxml.source("LOMv1.0")
            myxml.value("questionnaire")
          end
        end
        myxml.interactivityLevel do
          myxml.source("LOMv1.0")
          myxml.value("very high")
        end
        myxml.intendedEndUserRole do
          myxml.source("LOMv1.0")
          myxml.value("learner")
        end
        _LOMcontext = Lom.readableContext(pjson["context"], _LOMschema)
        if _LOMcontext
          myxml.context do
            myxml.source("LOMv1.0")
            myxml.value(_LOMcontext)
          end
        end
        if pjson["age_range"]
          myxml.typicalAgeRange do
            myxml.string(pjson["age_range"], :language=> metadataLanguage)
          end
        end
        if pjson["difficulty"]
          myxml.difficulty do
            myxml.source("LOMv1.0")
            myxml.value(pjson["difficulty"])
          end
        end
        if pjson["TLT"]
          myxml.typicalLearningTime do
            myxml.duration(pjson["TLT"])
          end
        end
        if pjson["educational_objectives"]
          myxml.description do
            myxml.string(pjson["educational_objectives"], loLanOpts)
          end
        end
        if loLanguage
          myxml.language(loLanguage)                 
        end
      end

      myxml.rights do
        myxml.cost do
          myxml.source("LOMv1.0")
          myxml.value("no")
        end
        myxml.copyrightAndOtherRestrictions do
          myxml.source("LOMv1.0")
          myxml.value("yes")
        end
        myxml.description do
          license = ""
          unless pjson["license"].nil? or pjson["license"]["name"].blank?
            license = "License: '" + pjson["license"]["name"] + "'. "
          end
          myxml.string(license + "For additional information or questions regarding copyright, distribution and reproduction, visit " + SgamePlatform::Application.config.full_domain + "/terms_of_use .", :language=> metadataLanguage)
        end
      end

    end

    myxml
  end

  # Metadata based on LOM (Learning Object Metadata) standard in JSON format
  def self.generate_LOM_metadata_json(pjson, presentation, options={})
    xml_metadata = generate_scorm_manifest("2004",pjson,presentation,options)
    xml_doc = REXML::Document.new(xml_metadata.target!)
    metadata_el = REXML::XPath.first(xml_doc.root, '/manifest/metadata')
    return {} if metadata_el.nil?

    lom_el = REXML::XPath.first(metadata_el, 'lom') || REXML::XPath.first(metadata_el, 'lom:lom')
    return {} if lom_el.nil?
    
    begin
      #Generate metadata with the SCORM gem
      metadata = Scorm::Metadata.from_xml(lom_el)
      json_metadata = JSON.parse((YAML.load(YAML.dump(metadata))).to_json)
      return Scormfile.adapt_json_metadata(json_metadata)
    rescue
      return {}
    end
  end


  ####################
  ## IMS QTI 2.1 Management (Handled by the IMSQTI module imsqti.rb)
  ####################

  def self.createQTI(folderPath,fileName,qjson)
    require 'imsqti'
    IMSQTI.createQTI(folderPath,fileName,qjson)
  end


  ####################
  ## Moodle Quiz XML Management (Handled by the MOODLEXML module moodlexml.rb)
  ####################

  def  self.createMoodleQUIZXML(folderPath,fileName,qjson)
    require 'moodlexml'
    MOODLEQUIZXML.createMoodleQUIZXML(folderPath,fileName,qjson)
  end


  ####################
  ## Other Methods
  ####################

  def afterPublish
  end

  
  private

  def parse_for_metadata
    parsed_json = JSON(self.json) rescue nil
    return if parsed_json.blank?

    self.title = parsed_json["title"] ? parsed_json["title"] : "Untitled"
    self.description = parsed_json["description"]
    self.tag_list = parsed_json["tags"]
    self.language = parsed_json["language"]

    unless parsed_json["age_range"].blank?
      begin
        ageRange = parsed_json["age_range"]
        self.age_min = ageRange.split("-")[0].delete(' ')
        self.age_max = ageRange.split("-")[1].delete(' ')
      rescue
      end
    end

    self.thumbnail_url = (parsed_json["avatar"] ? parsed_json["avatar"] : SgamePlatform::Application.config.full_domain + "/assets/logos/original/presentation-00.png")
  end

  def parse_for_metadata_id
    parsed_json = JSON(self.json) rescue nil
    return if parsed_json.blank?

    unless parsed_json["vishMetadata"]
      parsed_json["vishMetadata"] = {}
    end
    parsed_json["vishMetadata"]["id"] = self.id.to_s
    parsed_json["vishMetadata"]["draft"] = self.draft.to_s
    unless self.draft
      parsed_json["vishMetadata"]["released"] = "true"
    end
    
    parsed_json["author"] = {name: self.owner.name, vishMetadata:{ id: self.owner.id }}

    self.update_column :json, parsed_json.to_json
  end

  def extract_los
    lo = self.los.blank? ? Lo.new : self.los.first
    lo.resource_identifier = "resource_" + self.id.to_s
    lo.container_type = self.class.name
    lo.container_id = self.id
    lo.resource_index = 1
    lo.standard = "SCORM"
    lo.standard_version = "2004"
    lo.schema_version = "2004 4th Edition"
    pjson = JSON.parse(self.json)
    lo.rdata = VishEditorUtils.reportData?(pjson)
    lo.lo_type = (lo.rdata===true ? "sco" : "asset")
    lo.href = self.id.to_s + ".sgame"
    lo.hreffull = SgamePlatform::Application.config.full_domain + presentation_path(self, :format => "sgame")
    lo.metadata = Presentation.generate_LOM_metadata_json(pjson,self,{}).to_json
    lo.save!
  end
  
end