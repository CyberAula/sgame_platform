class Picture < Document
  has_attached_file :file, 
                    :url => '/:class/:id.:content_type_extension',
                    :path => ':rails_root/documents/:class/:id_partition/:style',
                    :styles => {:"170x127#"=>["170x127#"], :"80x113#"=>["80x113#"], :"500"=>["500>"]}

  validates_attachment :file, content_type: { content_type: ["image/jpeg", "image/gif", "image/png"] }

  def thumbnail_url
    self.file.url
  end
end