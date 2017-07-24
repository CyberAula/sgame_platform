class UsersController < ApplicationController
  before_filter :find_user
  load_and_authorize_resource :except => [:show_presentations]

  def show
    authorize! :read, @profile_user
    @presentations = @profile_user.presentations.order('updated_at DESC')
    @presentations = @presentations.public unless @isProfileOwner
  end

  def show_presentations
    authorize! :read, @profile_user
    @presentations = @profile_user.presentations.order('updated_at DESC')
    @presentations = @presentations.public unless @isProfileOwner
  end

  def show_files
    authorize! :read, @profile_user
    @files = @profile_user.files.sort_by(&:updated_at).reverse
    @files = @files.public unless @isProfileOwner
  end

  private

  def find_user
    @profile_user = User.find_by_id(params[:id])
    @isProfileOwner = (user_signed_in? and current_user.id==@profile_user.id)
  end

end