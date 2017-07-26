class Document < ActiveRecord::Base
  include Item
  acts_as_ordered_taggable

  belongs_to :owner, :class_name => 'User', :foreign_key => "owner_id"

  has_attached_file :file,
                    :url => '/:class/:id.:content_type_extension',
                    :path => ':rails_root/documents/:class/:id_partition/original/:filename.:extension'

  before_validation :set_title, :only => [:create]

  validates_attachment_presence :file
  do_not_validate_attachment_file_type :file
  validates_presence_of :owner_id
  validate :owner_validation
  validates_presence_of :title


  class << self
    def new(*args)
      # If already called from subtype, continue through the stack
      return super if self.name != "Document"
      doc = super
      return doc if doc.file_content_type.blank?
      klass = lookup_subtype_class(doc)
      if klass == Zipfile
        zipFileType = Zipfile.fileType(doc.file.queued_for_write[:original].path)
        klass = zipFileType.constantize unless zipFileType.nil?
      end
      return klass.new *args unless klass.blank?
      doc
    end

    # # Searches for the suitable class based on its mime type
    def lookup_subtype_class(doc)
      SgamePlatform::Application.config.subtype_classes_mime_types.each_pair do |klass, mime_types|
        return klass.to_s.classify.constantize if mime_types.include?(doc.mime_type.to_sym)
      end
      nil
    end
  end

  # The Mime::Type of this document's file
  def mime_type
    Mime::Type.lookup(self.file_content_type)
  end

  def as_json(options)
    json = {
     :id => self.id,
     :title => self.title,
     :src => SgamePlatform::Application.config.full_domain + self.file.url
    }
    json[:src] = Utils.checkUrlProtocol(json[:src],options[:protocol]) unless options[:protocol].blank?
    json
  end

  private

  def set_title
    self.title = file_file_name if self.title.blank?
  end

end