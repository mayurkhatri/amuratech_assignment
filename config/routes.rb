Rails.application.routes.draw do
  get 'login', to: 'sessions#new', as: 'login'
  get 'sessions/create'
  get 'sessions/destroy'
  get "/auth/:provider/callback", to: "sessions#create"
  get 'auth/failure', to: redirect('/')
  delete 'signout', to: 'sessions#destroy', as: 'signout'
  root to: 'repositories#index'
  resources :repositories, only: [:index, :show]
end
