module UsersHelper
	def current_user_path_for(resources)
		return user_path(current_user) + "/" + resources
	end
end