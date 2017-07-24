class AddScormfiles < ActiveRecord::Migration
  def change
    create_table "scormfiles", :force => true do |t|
      t.string   "title"
      t.text     "description"
      t.string   "type"
      t.integer  "owner_id"
      t.datetime "created_at"
      t.datetime "updated_at"
      t.boolean  "file_processing"
      t.text     "zippath"
      t.text     "zipurl"
      t.text     "lopath"
      t.text     "lourl"
      t.string   "lohref"
      t.string   "lohreffull"
      t.string   "schema"
      t.string   "schemaversion"
      t.string   "scorm_version"
    end

    add_attachment :scormfiles, :file
  end
end