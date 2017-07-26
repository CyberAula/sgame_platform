class AddGameTemplates < ActiveRecord::Migration
  def change
    create_table :game_templates do |t|
      t.integer :owner_id
      t.string :title
      t.string :description
      t.string :thumbnail_url
      t.string :language
      t.timestamps
    end
  end
end