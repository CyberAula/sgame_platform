class AddPresentations < ActiveRecord::Migration
	def change
		create_table(:presentations) do |t|
			t.integer  "author_id"
			t.string   "title"
			t.text     "json"
			t.boolean  "draft", :default => false
			t.text     "thumbnail_url"
			t.text     "description"
			t.integer  "visit_count", :default => 0
			t.string   "language"
			t.integer  "age_min", :default => 0
			t.integer  "age_max", :default => 0
			t.integer  "license_id"
			t.datetime "scorm2004_timestamp"
			t.datetime "scorm12_timestamp"
			t.string   "attachment_file_name"
			t.string   "attachment_content_type"
			t.integer  "attachment_file_size"
			t.datetime "attachment_updated_at"
			t.timestamps null: false
		end
	end
end