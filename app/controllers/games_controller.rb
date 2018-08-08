class GamesController < ApplicationController
  before_filter :authenticate_user!, :only => [:new, :create, :edit, :update]
  before_filter :allow_iframe_requests
  load_and_authorize_resource :except => [:sgame_api, :metadata]
  skip_authorization_check :only => [:sgame_api]

 
  #############
  # REST methods
  #############

  def index
    redirect_to "/"
  end

  def show
    @game = Game.find(params[:id])
    
    respond_to do |format|
      format.html {
        @suggestions = RecommenderSystem.suggestions({:n => 6, :lo_profile => @game.profile, :settings => {:preselection_filter_by_resource_types => ["Game"]}})
        render
      }
      format.full {
        @game_settings = @game.settings(user_signed_in? ? current_user : nil)
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

  def new
    @game = Game.new
    @game_templates = (GameTemplate.where(:certified => true) + current_user.game_templates).uniq.as_json(:include => [:events])
    @scormfiles = current_user.scormfiles.as_json(:include => [:los]) + current_user.presentations.map{|p| p.as_scormfile}

    respond_to do |format|
      format.html { 
        render 
      }
    end
  end

  def edit
    @game = Game.find(params[:id])
    @game_templates = (GameTemplate.where(:certified => true) + current_user.game_templates).uniq.as_json(:include => [:events])
    @scormfiles = (current_user.scormfiles + @game.scormfiles).uniq.as_json(:include => [:los]) + current_user.presentations.map{|p| p.as_scormfile}

    respond_to do |format|
      format.html {
        if @game.editor_data.blank?
          redirect_to user_path(current_user), notice: "This game has no editor data, it cannot be edited."
        else
          render
        end
      }
    end
  end

  def create
    params[:game].permit!
    
    @game = Game.new
    
    editor_data = JSON.parse(params[:game][:editor_data]).to_json rescue nil
    if editor_data.nil?
      errorMsg = I18n.t("at.errors.generic_create")
    else
      @game.editor_data = editor_data
      @game.fill_from_editor_data #Fill game fields from editor_data

      @game.owner_id = current_user.id
      @game.draft = (params[:game][:draft] and params[:game][:draft] == "true")

      @game.valid?

      if @game.errors.blank?
        if @game.validate_mappings_from_editor_data_for_new_games
          if @game.save
            #Game need to be saved before creating mappings because mappings need the game id
            created_mappings = @game.create_mappings_from_editor_data
            if created_mappings.blank?
              @game.destroy
              errorMsg = I18n.t("at.errors.invalid_mapping_server")
            end
          else
            errorMsg = I18n.t("at.errors.generic_create")
          end
        else
          errorMsg = I18n.t("at.errors.invalid_mapping_server")
        end
      else
        errorMsg = @game.errors.full_messages.to_sentence
      end 
    end
   
    respond_to do |format|
      format.json {
        if @game.persisted?
          render :json => { 
            :gamePath => game_path(@game),
            :editPath => edit_game_path(@game),
            :id => @game.id
          },
          :status => 200
        else
          render :json => { 
            :errorMsg => errorMsg
          },
          :status => 400
        end
      }
    end
  end

  def update
    params[:game].permit!

    @game = Game.find(params[:id])

    errorMsg = nil

    editor_data = JSON.parse(params[:game][:editor_data]).to_json rescue nil
    if editor_data.nil?
      errorMsg = I18n.t("at.errors.generic_update")
    else
      @game.editor_data = editor_data
      @game.fill_from_editor_data #Fill game fields from editor_data

      @game.draft = (params[:game][:draft] and params[:game][:draft] == "true")

      @game.valid?

      if @game.errors.blank?
        created_mappings = @game.create_mappings_from_editor_data
        if created_mappings.blank?
          errorMsg = I18n.t("at.errors.invalid_mapping_server")
        else
          errorMsg = I18n.t("at.errors.generic_create") unless @game.save
        end
      else
        errorMsg = @game.errors.full_messages.to_sentence
      end 
    end

    respond_to do |format|
      format.json {
        if errorMsg.nil?
          render :json => { 
            :gamePath => game_path(@game),
            :editPath => edit_game_path(@game),
            :id => @game.id
          },
          :status => 200
        else
          render :json => { 
            :errorMsg => errorMsg
          },
          :status => 400
        end
      }
    end
  end

  def destroy
    @game = Game.find(params[:id])
    @game.destroy
    respond_to do |format|
      format.all { redirect_to user_path(current_user) }
    end
  end


  #############
  # Custom methods
  #############

  def sgame_api
    redirect_to "/sgame_api/SGAME.js"
  end

  def metadata
    game = Game.find_by_id(params[:id])
    authorize! :show, game
    respond_to do |format|
      format.any {
        unless game.nil?
          xmlMetadata = Game.generate_LOM_metadata(game,{:id => Rails.application.routes.url_helpers.game_url(game), :LOMschema => params[:LOMschema] || "custom"})
          render :xml => xmlMetadata.target!, :content_type => "text/xml"
        else
          xmlMetadata = ::Builder::XmlMarkup.new(:indent => 2)
          xmlMetadata.instruct! :xml, :version => "1.0", :encoding => "UTF-8"
          xmlMetadata.error("Game not found")
          render :xml => xmlMetadata.target!, :content_type => "text/xml", :status => 404
        end
      }
    end
  end


  private

  def game_params
    params.require(:game).permit(:editor_data,:draft)
  end

end