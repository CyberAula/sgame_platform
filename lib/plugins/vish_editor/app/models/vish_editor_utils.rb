# encoding: utf-8
require 'json'

class VishEditorUtils
  
  def self.getElementTypes(loJSON)
    types = []
    begin
      slides = loJSON["slides"]
      types = types + slides.map { |s| s["type"] }
      slides.each do |slide|
        els = slide["elements"]
        if !els.nil?
          types = types + els.map {|el| getElType(el)}
        end
      end
      types.uniq!
      types = types.reject { |type| type.nil? }
    rescue => e
      return "Exception: " + e.message
    end
    return types
  end

  def self.getElType(el)
    return nil if el.nil?
    
    elType = el["type"]
    if elType != "object"
      return elType
    else
      #Look in body param
      elBody = el["body"]
      if elBody.nil? or !elBody.is_a? String
        return elType
      end
      if elBody.include?("://docs.google.com")
        return "document"
      end
      if elBody.include?("www.youtube.com")
        return "video"
      end
      if elBody.include?(".swf") and elBody.include?("embed")
        return "flash"
      end
      return "web"
    end
  end

  def self.reportData?(loJSON)
    reportData = false

    slides = loJSON["slides"]
    standardSlides = []
    slides.each do |slide|
      case slide["type"]
      when "flashcard","VirtualTour","enrichedvideo"
        standardSlides = standardSlides + (slide["slides"] || [])
      when "standard",nil
        #Standard or default
        standardSlides.push(slide)
      else
        #Do nothing
      end
    end

    slideElements = []
    standardSlides.each do |slide|
      slideElements = slideElements + (slide["elements"] || [])
    end
    
    slideElements.each do |el|
      case el["type"]
      when nil,"text","image","video","audio","snapshot"
        #Do nothing
      when "quiz"
        unless el["quiztype"].blank? or el["question"]["value"].blank? or (el["choices"].blank? and el["quiztype"]!="openAnswer")
          if el["selfA"]===true
            reportData = true
            break
          end
        end
      when "object"
        #Do nothing in this version
        #Future versions: deal with objects (e.g. SCORM packages and web apps) included in the presentations that report scores
      else
      end
    end

    reportData
  end

end