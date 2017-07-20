# Set up Recommender System settings
# Store some variables in configuration to speed things up
# Config accesible in SGAME::Application::config

Rails.application.configure do
  
  #SGAME RS settings
  rsConfig = {}
  rsConfig = config.APP_CONFIG["recommender_system"].parse_for_rs unless config.APP_CONFIG["recommender_system"].blank?

  #Default settings to use in SGAMERS
  config.rs_settings = {}
  config.rs_settings = rsConfig[:default_settings] unless rsConfig[:default_settings].blank?
  config.rs_settings = {:database => "SGAME", :sgame_database => {:max_preselection_size => 500, :preselection_size => 500}, :max_text_length => 50, :max_user_los => 1, :max_user_pastlos => 4, :preselection_filter_resource_type => "true", :preselection_filter_languages => "false"}.recursive_merge(config.rs_settings)

  #Default weights
  weights = {}
  weights[:default_rs] = RecommenderSystem.defaultRSWeights
  weights[:default_los] = RecommenderSystem.defaultLoSWeights
  weights[:default_us] = RecommenderSystem.defaultUSWeights
  if rsConfig[:weights]
    weights[:default_rs] = weights[:default_rs].recursive_merge(rsConfig[:weights][:default_rs]) if rsConfig[:weights][:default_rs]
    weights[:default_los] = weights[:default_los].recursive_merge(rsConfig[:weights][:default_los]) if rsConfig[:weights][:default_los]
    weights[:default_us] = weights[:default_us].recursive_merge(rsConfig[:weights][:default_us]) if rsConfig[:weights][:default_us]
  end
  config.weights = weights

  #Default filters
  filters = {}
  filters[:default_rs] = RecommenderSystem.defaultRSFilters
  filters[:default_los] = RecommenderSystem.defaultLoSFilters
  filters[:default_us] = RecommenderSystem.defaultUSFilters
  if rsConfig[:filters]
    filters[:default_rs] = filters[:default_rs].recursive_merge(rsConfig[:filters][:default_rs])if rsConfig[:filters][:default_rs]
    filters[:default_los] = filters[:default_los].recursive_merge(rsConfig[:filters][:default_los])if rsConfig[:filters][:default_los]
    filters[:default_us] = filters[:default_us].recursive_merge(rsConfig[:filters][:default_us])if rsConfig[:filters][:default_us]
  end
  config.filters = filters

  #RS: internal settings
  config.max_user_los = (config.rs_settings[:max_user_los].is_a?(Numeric) ? config.rs_settings[:max_user_los] : 1)
  config.max_user_pastlos = (config.rs_settings[:max_user_pastlos].is_a?(Numeric) ? config.rs_settings[:max_user_pastlos] : 4)

  #Settings for speed up TF-IDF calculations
  config.max_text_length = (config.rs_settings[:max_text_length].is_a?(Numeric) ? config.rs_settings[:max_text_length] : 50)

  config.stoptags = File.read("config/stoptags.yml").split(",").map{|s| s.gsub("\n","").gsub("\"","") } rescue []
end