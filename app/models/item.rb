module Item
	extend ActiveSupport::Concern
	include Taggable
	include Recommendable

	module ClassMethods
		def public
			if self.column_names.include?("draft")
				self.where(:draft => false)
			else
				self
			end
		end
	end
end