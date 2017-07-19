class UsersController < ApplicationController
  before_filter :find_user, :only => [:show, :show_presentations]

  def show
  	@presentations = @profile_user.presentations
  	@presentations = @presentations.public unless @isProfileOwner
  end

  def show_presentations
  	@presentations = @profile_user.presentations
    @presentations = @presentations.public unless @isProfileOwner
    render :show
  end

  private

  def find_user
    @profile_user = User.find_by_id(params[:id])
    @isProfileOwner = (user_signed_in? and current_user.id==@profile_user.id)
  end

end