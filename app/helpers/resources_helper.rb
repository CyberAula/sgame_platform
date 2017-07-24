module ResourcesHelper
	def download_resource_path(resource)
		return document_path(resource) + "/download"
	end
end