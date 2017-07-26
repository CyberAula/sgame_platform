class GameTemplateEvent < ActiveRecord::Base
	belongs_to :template, class_name: :GameTemplate, foreign_key: "game_template_id"
	has_many :mappings, class_name: :GameEventMapping, :dependent => :destroy

	validates_presence_of :game_template_id
	validates_presence_of :title
	validates_presence_of :id_in_game
end
