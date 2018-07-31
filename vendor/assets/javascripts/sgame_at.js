SGAME_AT = (function($,undefined){
	var options = {};

	var locales;

	var catalog = {};
	catalog.games = {};
	catalog.scormfiles = {};

	var stepsLoaded = [];

	current_step = 1;
	current_preview_game = {};
	current_game = {};
	current_scormfiles = [];

	var games_carrousel_id = "games_carrousel";
	var scormfiles_carrousel_id = "scormfiles_carrousel";


	var init = function (game_templates,scormfiles,initOptions){
		if(typeof initOptions == "object"){
			options = initOptions;
		}

		if(typeof SGAME_AT_Locales == "object"){
			locales = SGAME_AT_Locales;
		}

		$.each(game_templates, function(i, game_template){
			catalog.games[game_template.id] = game_template;
		});
		$.each(scormfiles, function(i, scormfile){
			catalog.scormfiles[scormfile.id] = scormfile;
		});
		_loadEvents();
		_onLoadStep("1");
		_translateUI();
	};

	var _loadEvents = function(){

		//Step minify
		$("#sgame_at div[step] div.stepTitle").click(function(event){
			var step = $(this).parents("[step]").attr("step");
			if(parseInt(step) <= current_step){
			  _toggleStep($(this).parents("[step]").attr("step"));
			}
		});

		//Fancyboxes
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

		// //Submit form
		// $("#sgame_at .demo_create").click(function(event){
		// 	if(current_scormfiles.length < 1){
		// 		return _showSGAMEDialogWithSettings({"msg":_getTrans("i.error_no_scormfiles")}, false);
		// 	}
			
		// 	var scormfiles_ids = [];
		// 	$.each(current_scormfiles, function(i,scormfile){
		// 		scormfiles_ids.push(scormfile.id);
		// 	});
		// 	$("#demo_form input[name='game_template']").val(current_game.id);
		// 	$("#demo_form input[name='scormfiles']").val(scormfiles_ids);
		// 	$("#demo_form").submit();
		// });
	};

	var _finishStep = function(step){
		var prevStep = parseInt(step);
		var nextStep = prevStep + 1;
		if (current_step===prevStep){
			current_step = nextStep;
			$("div[step=" + nextStep + "]").removeClass("disabled");
			_toggleStep(prevStep);
			_toggleStep(nextStep);
			_onLoadStep(nextStep);
		} else {
			_toggleStep(prevStep);
		}
	};

	var _toggleStep = function(step){
		var content = $("div[step=" + step + "]").find("div.stepContent");
		if($(content).hasClass("stephidden")){
			//Show
			$(content).removeClass("stephidden");
			$(content).slideDown();
		} else {
			//Hide
			$(content).addClass("stephidden");
			$(content).slideUp();
		}
	};

	var _onLoadStep = function(step){
		step = parseInt(step);
		if(stepsLoaded.indexOf(step) !== -1){
			return;
		} else {
			stepsLoaded.push(step);
		}
		switch(step){
			case 1:
				$("#step1_confirmation").click(function(){
					_onStep1Confirmation();
				});
				_createGamesCarrousel();
				break;
			case 2:
				_createScormfilesCarrousel();
				break;
			default:
				break;
		}
	};


	//Step 1

	var _createGamesCarrousel = function(){
		if(options.user_logged_in === true){
			var div = $("<div id='addGameButton'><a href='/game_templates/new' data-confirm='" + _getTrans("i.dialog_confirmation") + "' data-cancel-button='" + _getTrans("i.cancel") + "' data-method='get'><p>" + _getTrans("i.upload_game_template") + "</p><img src='/assets/add_game.png'/></a></div>");
			$("#" + games_carrousel_id).append(div);
		}
		$.each(catalog.games, function(i, game){
			var div = $("<div itemid="+game.id+"><p>" + game.title + "</p><img src='"+game.thumbnail_url+"'/></div>");
			$("#" + games_carrousel_id).append(div);
		});
		_createCarousel(games_carrousel_id);
		$("#" + games_carrousel_id + " div[itemid]").on("click", function(event){
			_selectGameTemplate(catalog.games[$(this).attr("itemid")]);
		});
		_selectGameTemplate(catalog.games[Object.keys(catalog.games)[0]]); //Preview first game
	};

	var _createCarousel = function(carouselId){
		var carouselWidth = $("#" + carouselId).width();
		var totalSlidesToShow = $("#" + carouselId + " div").length;
		var margins = carouselWidth * 0.05;
		var slidesToShow = Math.max(1,Math.round($("div.carrousel_wrapper").width()/(120 + margins)));
		var dotsToShow = Math.max(1,Math.ceil(totalSlidesToShow/slidesToShow));
		var slidesToScroll = Math.max(1,Math.ceil(totalSlidesToShow/dotsToShow));
		var maxDots = Math.floor($("div.carrousel_wrapper").width()/40);
		var showDots = dotsToShow <= maxDots;

		$("#" + carouselId).slick({
			dots: showDots,
			infinite: false,
			slidesToShow: slidesToShow,
			slidesToScroll: slidesToScroll
		});
	};

	var _selectGameTemplate = function(game){
		current_preview_game = game;
		$("#sgame_at .game .selected img.gthumbnail").attr("src",game.thumbnail_url);
		$("#sgame_at .game .selected tr.gtitle td").html(game.title);
		$("#sgame_at .game .selected tr.gdescription td").html(game.description);
		$("#sgame_at .game .selected tr.glanguage td").html(game.language);

		var eventsTable = $("#sgame_at .game .selected table.gevents");
		$(eventsTable).find("tr.geinstance").remove();
		var gEvents = game.events;
		var nEvents = gEvents.length;
		for(var i=0; i<nEvents; i++){
			var gEvent = gEvents[i];
			var gEventDOM = "<tr class='geinstance'><td class='gename'>" + gEvent.title + "</td><td class='gedescription'>" + gEvent.description + "</td></tr>";
			$(eventsTable).append(gEventDOM);
		}
	};

	var _onStep1Confirmation = function(){
		if((typeof current_preview_game == "undefined")||(typeof current_preview_game.id == "undefined")){
			return _showSGAMEDialogWithSettings({"msg":_getTrans("i.error_no_game")}, false);
		}
		current_game = current_preview_game;
		_finishStep("1");
	};


	//Step 2

	var _createScormfilesCarrousel = function(){
		if(options.user_logged_in === true){
			var div = $("<div id='addFileButton'><a href='/documents/new' data-method='get' data-confirm='" + _getTrans("i.dialog_confirmation") + "' data-cancel-button='" + _getTrans("i.cancel") + "' data-method='get'><p>" + _getTrans("i.upload_scormfile") + "</p><img src='/assets/add_file.png'/></a></div>");
			$("#" + scormfiles_carrousel_id).append(div);
		}
		$.each(catalog.scormfiles, function(i, scormfile){
			var div = $("<div itemid="+scormfile.id+"><p>" + scormfile.title + "</p><img src='"+scormfile.thumbnail_url+"'/></div>");
			$("#" + scormfiles_carrousel_id).append(div);
		});
		_createCarousel(scormfiles_carrousel_id);
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
		var descriptionb = $("<p class='scormfile_description_c'>" + scormfile.schema + " " + scormfile.schema_version + "</p>");
		
		var msgDescriptionResources = "";
		if((scormfile.nscos > 0)&&(scormfile.assets > 0)){
			if(scormfile.nscos > 1){
				msgDescriptionResources += scormfile.nscos + " SCOs"
			} else {
				msgDescriptionResources += scormfile.nscos + " SCO"
			}
			if(scormfile.nassets > 1){
				msgDescriptionResources += " and " + scormfile.nassets + " assets"
			} else {
				msgDescriptionResources += " and " + scormfile.nassets + " asset"
			}
		} else {
			if(scormfile.nscos > 0){
				if(scormfile.nscos > 1){
					msgDescriptionResources += scormfile.nscos + " SCOs"
				} else {
					msgDescriptionResources += scormfile.nscos + " SCO"
				}
			}
			if(scormfile.nassets > 0){
				if(scormfile.nassets > 1){
					msgDescriptionResources += scormfile.nassets + " assets"
				} else {
					msgDescriptionResources += scormfile.nassets + " asset"
				}
			}
		}
		var descriptionc = $("<p class='scormfile_description_b'>" + msgDescriptionResources + "</p>");
		
		$(scormfile_item_c2).append(description);
		$(scormfile_item_c2).append(descriptionb);
		$(scormfile_item_c2).append(descriptionc);
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
		$("[i18n-key-data-cancel-button]").each(function(index, elem){
			var translation = _getTrans($(elem).attr("i18n-key-data-cancel-button"));
			if(typeof translation != "undefined"){
				$(elem).attr("data-cancel-button",translation);
			}
		});
	};

	var _getTrans = function(s,params){
		//Preferred locale
		var trans = _getTransFromLocales(locales,s,params);
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