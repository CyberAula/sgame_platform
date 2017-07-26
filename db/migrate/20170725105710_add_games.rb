class AddGames < ActiveRecord::Migration
  def change
    create_table :games do |t|
      t.integer :game_template_id
      t.integer :owner_id
      t.string :title
      t.string :description
      t.string :thumbnail_url
      t.string :language
      t.boolean  :draft, :default => false
      t.datetime :scorm2004_timestamp
      t.datetime :scorm12_timestamp
      t.timestamps
    end
  end
end