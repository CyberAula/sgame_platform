module Scorm
  
  # A +Resource+ is a representation/description of an actual resource (image,
  # sco, pdf, etc...) in a SCORM package.
  class Resource
    attr_accessor :id
    attr_accessor :type
    attr_accessor :scorm_type
    attr_accessor :href
    attr_accessor :metadata
    attr_accessor :files
    attr_accessor :dependencies
    
    def initialize(id, type, scorm_type, href = nil, metadata = nil, files = nil, dependencies = nil)
      raise InvalidManifest, 'Missing resource id' if id.nil?
      raise InvalidManifest, 'Missing resource type' if type.nil?
      breakpoint if scorm_type.nil?
      raise InvalidManifest, 'Missing resource scormType' if scorm_type.nil?
      @id = id.to_s
      @type = type.to_s
      @scorm_type = scorm_type.to_s
      @href = href.to_s || ''
      @metadata = metadata || Hash.new
      @files = files || []
      @dependencies = dependencies || []
    end
    
    def self.from_xml(element, package=nil)
      if !element.attribute('href')
        return nil
      end

      @metadata = nil
      files = []
      REXML::XPath.each(element, 'file') do |file_el|
        files << element.attribute('xml:base').to_s + file_el.attribute('href').to_s
      end
      dependencies = []
      REXML::XPath.each(element, 'dependency') do |dep_el|
        dependencies << dep_el.attribute('identifierref').to_s
      end

      # debugger
      # Read metadata
      if package
        if metadata_el = REXML::XPath.first(element, 'metadata')
          # Find a <lom> element...
          lom_el = nil
          if adlcp_location = REXML::XPath.first(metadata_el, 'adlcp:location')
            # Read external metadata file
            metadata_xmldoc = REXML::Document.new(package.file(adlcp_location.text.to_s))
            if metadata_xmldoc.nil? || (metadata_xmldoc.root.name != 'lom')
              raise InvalidManifest, "Invalid external metadata file (#{adlcp_location.text.to_s})."
            else
              lom_el = metadata_xmldoc.root
            end
          else
            # Read inline metadata
            lom_el = REXML::XPath.first(metadata_el, 'lom') ||
                     REXML::XPath.first(metadata_el, 'lom:lom')
          end
        
          # Read lom metadata
          if lom_el
            @metadata = Scorm::Metadata.from_xml(lom_el)
          end
        end
      end

      res = self.new(
        element.attribute('identifier'), 
        element.attribute('type'), 
        element.attribute('scormType', 'adlcp') || element.attribute('scormtype', 'adlcp'),
        element.attribute('xml:base').to_s + element.attribute('href').to_s,
        @metadata,
        files,
        dependencies)
    end
  end
end