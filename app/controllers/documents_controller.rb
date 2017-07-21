class DocumentsController < ApplicationController
  before_filter :authenticate_user!, :except => [:show]
  before_filter :fill_create_params, :only => [:create]
  load_and_authorize_resource

  def create
    @document = Document.create(document_params)

    respond_to do |format|
      if @document.persisted?
        format.json {
          render :json => @document.to_json(:protocol => request.protocol)
        }
        format.html { 
          redirect_to document_path(@document), notice: "Success"
        }
      else
        format.json {
          return head(:not_found)
        }
        format.html { 
          flash.now[:alert] = @document.errors.full_messages
          render action: "new"
        }
      end
    end
  end

  def show
    @document ||= Document.find_by_id(params[:id])
    respond_to do |format|
      format.json {
        render :json => @document.to_json 
      }
      format.html {
        @suggestions = RecommenderSystem.suggestions({:n => 6, :lo_profile => @document.profile, :settings => {}})
      }
      format.any {
        path = @document.file.path(params[:style] || params[:format])
        head(:not_found) and return unless File.exist?(path)
        send_file path,
                 :filename => @document.file_file_name,
                 :disposition => "inline",
                 :type => request.format
      }
    end
  end

  def new
  end

  private

  def fill_create_params
    params["document"] ||= {}
    params["document"].each{|k,v| 
      params["document"].delete(k) unless ["title","description","file","owner_id"].include? k
    }
  end

  def document_params
    params.require(:document).permit(:title, :description, :file, :owner_id)
  end

end