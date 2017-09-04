class UsersController < ApplicationController
  before_filter :find_user
  load_and_authorize_resource :except => [:show_presentations]

  def show
    @scormfiles = @profile_user.scormfiles.sort_by(&:updated_at).reverse
    @scormfiles = @scormfiles.public unless @isProfileOwner
  end

  def show_scormfiles
    @scormfiles = @profile_user.scormfiles.sort_by(&:updated_at).reverse
    @scormfiles = @scormfiles.public unless @isProfileOwner
  end

  def show_presentations
    @presentations = @profile_user.presentations.order('updated_at DESC')
    @presentations = @presentations.public unless @isProfileOwner
  end

  def show_files
    @files = @profile_user.documents.sort_by(&:updated_at).reverse
    @files = @files.public unless @isProfileOwner
  end

  def show_games
    @games = @profile_user.games.sort_by(&:updated_at).reverse
    @games = @games.public unless @isProfileOwner
  end

  def show_templates
    @game_templates = @game_templates.sort_by(&:updated_at).reverse
  end

  private

  def find_user
    @profile_user = User.find_by_id(params[:id])
    authorize! :read, @profile_user
    @isProfileOwner = (user_signed_in? and current_user.id==@profile_user.id)
    
    #Get game templates (in order to decide if the tab 'templates' should be displayed)
    @game_templates = @profile_user.game_templates
    @game_templates = @game_templates.public unless @isProfileOwner
  end

end