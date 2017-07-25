class GameTemplate < ActiveRecord::Base
  has_many :games, :dependent => :destroy
  has_many :events, class_name: :GameTemplateEvent, :dependent => :destroy
end