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
    since = Time.now - 30.days
    till = Time.now
    uri = URI("https://api.github.com/repos/#{@user_name}/#{@repository_name}/commits?client_id=#{ENV['GITHUB_CLIENT_ID']}&client_secret=#{ENV['GITHUB_CLIENT_SECRET']}&since=#{since}&until=#{till}")
    commit_history = Net::HTTP.get(uri)
    json_result = JSON.parse(commit_history)
    @commit_history_array = json_result.map{|e| e["commit"]["author"]["date"]}.join(",")
  end

  def get_commits
    since = params[:startDate]
    till = params[:endDate]
    user_name = current_user.username
    repository_name = params[:id]
    uri = URI("https://api.github.com/repos/#{user_name}/#{repository_name}/commits?client_id=#{ENV['GITHUB_CLIENT_ID']}&client_secret=#{ENV['GITHUB_CLIENT_SECRET']}&since=#{since}&until=#{till}")
    commit_history = Net::HTTP.get(uri)
    json_result = JSON.parse(commit_history)
    @commit_history_array = json_result.map{|e| e["commit"]["author"]["date"]}.join(",")
    render json: json_result
  end
end
