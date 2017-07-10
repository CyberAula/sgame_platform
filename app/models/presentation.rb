require 'builder'

class Presentation < ActiveRecord::Base
  acts_as_ordered_taggable

  attr_accessor :attachment_url
  has_attached_file :attachment, 
                    :url => '/:class/:id/attachment_file',
                    :path => ':rails_root/documents/attachments/:id_partition/:filename.:extension'
  validates_attachment_size :attachment, :less_than => 8.megabytes

  belongs_to :author, :class_name => 'User', :foreign_key => "author_id"

  validates_presence_of :json
  validates_presence_of :author_id
  validate :author_validation
  def author_validation
    return errors[:base] << "Presentation without author" if self.author_id.blank? or User.find_by_id(self.author_id).nil?
    true
  end

  before_save :parse_for_metadata
  # before_save :fillTags
  # before_save :save_tag_array_text
  after_save :parse_for_metadata_id
  after_destroy :remove_scorms

  ####################
  ## Class methods
  ####################

  # def self.public
  #   self.where(:draft => false)
  # end

  ####################
  ## Model methods
  ####################

  def to_json(options=nil)
    json
  end

  def owner
    self.author
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
      zos.print controller.render_to_string "show.scorm.erb", :locals => {:presentation=>presentation, :json => json}, :layout => false  
    end

    #Add required XSD files and folders
    schemaDirs = []
    schemaFiles = []
    #SCORM schema
    schemaDirs.push("#{Rails.root}/public/schemas/SCORM_" + version)
    #LOM schema
    # schemaDirs.push("#{Rails.root}/public/schemas/lom")
    schemaFiles.push("#{Rails.root}/public/schemas/lom/lom.xsd");
    
    schemaDirs.each do |dir|
      zip_folder(t.path,dir)
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
    zip_folder(t.path,dir)

    #Add theme
    themesPath = "#{Rails.root}/lib/plugins/vish_editor/app/assets/images/themes/"
    theme = "theme1" #Default theme
    if json["theme"] and File.exists?(themesPath + json["theme"])
      theme = json["theme"]
    end
    #Copy presentation theme
    zip_folder(t.path,"#{Rails.root}/lib/plugins/vish_editor/app/assets",themesPath + theme)

    t.close
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

  def self.generate_scorm_manifest(version,ejson,presentation,options={})
    version = "2004" unless version.is_a? String and ["12","2004"].include?(version)

    #Get manifest resource identifier and LOM identifier
    if presentation and !presentation.id.nil?
      identifier = presentation.id.to_s
      lomIdentifier = Rails.application.routes.url_helpers.presentation_url(:id => presentation.id)
    elsif (ejson["vishMetadata"] and ejson["vishMetadata"]["id"])
      identifier = ejson["vishMetadata"]["id"].to_s
      lomIdentifier = "urn:ViSH:" + identifier
    else    
      identifier = "TmpSCORM_" + Time.now.to_i.to_s
      lomIdentifier = "urn:ViSH:" + identifier
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
        "identifier"=>"VISH_PRESENTATION_" + identifier,
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
        "identifier"=>"VISH_PRESENTATION_" + identifier,
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
        Presentation.generate_LOM_metadata(ejson,presentation,{:target => myxml, :id => lomIdentifier, :LOMschema => (options[:LOMschema]) ? options[:LOMschema] : "custom", :scormVersion => version})
      end

      myxml.organizations('default'=>"defaultOrganization") do
        myxml.organization('identifier'=>"defaultOrganization") do
          if ejson["title"]
            myxml.title(ejson["title"])
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
            if ejson["title"]
              myxml.title(ejson["title"])
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

    return myxml
  end



  ####################
  ## LOM Metadata
  ####################

  # Metadata based on LOM (Learning Object Metadata) standard
  # LOM final draft: http://ltsc.ieee.org/wg12/files/LOM_1484_12_1_v1_Final_Draft.pdf
  def self.generate_LOM_metadata(ejson, presentation, options={})
    _LOMschema = "custom"

    supportedLOMSchemas = ["custom","loose","ODS","ViSH"]
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
    when "ODS"
      lomHeaderOptions =  { 'xmlns' => "http://ltsc.ieee.org/xsd/LOM",
                            'xmlns:xsi' => "http://www.w3.org/2001/XMLSchema-instance",
                            'xsi:schemaLocation' => "http://ltsc.ieee.org/xsd/LOM lomODS.xsd"
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
            loId = "urn:ViSH:"+loId
          end
      end

      #Presentation instance
      presentationInstance = nil
      if presentation
        presentationInstance = presentation
      elsif ejson["vishMetadata"] and ejson["vishMetadata"]["id"]
        presentationInstance = Presentation.find_by_id(ejson["vishMetadata"]["id"])
        presentationInstance = nil unless presentationInstance.public?
      end

      #Location
      loLocation = nil
      unless presentationInstance.nil?
        loLocation = Rails.application.routes.url_helpers.presentation_url(:id => presentationInstance.id) if presentationInstance.draft == false
      end

      #Language (LO language and metadata language)
      loLanguage = getLOMLoLanguage(ejson["language"], _LOMschema)
      if loLanguage.nil?
        loLanOpts = {}
      else
        loLanOpts = { :language=> loLanguage }
      end
      metadataLanguage = "en"

      #Author name
      authorName = nil
      if ejson["author"] and ejson["author"]["name"]
        authorName = ejson["author"]["name"]
      elsif (!presentation.nil? and !presentation.author.nil? and !presentation.author.name.nil?)
        authorName = presentation.author.name
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
      if ejson["VEVersion"]
        atVersion = "v." + ejson["VEVersion"] + " "
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
          if ejson["title"]
            myxml.string(ejson["title"], loLanOpts)
          else
            myxml.string("Untitled", :language=> metadataLanguage)
          end
        end

        if loLanguage
          myxml.language(loLanguage)
        end
        
        myxml.description do
          if ejson["description"]
            myxml.string(ejson["description"], loLanOpts)
          elsif ejson["title"]
            myxml.string(ejson["title"] + ". A Virtual Presentation provided by " + SgamePlatform::Application.config.full_domain + ".", :language=> metadataLanguage)
          else
            myxml.string("Virtual Presentation provided by " + SgamePlatform::Application.config.full_domain + ".", :language=> metadataLanguage)
          end
        end
        if ejson["tags"] && ejson["tags"].kind_of?(Array)
          ejson["tags"].each do |tag|
            myxml.keyword do
              myxml.string(tag.to_s, loLanOpts)
            end
          end
        end
        #Add subjects as additional keywords
        if ejson["subject"]
          if ejson["subject"].kind_of?(Array)
            ejson["subject"].each do |subject|
              myxml.keyword do
                myxml.string(subject, loLanOpts)
              end 
            end
          elsif ejson["subject"].kind_of?(String)
            myxml.keyword do
                myxml.string(ejson["subject"], loLanOpts)
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
          if ejson["vishMetadata"] and ejson["vishMetadata"]["draft"]==="true"
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
            authorEntity = generateVCard(authorName)
            myxml.entity(authorEntity)
            
            myxml.date do
              myxml.dateTime(loDate)
              unless _LOMschema == "ODS"
                myxml.description do
                  myxml.string("This date represents the date the author finished the indicated version of the Learning Object.", :language=> metadataLanguage)
                end
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
          authoringToolEntity = generateVCard(authoringToolName)
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
            myxml.entity(generateVCard(authorName))
            myxml.date do
              myxml.dateTime(loDate)
              unless _LOMschema == "ODS"
                myxml.description do
                  myxml.string("This date represents the date the author finished authoring the metadata of the indicated version of the Learning Object.", :language=> metadataLanguage)
                end
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
          if ejson["VEVersion"]
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

        if !getLearningResourceType("lecture", _LOMschema).nil?
          myxml.learningResourceType do
            myxml.source("LOMv1.0")
            myxml.value("lecture")
          end
        end
        if !getLearningResourceType("presentation", _LOMschema).nil?
          myxml.learningResourceType do
            myxml.source("LOMv1.0")
            myxml.value("presentation")
          end
        end
        if !getLearningResourceType("slide", _LOMschema).nil?
          myxml.learningResourceType do
            myxml.source("LOMv1.0")
            myxml.value("slide")
          end
        end
        presentationElements = VishEditorUtils.getElementTypes(ejson) rescue []
        if presentationElements.include?("text") and !getLearningResourceType("narrative text", _LOMschema).nil?
          myxml.learningResourceType do
            myxml.source("LOMv1.0")
            myxml.value("narrative text")
          end
        end
        if presentationElements.include?("quiz") and !getLearningResourceType("questionnaire", _LOMschema).nil?
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
        _LOMcontext = readableContext(ejson["context"], _LOMschema)
        if _LOMcontext
          myxml.context do
            myxml.source("LOMv1.0")
            myxml.value(_LOMcontext)
          end
        end
        if ejson["age_range"]
          myxml.typicalAgeRange do
            myxml.string(ejson["age_range"], :language=> metadataLanguage)
          end
        end
        if ejson["difficulty"]
          myxml.difficulty do
            myxml.source("LOMv1.0")
            myxml.value(ejson["difficulty"])
          end
        end
        if ejson["TLT"]
          myxml.typicalLearningTime do
            myxml.duration(ejson["TLT"])
          end
        end
        if ejson["educational_objectives"]
          myxml.description do
            myxml.string(ejson["educational_objectives"], loLanOpts)
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
          unless ejson["license"].nil? or ejson["license"]["name"].blank?
            license = "License: '" + ejson["license"]["name"] + "'. "
          end
          myxml.string(license + "For additional information or questions regarding copyright, distribution and reproduction, visit " + SgamePlatform::Application.config.full_domain + "/terms_of_use .", :language=> metadataLanguage)
        end
      end

    end

    myxml
  end

  def self.getLOMLoLanguage(language, _LOMschema)
    #List of language codes according to ISO-639:1988
    # lanCodes = ["aa","ab","af","am","ar","as","ay","az","ba","be","bg","bh","bi","bn","bo","br","ca","co","cs","cy","da","de","dz","el","en","eo","es","et","eu","fa","fi","fj","fo","fr","fy","ga","gd","gl","gn","gu","gv","ha","he","hi","hr","hu","hy","ia","id","ie","ik","is","it","iu","ja","jw","ka","kk","kl","km","kn","ko","ks","ku","kw","ky","la","lb","ln","lo","lt","lv","mg","mi","mk","ml","mn","mo","mr","ms","mt","my","na","ne","nl","no","oc","om","or","pa","pl","ps","pt","qu","rm","rn","ro","ru","rw","sa","sd","se","sg","sh","si","sk","sl","sm","sn","so","sq","sr","ss","st","su","sv","sw","ta","te","tg","th","ti","tk","tl","tn","to","tr","ts","tt","tw","ug","uk","ur","uz","vi","vo","wo","xh","yi","yo","za","zh","zu"]
    lanCodesMin = I18n.available_locales.map{|i| i.to_s}
    lanCodesMin.concat(["it","pt"]).uniq!

    case _LOMschema
    when "ODS"
      #ODS requires language, and admits blank language.
      if language.nil? or language == "independent" or !lanCodesMin.include?(language)
        return "none"
      end
    else
      #When language=nil, no language attribute is provided
      if language.nil? or language == "independent" or !lanCodesMin.include?(language)
        return nil
      end
    end

    #It is included in the lanCodes array
    return language
  end

  def self.readableContext(context, _LOMschema)
    case _LOMschema
    when "ODS" 
      #ODS LOM Extension
      #According to ODS, context has to be one of ["primary education", "secondary education", "informal context"]
      case context
      when "preschool", "pEducation", "primary education", "school"
        return "primary education"
      when "sEducation", "higher education", "university"
        return "secondary education"
      when "training", "other"
        return "informal context"
      else
        return nil
      end
    when "ViSH"
      #ViSH LOM extension
      case context
      when "unspecified"
        return "Unspecified"
      when "preschool"
        return "Preschool Education"
      when "pEducation"
        return "Primary Education"
      when "sEducation"
        return "Secondary Education"
      when "higher education"
        return "Higher Education"
      when "training"
        return "Professional Training"
      when "other"
        return "Other"
      else
        return context
      end
    else
      #Strict LOM mode. Extensions are not allowed
      case context
      when "unspecified"
        return nil
      when "preschool"
      when "pEducation"
      when "sEducation"
        return "school"
      when "higher education"
        return "higher education"
      when "training"
        return "training"
      else
        return "other"
      end
    end
  end

  def self.getLearningResourceType(lreType, _LOMschema)
    case _LOMschema
    when "ODS"
      #ODS LOM Extension
      #According to ODS, the Learning REsources type has to be one of this:
      allowedLREtypes = ["application","assessment","blog","broadcast","case study","courses","demonstration","drill and practice","educational game","educational scenario","learning scenario","pedagogical scenario","enquiry-oriented activity","exercise","experiment","glossaries","guide","learning pathways","lecture","lesson plan","open activity","other","presentation","project","reference","role play","simulation","social media","textbook","tool","website","wiki","audio","data","image","text","video"]
    else
      allowedLREtypes = ["exercise","simulation","questionnaire","diagram","figure","graph","index","slide","table","narrative text","exam","experiment","problem statement","self assessment","lecture"]
    end

    if allowedLREtypes.include? lreType
      return lreType
    else
      return nil
    end
  end

  def self.generateVCard(fullName)
    return "BEGIN:VCARD&#xD;VERSION:3.0&#xD;N:"+fullName+"&#xD;FN:"+fullName+"&#xD;END:VCARD"
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
    #Try to infer the language of the presentation if it is not spcifiyed
    if (self.language.nil? or !self.language.is_a? String or self.language=="independent")
      self.inferLanguage
    end
  end

  def inferLanguage
    unless SgamePlatform::Application.config.APP_CONFIG["languageDetectionAPIKEY"].nil?
      stringToTestLanguage = ""
      if self.title.is_a? String and !self.title.blank?
        stringToTestLanguage = stringToTestLanguage + self.title + " "
      end
      if self.description.is_a? String and !self.description.blank?
        stringToTestLanguage = stringToTestLanguage + self.description + " "
      end

      if stringToTestLanguage.is_a? String and !stringToTestLanguage.blank?
        
        begin
          detectionResult = DetectLanguage.detect(stringToTestLanguage)
        rescue Exception => e
          detectionResult = []
        end
        
        validLanguageCodes = ["de","en","es","fr","it","pt","ru"]

        detectionResult.each do |result|
          if result["isReliable"] == true
            detectedLanguageCode = result["language"]
            if validLanguageCodes.include? detectedLanguageCode
              lan = detectedLanguageCode
            else
              lan = "ot"
            end

            #Update language
            self.update_column :language, lan
            eJson = JSON(self.json)
            eJson["language"] = lan
            self.update_column :json, eJson.to_json
            break
          end
        end
      end
    end
  end

  
  #method used to return json objects to the recommendation in the last slide
  def reduced_json(controller)
      rjson = {
        :id => id,
        :url => controller.presentation_url(:id => self.id),
        :title => title,
        :author => author.name,
        :description => description,
        :image => thumbnail_url ? thumbnail_url : SgamePlatform::Application.config.full_domain + "/assets/logos/original/presentation-00.png",
        :views => visit_count
      }
      rjson
  end

  def get_attachment_name
    "presentation_" + self.id.to_s + "_attachment" + File.extname(self.attachment_file_name)
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
    
    author = self.author
    parsed_json["author"] = {name: author.name, vishMetadata:{ id: author.id }}

    self.update_column :json, parsed_json.to_json
  end
  
end