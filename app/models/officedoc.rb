class Officedoc < Document  

  def source_full_url(protocol)
    Utils.checkUrlProtocol(SgamePlatform::Application.config.full_domain + self.file.url, protocol)
  end

  def google_doc_url(protocol)
    "https://docs.google.com/viewer?url=" + self.source_full_url(protocol) + "&embedded=true"
  end

end