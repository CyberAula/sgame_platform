class AddRdataToScormfiles < ActiveRecord::Migration
  def change
    add_column :scormfiles, :rdata, :boolean, :default => true
  end
end