SGAME_AT = (function($,undefined){
	var options = {};

	var locales;

	var catalog = {};
	catalog.games = {};
	catalog.scormfiles = {};

	var stepsLoaded = [];

	var current_step = 1;
	var current_preview_game = {};
	var current_game = {};
	var current_preview_scormfile = {};
	var current_los = [];


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

		//Preview URLs with iframes
		$("#preview_iframe_fancybox").fancybox(
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
				$("#sgame_at .game .selected img.thumbnail").on("click",function(){
					_previewGameTemplate(catalog.games[$(this).attr("gtid")]);
				});

				$("#step1_confirmation").on("click",function(){
					_onStep1Confirmation();
				});

				_createGamesCarrousel();
				break;
			case 2:
				$(document).on('click', '#sgame_at .scormfiles .selected img.thumbnail', function(event) {
					_previewScormfile(catalog.scormfiles[$(this).attr("sfid")]);
				});

				$(document).on('click', '#sgame_at .scormfiles .selected table.at_c td.preview img', function(event) {
					var index = parseInt($(this).parents(".loinstance").find("td.index").html());
					_previewLO(current_preview_scormfile.los[index-1]);
				});

				$(document).on('click', '#sgame_at .scormfiles .selected table.at_c td.add img', function(event) {
					var index = parseInt($(this).parents(".loinstance").find("td.index").html());
					var result = _addLO(current_preview_scormfile.los[index-1],current_preview_scormfile);
					if(result === false){
						return _showSGAMEDialogWithSettings({"msg":_getTrans("i.error_lo_already_added")}, false);
					}
				});

				$(document).on('click', '#step2_addscormfile', function(event) {
					_addScormfile(current_preview_scormfile);
				});
				
				_createScormfilesCarrousel();
				break;
			default:
				break;
		}
	};


	//Step 1

	var _createGamesCarrousel = function(){
		var div = $("<div id='addGameButton'><a href='/game_templates/new' data-confirm='" + _getTrans("i.dialog_confirmation") + "' data-cancel-button='" + _getTrans("i.cancel") + "' data-method='get'><p>" + _getTrans("i.upload_game_template") + "</p><img src='/assets/add_game.png'/></a></div>");
		var games_carrousel_id = "games_carrousel";
		$("#" + games_carrousel_id).append(div);
		
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

		//Fill metadata
		var thumbnailDOM = $("#sgame_at .game .selected img.thumbnail");
		if(typeof game.thumbnail_url !== "undefined"){
			$(thumbnailDOM).attr("src",game.thumbnail_url);
			$(thumbnailDOM).attr("gtid",game.id);
			$(thumbnailDOM).show();
		} else {
			$(thumbnailDOM).hide();
		}

		$("#sgame_at .game .selected tr.title td").html(game.title);
		$("#sgame_at .game .selected tr.description td").html(game.description);
		$("#sgame_at .game .selected tr.language td").html(game.language);

		//Fill events
		var eventsTable = $("#sgame_at .game .selected table.at_b");
		var gEvents = game.events;
		var nEvents = gEvents.length;

		if(nEvents < 1){
			$(eventsTable).hide();
		} else {
			$(eventsTable).find("tr.geinstance").remove();
			for(var i=0; i<nEvents; i++){
				var gEvent = gEvents[i];
				var gEventDOM = "<tr class='geinstance'><td class='name'>" + gEvent.title + "</td><td class='description'>" + gEvent.description + "</td></tr>";
				$(eventsTable).append(gEventDOM);
			}
			$(eventsTable).show();
		}

		$("#sgame_at .game .selected").show();
	};

	var _previewGameTemplate = function(gt){
		var gtURL = "/game_templates/" + gt.id + ".full";
		$("#preview_iframe_fancybox").attr("href",gtURL);
		$("#preview_iframe_fancybox").trigger("click");
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
		var div = $("<div id='addFileButton'><a href='/documents/new' data-method='get' data-confirm='" + _getTrans("i.dialog_confirmation") + "' data-cancel-button='" + _getTrans("i.cancel") + "' data-method='get'><p>" + _getTrans("i.upload_scormfile") + "</p><img src='/assets/add_file.png'/></a></div>");
		var scormfiles_carrousel_id = "scormfiles_carrousel";
		$("#" + scormfiles_carrousel_id).append(div);
		
		$.each(catalog.scormfiles, function(i, sf){
			var div = $("<div itemid=" + sf.id + "><p>" + sf.title + "</p><img src='" + sf.thumbnail_url + "'/></div>");
			$("#" + scormfiles_carrousel_id).append(div);
		});
		_createCarousel(scormfiles_carrousel_id);
		$("#" + scormfiles_carrousel_id + " div[itemid]").on("click", function(event){
			_selectScormfile(catalog.scormfiles[$(this).attr("itemid")]);
		});
	};

	var _selectScormfile = function(sf){
		current_preview_scormfile = sf;

		//Fill metadata
		var thumbnailDOM = $("#sgame_at .scormfiles .selected img.thumbnail");
		if(typeof sf.thumbnail_url !== "undefined"){
			$(thumbnailDOM).attr("src",sf.thumbnail_url);
			$(thumbnailDOM).attr("sfid",sf.id);
			$(thumbnailDOM).show();
		} else {
			$(thumbnailDOM).hide();
		}
		
		$("#sgame_at .scormfiles .selected tr.title td").html(sf.title);
		$("#sgame_at .scormfiles .selected tr.description td").html(sf.description);
		$("#sgame_at .scormfiles .selected tr.language td").html(sf.language);
		$("#sgame_at .scormfiles .selected tr.version td").html(sf.schema + " " + sf.schema_version);

		var nResources = "";
		if((sf.nscos > 0)&&(sf.assets > 0)){
			if(sf.nscos > 1){
				nResources += sf.nscos + " SCOs";
			} else {
				nResources += sf.nscos + " SCO";
			}
			nResources += " " + _getTrans("i.and") + " ";
			if(sf.nassets > 1){
				nResources += sf.nassets + " assets";
			} else {
				nResources += sf.nassets + " asset";
			}
		} else {
			if(sf.nscos > 0){
				if(sf.nscos > 1){
					nResources += sf.nscos + " SCOs";
				} else {
					nResources += sf.nscos + " SCO";
				}
			}
			if(sf.nassets > 0){
				if(sf.nassets > 1){
					nResources += sf.nassets + " assets";
				} else {
					nResources += sf.nassets + " asset";
				}
			}
		}
		$("#sgame_at .scormfiles .selected tr.nresources td").html(nResources);


		//Fill LOs
		var losTable = $("#sgame_at .scormfiles .selected table.at_c");
		var sfLOs = sf.los;
		var nLOs = sfLOs.length;

		if(nLOs < 1){
			$(losTable).hide();
		} else {
			$(losTable).find("tr.loinstance").remove();
			for(var i=0; i<nLOs; i++){
				var lo = sfLOs[i];
				var loDOM = "<tr class='loinstance'><td class='index'>" + lo.resource_index + "</td><td class='type'>" + lo.lo_type + "</td><td class='preview'><img src='/assets/eye_icon.png'/></td><td class='add'><img src='/assets/plus.png'/></td></tr>";
				$(losTable).append(loDOM);
			}
			$(losTable).show();
		}

		$("#sgame_at .scormfiles .selected").show();
	};

	var _previewScormfile = function(sf){
		var sfURL = "/scormfiles/" + sf.id + ".full";
		$("#preview_iframe_fancybox").attr("href",sfURL);
		$("#preview_iframe_fancybox").trigger("click");
	};

	var _previewLO = function(lo){
		$("#preview_iframe_fancybox").attr("href",lo.hreffull);
		$("#preview_iframe_fancybox").trigger("click");
	};

	var _addScormfile = function(sf){
		var results = [];
		var nLOs = sf.los.length;
		for(var i=0; i<nLOs; i++){
			results.push(_addLO(sf.los[i],sf));
		}
		if(results.indexOf(false)!==-1){
			var errorMsg;
			if(results.indexOf(true)===-1){
				errorMsg = _getTrans("i.error_sf_already_added");
			} else {
				errorMsg = _getTrans("i.error_some_los_already_added");
			}
			return _showSGAMEDialogWithSettings({"msg":errorMsg}, false);
		}
	};

	var _addLO = function(lo,sf){
		var nLOs = current_los.length;
		for(var i=0; i<nLOs; i++){
			if(current_los[i].id === lo.id){
				//LO already added
				return false;
			}
		}

		//Add LO
		if(typeof lo.title === "undefined"){
			//Include title
			lo.title = sf.title + " (" + lo.resource_index + ")";
		}
		current_los.push(lo);
		return true;
	};

	var _onStep2Confirmation = function(){
		if(current_scormfiles.length < 1){
			return _showSGAMEDialogWithSettings({"msg":_getTrans("i.error_no_scormfiles")}, false);
		}
		_finishStep("2");
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