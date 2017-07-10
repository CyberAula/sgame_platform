class LocalesController < ActionController::Base

  def change_locale
    locale = params[:locale]

    locale = I18n.default_locale.to_s unless Utils.valid_locale?(locale)

    session[:locale] = locale
    if user_signed_in?
      current_user.ui_language = locale
      current_user.save!
    end
    
    #Needed due to devise bug on sign_up failure path
    return redirect_to "/users/sign_up" if request.env["HTTP_REFERER"].present? and request.env["HTTP_REFERER"].ends_with?("/users")

    redirect_to :back
  end

end