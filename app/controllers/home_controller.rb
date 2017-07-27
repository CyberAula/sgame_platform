class HomeController < ApplicationController
	before_filter :authenticate_user!, :except => [:frontpage]
	skip_authorization_check :only => [:frontpage]

	def frontpage
		@certified_resources = Game.certified
		respond_to do |format|
			format.html { render layout: "application" }
		end
	end
end