Rails.application.configure do
  #Config action mailer
  #http://edgeguides.rubyonrails.org/action_mailer_basics.html
  mConf = config.APP_CONFIG["mail"]

  ActionMailer::Base.default :charset => "utf-8"
  ActionMailer::Base.default_url_options = {:host => config.APP_CONFIG["domain"]}
  ActionMailer::Base.perform_deliveries = false
  ActionMailer::Base.raise_delivery_errors = false

  unless mConf.nil?
    ActionMailer::Base.default :from => mConf["no_reply_mail"] unless mConf["no_reply_mail"].blank?
    ActionMailer::Base.perform_deliveries = mConf["perform_deliveries"] unless mConf["perform_deliveries"].blank?
    ActionMailer::Base.raise_delivery_errors = mConf["raise_delivery_errors"] unless mConf["raise_delivery_errors"].blank?
    
    if mConf["type"] == "SENDMAIL"
      ActionMailer::Base.delivery_method = :sendmail
      ActionMailer::Base.sendmail_settings = {
        :location => "/usr/sbin/sendmail",
        :arguments => "-i -t"
      }
    else
      ActionMailer::Base.delivery_method = :smtp
      
      if mConf["gmail_credentials"].blank?
        smtp_settings = {}
        smtp_settings[:address] = mConf["address"].blank? ? "127.0.0.1" : mConf["address"]
        smtp_settings[:port] = mConf["port"].blank? ? "25" : mConf["port"]
        smtp_settings[:domain] = mConf["domain"].blank? ? config.APP_CONFIG["domain"] : mConf["domain"]
        smtp_settings[:user_name] = mConf["username"] unless mConf["username"].blank?
        smtp_settings[:password] = mConf["password"] unless mConf["password"].blank?
        smtp_settings[:enable_starttls_auto] = mConf["enable_starttls_auto"].blank? ? true : mConf["enable_starttls_auto"]
        smtp_settings[:openssl_verify_mode] = mConf["openssl_verify_mode"].blank? ? "none" : mConf["openssl_verify_mode"]
        config.action_mailer.smtp_settings = smtp_settings
      else
        #Use gmail Credentials
        smtp_settings = {
          :address => "smtp.gmail.com",
          :port => 587,
          :domain => "gmail.com",
          :user_name => mConf["gmail_credentials"]["username"],
          :password => mConf["gmail_credentials"]["password"],
          :authentication => "plain",
          :enable_starttls_auto => true,
          :open_timeout => 5,
          :read_timeout => 5 
        }
      end

      ActionMailer::Base.smtp_settings = smtp_settings
    end
  end
end