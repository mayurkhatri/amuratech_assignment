class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  helper_method :current_user

  def authenticate_user
    if current_user.blank?
      redirect_to login_path
    end
  end

  def current_user
    begin
      session[:user_id].nil? ? nil : User.find(session[:user_id])
    rescue ActiveRecord::RecordNotFound
      nil
    end
  end
end
