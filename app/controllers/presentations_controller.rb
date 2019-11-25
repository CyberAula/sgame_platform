class PresentationsController < ApplicationController
  require 'fileutils'
  before_filter :authenticate_user!, :only => [ :new, :create, :edit, :update, :clone, :uploadTmpJSON ]
  load_and_authorize_resource :except => [:metadata]

  # Enable CORS
  before_filter :cors_preflight_check, :only => [:presentation_thumbnails, :last_slide, :iframe_api]
  after_filter :cors_set_access_control_headers, :only => [:presentation_thumbnails, :last_slide, :iframe_api]
  
  #############
  # REST methods
  #############

  def index
    redirect_to "/"
  end

  def show
    @presentation = Presentation.find(params[:id])
    @suggestions = RecommenderSystem.suggestions({:n => 6, :lo_profile => @presentation.profile, :settings => {:preselection_filter_by_resource_types => ["Presentation"]}})
    respond_to do |format|
      format.html {
        if @presentation.draft 
          if (can? :edit, @presentation)
            redirect_to edit_presentation_path(@presentation)
          else
            redirect_to "/"
          end
        else
          render
        end
      }
      format.full {
        render :layout => 'veditor'
      }
      format.sgame {
        render :layout => 'veditor'
      }
      format.json {
        render :json => @presentation.json
      }
      format.scorm {
        if (can? :read, @presentation)
          scormVersion = (params["version"].present? and ["12","2004"].include?(params["version"])) ? params["version"] : "2004"
          @presentation.to_scorm(self,scormVersion)
          send_file @presentation.scormFilePath(scormVersion), :type => 'application/zip', :disposition => 'attachment', :filename => ("scorm" + scormVersion + "-#{@presentation.id}.zip")
        else
          render :nothing => true, :status => 500
        end
      }      
    end
  end

  def new
    @presentation = Presentation.new
    respond_to do |format|
      format.full { render :layout => 'veditor', :locals => {:default_tag=> params[:default_tag]}}
    end
  end

  def edit
    @presentation = Presentation.find(params[:id])
    respond_to do |format|
      format.full { render :layout => 'veditor' }
    end
  end

  def create
    params[:excursion].permit!
    @presentation = Presentation.new(params[:excursion])

    if(params[:draft] and params[:draft] == "true")
      @presentation.draft = true
    else
      @presentation.draft = false
    end
    @presentation.owner_id = current_user.id
    @presentation.save!

    published = (@presentation.draft===false)
    if published
      @presentation.afterPublish
    end

    render :json => { :url => (@presentation.draft ? user_path(current_user) : presentation_path(@presentation)),
                      :uploadPath => presentation_path(@presentation, :format=> "json"),
                      :editPath => edit_presentation_path(@presentation),
                      :id => @presentation.id
                    }
  end

  def update
    params[:excursion].permit! unless params[:excursion].blank?

    @presentation = Presentation.find(params[:id])
    wasDraft = @presentation.draft

    if(params[:draft])
      if(params[:draft] == "true")
        @presentation.draft = true
      elsif (params[:draft] == "false")
        @presentation.draft = false
      end
    end

    @presentation.update_attributes!(params[:excursion] || {})
   
    published = (wasDraft===true and @presentation.draft===false)
    if published
      @presentation.afterPublish
    end

    render :json => { :url => (@presentation.draft ? user_path(current_user) : presentation_path(@presentation)),
                      :uploadPath => presentation_path(@presentation, :format=> "json"),
                      :editPath => edit_presentation_path(@presentation),
                      :exitPath => (@presentation.draft ? user_path(current_user) : presentation_path(@presentation)),
                      :id => @presentation.id
                    }
  end

  def destroy
    @presentation = Presentation.find(params[:id])
    @presentation.destroy
    respond_to do |format|
      format.all { 
        redirect_to view_context.current_user_path_for("presentations")
      }
    end
  end


  ############################
  # Custom actions over Presentations and services provided by presentations controller
  ############################

  def preview
    respond_to do |format|
      format.all { render "show.full.erb", :layout => 'veditor.full' }
    end
  end

  def metadata
    presentation = Presentation.find_by_id(params[:id])
    authorize! :show, presentation
    respond_to do |format|
      format.any {
        unless presentation.nil?
          xmlMetadata = Presentation.generate_LOM_metadata(JSON(presentation.json),presentation,{:id => Rails.application.routes.url_helpers.presentation_url(:id => presentation.id), :LOMschema => params[:LOMschema] || "custom"})
          render :xml => xmlMetadata.target!, :content_type => "text/xml"
        else
          xmlMetadata = ::Builder::XmlMarkup.new(:indent => 2)
          xmlMetadata.instruct! :xml, :version => "1.0", :encoding => "UTF-8"
          xmlMetadata.error("Presentation not found")
          render :xml => xmlMetadata.target!, :content_type => "text/xml", :status => 404
        end
      }
    end
  end

  def scormMetadata
    presentation = Presentation.find_by_id(params[:id])
    scormVersion = ((params["version"].present? and ["12","2004"].include?(params["version"])) ? params["version"] : "2004")
    respond_to do |format|
      format.xml {
        xmlMetadata = Presentation.generate_scorm_manifest(scormVersion,JSON(presentation.json),presentation,{:LOMschema => params[:LOMschema]})
        render :xml => xmlMetadata.target!
      }
      format.any {
        redirect_to (presentation_path(presentation)+"/scormMetadata.xml?version=" + scormVersion)
      }
    end
  end

  def clone
    original = Presentation.find_by_id(params[:id])
    if original.blank?
      flash[:alert] = t('dictionary.errors.resource_not_found')
      redirect_to presentation_path(original)
    else
      cloned_presentation = original.clone_for(current_user)
      if cloned_presentation.nil?
        flash[:notice] = t('presentations.clone.fail')
        redirect_to presentation_path(original)
      else
        flash[:notice] = t('presentations.clone.success')
        redirect_to presentation_path(cloned_presentation)
      end
    end
  end

  def manifest
    headers['Last-Modified'] = Time.now.httpdate
    @presentation = Presentation.find_by_id(params[:id])
    render 'cache.manifest', :layout => false, :content_type => 'text/cache-manifest'
  end

  def iframe_api
    respond_to do |format|
      format.js {
        render :file => "#{Rails.root}/lib/plugins/vish_editor/app/assets/javascripts/VISH.IframeAPI.js",
          :content_type => 'application/javascript',
          :layout => false
      }
    end
  end

  def presentation_thumbnails
    thumbnails = Hash.new
    thumbnails["pictures"] = []

    81.times do |index|
      index = index+1
      thumbnail = Hash.new
      thumbnail["title"] = "Thumbnail " + index.to_s
      thumbnail["description"] = "Sample Thumbnail"
      tnumber = index.to_s
      if index<10
        tnumber = "0" + tnumber
      end
      thumbnail["src"] = SgamePlatform::Application.config.full_domain + "/assets/logos/original/excursion-"+tnumber+".png"
      thumbnail["src"] = Utils.checkUrlProtocol(thumbnail["src"],request.protocol)
      thumbnails["pictures"].push(thumbnail)
    end

    render :json => thumbnails
  end


  ##################
  # Recomendation on the last slide
  ##################
  
  def last_slide
    current_presentation =  Presentation.find_by_id(params[:presentation_id]) if params[:presentation_id]
    options = {:user => current_user, :lo => current_presentation, :n => (params[:quantity] || 6).to_i, :models => [Presentation]}
    options[:keywords] = params[:q].split(",") if current_presentation.nil? and params[:q]
    presentations = RecommenderSystem.suggestions(options).map { |profile|
      {
        :id => profile[:id_repository],
        :url => profile[:url],
        :title => profile[:title],
        :description => profile[:description],
        :author => profile[:object].owner.name,
        :image => profile[:thumbnail_url],
        :views => "",
        :favourites => ""
      }
    }
    respond_to do |format|
      format.json {
        render :json => presentations
      }
    end
  end


  #####################
  ## VE Methods
  ####################

  def uploadTmpJSON
    respond_to do |format|  
      format.json {
        results = Hash.new
        return render :json => results unless params["json"].present?
        json = params["json"]
        
        responseFormat = "json" #Default
        if params["responseFormat"].is_a? String
          responseFormatParsedParam = params["responseFormat"].downcase
          if responseFormatParsedParam.include?("scorm")
            responseFormat = "scorm"
            scormVersion = responseFormatParsedParam.sub("scorm","")
          elsif responseFormatParsedParam == "qti"
            responseFormat = "qti"
          elsif responseFormatParsedParam == "moodlexml"
            responseFormat = "MoodleXML"
          end
        end

        tmpFileName = Time.now.to_i.to_s

        if responseFormat == "json"
          #Generate JSON file
          filePath = "#{Rails.root}/public/tmp/json/#{tmpFileName}.json"
          t = File.open(filePath, 'w')
          t.write json
          t.close
          results["url"] = "#{SgamePlatform::Application.config.full_domain}/presentations/tmpJson.json?fileId=#{tmpFileName}"
        elsif responseFormat == "scorm" and ["12","2004"].include?(scormVersion)
          #Generate SCORM package
          filePath = "#{Rails.root}/public/tmp/scorm/"
          fileName = "scorm" + scormVersion + "-tmp-#{tmpFileName}"
          Presentation.createSCORM(scormVersion,filePath,fileName,JSON(json),nil,self)
          results["url"] = "#{SgamePlatform::Application.config.full_domain}/tmp/scorm/#{fileName}.zip"
        elsif responseFormat == "qti"
           #Generate QTI package
           filePath = "#{Rails.root}/public/tmp/qti/"
           FileUtils.mkdir_p filePath
           fileName = "qti-tmp-#{tmpFileName}"
           Presentation.createQTI(filePath,fileName,JSON(json))
           results["url"] = "#{SgamePlatform::Application.config.full_domain}/tmp/qti/#{fileName}.zip"
        elsif responseFormat == "MoodleXML"
           #Generate Moodle XML package
           filePath = "#{Rails.root}/public/tmp/moodlequizxml/"
           FileUtils.mkdir_p filePath
           fileName = "moodlequizxml-tmp-#{tmpFileName}"
           Presentation.createMoodleQUIZXML(filePath,fileName,JSON(json))
           results["url"] = "#{SgamePlatform::Application.config.full_domain}/tmp/moodlequizxml/#{fileName}.xml"
           results["xml"] = File.open("#{filePath}#{fileName}.xml").read
           results["filename"] = "#{fileName}.xml"
        end

        results["url"] = Utils.checkUrlProtocol(results["url"],request.protocol) unless results["url"].blank?

        render :json => results
      }
    end
  end

  def downloadTmpJSON
    respond_to do |format|
      format.json {
        return render :json => Hash.new if params["fileId"] == nil
        
        fileId = params["fileId"]
        if params["filename"]
          filename = params["filename"]
        else
          filename = fileId
        end

        filePath = "#{Rails.root}/public/tmp/json/#{fileId}.json"
        if File.exist? filePath
          send_file "#{filePath}", :type => 'application/json', :disposition => 'attachment', :filename => "#{filename}.json"
        else 
          render :json => Hash.new
        end
      }
    end
  end

end