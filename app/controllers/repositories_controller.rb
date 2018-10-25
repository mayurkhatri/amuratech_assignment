require 'net/http'
require 'openssl'
require 'json'

class RepositoriesController < ApplicationController
  before_action :authenticate_user
  def index
    if current_user.present?
      user_name = current_user.username
      uri = URI("https://api.github.com/users/#{user_name}/repos?client_id=#{ENV['GITHUB_CLIENT_ID']}&client_secret=#{ENV['GITHUB_CLIENT_SECRET']}")
      repositories = Net::HTTP.get(uri)
      json_result = JSON.parse(repositories)
      @repo_names_with_access = json_result
    end
  end

  def show
    @repository_name = params[:id]
    @repository_description = params[:description]
    @user_name = current_user.username.to_s
    uri = URI("https://api.github.com/repos/#{@user_name}/#{@repository_name}/commits?client_id=#{ENV['GITHUB_CLIENT_ID']}&client_secret=#{ENV['GITHUB_CLIENT_SECRET']}")
    commit_history = Net::HTTP.get(uri)
    json_result = JSON.parse(commit_history)
    commit_history_array = json_result.map{|e| e["commit"]["author"]["date"].to_date}
    @commit_history_array = commit_history_array.each_with_object(Hash.new(0)) {|e, h| h[e] += 1}
  end
end
