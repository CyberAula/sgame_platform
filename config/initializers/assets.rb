# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path
# Rails.application.config.assets.paths << Emoji.images_path

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
# Rails.application.config.assets.precompile += %w( search.js )

Rails.application.config.assets.precompile += %w( ckeditor/ckeditor.js )
Rails.application.config.assets.precompile += %w( vishEditor.js )
Rails.application.config.assets.precompile += %w( vishEditor.min.js )
Rails.application.config.assets.precompile += %w( vish_editor.css )
Rails.application.config.assets.precompile += %w( VISH.IframeAPI.js )
Rails.application.config.assets.precompile += %w( vishViewer.js )
Rails.application.config.assets.precompile += %w( vishViewer.min.js  )
Rails.application.config.assets.precompile += %w( ve_sgame_locales.js )
Rails.application.config.assets.precompile += %w( jquery.js )
Rails.application.config.assets.precompile += %w( SGAME.min.js )
Rails.application.config.assets.precompile += %w( sgame_demo.js )
Rails.application.config.assets.precompile += %w( sgame_demo_locales.js )
Rails.application.config.assets.precompile += %w( sgame_demo.css )
Rails.application.config.assets.precompile += %w( sgame_at.js )
Rails.application.config.assets.precompile += %w( sgame_at.css )