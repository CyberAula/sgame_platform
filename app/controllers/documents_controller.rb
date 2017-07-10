class DocumentsController < ApplicationController
  
  before_filter :authenticate_user!, :except => [:show]
  before_filter :fill_create_params, :only => [:create]

  def create
    @document = Document.create(document_params)
    respond_to do |format|
      format.json {
        if @document.persisted?
          render :json => @document.to_json(:protocol => request.protocol)
        else
          return head(:not_found)
        end
      }
    end
  end

  def show
    @document ||= Document.find_by_id(params[:id])
    respond_to do |format|
      format.json {render :json => @document.to_json }
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


  private

  def fill_create_params
    params["document"] ||= {}
    params["document"].each{|k,v| 
      params["document"].delete(k) unless ["file","owner_id"].include? k
    }
  end

  def document_params
    params.require(:document).permit(:file, :owner_id)
  end

end