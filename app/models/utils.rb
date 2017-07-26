# encoding: utf-8

class Utils

  #################
  # Languages Utils
  #################

  def self.valid_locale?(locale)
    locale.is_a? String and I18n.available_locales.include? locale.to_sym
  end

  def self.getAllLanguages
    I18n.available_locales.map{|l| l.to_s}
  end

  #Translate ISO 639-1 codes to readable language names
  def self.getReadableLanguage(lanCode="")
    I18n.t("languages." + lanCode.to_s, :default => lanCode.to_s)
  end

  #Change URLs to https when clientProtocol is HTTPs
  def self.checkUrlProtocol(url,clientProtocol)
    return url unless url.is_a? String and clientProtocol.include?("https")
    protocolMatch = url.scan(/^https?:\/\//)
    return url if protocolMatch.blank?

    urlProtocol = protocolMatch[0].sub(":\/\/","");
    clientProtocol = clientProtocol.sub(":\/\/","");

    if (urlProtocol != clientProtocol)
      case(clientProtocol)
        when "https"
          #Try to load HTTP url over HTTPs
          url = "https" + url.sub(urlProtocol,""); #replace first
        when "http"
          #Try to load HTTPs url over HTTP. Do nothing.
        else
         #Document is not loaded over HTTP or HTTPs. Do nothing.
        end
    end
    return url
  end

  def self.getResourceTypes
    ["Presentation","Document","Scormfile","Game"]
  end

end