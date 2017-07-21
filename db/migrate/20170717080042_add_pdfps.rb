class AddPdfps < ActiveRecord::Migration
  def change
    create_table :pdfps do |t|
      t.column :owner_id, :integer
      t.column :pcount, :integer
      t.column :permanent, :boolean, :default => false
      t.column :attach_file_name,     :string
      t.column :attach_content_type,  :string
      t.column :attach_file_size,     :integer
      t.column :attach_updated_at,    :datetime
      t.timestamps
    end
  end
end