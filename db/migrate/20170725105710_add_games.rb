class AddGames < ActiveRecord::Migration
  def change
    create_table :games do |t|
      t.integer :game_template_id
      t.string :title
      t.string :description
      t.string :thumbnail_url
      t.timestamps
    end
  end
end