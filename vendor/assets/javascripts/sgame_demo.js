SGAME_DEMO = (function($,undefined){
	var options = {};

	var catalog = {};
	catalog.games = {};
	catalog.scormfiles = {};

	current_game = {};
	current_scorm_files = [];

	var games_carrousel_id = "games_carrousel";
	var scormfiles_carrousel_id = "scormfiles_carrousel";


	var init = function (game_templates,scormfiles,initOptions){
		if(typeof initOptions == "object"){
			options = initOptions;
		}
		$.each(game_templates, function(i, game_template){
			catalog.games[game_template.id] = game_template;
		});
		$.each(scormfiles, function(i, scormfile){
			catalog.scormfiles[scormfile.id] = scormfile;
		});
		_createFancyboxes();
		_loadEvents();
		_createGamesCarrousel();
		_createScormfilesCarrousel();
	};

	var _createFancyboxes = function(){
	};

	var _createGamesCarrousel = function(){
		// if(options.user_logged_in === true){
		// 	var div = $("<div id='addGameButton'><a href='/game_templates/new'><p>Upload</p><img src='/assets/add_game.png'/></a></div>");
		// 	$("#" + games_carrousel_id).append(div);
		// }
		$.each(catalog.games, function(i, game){
			var div = $("<div itemId="+game.id+"><p>" + game.title + "</p><img src="+game.thumbnail_url+"/></div>");
			$("#" + games_carrousel_id).append(div);
		});
		$("#" + games_carrousel_id).slick({
			dots: true,
			infinite: true,
			slidesToShow: 3,
			slidesToScroll: 1
		});
		_previewGame(catalog.games[Object.keys(catalog.games)[0]]); //Preview first game
	};

	var _createScormfilesCarrousel = function(){
		if(options.user_logged_in === true){
			var div = $("<div id='addFileButton'><a href='/documents/new'><p>Upload</p><img src='/assets/add_file.png'/></a></div>");
			$("#" + scormfiles_carrousel_id).append(div);
		}
		$.each(catalog.scormfiles, function(i, scormfile){
			var div = $("<div itemId="+scormfile.id+"><p>" + scormfile.title + "</p><img src="+scormfile.thumbnail_url+"/></div>");
			$("#" + scormfiles_carrousel_id).append(div);
		});
		$("#" + scormfiles_carrousel_id).slick({
			dots: true,
			infinite: true,
			slidesToShow: 3,
			slidesToScroll: 1
		});
		$("#games_carrousel div[itemId]").on("click", function(event){
			_previewGame(catalog.games[$(this).attr("itemId")]);
		});
	};

	/**
	 * Events
	 */
	var _loadEvents = function(){

	};

	/*
	 * Update UI
	 */

	var _previewGame = function(game){
		current_game = game;
		$("#sgame_demo .game .preview img").attr("src",game.thumbnail_url);
		$("#sgame_demo .game .preview p").html(game.description);
	};


	return {
		init 		: init
	};

}) (jQuery);