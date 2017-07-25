class Lo < ActiveRecord::Base
	validates_presence_of :container_type
	validates_presence_of :container_id
	validates_presence_of :standard
	validates_presence_of :standard_version
	validates_presence_of :schema_version
	validates_presence_of :lo_type
	validates_inclusion_of :rdata, :in => [ true, false ]
	validates_presence_of :href
	validates_presence_of :hreffull
	validates_presence_of :metadata

	has_many :game_event_mappings, :dependent => :destroy

	def container
		self.container_type.constantize.find_by_id(self.container_id)
	end

	def public?
		self.container.public?
	end

	def sgame_metadata
		smetadata = Hash.new
		smetadata["id"] = self.id
		smetadata["url"] = self.hreffull
		smetadata["scorm_type"] = self.lo_type;
		smetadata["lom_metadata"] = self.metadata
		return smetadata
	end
end