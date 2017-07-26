class GameTemplate < ActiveRecord::Base
	belongs_to :owner, :class_name => 'User', :foreign_key => "owner_id"
	has_many :games, :dependent => :destroy
	has_many :events, class_name: :GameTemplateEvent, :dependent => :destroy

	before_destroy :remove_files #This callback need to be before has_attached_file, to be executed before paperclip callbacks

	has_attached_file :file,
		:url => '/:class/:id.:extension',
		:path => ':rails_root/documents/:class/:id_partition/:filename.:extension'

	validates_attachment_presence :file
	validates_attachment :file, content_type: { content_type: ["application/zip"] }
	validates_presence_of :owner_id
	validates_presence_of :title
	validate :sgame_requirements
	after_save :extract_game

	def sgame_requirements
		errors = []

		zipFilePath = self.persisted? ? self.file.path : self.file.queued_for_write[:original].path
		Zip::File.open(zipFilePath) do |zip|
			#Validate index HTML file
			errors << "No index.html file" if zip.entries.select{|e| e.name == "index.html"}.first.nil?
			#Validate events (TODO)
			errors << "No events file" if false
		end
		if errors.length == 0
			return true
		else
			return (errors[:base] + errors)
		end
	end

	def extract_game
		#Unpack the ZIP file and extract the game
		if SgamePlatform::Application.config.APP_CONFIG["code_path"].nil?
			gameTemplatesPath = Rails.root.join('public', 'code', 'game_templates').to_s
		else
			gameTemplatesPath = SgamePlatform::Application.config.APP_CONFIG["code_path"] + "/game_templates"
		end
		gameTemplatePath = gameTemplatesPath + "/" + self.id.to_s
		Utils.extract_folder(self.file.path,gameTemplatePath)
	end

	def template_full_url
		SgamePlatform::Application.config.full_code_domain + "/code/game_templates/" + self.id.to_s + "/"
	end

end