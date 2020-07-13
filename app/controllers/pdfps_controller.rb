class PdfpsController < ApplicationController
  before_action :authenticate_user_on_pdfps
  before_action :fill_create_params, :only => [ :new, :create]
  load_and_authorize_resource

  def new
    @pdfp = Pdfp.new
  end

  def create
    @pdfp = Pdfp.new(pdfp_params)
    @pdfp.save!
    begin
    	@imgs = @pdfp.to_img({:protocol => request.protocol})
    	render :json => @imgs
    rescue Exception => e
    	@pdfp.destroy
    	render :json => e.message
    end
  end

  def show
    @pdfp = Pdfp.find(params[:id])
    render :json => @pdfp.getImgArray
  end


  private

  def authenticate_user_on_pdfps
    raise "#PDFexAPIError:4 Unauthorized" unless user_signed_in?
  end

  def fill_create_params
    params["pdfex"] ||= {}
    params["pdfex"].delete "owner_id" if params["pdfex"]["owner_id"]
    params["pdfex"].delete "scope" if params["pdfex"]["scope"]
    params["pdfex"]["owner_id"] = current_user.id
  end

  def pdfp_params
    params.require(:pdfex).permit(:attach, :owner_id)
  end

end