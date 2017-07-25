class AddGameTemplates < ActiveRecord::Migration
  def change
    create_table :game_templates do |t|
      t.string :title
      t.string :description
      t.string :thumbnail_url
      t.timestamps
    end
  end
end