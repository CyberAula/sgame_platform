class GameTemplatesController < ApplicationController
  before_action :authenticate_user!, :only => [:new, :create, :edit, :update]
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

  def create
    @game_template = GameTemplate.create(game_template_params)
    
    respond_to do |format|
      if @game_template.persisted?
        format.json {
          render :json => @game_template.to_json(:protocol => request.protocol)
        }
        format.html {
          redirect_to polymorphic_path(@game_template), notice: I18n.t("game_templates.messages.success.create")
        }
      else
        format.json {
          return head(:not_found)
        }
        format.html { 
          flash.now[:alert] = @game_template.errors.full_messages
          render action: "new"
        }
      end
    end
  end

  def edit
    @game_template = GameTemplate.find(params[:id])
    respond_to do |format|
      format.html { 
        render 
      }
    end
  end

  def update
    @game_template = GameTemplate.find(params[:id])
    params[:game_template].permit! unless params[:game_template].blank?

    respond_to do |format|
      if @game_template.update_attributes(params[:game_template] || {})
        format.html { redirect_to game_template_path(@game_template), notice: I18n.t("game_templates.messages.success.update") }
      else
        format.html { 
          flash.now[:alert] = I18n.t("game_templates.messages.error.generic_update")
          render action: "edit"
        }
      end
    end
  end

  def destroy
    @game_template = GameTemplate.find(params[:id])
    @game_template.destroy
    respond_to do |format|
      format.all { redirect_to user_path(current_user) }
    end
  end

  def download
    @game_template = GameTemplate.find(params[:id])
    authorize! :read, @game_template

    path = @game_template.file.path

    head(:not_found) and return unless File.exist?(path)

    send_file_options = {
      :filename => @game_template.file_file_name,
      :type => @game_template.file_content_type
    }

    send_file(path, send_file_options)
  end


  private

  def game_template_params
    params.require(:game_template).permit(:owner_id,:file,:title,:description,:thumbnail,:thumbnail_url,:language)
  end

end