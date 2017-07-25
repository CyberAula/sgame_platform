class Game < ActiveRecord::Base
	belongs_to :template, class_name: :GameTemplate, foreign_key: "game_template_id"
	has_many :mappings, class_name: :GameEventMapping, :dependent => :destroy
	has_many :events, class_name: :GameTemplateEvent, :through => :template
	has_many :los, :through => :mappings

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
			mapping["los_id"] = los;
			settings["event_mapping"].push(mapping);
		end
		return settings
	end

	def los_sgame_metadata
		self.los.map{|lo| lo.sgame_metadata}
	end
	
end
