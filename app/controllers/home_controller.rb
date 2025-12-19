class HomeController < ApplicationController
	before_action :authenticate_user!, :except => [:frontpage, :terms_of_use, :privacy_policy, :cookie_policy]
	skip_authorization_check :only => [:frontpage, :terms_of_use, :privacy_policy, :cookie_policy]

	def frontpage
		@certified_resources = Game.certified.order(SgamePlatform::Application.config.agnostic_random)
		respond_to do |format|
			format.html { render layout: "application" }
		end
	end

	def terms_of_use
		path = Rails.root.join("public", "policies", "legal_notice.html")
		if File.exist?(path)
			render file: path, layout: false
		else
			redirect_to view_context.home_path, alert: I18n.t("dictionary.errors.page_not_found")
		end
	end

	def privacy_policy
		path = Rails.root.join("public", "policies", "privacy_policy.html")
		if File.exist?(path)
			render file: path, layout: false
		else
			redirect_to view_context.home_path, alert: I18n.t("dictionary.errors.page_not_found")
		end
	end

	def cookie_policy
		path = Rails.root.join("public", "policies", "cookie_policy.html")
		if File.exist?(path)
			render file: path, layout: false
		else
			redirect_to view_context.home_path, alert: I18n.t("dictionary.errors.page_not_found")
		end
	end
end