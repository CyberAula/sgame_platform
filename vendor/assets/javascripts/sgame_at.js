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
	var current_mapping = {};


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
					var loId = parseInt($(this).parents("tr.loinstance[loid]").attr("loid"));
					_previewLO(_findLoWithId(loId,current_preview_scormfile.los));
				});

				$(document).on('click', '#sgame_at .scormfiles .selected table.at_c td.add img', function(event) {
					var index = parseInt($(this).parents(".loinstance").find("td.index").html());
					var result = _addLO(current_preview_scormfile.los[index-1],current_preview_scormfile);
					if(result === false){
						return _showSGAMEDialogWithSettings({"msg":_getTrans("i.error_lo_already_added")}, false);
					}
				});

				$(document).on('click', '#sgame_at .scormfiles .selected_los table.at_c td.preview img', function(event) {
					var loId = parseInt($(this).parents("tr.loinstance[loid]").attr("loid"));
					_previewLO(_findLoWithId(loId,current_los));
				});

				$(document).on('click', '#sgame_at .scormfiles .selected_los table.at_c td.remove img', function(event) {
					var loId = parseInt($(this).parents("[loid]").attr("loid"));
					_removeLO(loId);
				});

				$(document).on('click', '#step2_addscormfile', function(event) {
					_addScormfile(current_preview_scormfile);
				});

				$("#step2_confirmation").on("click",function(){
					_onStep2Confirmation();
				});

				_createScormfilesCarrousel();
				break;
			case 3:
				$("#step3_confirmation").on("click",function(){
					_onStep3Confirmation();
				});

				_redrawMappingTable();
				break;
			default:
				break;
		}
	};


	//Utils

	var _findLoWithId = function(id,los){
		var nLOs = los.length;
		for(var i=0; i<nLOs; i++){
			if(los[i].id===id){
				return los[i];
			}
		}
	};

	var _getCurrentLoIds = function(){
		var loIds = [];
		var nLOs = current_los.length;
		for(var i=0; i<nLOs; i++){
			loIds.push(current_los[i].id);
		}
		return loIds;
	};


	//Step 1

	var _createGamesCarrousel = function(){
		var games_carrousel_id = "games_carrousel";
		$.each(catalog.games, function(i, game){
			var div = $("<div itemid="+game.id+"><p>" + game.title + "</p><img src='"+game.thumbnail_url+"'/></div>");
			$("#" + games_carrousel_id).append(div);
		});
		var div = $("<div id='addGameButton'><a href='/game_templates/new' data-confirm='" + _getTrans("i.dialog_confirmation") + "' data-cancel-button='" + _getTrans("i.cancel") + "' data-method='get'><p>" + _getTrans("i.upload_game_template") + "</p><img src='/assets/add_game.png'/></a></div>");
		$("#" + games_carrousel_id).prepend(div);

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

		var newGameTemplate = (typeof current_game !== "undefined")&&(typeof current_game.id !== "undefined")&&(current_preview_game.id !== current_game.id);
		if((newGameTemplate)&&(Object.keys(current_mapping).length > 0)){
			return _showSGAMEDialogWithSettings({"msg": _getTrans("i.gt_change_confirmation")}, true, function(ok){
				if(ok){
					//New game template was selected
					current_game = current_preview_game;
					//Reset mapping
					current_mapping = {};
					_redrawMappingTable();
					_finishStep("1");
				} else {
					return;
				}
			});
		}
		
		current_game = current_preview_game;
		
		_finishStep("1");
	};


	//Step 2

	var _createScormfilesCarrousel = function(){
		var scormfiles_carrousel_id = "scormfiles_carrousel";
		$.each(catalog.scormfiles, function(i, sf){
			var div = $("<div itemid=" + sf.id + "><p>" + sf.title + "</p><img src='" + sf.thumbnail_url + "'/></div>");
			$("#" + scormfiles_carrousel_id).prepend(div);
		});
		var div = $("<div id='addFileButton'><a href='/documents/new' data-method='get' data-confirm='" + _getTrans("i.dialog_confirmation") + "' data-cancel-button='" + _getTrans("i.cancel") + "' data-method='get'><p>" + _getTrans("i.upload_scormfile") + "</p><img src='/assets/add_file.png'/></a></div>");
		$("#" + scormfiles_carrousel_id).prepend(div);

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
				var loDOM = "<tr class='loinstance' loid='" + lo.id + "'><td class='index'>" + lo.resource_index + "</td><td class='type'>" + lo.lo_type + "</td><td class='preview'><img src='/assets/eye_icon.png'/></td><td class='add'><img src='/assets/plus.png'/></td></tr>";
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

		if(nLOs === 0){
			_redrawLoTable();
		} else {
			_addLoToLoTable(lo);
		}
		
		return true;
	};

	var _removeLO = function(loId){
		var nLOs = current_los.length;
		for(var i=0; i<nLOs; i++){
			if(current_los[i].id === loId){
				current_los.splice(i, 1);
				if(nLOs === 1){
					_redrawLoTable();
				} else {
					_removeLoFromLoTable(loId);
				}
				return true;
			}
		}
		return false;
	};

	var _redrawLoTable = function(){
		var loDiv = $("#sgame_at .scormfiles .selected_los");
		var loTable = $(loDiv).find("table.at_c");
		var nLOs = current_los.length;
		if(nLOs <= 0){
			$(loTable).hide();
			$(loDiv).find(".nolos").show();
			return;
		}
		$(loDiv).find(".nolos").hide();
		$(loTable).find("tr.loinstance").remove();

		for(var i=0; i<nLOs; i++){
			_addLoToLoTable(current_los[i],loTable);
		}

		$(loTable).show();
	};

	var _addLoToLoTable = function(lo,loTable){
		if(typeof loTable === "undefined"){
			loTable = $("#sgame_at .scormfiles .selected_los table.at_c");
		}
		var loDOM = "<tr class='loinstance' loid='" + lo.id + "'><td class='title'>" + lo.title + "</td><td class='type'>" + lo.lo_type + "</td><td class='preview'><img src='/assets/eye_icon.png'/></td><td class='remove'><img src='/assets/remove.png'/></td></tr>";
		$(loTable).append(loDOM);
	};

	var _removeLoFromLoTable = function(loId,loTable){
		if(typeof loTable === "undefined"){
			loTable = $("#sgame_at .scormfiles .selected_los table.at_c");
		}
		$(loTable).find("tr.loinstance[loid='" + loId + "']").remove();
	};

	var _onStep2Confirmation = function(){
		if(current_los.length < 1){
			return _showSGAMEDialogWithSettings({"msg":_getTrans("i.error_no_los")}, false);
		}
		_redrawMappingTable();
		_finishStep("2");
	};

	//Step 3

	var _redrawMappingTable = function(){
		var mappingTable = $("#sgame_at .mapping div.mapping_table_wrapper table");
		var nEvents = current_game.events.length;
		$(mappingTable).find("tr.eminstance").remove();

		for(var i=0; i<nEvents; i++){
			_addEventToMappingTable(current_game.events[i],mappingTable);
		}

		$(mappingTable).show();
	};

	var _addEventToMappingTable = function(event,mappingTable){
		var emDOM = "<tr class='eminstance' eid='" + event.id + "'><td class='title'>" + event.title + "</td><td class='description'>" + event.description + "</td><td class='mapping'><select multiple='multiple'></select></td></tr>";
		$(mappingTable).append(emDOM);

		var select = $(mappingTable).find("tr.eminstance[eid='" + event.id + "'] td.mapping select");
		var selectOptions = [{value:"none", text:_getTrans("i.none"), selected: ((typeof current_mapping[event.id] !== "undefined")&&(current_mapping[event.id].indexOf("none")!==-1))},{value: "*", text: _getTrans("i.all"), selected: ((typeof current_mapping[event.id] === "undefined")||(current_mapping[event.id].length===0))}];

		for(var j=0; j<current_los.length; j++){
			var lo = current_los[j];
			var selected = ((typeof current_mapping[event.id] !== "undefined")&&(current_mapping[event.id].indexOf(lo.id + "")!==-1));
			selectOptions.push({value:lo.id, text:lo.title, selected: selected});
		}

		for(var i=0; i<selectOptions.length; i++){
			var option = selectOptions[i];
			var selected = '';
			if(option.selected === true){
				selected = 'selected="selected"';
			}
			$(select).append('<option value="' + option.value + '" ' + selected + '>' + option.text + '</option>');
		}

		$(select).select2();

		$(select).on('change.select2', function (e) {
			if((typeof e.added !== "undefined")&&(typeof e.added.id !== "undefined")){
				switch(e.added.id){
					case "*":
						//All
						if (e.val.length > 1){
							$(this).select2("val",["*"]);
						}
						break;
					case "none":
						//None
						if (e.val.length > 1){
							$(this).select2("val",["none"]);
						}
						break;
					default:
						//Other
						var val = e.val;
						var shouldChangeVal = false;
						var iAll = val.indexOf("*");
						if (iAll !== -1){
							val.splice(iAll, 1);
							shouldChangeVal = true;
						}
						var iNone = val.indexOf("none");
						if (iNone !== -1){
							val.splice(iNone, 1);
							shouldChangeVal = true;
						}

						if(shouldChangeVal === true){
							$(this).select2("val",val);
						}

						break;
				}
			}
			
		});
	};

	var _onStep3Confirmation = function(){
		var nEvents = current_game.events.length;
		var currentLoIds = _getCurrentLoIds();
		var mappingTable = $("#sgame_at .mapping div.mapping_table_wrapper table");

		for(var i=0; i<nEvents; i++){
			//Build mapping
			var eventId = current_game.events[i].id;
			var eMDOM = $(mappingTable).find("tr.eminstance[eid='" + eventId + "']");
			var idsMappedLOs = $(eMDOM).find("div.select2-container-multi").select2("val");

			//idsMappedLOs
			for(var j=0; j<idsMappedLOs.length; j++){
				if((idsMappedLOs[j]==="*")||(idsMappedLOs[j]==="none")||(currentLoIds.indexOf(parseInt(idsMappedLOs[j]))!==-1)){
					continue;
				}
				return _showSGAMEDialogWithSettings({"msg":_getTrans("i.error_invalid_mapping")}, false);
			}

			current_mapping[eventId] = idsMappedLOs;

			//Check mapping
			var eM = current_mapping[eventId];
			if((typeof eM == "undefined")||(eM.length === 0)){
				return _showSGAMEDialogWithSettings({"msg":_getTrans("i.error_invalid_mapping")}, false);
			}
		};

		_finishStep("3");
	};


	/*
	 * I18n support
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