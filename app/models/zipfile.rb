class Zipfile < Document
  
  def thumbnail_url
    "/assets/zip_file_icon.png"
  end

  def fileType
    fileType = "Zipfile"
    fileType = Zipfile.fileType(self.file.path) if self.file.class == Paperclip::Attachment and !self.file.path.blank?
    return fileType
  end

  def self.fileType(filePath)
    Zip::File.open(filePath) do |zip|
        manifest = zip.entries.select{|e| e.name == "imsmanifest.xml"}.first
        if manifest
          schema = Zipfile.getSchemaFromXmlManifest(Nokogiri::XML(manifest.get_input_stream.read)) rescue "invalid schema"
          case schema
          when "IMS Content"
            fileType = "Imscpfile"
          when "ADL SCORM", nil
            fileType = "Scormfile"
          end
        else
          index = zip.entries.select{|e| e.name == "index.html"}.first
          fileType = "Webapp" if index
        end
    end
  end

  def self.getSchemaFromXmlManifest(xmlManifest)
    return nil unless xmlManifest.is_a? Nokogiri::XML::Document
    schemaEl = xmlManifest.at_css('//metadata//schema')
    return schemaEl.text unless schemaEl.nil?
    nil
  end

  def getResourceAfterSave
    case self.fileType
    when "Scormfile"
      resource = Scormfile.createScormfileFromZip(self)
    when "Imscpfile"
      # TODO
      # resource = Imscpfile.createImscpfileFromZip(self)
      resource = self
    when "Webapp"
      # TODO
      # resource = Webapp.createWebappFromZip(self)
      resource = self
    else
      resource = self
    end
    return resource
  end
  
end