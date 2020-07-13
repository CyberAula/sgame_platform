class HomeController < ApplicationController
	before_action :authenticate_user!, :except => [:frontpage]
	skip_authorization_check :only => [:frontpage]

	def frontpage
		@certified_resources = Game.certified.order(SgamePlatform::Application.config.agnostic_random)
		respond_to do |format|
			format.html { render layout: "application" }
		end
	end
end