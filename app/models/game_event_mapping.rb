class GameEventMapping < ActiveRecord::Base
  belongs_to :game
  belongs_to :event, class_name: :GameTemplateEvent, foreign_key: "game_template_event_id"
  belongs_to :lo

  validates_presence_of :game_template_event_id
  validates_presence_of :lo_id
  validates_presence_of :game_id unless :skip_game_id_validation?

  validate :game_template_event_exists
  def game_template_event_exists
    return false if GameTemplateEvent.find_by_id(self.game_template_event_id).nil?
  end

  validate :lo_exists
  def lo_exists
    return false if Lo.find_by_id(self.lo_id).nil?
  end

  validate :game_exists
  def game_exists
    return false if Game.find_by_id(self.game_id).nil?
  end

  attr_accessor :skip_game_id_validation

  def skip_game_id_validation?
    self.skip_game_id_validation
  end

end