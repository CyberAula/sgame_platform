class User < ActiveRecord::Base
	devise :database_authenticatable, :registerable,
	:recoverable, :rememberable, :trackable, :validatable, :confirmable, :omniauthable

	include Taggable
	acts_as_ordered_taggable

	has_many :presentations, :foreign_key => "owner_id"
	has_many :documents, :foreign_key => "owner_id"
	has_many :pdfp, :foreign_key => "owner_id"

	before_save :fillTags
	before_save :save_tag_array_text

	validates_presence_of :name
end