class AddResourceIdToLos < ActiveRecord::Migration[4.2]
  def change
    add_column :los, :resource_identifier, :string
  end
end