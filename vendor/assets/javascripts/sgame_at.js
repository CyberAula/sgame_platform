SGAME_AT = (function($,undefined){
	var VERSION = "1.0";

	var options = {};

	var locales;

	var catalog = {};
	catalog.game_templates = {};
	catalog.scormfiles = {};

	var stepsLoaded = [];
	var editMode = false;

	//Application state (Editor data in the SGAME platform)
	var current_step = 1;
	var current_preview_game_template = {};
	var current_game_template = {};
	var current_preview_scormfile = {};
	var current_los = {};
	var current_mapping = {};
	var current_sequencing = {};
	var current_settings = {};
	var current_metadata = {};


	var init = function (state,game_templates,scormfiles,initOptions){
		_extendJS();

		if(typeof initOptions == "object"){
			options = initOptions;
		}

		if(typeof SGAME_AT_Locales == "object"){
			locales = SGAME_AT_Locales;
		}

		$.each(game_templates, function(i, game_template){
			catalog.game_templates[game_template.id] = game_template;
		});
		$.each(scormfiles, function(i, scormfile){
			catalog.scormfiles[scormfile.id] = scormfile;
		});

		if((typeof state === "object")&&(Object.keys(state).length>0)){
			editMode = true;

			//Load initial state
			if(typeof state.step !== "undefined"){
				current_step = parseInt(state.step);
			}
			if(typeof state.game_template !== "undefined"){
				current_game_template = state.game_template;
			}
			if(typeof state.los !== "undefined"){
				current_los = state.los;
			}
			if(typeof state.mapping !== "undefined"){
				current_mapping = state.mapping;
				
				//Check mapping
				var mKeys = Object.keys(current_mapping);
				var mKeysL = mKeys.length;
				for(var x=0; x<mKeysL; x++){
					current_mapping[mKeys[x]] = current_mapping[mKeys[x]] + "";
				}
			}
			if(typeof state.sequencing !== "undefined"){
				current_sequencing = state.sequencing;
			}
			if(typeof state.settings !== "undefined"){
				current_settings = state.settings;
			}
			if(typeof state.metadata !== "undefined"){
				current_metadata = state.metadata;
			}
		}

		_loadEvents();
		_translateUI();

		for(var i=0; i<current_step; i++){
			_loadStep(i+1);
		}
	};

	var _extendJS = function(){
		String.prototype.replaceAll = function(find,replace){
			var str = this;
			return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
		};
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

	var _loadStep = function(step){
		$("div[step=" + step + "]").removeClass("disabled");
		_toggleStep(step,false);
		_onLoadStep(step);
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

	var _toggleStep = function(step,animation){
		if(typeof animation === "undefined"){
			animation = true;
		}
		var content = $("div[step=" + step + "]").find("div.stepContent");
		if($(content).hasClass("stephidden")){
			//Show
			$(content).removeClass("stephidden");
			if(animation){
				$(content).slideDown();
			} else {
				$(content).show();
			}
		} else {
			//Hide
			$(content).addClass("stephidden");
			if(animation){
				$(content).slideUp();
			} else {
				$(content).hide();
			}
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
				$("#sgame_at .game_template .selected img.thumbnail").on("click",function(){
					_previewGameTemplate(catalog.game_templates[$(this).attr("gtid")]);
				});

				$("#step1_confirmation").on("click",function(){
					_onStep1Confirmation();
				});

				_createGameTemplatesCarrousel();
				break;
			case 2:
				$(document).on('click', '#sgame_at .scormfiles .selected img.thumbnail', function(event) {
					_previewScormfile(catalog.scormfiles[$(this).attr("sfid")]);
				});

				$(document).on('click', '#sgame_at .scormfiles .selected table.at_c td.preview img', function(event) {
					var loId = $(this).parents("tr.loinstance[loid]").attr("loid");
					for(var i=0; i<current_preview_scormfile.los.length; i++){
						if((current_preview_scormfile.los[i].id + "") === loId){
							_previewLO(current_preview_scormfile.los[i]);
						}
					}
				});

				$(document).on('click', '#sgame_at .scormfiles .selected table.at_c td.add img', function(event) {
					var index = parseInt($(this).parents(".loinstance").find("td.index").html());
					var result = _addLO(current_preview_scormfile.los[index-1]);
					if(result === false){
						return _showSGAMEDialogWithSettings({"msg":_getTrans("i.error_lo_already_added")}, false);
					}
				});

				$(document).on('click', '#sgame_at .scormfiles .selected_los table.at_c td.preview img', function(event) {
					var loId = $(this).parents("tr.loinstance[loid]").attr("loid");
					_previewLO(current_los[loId]);
				});

				$(document).on('click', '#sgame_at .scormfiles .selected_los table.at_c td.remove img', function(event) {
					var loId = $(this).parents("[loid]").attr("loid");
					_removeLO(loId);
				});

				$(document).on('click', '#step2_addscormfile', function(event) {
					_addScormfile(current_preview_scormfile);
				});

				$("#step2_confirmation").on("click",function(){
					_onStep2Confirmation();
				});

				_createScormfilesCarrousel();

				_redrawLoTable();
				break;
			case 3:
				$("#step3_confirmation").on("click",function(){
					_onStep3Confirmation();
				});

				_redrawMappingTable();
				break;
			case 4:
				//Sequencing option 1: repeat_lo
				if(typeof current_sequencing["repeat_lo"] !== "undefined"){
					$("#sgame_at div[step='4'] div.options_wrapper input[name='seq_opt1'][value='" + current_sequencing["repeat_lo"] + "']").attr('checked',true);
				}

				$("#step4_confirmation").on("click",function(){
					_onStep4Confirmation();
				});
				break;
			case 5:
				//Setting option 1: completion_notification
				if(typeof current_settings["completion_notification"] !== "undefined"){
					$("#sgame_at div[step='5'] div.options_wrapper input[name='set_opt1'][value='" + current_settings["completion_notification"] + "']").attr('checked',true);
				}
				$("#step5_confirmation").on("click",function(){
					_onStep5Confirmation();
				});
				break;
			case 6:
				//Title
				if(typeof current_metadata["title"] === "string"){
					$("#sgame_at div[step='6'] div.metadata_wrapper input[name='metadata_field1']").val(current_metadata["title"]);
				}
				//Description
				if(typeof current_metadata["description"] === "string"){
					$("#sgame_at div[step='6'] div.metadata_wrapper textarea[name='metadata_field2']").val(current_metadata["description"]);
				}

				$("#step6_confirmation").on("click",function(){
					_onStep6Confirmation();
				});
				break;
			case 7:
				$("#step7_confirmation").on("click",function(){
					_onStep7Confirmation();
				});
				break;
			default:
				break;
		}
	};


	//Step 1

	var _createGameTemplatesCarrousel = function(){
		var game_templates_carrousel_id = "game_templates_carrousel";
		$.each(catalog.game_templates, function(i, game_template){
			var div = $("<div itemid="+game_template.id+"><p>" + game_template.title + "</p><img src='" + game_template.thumbnail_url + "'/></div>");
			$("#" + game_templates_carrousel_id).append(div);
		});
		var div = $("<div id='addGameButton'><a href='/game_templates/new' data-confirm='" + _getTrans("i.dialog_confirmation") + "' data-cancel-button='" + _getTrans("i.cancel") + "' data-method='get'><p>" + _getTrans("i.upload_game_template") + "</p><img src='/assets/add_game.png'/></a></div>");
		$("#" + game_templates_carrousel_id).prepend(div);

		_createCarousel(game_templates_carrousel_id);

		$("#" + game_templates_carrousel_id + " div[itemid]").on("click", function(event){
			_selectGameTemplate(catalog.game_templates[$(this).attr("itemid")]);
		});

		var selectedGameTemplateId;
		if((typeof current_game_template !== "undefined")&&(typeof current_game_template.id !== "undefined")){
			selectedGameTemplateId = current_game_template.id;
		} else {
			selectedGameTemplateId = Object.keys(catalog.game_templates)[0]; //Preview first game
		}

		_selectGameTemplate(catalog.game_templates[selectedGameTemplateId]);
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

	var _selectGameTemplate = function(gt){
		current_preview_game_template = gt;

		//Fill metadata
		var thumbnailDOM = $("#sgame_at .game_template .selected img.thumbnail");
		if(typeof gt.thumbnail_url !== "undefined"){
			$(thumbnailDOM).attr("src",gt.thumbnail_url);
			$(thumbnailDOM).attr("gtid",gt.id);
			$(thumbnailDOM).show();
		} else {
			$(thumbnailDOM).hide();
		}

		$("#sgame_at .game_template .selected tr.title td").html(gt.title);
		$("#sgame_at .game_template .selected tr.description td").html(gt.description);
		$("#sgame_at .game_template .selected tr.language td").html(gt.language);

		//Fill events
		var eventsTable = $("#sgame_at .game_template .selected table.at_b");
		var gEvents = gt.events;
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

		$("#sgame_at .game_template .selected").show();
	};

	var _previewGameTemplate = function(gt){
		var gtURL = "/game_templates/" + gt.id + ".full";
		$("#preview_iframe_fancybox").attr("href",gtURL);
		$("#preview_iframe_fancybox").trigger("click");
	};

	var _onStep1Confirmation = function(){
		if((typeof current_preview_game_template == "undefined")||(typeof current_preview_game_template.id == "undefined")){
			return _showSGAMEDialogWithSettings({"msg":_getTrans("i.error_no_game")}, false);
		}

		var newGameTemplate = (typeof current_game_template !== "undefined")&&(typeof current_game_template.id !== "undefined")&&(current_preview_game_template.id !== current_game_template.id);
		if((newGameTemplate)&&(Object.keys(current_mapping).length > 0)){
			return _showSGAMEDialogWithSettings({"msg": _getTrans("i.gt_change_confirmation")}, true, function(ok){
				if(ok){
					//New game template was selected
					current_game_template = current_preview_game_template;
					//Reset mapping
					current_mapping = {};
					_redrawMappingTable();
					_finishStep("1");
				} else {
					return;
				}
			});
		}
		
		current_game_template = current_preview_game_template;
		
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
			results.push(_addLO(sf.los[i]));
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

	var _addLO = function(lo){
		if(typeof current_los[lo.id] !== "undefined"){
			//LO already added
			return false;
		}

		//Add LO
		current_los[lo.id] = lo;

		if(Object.keys(current_los).length === 1){
			_redrawLoTable();
		} else {
			_addLoToLoTable(lo);
		}
		
		return true;
	};

	var _removeLO = function(loId){
		if(typeof current_los[loId] === "undefined"){
			return false;
		}

		delete current_los[loId];

		if(Object.keys(current_los).length === 0){
			_redrawLoTable();
		} else {
			_removeLoFromLoTable(loId);
		}
		return true;
	};

	var _redrawLoTable = function(){
		var loDiv = $("#sgame_at .scormfiles .selected_los");
		var loTable = $(loDiv).find("table.at_c");
		var loIds = Object.keys(current_los);
		var nLOs = loIds.length;
		if(nLOs <= 0){
			$(loTable).hide();
			$(loDiv).find(".nolos").show();
			return;
		}
		$(loDiv).find(".nolos").hide();
		$(loTable).find("tr.loinstance").remove();

		for(var i=0; i<nLOs; i++){
			_addLoToLoTable(current_los[loIds[i]],loTable);
		}

		$(loTable).show();
	};

	var _addLoToLoTable = function(lo,loTable){
		if(typeof loTable === "undefined"){
			loTable = $("#sgame_at .scormfiles .selected_los table.at_c");
		}

		if((typeof lo.title !== "string")&&(typeof lo.container_id !== "undefined")){
			lo.title = catalog.scormfiles[lo.container_id].title + " (" + lo.resource_index + ")";
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
		if(Object.keys(current_los).length < 1){
			return _showSGAMEDialogWithSettings({"msg":_getTrans("i.error_no_los")}, false);
		}
		_redrawMappingTable();
		_finishStep("2");
	};

	//Step 3

	var _redrawMappingTable = function(){
		var mappingTable = $("#sgame_at .mapping div.mapping_table_wrapper table");
		var nEvents = current_game_template.events.length;
		$(mappingTable).find("tr.eminstance").remove();

		for(var i=0; i<nEvents; i++){
			_addEventToMappingTable(current_game_template.events[i],mappingTable);
		}

		$(mappingTable).show();
	};

	var _addEventToMappingTable = function(event,mappingTable){
		var emDOM = "<tr class='eminstance' eid='" + event.id + "'><td class='title'>" + event.title + "</td><td class='description'>" + event.description + "</td><td class='mapping'><select multiple='multiple'></select></td></tr>";
		$(mappingTable).append(emDOM);

		var select = $(mappingTable).find("tr.eminstance[eid='" + event.id + "'] td.mapping select");
		var selectOptions = [{value:"none", text:_getTrans("i.none"), selected: ((typeof current_mapping[event.id] !== "undefined")&&(current_mapping[event.id].indexOf("none")!==-1))},{value: "*", text: _getTrans("i.all"), selected: ((typeof current_mapping[event.id] === "undefined")||(current_mapping[event.id].length===0)||(current_mapping[event.id].indexOf("*")!==-1))}];

		var loIds = Object.keys(current_los);
		var nLOs = loIds.length;
		for(var j=0; j<nLOs; j++){
			var lo = current_los[loIds[j]];
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
		var nEvents = current_game_template.events.length;
		var currentLoIds = Object.keys(current_los);
		var mappingTable = $("#sgame_at .mapping div.mapping_table_wrapper table");

		for(var i=0; i<nEvents; i++){
			//Build mapping
			var eventId = current_game_template.events[i].id;
			var eMDOM = $(mappingTable).find("tr.eminstance[eid='" + eventId + "']");
			var idsMappedLOs = $(eMDOM).find("div.select2-container-multi").select2("val");

			//idsMappedLOs
			for(var j=0; j<idsMappedLOs.length; j++){
				if((idsMappedLOs[j]==="*")||(idsMappedLOs[j]==="none")||(currentLoIds.indexOf(idsMappedLOs[j])!==-1)){
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


	//Step 4

	var _onStep4Confirmation = function(){
		//Sequencing option 1: repeat_lo
		current_sequencing["repeat_lo"] = $("#sgame_at div[step='4'] div.options_wrapper input[name='seq_opt1']:checked").val();
		_finishStep("4");
	};


	//Step 5

	var _onStep5Confirmation = function(){
		//Settings option 1: completion_notification
		current_settings["completion_notification"] = $("#sgame_at div[step='5'] div.options_wrapper input[name='set_opt1']:checked").val();
		_finishStep("5");
	};


	//Step 6

	var _onStep6Confirmation = function(){
		//Title
		current_metadata["title"] = $("#sgame_at div[step='6'] div.metadata_wrapper input[name='metadata_field1']").val();
		//Description
		current_metadata["description"] = $("#sgame_at div[step='6'] div.metadata_wrapper textarea[name='metadata_field2']").val();

		//Validation
		if((typeof current_metadata["title"] !== "string")||(current_metadata["title"].trim() === "")){
			return _showSGAMEDialogWithSettings({"msg":_getTrans("i.error_title_missing")}, false);
		}

		_finishStep("6");
	};


	//Step 7

	var _onStep7Confirmation = function(){
		//Final validation. TODO
		_onCreateGame();
	};

	var _onCreateGame = function(){
		
		var editor_data = _generateEditorData();
		var game = {editor_data: editor_data};

		if(editMode){
			//Send request to the SGAME platform to edit an existing educational game
			var url = '/games/' + current_metadata["id"];
			var type = 'PUT';
		} else {
			//Send request to the SGAME platform to create a new educational game
			var url = '/games';
			var type = 'POST';
		}

		$.ajax({
			url:url,
			type:type,
			dataType:'json',
			data:{
				game: game,
				authenticity_token: options["authenticity_token"]
			},
			success:function(data){
				var keySuccessMsg = (editMode ? "i.success_update" : "i.success_creation");
				_showSGAMEDialogWithSettings({"msg":_getTrans(keySuccessMsg)}, false, function(){
					window.location.href = data.gamePath;
				});
			},
			error:function(data){
				if((typeof data.responseJSON !== "undefined")&&(typeof data.responseJSON.errorMsg === "string")){
					var keySpecificErrorMsg = (editMode ? "i.error_specific_update" : "i.error_specific_create");
					var errorMsg = _getTrans(keySpecificErrorMsg, {errorMsg: data.responseJSON.errorMsg});
				} else {
					var keyGenericErrorMsg = (editMode ? "i.error_generic_update" : "i.error_generic_create");
					var errorMsg = _getTrans(keyGenericErrorMsg);
				}
				_showSGAMEDialogWithSettings({"msg":errorMsg}, false);
			}
		});
	};

	var _generateEditorData = function(){
		var editor_data = {};
		editor_data.sgame_at_version = VERSION;
		editor_data.step = current_step;

		editor_data.game_template = current_game_template;
		editor_data.los = current_los;
		editor_data.mapping = current_mapping;
		editor_data.sequencing = current_sequencing;
		editor_data.settings = current_settings;
		editor_data.metadata = current_metadata;

		return JSON.stringify(editor_data);
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
	 * // _getTrans("i.dtest", {name: "Demo"}) -> "Uploaded by Demo via SGAME"
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