class HomeController < ApplicationController
	before_filter :authenticate_user!, :except => [:frontpage]

	def frontpage
		# return redirect_to :controller=>'home', :action => 'index' if user_signed_in?
		respond_to do |format|
			format.html { render layout: "application" }
		end
	end
end