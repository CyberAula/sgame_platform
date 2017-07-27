class AddLos < ActiveRecord::Migration
  def change
    create_table :los do |t|
      t.string  :container_type
      t.integer :container_id
      t.string  :standard
      t.string  :standard_version
      t.string  :schema_version
      t.string  :lo_type
      t.boolean :rdata
      t.string  :href
      t.string  :hreffull
      t.string  :metadata
      t.boolean :certified, :default => false
      t.timestamps
    end
  end
end