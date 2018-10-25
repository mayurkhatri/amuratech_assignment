require 'net/http'
require 'openssl'
require 'json'

class SessionsController < ApplicationController
  layout false
  def new
  end

  def create
    user = User.from_omniauth(request.env["omniauth.auth"])

    if user.valid?
      session[:user_id] = user.id
      redirect_to repositories_path
    end
  end

  def destroy
    reset_session
    redirect_to request.referer
  end
end
