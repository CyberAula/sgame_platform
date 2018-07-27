SgamePlatform::Application.routes.draw do
  root "home#frontpage"

  #Users
  devise_for :users, controllers: { sessions: "users/sessions", registrations: "users/registrations", :omniauth_callbacks => "users/omniauth_callbacks" }

  match '/users/:id/presentations' => 'users#show_presentations', via: [:get]
  match '/users/:id/scormfiles' => 'users#show_scormfiles', via: [:get]
  match '/users/:id/files' => 'users#show_files', via: [:get]
  match '/users/:id/games' => 'users#show_games', via: [:get]
  match '/users/:id/game_templates' => 'users#show_templates', via: [:get]
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
  resources :games
  match '/games/:id/metadata' => 'games#metadata', :via => :get
  resources :game_templates
  match '/game_templates/:id/download' => 'game_templates#download', :via => :get

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
  match '/demo/create', to: 'demo#create', via: [:post]

  #Terms of use
  match '/terms_of_use', to: "home#frontpage", via: [:get]

  #Wildcard route (This rule should be placed the last)
  match "*not_found", :to => 'application#page_not_found', via: [:get]
end