class DemoController < ApplicationController
	skip_authorization_check

	def demo
		@game_templates = GameTemplate.where(:certified => true)
		@scormfiles = Scormfile.where(:certified => true)
		if user_signed_in?
			@game_templates = (@game_templates + current_user.game_templates).uniq
			@scormfiles = (@scormfiles + current_user.scormfiles).uniq
		end
	end
end