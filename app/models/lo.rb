class Lo < ActiveRecord::Base
	has_many :game_event_mappings, :dependent => :destroy

	before_validation :fill_certified

	validates_presence_of :container_type
	validates_presence_of :container_id
	validate :container_validation
	def container_validation
		return errors[:base] << "Learning Object without container" if self.container.nil?
		true
	end
	validates_presence_of :standard
	validates_presence_of :standard_version
	validates_presence_of :schema_version
	validates_presence_of :lo_type
	validates_inclusion_of :rdata, :in => [ true, false ]
	validates_presence_of :href
	validates_presence_of :hreffull
	validates_presence_of :metadata
	validates_inclusion_of :certified, :in => [ true, false ]

	def container
		self.container_type.constantize.find_by_id(self.container_id) rescue nil
	end

	def public?
		self.container.public?
	end

	def owner
		self.container.owner
	end

	def owner_id
		self.owner.id
	end

	def sgame_metadata
		smetadata = Hash.new
		smetadata["id"] = self.id.to_s
		smetadata["url"] = self.hreffull
		smetadata["scorm_type"] = self.lo_type
		smetadata["scorm_version"] = self.standard_version
		smetadata["lom_metadata"] = JSON.parse(self.metadata) rescue {}
		return smetadata
	end

	def readable_title
		title = self.container.title rescue nil
		title += "(" + self.resource_index.to_s + ")" unless self.resource_index.nil?
		title
	end


	private
	
	def fill_certified
		self.certified = self.container.certified unless self.container.nil?
		true
	end
end