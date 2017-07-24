class ScormfilesController < ApplicationController
  before_filter :authenticate_user!, :except => [:show]
  load_and_authorize_resource

  def show
    @scormfile = Scormfile.find_by_id(params[:id])
    respond_to do |format|
      format.json {
        render :json => @scormfile.to_json 
      }
      format.html {
        @suggestions = RecommenderSystem.suggestions({:n => 6, :lo_profile => @scormfile.profile, :settings => {}})
      }
      format.full {
        render :layout => 'iframe.full'
      }
    end
  end

  def download
    @scormfile = Scormfile.find_by_id(params[:id])
    authorize! :read, @scormfile

    path = @scormfile.file.path

    head(:not_found) and return unless File.exist?(path)

    send_file_options = {
      :filename => @scormfile.file_file_name,
      :type => @scormfile.file_content_type
    }

    send_file(path, send_file_options)
  end

  def destroy
    @scormfile = Scormfile.find_by_id(params[:id])
    @scormfile.destroy

    respond_to do |format|
      format.html { redirect_to (user_path(current_user) + "/files") }
      format.json { head :no_content }
    end
  end

end