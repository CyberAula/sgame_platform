class AddDocuments < ActiveRecord::Migration
  def change
    create_table "documents", :force => true do |t|
      t.string   :title
      t.text     :description
      t.text     :thumbnail_url
      t.text     :language
      t.string   :type
      t.integer  :owner_id
      t.boolean  :file_processing
      t.boolean  :certified, :default => false
      t.timestamps
    end

    add_attachment :documents, :file
  end
end