module Extractable
	extend ActiveSupport::Concern

	def los
		Lo.where(:container_type => self.class.name, :container_id => self.id)
	end

	def remove_los
		self.los.map{|lo| lo.destroy}
	end
end