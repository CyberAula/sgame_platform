class AddGameTemplates < ActiveRecord::Migration
  def change
    create_table :game_templates do |t|
      t.integer :owner_id
      t.string  :title
      t.text    :description
      t.text    :thumbnail_url
      t.string  :language
      t.text    :path
      t.boolean  :certified, :default => false
      t.integer :height
      t.integer :width
      t.timestamps
    end

    add_attachment :game_templates, :file
    add_attachment :game_templates, :thumbnail
  end
end