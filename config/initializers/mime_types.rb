# Be sure to restart your server when you modify this file.

# Add new mime types for use in respond_to blocks:
# Mime::Type.register "text/richtext", :rtf

Mime::Type.register_alias "application/zip", :scorm
Mime::Type.register_alias "text/html", :sgame
Mime::Type.register_alias "text/html", :full
Mime::Type.register_alias "text/html", :fs
Mime::Type.register_alias "text/html", :partial

Mime::Type.register "application/x-zip-compressed", :xzip
Mime::Type.register "application/x-rar", :rar

Mime::Type.register "text/plain", :txt
Mime::Type.register "application/vnd.ms-word", :doc, [ "application/msword" ]
Mime::Type.register "application/vnd.openxmlformats-officedocument.wordprocessingml.document", :docx, [ "application/msword" ]
Mime::Type.register "application/vnd.ms-powerpoint", :ppt, [ "application/mspowerpoint" ]
Mime::Type.register "application/vnd.openxmlformats-officedocument.presentationml.presentation", :pptx, [ "application/mspowerpoint" ]
Mime::Type.register "application/vnd.ms-excel", :xls, [ "application/msexcel" ]
Mime::Type.register "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", :xlsx, [ "application/msexcel" ]
Mime::Type.register "application/vnd.oasis.opendocument.text", :odt
Mime::Type.register "application/vnd.oasis.opendocument.presentation", :odp
Mime::Type.register "application/vnd.oasis.opendocument.spreadsheet", :ods
Mime::Type.register "application/rtf", :rtf