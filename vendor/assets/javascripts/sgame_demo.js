SGAME_DEMO = (function($,undefined){
	var catalog = {};
	catalog.games = {};
	catalog.scormfiles = {};

	current_game = {};
	current_scorm_files = [];

	var games_carrousel_id = "games_carrousel";
	var scormfiles_carrousel_id = "scormfiles_carrousel";


	var init = function (game_templates,scormfiles){
		$.each(game_templates, function(i, game_template){
			catalog.games[game_template.id] = game_template;
		});
		$.each(scormfiles, function(i, scormfile){
			catalog.scormfiles[scormfile.id] = scormfile;
		});
		_createFancyboxes();
		_loadEvents();
		_createGamesCarrousel(catalog.games);
		_createScormfilesCarrousel(catalog.scormfiles);
	};

	var _createFancyboxes = function(){
	};

	var _createGamesCarrousel = function(games){
		$.each(games, function(i, game){
			var div = $("<div itemId="+game.id+"><p>" + game.title + "</p><img src="+game.thumbnail_url+"/></div>");
			$("#" + games_carrousel_id).prepend(div);
		});
		$("#" + games_carrousel_id).slick({
			dots: true,
			infinite: true,
			slidesToShow: 3,
			slidesToScroll: 1
		});
		_previewGame(catalog.games[Object.keys(catalog.games)[0]]); //Preview first game
	};

	var _createScormfilesCarrousel = function(scormfiles){
		$.each(scormfiles, function(i, scormfile){
			var div = $("<div itemId="+scormfile.id+"><p>" + scormfile.title + "</p><img src="+scormfile.thumbnail_url+"/></div>");
			$("#" + scormfiles_carrousel_id).prepend(div);
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