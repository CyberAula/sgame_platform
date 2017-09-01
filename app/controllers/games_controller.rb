class GamesController < ApplicationController
  before_filter :authenticate_user!, :only => [:new, :create, :edit, :update]
  before_filter :allow_iframe_requests
  load_and_authorize_resource :except => :sgame_api
  skip_authorization_check :only => :sgame_api

 
  #############
  # REST methods
  #############

  def index
    redirect_to "/"
  end

  def show
    @game = Game.find(params[:id])
    @suggestions = RecommenderSystem.suggestions({:n => 6, :lo_profile => @game.profile, :settings => {:preselection_filter_by_resource_types => ["Game"]}})
    respond_to do |format|
      format.html {
        render
      }
      format.full {
        render :layout => 'game'
      }
      format.json {
        render :json => @game.json
      }
      format.scorm {
        if (can? :read, @game)
          scormVersion = (params["version"].present? and ["12","2004"].include?(params["version"])) ? params["version"] : "2004"
          @game.to_scorm(self,scormVersion)
          send_file @game.scormFilePath(scormVersion), :type => 'application/zip', :disposition => 'attachment', :filename => ("scorm" + scormVersion + "-#{@game.id}.zip")
        else
          render :nothing => true, :status => 500
        end
      }
    end
  end

  def sgame_api
    redirect_to "/sgame_api/SGAME.js"
  end

  def new
    @game = Game.new
    respond_to do |format|
      format.html { 
        render 
      }
    end
  end

  def edit
    @game = Game.find(params[:id])
    respond_to do |format|
      format.html { 
        render 
      }
    end
  end

  def create
    params[:game].permit!
    @game = Game.new(params[:excursion])

    if(params[:draft] and params[:draft] == "true")
      @game.draft = true
    else
      @game.draft = false
    end
    @game.owner_id = current_user.id
    @game.save!

    published = (@game.draft===false)
    # @game.afterPublish if published

    respond_to do |format|
      format.html {
        redirect_to game_path(@game), notice: I18n.t("games.messages.success.create")
      }
    end
  end

  def update
    @game = Game.find_by_id(params[:id])
    wasDraft = @game.draft
    params[:game].permit! unless params[:game].blank?

    respond_to do |format|
      if @game.update_attributes(params[:game] || {})
        published = (wasDraft===true and @game.draft===false)
        # @game.afterPublish if published
        format.html { redirect_to game_path(@game), notice: I18n.t("games.messages.success.update") }
      else
        format.html { 
          flash.now[:alert] = I18n.t("games.messages.error.generic_update")
          render action: "edit"
        }
      end
    end
  end

  def destroy
    @game = Game.find(params[:id])
    @game.destroy
    respond_to do |format|
      format.all { redirect_to user_path(current_user) }
    end
  end

end