class AddGameTemplateEvents < ActiveRecord::Migration
  def change
    create_table :game_template_events do |t|
      t.integer :game_template_id
      t.string :title
      t.string :description
      t.integer :id_in_game
      t.string :metadata
      t.timestamps
    end
  end
end
