class AddUserFields < ActiveRecord::Migration
  def change
    add_column :users, :name, :string
    add_column :users, :language, :string
    add_column :users, :ui_language, :string
  end
end