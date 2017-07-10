class ApplicationController < ActionController::Base
	protect_from_forgery
	before_action :configure_permitted_parameters, if: :devise_controller?

	#############
	# CORS
	# Methods to enable CORS (http://www.tsheffler.com/blog/?p=428)
	#############

	# If this is a preflight OPTIONS request, then short-circuit the
	# request, return only the necessary headers and return an empty
	# text/plain.
	def cors_preflight_check
		if request.method.downcase.to_sym == :options
			headers['Access-Control-Allow-Origin'] = '*'
			headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS'
			headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-Prototype-Version'
			headers['Access-Control-Max-Age'] = '1728000'
			render :text => '', :content_type => 'text/plain'
		end
	end

	def cors_set_access_control_headers
		headers['Access-Control-Allow-Origin'] = '*'
		headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS'
		headers['Access-Control-Max-Age'] = "1728000"
	end

	def allow_iframe_requests
		response.headers.delete('X-Frame-Options')
	end

	protected

	def configure_permitted_parameters
		devise_parameter_sanitizer.permit(:sign_up) do |user_params|
			user_params.permit(:email, :password, :password_confirmation, :name, :language)
		end
	end
end