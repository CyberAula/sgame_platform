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

	def create
		if params["game_template"] and params["scormfiles"]
			@game_template = GameTemplate.find_by_id(params["game_template"])
			@scormfiles = Scormfile.where(id: params["scormfiles"].split(","))
			if !@game_template.nil? and !@scormfiles.blank?
				if @game_template.public? and @scormfiles.map{|sf| sf.public?}.uniq===[true]
					owner = user_signed_in? ? current_user : SgamePlatform::Application.config.demo_user
					gameInstance = Game.create!	:owner_id => owner.id,
						:game_template_id => @game_template.id,
						:title => "SGAME demo",
						:description => "Example of educational game based on " + @game_template.title, 
						:thumbnail_url => @game_template.thumbnail_url,
						:certified => false
					@scormfiles.map{|sf| sf.los}.sum.map{|lo| lo.id}.uniq.each do |lo_id|
						GameEventMapping.create! :game_id => gameInstance.id,
						:game_template_event_id => @game_template.events.first.id, 
						:lo_id => lo_id
					end
				end
			end
		end

		if gameInstance and gameInstance.persisted?
			redirect_to game_path(gameInstance)
		else
			redirect_to "/demo"
		end
	end
end