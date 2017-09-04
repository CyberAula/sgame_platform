module ResourcesHelper
	def download_resource_path(resource)
		return polymorphic_path(resource) + "/download"
	end

	def metadata_resource_path(resource)
		return polymorphic_path(resource) + "/metadata.xml"
	end
end