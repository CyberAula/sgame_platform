class AddEditorDataToGames < ActiveRecord::Migration
  def change
    add_column :games, :editor_data, :text
  end
end
