class Game < ActiveRecord::Base
	include Item

	belongs_to :owner, :class_name => 'User', :foreign_key => "owner_id"
	belongs_to :template, class_name: :GameTemplate, foreign_key: "game_template_id"
	has_many :mappings, class_name: :GameEventMapping, :dependent => :destroy
	has_many :events, class_name: :GameTemplateEvent, :through => :template
	has_many :los, :through => :mappings

	before_validation :fill_language
	validates_presence_of :game_template_id
	validates_presence_of :owner_id
	validate :owner_validation
	validates_presence_of :title

	after_destroy :remove_scorms


	def settings
		settings = Hash.new
		settings["name"] = self.title;
		settings["description"] = self.description;
		settings["thumbnail"] = self.thumbnail_url;
		settings["lo_list"] = self.los_sgame_metadata;
		settings["event_mapping"] = [];
		self.events.each do |event|
			#Get LOs mapped to this event
			los = []
			self.mappings.where(:game_template_event_id => event.id).each do |mapping|
				if mapping.lo_id == -2
					los.push("*");
				else
					los.push(mapping.lo_id);
				end
			end
			mapping = Hash.new;
			mapping["event_id"] = event.id_in_game;
			mapping["los_id"] = los.uniq;
			settings["event_mapping"].push(mapping);
		end
		return settings
	end

	def los_sgame_metadata
		self.los.map{|lo| lo.sgame_metadata}
	end

	def mini_thumbnail_url
		return "/assets/gamepad_black.png"
	end

	#
	# Exportation to SCORM
	#
	def to_scorm(controller,version="2004")
		if self.scorm_needs_generate(version)
			folderPath = Game.scormFolderPath(version)
			fileName = self.id
			Game.createSCORM(version,folderPath,fileName,self,controller)
			self.update_column(((version=="12") ? :scorm12_timestamp : :scorm2004_timestamp), Time.now)
		end
	end

	def self.scormFolderPath(version)
		"#{Rails.root}/public/scorm/" + version + "/games/"
	end

	def scormFilePath(version)
		Game.scormFolderPath(version) + "#{self.id}.zip"
	end

	def scorm_needs_generate(version="2004")
		scormTimestamp = (version=="12") ? self.scorm12_timestamp : self.scorm2004_timestamp
		scormTimestamp.nil? or self.updated_at > scormTimestamp or !File.exist?(self.scormFilePath(version))
	end

	def remove_scorms
		["12","2004"].each do |scormVersion|
			scormFilePath = scormFilePath(scormVersion)
			File.delete(scormFilePath) if File.exist?(scormFilePath)
		end
	end

	def self.createSCORM(version="2004",folderPath,fileName,game,controller)
		require 'zip'

		t = File.open("#{folderPath}#{fileName}.zip", 'w')

		#Add manifest, main HTML file and additional files
		Zip::OutputStream.open(t.path) do |zos|
		  xml_manifest = Game.generate_scorm_manifest(version,game)
		  zos.put_next_entry("imsmanifest.xml")
		  zos.print xml_manifest.target!()

		  zos.put_next_entry("game.html")
		  zos.print controller.render_to_string "show.scorm.erb", :locals => {:game=>game}, :layout => false  
		end

		#Add required XSD files and folders
		schemaDirs = []
		schemaFiles = []
		#SCORM schema
		schemaDirs.push("#{Rails.root}/public/schemas/SCORM_" + version)
		#LOM schema
		schemaFiles.push("#{Rails.root}/public/schemas/lom/lom.xsd");

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

		t.close
	end

	def self.generate_scorm_manifest(version,game)
		version = "2004" unless version.is_a? String and ["12","2004"].include?(version)

		identifier = game.id.to_s
		lomIdentifier = Rails.application.routes.url_helpers.game_url(:id => game.id)

		myxml = ::Builder::XmlMarkup.new(:indent => 2)
		myxml.instruct! :xml, :version => "1.0", :encoding => "UTF-8"

		#Select LOM Header options
		manifestHeaderOptions = {}
		manifestContent = {}

		case version
		when "12"
			#SCORM 1.2
			manifestHeaderOptions = {
				"identifier"=>"SGAME_GAME_" + identifier,
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
				"identifier"=>"SGAME_GAME_" + identifier,
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
		end

		myxml.manifest(manifestHeaderOptions) do

			myxml.metadata do
				myxml.schema("ADL SCORM")
				myxml.schemaversion(manifestContent["schemaVersion"])
				#TODO: Add LOM metadata
				# Game.generate_LOM_metadata(game,{:target => myxml, :id => lomIdentifier, :LOMschema => "custom", :scormVersion => version})
			end

			myxml.organizations('default'=>"defaultOrganization") do
				myxml.organization('identifier'=>"defaultOrganization") do
					myxml.title(game.title)
					itemOptions = {
						'identifier'=>"GAME_" + identifier,
						'identifierref'=>"GAME_" + identifier + "_RESOURCE"
					}
					if version == "12"
						itemOptions["isvisible"] = "true"
					end
					myxml.item(itemOptions) do
						myxml.title(game.title)
						if version == "12"
							myxml.tag!("adlcp:masteryscore") do
								myxml.text!("50")
							end
						end
					end
				end
			end

			resourceOptions = {
				'identifier'=>"GAME_" + identifier + "_RESOURCE",
				'type'=>"webcontent",
				'href'=>"game.html",
			}
			if version == "12"
				resourceOptions['adlcp:scormtype'] = "sco"
			else
				resourceOptions['adlcp:scormType'] = "sco"
			end

			myxml.resources do         
				myxml.resource(resourceOptions) do
					myxml.file('href'=> "game.html")
				end
			end
		end    
		return myxml
	end


	private

	def fill_language
		self.language = self.template.language if self.language.nil? and !self.template.nil?
	end
	
end