class AddRdataToScormfiles < ActiveRecord::Migration[4.2]
  def change
    add_column :scormfiles, :rdata, :boolean, :default => true
  end
end