class Zipfile < Document
  
  def thumbnail_url
    "/assets/zip_file_icon.png"
  end

  def fileType
    Zipfile.fileType(self.file.path)
  end

  def self.fileType(filePath)
    if File.exists?(filePath)
      Zip::File.open(filePath) do |zip|
          manifest = zip.entries.select{|e| e.name == "imsmanifest.xml"}.first
          if manifest
            schema = Zipfile.getSchemaFromXmlManifest(Nokogiri::XML(manifest.get_input_stream.read)) rescue nil
            case schema
            when "IMS Content"
              return "Imscpfile"
            when "ADL SCORM", nil
              return "Scormfile"
            end
          else
            return "Webapp" if zip.entries.select{|e| e.name == "index.html"}.first
          end
          return "Zipfile"
      end
    end
    nil
  end

  def self.getSchemaFromXmlManifest(xmlManifest)
    return nil unless xmlManifest.is_a? Nokogiri::XML::Document
    schemaEl = xmlManifest.at_css('//metadata//schema')
    return schemaEl.text unless schemaEl.nil?
    nil
  end
  
end