  # encoding: utf-8

class Lom

  ####################
  ## LOM Metadata
  ####################

  def self.getLoLanguage(language, _LOMschema)
    #List of language codes according to ISO-639:1988
    # lanCodes = ["aa","ab","af","am","ar","as","ay","az","ba","be","bg","bh","bi","bn","bo","br","ca","co","cs","cy","da","de","dz","el","en","eo","es","et","eu","fa","fi","fj","fo","fr","fy","ga","gd","gl","gn","gu","gv","ha","he","hi","hr","hu","hy","ia","id","ie","ik","is","it","iu","ja","jw","ka","kk","kl","km","kn","ko","ks","ku","kw","ky","la","lb","ln","lo","lt","lv","mg","mi","mk","ml","mn","mo","mr","ms","mt","my","na","ne","nl","no","oc","om","or","pa","pl","ps","pt","qu","rm","rn","ro","ru","rw","sa","sd","se","sg","sh","si","sk","sl","sm","sn","so","sq","sr","ss","st","su","sv","sw","ta","te","tg","th","ti","tk","tl","tn","to","tr","ts","tt","tw","ug","uk","ur","uz","vi","vo","wo","xh","yi","yo","za","zh","zu"]
    lanCodesMin = I18n.available_locales.map{|i| i.to_s}

    #When language=nil, no language attribute is provided
    return nil if language.nil? or language == "independent" or !lanCodesMin.include?(language)
    return language
  end

  def self.readableContext(context, _LOMschema)
    return nil if context.blank?
    case context
    when "unspecified"
      return nil
    when "school"
    when "preschool"
    when "pEducation"
    when "sEducation"
      return "school"
    when "higher education"
      return "higher education"
    when "training"
      return "training"
    else
      return "other"
    end
  end

  def self.getLearningResourceType(lreType, _LOMschema)
    allowedLREtypes = ["exercise","simulation","questionnaire","diagram","figure","graph","index","slide","table","narrative text","exam","experiment","problem statement","self assessment","lecture"]
    if allowedLREtypes.include? lreType
      return lreType
    else
      return nil
    end
  end

  def self.generateVCard(fullName)
    return "BEGIN:VCARD&#xD;VERSION:3.0&#xD;N:"+fullName+"&#xD;FN:"+fullName+"&#xD;END:VCARD"
  end

end