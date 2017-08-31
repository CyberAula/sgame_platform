SGAME_DEMO = (function($,undefined){
	var options = {};

	var catalog = {};
	catalog.games = {};
	catalog.scormfiles = {};

	current_game = {};
	current_scormfiles = [];

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
		$("#preview_scormfile_fancybox").fancybox(
			{
				openEffect  : 'none',
				closeEffect : 'none',
				type: 'iframe',
				scrolling : false,
				autoSize : true,
				beforeLoad: function(){
				},
				afterLoad: function(){
				}
			}
		);
	};

	var _createGamesCarrousel = function(){
		// if(options.user_logged_in === true){
		// 	var div = $("<div id='addGameButton'><a href='/game_templates/new'><p>Upload</p><img src='/assets/add_game.png'/></a></div>");
		// 	$("#" + games_carrousel_id).append(div);
		// }
		$.each(catalog.games, function(i, game){
			var div = $("<div itemid="+game.id+"><p>" + game.title + "</p><img src="+game.thumbnail_url+"/></div>");
			$("#" + games_carrousel_id).append(div);
		});
		$("#" + games_carrousel_id).slick({
			dots: true,
			infinite: true,
			slidesToShow: 3,
			slidesToScroll: 1
		});
		$("#" + games_carrousel_id + " div[itemid]").on("click", function(event){
			_selectGame(catalog.games[$(this).attr("itemid")]);
		});
		_selectGame(catalog.games[Object.keys(catalog.games)[0]]); //Preview first game
	};

	var _createScormfilesCarrousel = function(){
		if(options.user_logged_in === true){
			var div = $("<div id='addFileButton'><a href='/documents/new'><p>Upload</p><img src='/assets/add_file.png'/></a></div>");
			$("#" + scormfiles_carrousel_id).append(div);
		}
		$.each(catalog.scormfiles, function(i, scormfile){
			var div = $("<div itemid="+scormfile.id+"><p>" + scormfile.title + "</p><img src="+scormfile.thumbnail_url+"/></div>");
			$("#" + scormfiles_carrousel_id).append(div);
		});
		$("#" + scormfiles_carrousel_id).slick({
			dots: true,
			infinite: true,
			slidesToShow: 3,
			slidesToScroll: 1
		});
		$("#" + scormfiles_carrousel_id + " div[itemid]").on("click", function(event){
			_addScormfile(catalog.scormfiles[$(this).attr("itemid")]);
		});
	};

	var _addScormfile = function(scormfile){
		//Already added scormfile
		if(current_scormfiles.indexOf(scormfile)!==-1){
			return;
		}
		current_scormfiles.push(scormfile);

		var li = $("<li itemid='"+scormfile.id+"' class='scormfile_item'>");
		var scormfile_item_c1 = $("<div class='scormfile_item_c1'>");
		var img = $("<img class='scormfile_item_thumbnail' src='"+scormfile.thumbnail_url+"' />");
		$(img).click(function(){
			_previewScormfile(catalog.scormfiles[$(this).parents("[itemid]").attr("itemid")]);
		});
		$(scormfile_item_c1).append(img);

		var scormfile_item_c2 = $("<div class='scormfile_item_c2'>");
		var description = $("<p class='scormfile_description'>"+scormfile.description+"</p>");

		var msgDescriptionb = "";
		if((scormfile.nscos > 0)&&(scormfile.assets > 0)){
			if(scormfile.nscos > 1){
				msgDescriptionb += scormfile.nscos + " SCOs"
			} else {
				msgDescriptionb += scormfile.nscos + " SCO"
			}
			if(scormfile.nassets > 1){
				msgDescriptionb += " and " + scormfile.nassets + " assets"
			} else {
				msgDescriptionb += " and " + scormfile.nassets + " asset"
			}
		} else {
			if(scormfile.nscos > 0){
				if(scormfile.nscos > 1){
					msgDescriptionb += scormfile.nscos + " SCOs"
				} else {
					msgDescriptionb += scormfile.nscos + " SCO"
				}
			}
			if(scormfile.nassets > 0){
				if(scormfile.nassets > 1){
					msgDescriptionb += scormfile.nassets + " assets"
				} else {
					msgDescriptionb += scormfile.nassets + " asset"
				}
			}
		}
		var descriptionb = $("<p class='scormfile_description_b'>" + msgDescriptionb + "</p>");
		$(scormfile_item_c2).append(description);
		$(scormfile_item_c2).append(descriptionb);
		$(li).append(scormfile_item_c2);

		var scormfile_item_c3 = $("<div class='scormfile_item_c3'>");
		var removeButton = $("<button class='remove_button'><span class='glyphicon glyphicon-remove'></span></button>");
		$(removeButton).click(function(event){
	 		_removeScormfile(catalog.scormfiles[$(this).parents("li[itemid]").attr("itemid")]);
		});
		$(scormfile_item_c3).append(removeButton);

		$(li).append(scormfile_item_c1);
		$(li).append(scormfile_item_c2);
		$(li).append(scormfile_item_c3);

		$("#scormfiles_list").append(li);
	};

	var _removeScormfile = function(scormfile){
		current_scormfiles.splice(current_scormfiles.indexOf(scormfile),1);
		$("div.scormfiles #scormfiles_list li[itemid='" + scormfile.id + "']").remove();
	};

	var _previewScormfile = function(scormfile){
		var scormfileURL = "/scormfiles/" + scormfile.id + ".full";
		$("#preview_scormfile_fancybox").attr("href",scormfileURL);
		$("#preview_scormfile_fancybox").trigger("click");
	};


	/**
	 * Events
	 */
	var _loadEvents = function(){

	};

	/*
	 * Update UI
	 */

	var _selectGame = function(game){
		current_game = game;
		$("#sgame_demo .game .selected img").attr("src",game.thumbnail_url);
		$("#sgame_demo .game .selected p").html(game.description);
	};


	return {
		init 		: init
	};

}) (jQuery);