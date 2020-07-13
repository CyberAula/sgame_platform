class TagsController < ApplicationController
  before_action :authenticate_user!
  skip_authorization_check

  # Enable CORS
  before_action :cors_preflight_check, :only => [:index]
  after_action :cors_set_access_control_headers, :only => [:index]

  def index
    if params[:mode]=="popular" or !params[:q].present?
      @tags = most_popular
    else
      @tags = match_tag(params[:q])
    end

    limit = [params[:limit].present? ? params[:limit].to_i : 25, 5000].min
    @tags = @tags.limit(limit)

    @tags = [ ActsAsTaggableOn::Tag.new(name: params[:q]) ] if @tags.blank? && params[:q].present?

    respond_to do |format|
      format.any {
        render json: @tags
      }
    end
  end


  private

  def match_tag(tag)
    return most_popular unless tag.is_a? String
    ActsAsTaggableOn::Tag.where('plain_name LIKE ?',"%#{ ActsAsTaggableOn::Tag.getPlainName(tag) }%")
  end

  def most_popular
    ActsAsTaggableOn::Tag.most_used
  end

end