class GameTemplate < ActiveRecord::Base
	include Item

	belongs_to :owner, :class_name => 'User', :foreign_key => "owner_id"
	has_many :games, :dependent => :destroy
	has_many :events, class_name: :GameTemplateEvent, :dependent => :destroy

	has_attached_file :file,
		:url => '/:class/:id.:extension',
		:path => ':rails_root/documents/:class/:id_partition/:filename.:extension'
	has_attached_file :thumbnail,
		:styles => SgamePlatform::Application.config.thumbnail_styles

	after_destroy :remove_template_files
	after_create :extract_game
	after_save :fill_thumbnail_url

	validates_attachment_presence :file
	validates_attachment :file, content_type: { content_type: ["application/zip"] }
	validates_presence_of :owner_id
	validates_presence_of :title
	validates_attachment :thumbnail, content_type: { content_type: ["image/jpeg", "image/gif", "image/png"] }
	validate :sgame_requirements

	def sgame_requirements
		sgame_errors = []

		if self.file.queued_for_write[:original] and File.exists?(self.file.queued_for_write[:original].path)
			zipFilePath = self.file.queued_for_write[:original].path
		else
			zipFilePath = self.file.path
		end
		Zip::File.open(zipFilePath) do |zip|
			#Validate index HTML file
			sgame_errors << "No index.html file" if zip.entries.select{|e| e.name == "index.html"}.first.nil?
			#Validate events
			eventsFile = zip.entries.select{|e| e.name == "sgame_events.json"}.first
			if eventsFile.nil?
				sgame_errors << "No sgame_events-json file"
			else
				events = nil
				events = JSON.parse(zip.read(eventsFile)) rescue sgame_errors << "Incorrect format of sgame_events.json file"
				unless events.nil?
					events.each do |event|
						gte = GameTemplateEvent.new
						gte.game_template_id = self.id || 0 #Id will be available after creation
						gte.fill_with_json_event(event)
						unless gte.valid?
							sgame_errors = sgame_errors + gte.errors.full_messages
						end
					end
				end
			end			
		end
		return true if sgame_errors.length == 0
		sgame_errors.uniq.each do |e|
			errors[:base] << e
		end
	end

	def url_full
		SgamePlatform::Application.config.full_code_domain + "/code/game_templates/" + self.id.to_s + "/"
	end

	def mini_thumbnail_url
		return "/assets/gamepad_black.png"
	end


	private

	def fill_thumbnail_url
		self.update_column(:thumbnail_url, self.thumbnail.url(:default, :timestamp => false)) if self.thumbnail.exists?
	end

	def extract_game
		#Unpack the ZIP file and extract the game
		if SgamePlatform::Application.config.APP_CONFIG["code_path"].nil?
			gameTemplatesPath = Rails.root.join('public', 'code', 'game_templates').to_s
		else
			gameTemplatesPath = SgamePlatform::Application.config.APP_CONFIG["code_path"] + "/game_templates"
		end
		gameTemplatePath = gameTemplatesPath + "/" + self.id.to_s

		if self.file.queued_for_write[:original] and File.exists?(self.file.queued_for_write[:original].path)
			zipFilePath = self.file.queued_for_write[:original].path
		else
			zipFilePath = self.file.path
		end
		Utils.extract_folder(zipFilePath,gameTemplatePath)

		#Template paths are saved as absolute paths when APP_CONFIG["code_path"] is defined
		templatePathToSave = gameTemplatePath.dup
		templatePathToSave.slice! (Rails.root.to_s+"/") if SgamePlatform::Application.config.APP_CONFIG["code_path"].nil?
		self.update_column(:path, templatePathToSave)

		#Process events file
		if File.exists?(gameTemplatePath+"/sgame_events.json")
			events = JSON.parse(File.read(gameTemplatePath+"/sgame_events.json"))
			events.each do |event|
				gte = GameTemplateEvent.new
				gte.game_template_id = self.id
				gte.fill_with_json_event(event)
				gte.save!
			end
		end
	end

	def remove_template_files
		require "fileutils"
		FileUtils.rm_rf(self.path) if File.exists? self.path
	end

end