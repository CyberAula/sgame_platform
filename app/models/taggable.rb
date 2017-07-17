module Taggable
	extend ActiveSupport::Concern

	module ClassMethods
	end

	private

	def fillTags
		return true if !self.respond_to?("tag_list") or self.tag_list.blank?

		tagsConfig = SgamePlatform::Application.config.tagsSettings
		self.tag_list = self.tag_list.first(tagsConfig["maxTags"]) if self.tag_list.length > tagsConfig["maxTags"]

		tagsToDelete = []
		self.tag_list.each do |tag|
			tL = tag.length
			if (tL < tagsConfig["minLength"] || tL > tagsConfig["maxLength"])
				tagsToDelete << tag
				break
			end

			tagsConfig["tagSeparators"].each do |s|
				if tag.include?(s)
					tagsToDelete << tag
					break 
				end
			end
		end

		tagsToDelete.each do |tag|
			self.tag_list.delete(tag)
		end

		true
	end

	def checkTags
		return true if !self.respond_to?("tag_list") or self.tag_list.blank?

		tagsConfig = SgamePlatform::Application.config.tagsSettings
		return errors[:base] << ("Tag limit is " + tagsConfig["maxTags"].to_s) if self.tag_list.length > tagsConfig["maxTags"]

		self.tag_list.each do |tag|
			tL = tag.length

			if (tL < tagsConfig["minLength"] || tL > tagsConfig["maxLength"])
				errors[:base] << ("Invalid tag length for tag '" + tag + "'") 
				break
			end

			tagsConfig["tagSeparators"].each do |s|
				if tag.include?(s)
					errors[:base] << ("Invalid tag '" + tag + "'")
					break 
				end
			end

			break unless errors[:base].blank?
		end

		return errors[:base] unless errors[:base].blank?

		true
	end

	def save_tag_array_text
		return unless self.respond_to?("tag_array_text")
		stopTags = SgamePlatform::Application.config.stoptags || []
		self.tag_array_text = self.tag_list.map{|tag| ActsAsTaggableOn::Tag.getPlainName(tag)}.uniq.reject{|tag| stopTags.include? tag}.join(",") unless self.tag_list.blank?
	end
end