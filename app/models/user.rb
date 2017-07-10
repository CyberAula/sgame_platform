class User < ActiveRecord::Base
	devise :database_authenticatable, :registerable,
	:recoverable, :rememberable, :trackable, :validatable, :confirmable, :omniauthable

	has_many :presentations, :foreign_key => "author_id"
end