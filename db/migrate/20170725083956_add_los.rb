class AddLos < ActiveRecord::Migration[4.2]
  def change
    create_table :los do |t|
      t.string  :container_type
      t.integer :container_id
      t.string  :standard
      t.string  :standard_version
      t.string  :schema_version
      t.string  :lo_type
      t.boolean :rdata
      t.integer :resource_index
      t.string  :href
      t.string  :hreffull
      t.string  :metadata
      t.boolean :certified, :default => false
      t.timestamps
    end
  end
end