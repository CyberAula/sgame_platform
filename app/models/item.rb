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
		def certified
			if self.column_names.include?("certified")
				self.where(:certified => true).public
			else
				self.public
			end
		end
	end

	def owner_validation
		return errors[:base] << "Item without author" if self.owner_id.blank? or User.find_by_id(self.owner_id).nil?
		true
	end

	def public?
		if self.respond_to?("draft")
			!self.draft
		else
			true
		end
	end
end