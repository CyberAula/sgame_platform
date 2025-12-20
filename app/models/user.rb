class User < ActiveRecord::Base
	attr_accessor :accept_terms
	validates :accept_terms, acceptance: true, on: :create
	validates :terms_accepted_at, presence: true, on: :create
	before_validation :set_terms_accepted_at, on: :create
	devise :database_authenticatable, :registerable,
	:recoverable, :rememberable, :trackable, :validatable, :confirmable, :omniauthable

	include Taggable
	acts_as_ordered_taggable

	has_many :presentations, :foreign_key => "owner_id", :dependent => :destroy
	has_many :documents, :foreign_key => "owner_id", :dependent => :destroy
	has_many :scormfiles, :foreign_key => "owner_id", :dependent => :destroy
	has_many :pdfp, :foreign_key => "owner_id", :dependent => :destroy
	has_many :games, :foreign_key => "owner_id", :dependent => :destroy
	has_many :game_templates, :foreign_key => "owner_id", :dependent => :destroy

	before_save :fillTags
	before_save :save_tag_array_text

	validates_presence_of :name

	def files
		self.documents + self.scormfiles
	end

	def accepted_latest_terms?
    	return true if SgamePlatform::Application.config.terms_last_updated_at.blank?
    	return false if self.terms_accepted_at.blank?
    	self.terms_accepted_at >= SgamePlatform::Application.config.terms_last_updated_at
  	end

	private

	def set_terms_accepted_at
		self.terms_accepted_at ||= Time.current if accept_terms == "1"
	end

end