class AddScormfiles < ActiveRecord::Migration
  def change
    create_table "scormfiles", :force => true do |t|
      t.integer  :owner_id
      t.string   :title
      t.text     :description
      t.text     :thumbnail_url
      t.string   :language
      t.string   :type
      t.text     :lopath
      t.string   :lohref
      t.string   :lohreffull
      t.string   :schema
      t.string   :schema_version
      t.string   :scorm_version
      t.timestamps
    end

    add_attachment :scormfiles, :file
  end
end