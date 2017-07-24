module ResourcesHelper
	def download_resource_path(resource)
		return polymorphic_path(resource) + "/download"
	end
end