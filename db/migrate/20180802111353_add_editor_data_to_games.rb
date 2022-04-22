class AddEditorDataToGames < ActiveRecord::Migration[4.2]
  def change
    add_column :games, :editor_data, :text
  end
end
