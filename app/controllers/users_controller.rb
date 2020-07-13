class UsersController < ApplicationController
  before_action :find_user
  load_and_authorize_resource :except => [:show_scormfiles, :show_presentations, :show_files, :show_games, :show_templates]

  def show
    @scormfiles = @profile_user.scormfiles.order('updated_at DESC')
    @scormfiles = @scormfiles.public_items unless @isProfileOwner
  end

  def show_scormfiles
    @scormfiles = @profile_user.scormfiles.order('updated_at DESC')
    @scormfiles = @scormfiles.public_items unless @isProfileOwner
  end

  def show_presentations
    @presentations = @profile_user.presentations.order('updated_at DESC')
    @presentations = @presentations.public_items unless @isProfileOwner
  end

  def show_files
    @files = @profile_user.documents
    @files = @files.public_items unless @isProfileOwner
    @files = @files.sort_by(&:updated_at).reverse
  end

  def show_games
    @games = @profile_user.games.order('updated_at DESC')
    @games = @games.public_items unless @isProfileOwner
  end

  def show_templates
    @game_templates = @game_templates.order('updated_at DESC')
  end

  private

  def find_user
    @profile_user = User.find_by_id(params[:id])
    authorize! :read, @profile_user
    @isProfileOwner = (user_signed_in? and current_user.id==@profile_user.id)
    
    #Get game templates (in order to decide if the tab 'templates' should be displayed)
    @game_templates = @profile_user.game_templates
    @game_templates = @game_templates.public_items unless @isProfileOwner
  end

end