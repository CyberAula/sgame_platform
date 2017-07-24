SgamePlatform::Application.routes.draw do
  root "home#frontpage"

  #Users
  devise_for :users, controllers: { sessions: "users/sessions", registrations: "users/registrations", :omniauth_callbacks => "users/omniauth_callbacks" }

  match '/users/:id/presentations' => 'users#show_presentations', via: [:get]
  resources :users

  #Locale
  match '/change_locale', to: 'locales#change_locale', via: [:get]

  #Thumbnails
  match '/thumbnails' => 'presentations#presentation_thumbnails', via: [:get]

  #Documents
  resources :documents
  match '/documents/:id/download' => 'documents#download', :via => :get
  resources :pictures
  resources :zipfiles

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

  #Wildcard route (This rule should be placed the last)
  match "*not_found", :to => 'application#page_not_found', via: [:get]
end