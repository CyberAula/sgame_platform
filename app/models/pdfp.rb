class Pdfp < ActiveRecord::Base
  belongs_to :owner, :class_name => 'User', :foreign_key => "owner_id"

  before_destroy :remove_files #This callback need to be before has_attached_file, to be executed before paperclip callbacks
  has_attached_file :attach
  after_save :updatePageCount

  validates_attachment_content_type :attach, :content_type =>['application/pdf'], :message => '#PDFexAPIError:1 File format is invalid'
  validates_attachment_size :attach, :in => 0.megabytes..8.megabytes, :message => '#PDFexAPIError:2 File size is too big'
  validates_presence_of :owner_id

  def to_img(options)
    if self.pcount > 90
      raise "#PDFexAPIError:3 PDF file have too many pages"
    end

    require 'RMagick'
    pdf = Magick::ImageList.new(self.attach.path){ self.density = 200 }
    pdf.write(getRootFolder + getFileName + (pdf.length===1 ? "-0" : "") + ".jpg")
    #imgLength = pdf.length = self.pcount

    getImgArray(pdf.length,options)
  end

  def getImgArray(imgLength,options={})
    if imgLength.nil?
      imgLength = getImgLength
    end

    imgs = Hash.new
    imgs["urls"] = []

    imgLength.times do |index|
      imgUrl = SgamePlatform::Application.config.full_domain + "/" + getRootUrl + getFullFileNameForIndex(index)
      if options and options[:protocol]
        imgUrl = Utils.checkUrlProtocol(imgUrl,options[:protocol])
      end
      imgs["urls"].push(imgUrl)
    end

    #Add PDFEx Id
    imgs["pdfexId"] = self.id

    imgs
  end


  def getRootFolder
    splitPath = self.attach.path.split("/")
    splitPath.pop()
    rootFolder = splitPath.join("/")+"/"
  end

  def getRootUrl
    splitUrl = self.attach.url.split("/")
    splitUrl.pop()
    rootUrl = (splitUrl.join("/")+"/")[1..-1]
  end

  def getFileName
    splitName = self.attach.original_filename.split(".")
    splitName.pop()
    fileName = splitName.join(".")
  end

  def getFullFileNameForIndex(index)
    return getFileName + "-" + index.to_s + ".jpg"
  end

  def getImgLength
    rootFolder = getRootFolder
    length = %x(ls -l #{rootFolder}/*.jpg | wc -l).to_i
    return length
  end

  def updatePageCount
    require 'pdf/reader'
    pdfRead = PDF::Reader.new(self.attach.path)
    self.update_column(:pcount, pdfRead.page_count)
  end


  private

  def remove_files
    #Remove Image files
    rootFolder = getRootFolder
    system "rm #{rootFolder}*.jpg" if File.exists?(rootFolder) and File.exists?(rootFolder + "*.jpg")
  end

end