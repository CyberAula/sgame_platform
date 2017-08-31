SgamePlatform::Application.routes.draw do
  root "home#frontpage"

  #Users
  devise_for :users, controllers: { sessions: "users/sessions", registrations: "users/registrations", :omniauth_callbacks => "users/omniauth_callbacks" }

  match '/users/:id/presentations' => 'users#show_presentations', via: [:get]
  match '/users/:id/files' => 'users#show_files', via: [:get]
  match '/users/:id/games' => 'users#show_games', via: [:get]
  match '/users/:id/templates' => 'users#show_templates', via: [:get]
  resources :users

  #Locale
  match '/change_locale', to: 'locales#change_locale', via: [:get]

  #Thumbnails
  match '/thumbnails' => 'presentations#presentation_thumbnails', via: [:get]

  #Documents
  resources :documents
  resources :pictures
  resources :zipfiles
  resources :scormfiles
  match '/documents/:id/download' => 'documents#download', :via => :get
  match '/scormfiles/:id/download' => 'scormfiles#download', :via => :get
  match '/games/new' => 'demo#demo', :via => :get #redirect create games to the demo application
  resources :games
  resources :game_templates

  #Presentations
  match '/presentations/:id/metadata' => 'presentations#metadata', :via => :get
  match '/presentations/:id/scormMetadata' => 'presentations#scormMetadata', :via => :get
  match '/presentations/last_slide' => 'presentations#last_slide', :via => :get
  match '/presentations/preview' => 'presentations#preview', :via => :get
  match '/presentations/tmpJson' => 'presentations#uploadTmpJSON', :via => :post
  match '/presentations/tmpJson' => 'presentations#downloadTmpJSON', :via => :get

  resources :presentations

  #PDF to Presentation
  # resources :pdfexes, :except => [:index], controller: 'pdfps'
  resources :pdfps, :except => [:index]

  #Tags
  match "/tags" => 'tags#index', :via => :get

  #Change ui language
  match '/change_locale', to: 'locales#change_locale', via: [:get]

  #SGAME API
  match '/SGAME.js', to: 'games#sgame_api', via: [:get]

  #Demo
  match '/demo', to: 'demo#demo', via: [:get]

  #Wildcard route (This rule should be placed the last)
  match "*not_found", :to => 'application#page_not_found', via: [:get]
end