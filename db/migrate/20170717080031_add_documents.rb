class AddDocuments < ActiveRecord::Migration
  def change
    create_table "documents", :force => true do |t|
      t.string   "title"
      t.text     "description"
      t.string   "type"
      t.integer  "owner_id"
      t.datetime "created_at"
      t.datetime "updated_at"
      t.boolean  "file_processing"
    end

    add_attachment :documents, :file
  end
end