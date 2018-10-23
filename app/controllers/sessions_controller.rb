require 'net/http'
require 'openssl'
require 'json'

class SessionsController < ApplicationController
  def new
    if current_user.present?
      user_name = current_user.username
      uri = URI("https://api.github.com/users/#{user_name}/repos?client_id=#{ENV['GITHUB_CLIENT_ID']}&client_secret=#{ENV['GITHUB_CLIENT_SECRET']}")
      repositories = Net::HTTP.get(uri)
      json_result = JSON.parse(repositories)
      @repo_names_with_access = json_result.map{|e| e["name"]}
      # @repo_names_with_access = json_result.map{|e| [e["name"], e["private"], e["avatar_url"]]}
    end
  end

  def create
    user = User.from_omniauth(request.env["omniauth.auth"])

    if user.valid?
      session[:user_id] = user.id
      redirect_to request.env['omniauth.origin']
    end
  end

  def destroy
    reset_session
    redirect_to request.referer
  end
end
