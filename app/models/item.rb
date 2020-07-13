module Item
	extend ActiveSupport::Concern
	include Taggable
	include Recommendable

	module ClassMethods
		def public_items
			if self.column_names.include?("draft")
				self.where(:draft => false)
			else
				self.all
			end
		end
		def certified
			if self.column_names.include?("certified")
				self.where(:certified => true).public_items
			else
				self.public_items
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