Rails.application.configure do
  #Config action mailer
  #http://edgeguides.rubyonrails.org/action_mailer_basics.html
  sgameMailConf = config.APP_CONFIG["mail"]

  ActionMailer::Base.default :charset => "utf-8"
  config.action_mailer.default_url_options = {:host => config.APP_CONFIG["domain"]}

  unless sgameMailConf.nil?  
    if sgameMailConf["type"] == "SENDMAIL"
      ActionMailer::Base.delivery_method = :sendmail
      ActionMailer::Base.default :from => sgameMailConf["no_reply_mail"] unless sgameMailConf["no_reply_mail"].blank?
      ActionMailer::Base.sendmail_settings = {
        :location => "/usr/sbin/sendmail",
        :arguments => "-i -t"
      }
    else
      ActionMailer::Base.delivery_method = :smtp
      if sgameMailConf["gmail_credentials"].blank?
        ActionMailer::Base.default :from => sgameMailConf["no_reply_mail"] unless sgameMailConf["no_reply_mail"].blank?
        smtp_settings = {}
        smtp_settings[:address] = sgameMailConf["address"].blank? ? "127.0.0.1" : sgameMailConf["address"] #If no address is provided, use local SMTP server
        smtp_settings[:port] = sgameMailConf["port"].blank? ? "25" : sgameMailConf["port"]
        smtp_settings[:domain] = sgameMailConf["domain"].blank? ? config.APP_CONFIG["domain"] : sgameMailConf["domain"]
        smtp_settings[:user_name] = sgameMailConf["username"] unless sgameMailConf["username"].blank?
        smtp_settings[:password] = sgameMailConf["password"] unless sgameMailConf["password"].blank?
        smtp_settings[:enable_starttls_auto] = sgameMailConf["enable_starttls_auto"].blank? ? true : (sgameMailConf["enable_starttls_auto"]=="true")
        smtp_settings[:openssl_verify_mode] = sgameMailConf["openssl_verify_mode"].blank? ? "none" : (sgameMailConf["openssl_verify_mode"])
        config.action_mailer.smtp_settings = smtp_settings
      else
        #Use gmail Credentials
        smtp_settings = {
          :address => "smtp.gmail.com",
          :port => 587,
          :domain => "gmail.com",
          :user_name => sgameMailConf["gmail_credentials"]["username"],
          :password => sgameMailConf["gmail_credentials"]["password"],
          :authentication => "plain",
          :enable_starttls_auto => true
        }
      end
      ActionMailer::Base.smtp_settings = smtp_settings
    end
  end
end