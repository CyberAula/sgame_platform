# encoding: utf-8
#
# Rake task to compile the SGAME API
# Compile javascript using google's closure compiler (see http://code.google.com/closure/compiler/)
# Also rewrite routes
#

#PATHS
SGAME_PLUGIN_PATH = "lib/plugins/sgame";
SGAME_PATH = "../sgame";

# SGAME files and dirs :
SGAME_JS_FILES_AND_DIRS = ['app/assets/js_to_compile/SGAME_development.js','app/assets/js_to_compile']

SGAME_COMPILER_JAR_PATH = "extras/compile"
SGAME_JSCOMPILER_JAR_FILE = SGAME_COMPILER_JAR_PATH + "/compiler.jar"

# Rake Task
namespace :sgame do

  #bundle exec rake sgame:build
  task :build do
    Rake::Task["sgame:prepare"].invoke
    Rake::Task["sgame:compile"].invoke
    Rake::Task["sgame:cleanCompile"].invoke
  end

  task :prepare do
    system "rm -rf " + SGAME_PLUGIN_PATH + "/app/assets/javascripts/SGAME.min.js"
    system "rm -rf " + SGAME_PLUGIN_PATH + "/app/assets/javascripts/SGAME.js"
    system "rm -rf public/sgame_api/SGAME.js"
    system "rm -rf public/sgame_api/SGAME.min.js"

    system "cp -r " + SGAME_PLUGIN_PATH + "/app/assets/javascripts/ " + SGAME_PLUGIN_PATH + "/app/assets/js_to_compile/"
  end

  task :compile do
    #JavaScript files
    puts "Compiling Javascript"
    js_files = []
    SGAME_JS_FILES_AND_DIRS.each do |dir|
      dir = SGAME_PLUGIN_PATH + "/" + dir;
      if dir =~ /js$/
        js_files << dir
      else
        js_files.concat(Dir[ File.join(dir, "*.js") ].sort)
      end
    end
    js_files.uniq!
    puts "matched #{js_files.size} .js file(s)"
    compile_js(js_files)
  end

  task :cleanCompile do
    system "rm -rf " + SGAME_PLUGIN_PATH + "/app/assets/js_to_compile"
  end

  #========================================================================

  def compile_js(files)
    files = [ files ] unless files.is_a?(Array)

    compiler_options = {}
    compiler_options['--js'] = files.join(' ')
    compiler_options['--compilation_level'] = 'SIMPLE_OPTIMIZATIONS'
    compiler_options['--js_output_file'] = "SGAME.min.js"
    compiler_options['--warning_level'] = 'QUIET'
    compiler_options2 = {}
    compiler_options2['--js'] = files.join(' ')
    compiler_options2['--compilation_level'] = 'WHITESPACE_ONLY'
    compiler_options2['--formatting'] = 'PRETTY_PRINT'
    compiler_options2['--js_output_file'] = "SGAME.js"
    compiler_options2['--warning_level'] = 'QUIET'
    
    files.each do |file|
      puts " > #{file}"
    end
    
    puts ""
    puts "----------------------------------------------------"
    puts "compiling SGAME API..."

    system "java -jar #{SGAME_JSCOMPILER_JAR_FILE} #{compiler_options.to_a.join(' ')}"
    system "java -jar #{SGAME_JSCOMPILER_JAR_FILE} #{compiler_options2.to_a.join(' ')}"
    puts "DONE"
    puts "----------------------------------------------------"
    puts "compiled #{files.size} javascript file(s) into SGAME.min.js and SGAME.js"
    puts ""

    #Public library
    system "mv SGAME.js public/sgame_api/SGAME.js"
    system "mv SGAME.min.js public/sgame_api/SGAME.min.js"
  end

end