class AddPdfps < ActiveRecord::Migration[4.2]
  def change
    create_table :pdfps do |t|
      t.column :owner_id, :integer
      t.column :pcount, :integer
      t.column :permanent, :boolean, :default => false
      t.text   :thumbnail_url
      t.timestamps
    end

    add_attachment :pdfps, :attach
  end
end