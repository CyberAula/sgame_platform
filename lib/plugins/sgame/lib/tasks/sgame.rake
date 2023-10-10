# encoding: utf-8
#
# Rake task to compile the SGAME API and the SGAME VLE Gateway
# Compile javascript code using Google's closure compiler (see http://code.google.com/closure/compiler/)
# Requires JDK (Java Development Kit)
# How to use: bundle exec rake sgame:build
#

#PATHS
SGAME_PLUGIN_PATH = "lib/plugins/sgame";
SGAME_COMPILER_JAR_PATH = "extras/compile"
SGAME_JSCOMPILER_JAR_FILE = SGAME_COMPILER_JAR_PATH + "/compiler.jar"

# SGAME API files and dirs :
SGAME_API_JS_FILES_AND_DIRS = ['app/assets/js_to_compile_api/iso8601Parser.js','app/assets/js_to_compile_api/Local_API_1484_11.js','app/assets/js_to_compile_api/Local_API_SCORM_12.js','app/assets/js_to_compile_api/SGAME.js','app/assets/js_to_compile_api/SGAME.Debugger.js','app/assets/js_to_compile_api/SGAME.Messenger.js','app/assets/js_to_compile_api/SGAME.Fancybox.js','app/assets/js_to_compile_api/SGAME.TrafficLight.js','app/assets/js_to_compile_api/SGAME.Sequencing.js','app/assets/js_to_compile_api']
SGAME_Gateway_JS_FILES_AND_DIRS = ['app/assets/js_to_compile_gateway/jquery-3.4.1.min.js','app/assets/js_to_compile_gateway/platform.js','app/assets/js_to_compile_gateway/SCORM_API_Wrapper.js','app/assets/js_to_compile_gateway/SGAME_GATEWAY.js','app/assets/js_to_compile_gateway']


# Rake Task
namespace :sgame do

  #bundle exec rake sgame:build
  task :build do
    Rake::Task["sgame:build_api"].invoke
    Rake::Task["sgame:build_gateway"].invoke
  end

  #SGAME API tasks
  task :build_api do
    Rake::Task["sgame:prepare_api"].invoke
    Rake::Task["sgame:compile_api"].invoke
    Rake::Task["sgame:clean_api"].invoke
  end

  task :prepare_api do
    system "rm -rf public/sgame_api/SGAME.js"
    system "rm -rf public/sgame_api/SGAME.min.js"

    system "cp -r " + SGAME_PLUGIN_PATH + "/app/assets/javascripts/sgame_api/ " + SGAME_PLUGIN_PATH + "/app/assets/js_to_compile_api/"
  end

  task :compile_api do
    puts "Compiling SGAME API Javascript"
    compile_js(SGAME_API_JS_FILES_AND_DIRS,"SGAME")
  end

  task :clean_api do
    system "rm -rf " + SGAME_PLUGIN_PATH + "/app/assets/js_to_compile_api"
  end

  #SGAME VLE Gateway tasks
  task :build_gateway do
    Rake::Task["sgame:prepare_gateway"].invoke
    Rake::Task["sgame:compile_gateway"].invoke
    Rake::Task["sgame:clean_gateway"].invoke
  end

  task :prepare_gateway do
    system "rm -rf public/sgame_api/SGAME_VLE_Gateway.js"
    system "rm -rf public/sgame_api/SGAME_VLE_Gateway.min.js"

    system "cp -r " + SGAME_PLUGIN_PATH + "/app/assets/javascripts/sgame_gateway/ " + SGAME_PLUGIN_PATH + "/app/assets/js_to_compile_gateway/"
  end

  task :compile_gateway do
    puts "Compiling SGAME VLE Gateway Javascript"
    compile_js(SGAME_Gateway_JS_FILES_AND_DIRS,"SGAME_VLE_Gateway")
  end

  task :clean_gateway do
    system "rm -rf " + SGAME_PLUGIN_PATH + "/app/assets/js_to_compile_gateway"
  end

  #========================================================================

  def compile_js(files_and_dirs,outputname)   
    js_files = []
    files_and_dirs.each do |dir|
      dir = SGAME_PLUGIN_PATH + "/" + dir;
      if dir =~ /js$/
        js_files << dir
      else
        js_files.concat(Dir[ File.join(dir, "*.js") ].sort)
      end
    end
    js_files.uniq!
    puts "matched #{js_files.size} .js file(s)"
    compile_js_files(js_files,outputname)
  end

  def compile_js_files(files,outputname)
    files = [ files ] unless files.is_a?(Array)

    compiler_options = {}
    compiler_options['--js'] = files.join(' ')
    compiler_options['--compilation_level'] = 'SIMPLE_OPTIMIZATIONS'
    compiler_options['--js_output_file'] = (outputname + ".min.js")
    compiler_options['--warning_level'] = 'QUIET'
    compiler_options2 = {}
    compiler_options2['--js'] = files.join(' ')
    compiler_options2['--compilation_level'] = 'WHITESPACE_ONLY'
    compiler_options2['--formatting'] = 'PRETTY_PRINT'
    compiler_options2['--js_output_file'] = (outputname + ".js")
    compiler_options2['--warning_level'] = 'QUIET'
    
    files.each do |file|
      puts " > #{file}"
    end
    
    puts ""
    puts "----------------------------------------------------"
    puts "compiling " + outputname + "..."

    system "java -jar #{SGAME_JSCOMPILER_JAR_FILE} #{compiler_options.to_a.join(' ')}"
    system "java -jar #{SGAME_JSCOMPILER_JAR_FILE} #{compiler_options2.to_a.join(' ')}"
    puts "DONE"
    puts "----------------------------------------------------"
    puts "compiled #{files.size} javascript file(s) into " + outputname + ".min.js and " + outputname + ".js"
    puts ""

    #Public library
    system "mv " + outputname + ".js public/sgame_api/" + outputname + ".js"
    system "mv " + outputname + ".min.js public/sgame_api/" + outputname + ".min.js"
  end

end