class GameTemplate < ActiveRecord::Base
	belongs_to :owner, :class_name => 'User', :foreign_key => "owner_id"
	has_many :games, :dependent => :destroy
	has_many :events, class_name: :GameTemplateEvent, :dependent => :destroy

	validates_presence_of :owner_id
	validates_presence_of :title

	def url
		"/game_template/" + self.id.to_s() + "/"
	end
end