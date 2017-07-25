class AddGameEventMappings < ActiveRecord::Migration
  def change
  	create_table :game_event_mappings do |t|
      t.integer :game_template_event_id
      t.integer :game_id
      t.integer :lo_id
      t.string :data
      t.timestamps
    end
  end
end
