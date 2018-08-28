# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20180828145118) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "documents", force: :cascade do |t|
    t.string   "title"
    t.text     "description"
    t.text     "thumbnail_url"
    t.text     "language"
    t.string   "type"
    t.integer  "owner_id"
    t.boolean  "file_processing"
    t.boolean  "certified",              default: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "file_file_name"
    t.string   "file_content_type"
    t.integer  "file_file_size"
    t.datetime "file_updated_at"
    t.string   "thumbnail_file_name"
    t.string   "thumbnail_content_type"
    t.integer  "thumbnail_file_size"
    t.datetime "thumbnail_updated_at"
  end

  create_table "game_event_mappings", force: :cascade do |t|
    t.integer  "game_template_event_id"
    t.integer  "game_id"
    t.integer  "lo_id"
    t.string   "data"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "game_template_events", force: :cascade do |t|
    t.integer  "game_template_id"
    t.string   "title"
    t.string   "description"
    t.integer  "id_in_game"
    t.string   "metadata"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "event_type"
    t.string   "frequency"
  end

  create_table "game_templates", force: :cascade do |t|
    t.integer  "owner_id"
    t.string   "title"
    t.text     "description"
    t.text     "thumbnail_url"
    t.string   "language"
    t.text     "path"
    t.boolean  "certified",              default: false
    t.integer  "height"
    t.integer  "width"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "file_file_name"
    t.string   "file_content_type"
    t.integer  "file_file_size"
    t.datetime "file_updated_at"
    t.string   "thumbnail_file_name"
    t.string   "thumbnail_content_type"
    t.integer  "thumbnail_file_size"
    t.datetime "thumbnail_updated_at"
  end

  create_table "games", force: :cascade do |t|
    t.integer  "game_template_id"
    t.integer  "owner_id"
    t.string   "title"
    t.text     "description"
    t.text     "thumbnail_url"
    t.string   "language"
    t.boolean  "draft",                  default: false
    t.datetime "scorm2004_timestamp"
    t.datetime "scorm12_timestamp"
    t.boolean  "certified",              default: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "thumbnail_file_name"
    t.string   "thumbnail_content_type"
    t.integer  "thumbnail_file_size"
    t.datetime "thumbnail_updated_at"
    t.text     "editor_data"
  end

  create_table "los", force: :cascade do |t|
    t.string   "container_type"
    t.integer  "container_id"
    t.string   "standard"
    t.string   "standard_version"
    t.string   "schema_version"
    t.string   "lo_type"
    t.boolean  "rdata"
    t.integer  "resource_index"
    t.string   "href"
    t.string   "hreffull"
    t.string   "metadata"
    t.boolean  "certified",           default: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "resource_identifier"
  end

  create_table "pdfps", force: :cascade do |t|
    t.integer  "owner_id"
    t.integer  "pcount"
    t.boolean  "permanent",           default: false
    t.text     "thumbnail_url"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "attach_file_name"
    t.string   "attach_content_type"
    t.integer  "attach_file_size"
    t.datetime "attach_updated_at"
  end

  create_table "presentations", force: :cascade do |t|
    t.integer  "owner_id"
    t.text     "json"
    t.string   "title"
    t.text     "description"
    t.text     "thumbnail_url"
    t.string   "language"
    t.integer  "age_min",             default: 0
    t.integer  "age_max",             default: 0
    t.boolean  "draft",               default: false
    t.datetime "scorm2004_timestamp"
    t.datetime "scorm12_timestamp"
    t.boolean  "certified",           default: false
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.text     "tag_array_text",      default: ""
  end

  create_table "scormfiles", force: :cascade do |t|
    t.integer  "owner_id"
    t.string   "title"
    t.text     "description"
    t.text     "thumbnail_url"
    t.string   "language"
    t.string   "type"
    t.text     "lopath"
    t.string   "lohref"
    t.string   "lohreffull"
    t.string   "schema"
    t.string   "schema_version"
    t.string   "scorm_version"
    t.integer  "nassets"
    t.integer  "nscos"
    t.boolean  "certified",              default: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "file_file_name"
    t.string   "file_content_type"
    t.integer  "file_file_size"
    t.datetime "file_updated_at"
    t.string   "thumbnail_file_name"
    t.string   "thumbnail_content_type"
    t.integer  "thumbnail_file_size"
    t.datetime "thumbnail_updated_at"
    t.boolean  "rdata",                  default: true
  end

  create_table "taggings", force: :cascade do |t|
    t.integer  "tag_id"
    t.integer  "taggable_id"
    t.string   "taggable_type"
    t.integer  "tagger_id"
    t.string   "tagger_type"
    t.string   "context",       limit: 128
    t.datetime "created_at"
  end

  add_index "taggings", ["tag_id", "taggable_id", "taggable_type", "context", "tagger_id", "tagger_type"], name: "taggings_idx", unique: true, using: :btree
  add_index "taggings", ["taggable_id", "taggable_type", "context"], name: "index_taggings_on_taggable_id_and_taggable_type_and_context", using: :btree

  create_table "tags", force: :cascade do |t|
    t.string  "name"
    t.integer "taggings_count", default: 0
    t.string  "plain_name"
  end

  add_index "tags", ["name"], name: "index_tags_on_name", unique: true, using: :btree

  create_table "users", force: :cascade do |t|
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.inet     "current_sign_in_ip"
    t.inet     "last_sign_in_ip"
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email"
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.string   "name"
    t.string   "language"
    t.string   "ui_language"
    t.text     "tag_array_text",         default: ""
  end

  add_index "users", ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true, using: :btree
  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

end
