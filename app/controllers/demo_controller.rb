class DemoController < ApplicationController
	skip_authorization_check

	def demo
		@game_templates = GameTemplate.where(:certified => true)
		@scormfiles = Scormfile.where(:certified => true)
	end
end