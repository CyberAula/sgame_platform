class AddGameTemplates < ActiveRecord::Migration
  def change
    create_table :game_templates do |t|
      t.integer :owner_id
      t.string  :title
      t.text    :description
      t.string  :thumbnail_url
      t.string  :language
      t.text    :path
      t.timestamps
    end

    add_attachment :game_templates, :file
  end
end