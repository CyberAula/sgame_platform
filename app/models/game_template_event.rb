class GameTemplateEvent < ActiveRecord::Base
	belongs_to :template, class_name: :GameTemplate, foreign_key: "game_template_id"
	has_many :mappings, class_name: :GameEventMapping, :dependent => :destroy

	validates_presence_of :game_template_id
	validates_presence_of :title
	validates_presence_of :id_in_game

	def fill_with_json_event(event)
		self.title = event["title"] unless event["title"].blank?
		self.id_in_game = event["id"] unless event["id"].blank?

		self.description = event["description"] unless event["description"].blank?
		self.event_type = event["type"] unless event["type"].blank?
		self.frequency = event["frequency"] unless event["frequency"].blank?
	end
end