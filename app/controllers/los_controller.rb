class LosController < ApplicationController
  load_and_authorize_resource

  def show
    @lo = Lo.find_by_id(params[:id])
    respond_to do |format|
      format.json {
        render :json => @lo.to_json 
      }
      format.html {
        render :formats=>[:full], :layout => false
      }
      format.full {
        render :layout => false
      }
    end
  end

end