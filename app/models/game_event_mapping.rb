class GameEventMapping < ActiveRecord::Base
  belongs_to :game
  belongs_to :event, class_name: :GameTemplateEvent, foreign_key: "game_template_event_id"
  belongs_to :lo
end