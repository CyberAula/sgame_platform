class Zipfile < Document
  
  def fileType
    fileType = "Zipfile"

    if self.file.class == Paperclip::Attachment and !self.file.path.blank?
      Zip::File.open(self.file.path) do |zip|
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

    return fileType
  end

  def self.getSchemaFromXmlManifest(xmlManifest)
    return nil unless xmlManifest.is_a? Nokogiri::XML::Document
    schemaEl = xmlManifest.at_css('//metadata//schema')
    return schemaEl.text unless schemaEl.nil?
    nil
  end
  
end