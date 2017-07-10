class PicturesController < DocumentsController
  def show
    @document = Picture.find_by_id(params[:id])
    params[:style] = "original"
    super
  end
end