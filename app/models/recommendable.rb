module Recommendable
	extend ActiveSupport::Concern
	include ActionDispatch::Routing::PolymorphicRoutes
	include Rails.application.routes.url_helpers

	def profile
		profile = {}
		profile[:title] = self.title if self.respond_to?("title")
		profile[:description] = self.description if self.respond_to?("description")
		profile[:keywords] = (self.tag_array_text.blank? ? [] : self.tag_array_text.split(",")) if self.respond_to?("tag_array_text")
		profile[:language] = self.language if self.respond_to?("language")
		profile = profile.recursive_merge(self.extend_profile) if self.respond_to?("extend_profile")
		profile[:id_repository] = self.id
		profile[:repository] = "SGAME"
		profile[:url] = (polymorphic_path(self) rescue nil)
		profile[:thumbnail_url] = (self.thumbnail_url) if self.respond_to?("thumbnail_url")
		profile[:mini_thumbnail_url] = self.mini_thumbnail_url if self.respond_to?("mini_thumbnail_url")
		profile[:object] = self
		profile[:object_class] = profile[:object].class.name.underscore
		profile
	end
end