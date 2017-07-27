class GameTemplatesController < ApplicationController
  before_filter :authenticate_user!, :only => [:new, :create, :edit, :update]
  load_and_authorize_resource
 
  def index
    redirect_to "/"
  end

  def show
    @game_template = GameTemplate.find(params[:id])
    @suggestions = RecommenderSystem.suggestions({:n => 6, :lo_profile => @game_template.profile, :settings => {:preselection_filter_by_resource_types => ["Game"]}})
    respond_to do |format|
      format.html {
        render
      }
      format.full {
        render :layout => 'iframe'
      }
      format.json {
        render :json => @game_template.json
      }      
    end
  end

  def new
    @game_template = GameTemplate.new
    respond_to do |format|
      format.html { 
        render 
      }
    end
  end

  def destroy
    @game_template = GameTemplate.find(params[:id])
    @game_template.destroy
    respond_to do |format|
      format.all { redirect_to user_path(current_user) }
    end
  end

end