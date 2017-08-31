SGAME_DEMO = (function($,undefined){
	var options = {};

	var defaultLocales;
	var locales;

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

		if(typeof SGAME_DEMO_Locales == "object"){
			defaultLocales = SGAME_DEMO_Locales["en"];
			if((typeof options.language == "string")&&(Object.keys(SGAME_DEMO_Locales).indexOf(options.language)!=-1)){
				locales = SGAME_DEMO_Locales[options.language];
			}
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
		_translateUI();
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
			var div = $("<div id='addFileButton'><a i18n-key-data-confirm='i.dialog_confirmation' data-confirm='are you sure?' data-method='get' href='/documents/new'><p i18n-key='i.upload'>Upload</p><img src='/assets/add_file.png'/></a></div>");
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

	/*
	 * Locales
	 */

	 var _translateUI = function(){
		$("[i18n-key]").each(function(index, elem){
			var translation = _getTrans($(elem).attr("i18n-key"));
			if(typeof translation != "undefined"){
				switch(elem.tagName){
					default:
						//Generic translation (for h,p or span elements)
						$(elem).text(translation);
						break;
				}
			}
		});
		$("[i18n-key-data-confirm]").each(function(index, elem){
			var translation = _getTrans($(elem).attr("i18n-key-data-confirm"));
			if(typeof translation != "undefined"){
				$(elem).attr("data-confirm",translation);
			}
		});
	};

	var _getTrans = function(s,params){
		//Preferred locale
		var trans = _getTransFromLocales(locales,s,params);
		if(typeof trans == "string"){
			return trans;
		}

		//Default locale
		trans = _getTransFromLocales(defaultLocales,s,params);
		if(typeof trans == "string"){
			return trans;
		}

		return s;
	};

	var _getTransFromLocales = function(locales,s,params){
		if(typeof locales == undefined){
			return undefined;
		}

		if((typeof locales[s] != "undefined")&&(typeof locales[s] == "string")) {
			return _getTransWithParams(locales[s],params);
		}

		return undefined;
	};

	/*
	 * Replace params (if they are provided) in the translations keys. Example:
	 * // "i.dtest"	: "Uploaded by #{name} via SGAME",
	 * // VISH.I18n.getTrans("i.dtest", {name: "Demo"}) -> "Uploaded by Demo via SGAME"
	 */
	var _getTransWithParams = function(trans,params){
		if(typeof params != "object"){
			return trans;
		}

		for(var key in params){
			var stringToReplace = "#{" + key + "}";
			if(trans.indexOf(stringToReplace)!=-1){
				trans = trans.replaceAll(stringToReplace,params[key]);
			}
		};

		return trans;
	};


	return {
		init 		: init
	};

}) (jQuery);