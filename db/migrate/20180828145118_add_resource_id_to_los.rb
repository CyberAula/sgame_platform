class AddResourceIdToLos < ActiveRecord::Migration
  def change
    add_column :los, :resource_identifier, :string
  end
end