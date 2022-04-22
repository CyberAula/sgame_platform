class AddExtraFieldsToEvents < ActiveRecord::Migration[4.2]
  def change
    add_column :game_template_events, :event_type, :string
    add_column :game_template_events, :frequency, :string
  end
end