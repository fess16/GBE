Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");

Components.utils.import('chrome://GBE/content/scripts/module.js');


var fessGoogleBookmarksDialogs = {

	"_M" : fGoogleBookmarksModule,
	"overlay" : null,
	"windowsParams" : null,

	/**
	 * При загрузке окна настроек дополнения
	 */
	onLoadPrefWindow : function()
	{
		if (window !== null && window.arguments !== undefined && window.arguments[0] !== undefined ) 
		{
			var useMenuBar = window.arguments[0]._M.useMenuBar;
			this.overlay = window.arguments[0];
		}
		else
		{
			var useMenuBar = Components.classes["@mozilla.org/preferences-service;1"]
     .getService(Components.interfaces.nsIPrefService)
     .getBranch("extensions.fessGBE.")
     .getBoolPref("useMenuBar");
		}

		if (useMenuBar)
		{
			document.getElementById("fessGBE-prefs-useMenuBar-Ctrl").selectedIndex = 0;
		}
		else
		{
			document.getElementById("fessGBE-prefs-useMenuBar-Ctrl").selectedIndex = 1;
		}
		if (document.getElementById("fessGBE-prefs-enableLabelUnlabeled-Ctrl").checked)
		{
			document.getElementById("fessGBE-prefs-labelUnlabeledName-Ctrl").disabled = false;
		}
		else
		{
			document.getElementById("fessGBE-prefs-labelUnlabeledName-Ctrl").disabled = true;
		}
	}, 

	onChangeWidthValue : function(event)
	{
		let value = parseInt(event.target.value);
		let id = event.target.getAttribute('id');
		if (id == "fessGBE-prefs-minMenuWidth-Ctrl")
		{
			if (isNaN(value) || value < 300 || value > 950)
			{
				event.target.value = 300;
			}
		}
		if (id == "fessGBE-prefs-maxMenuWidth-Ctrl")
		{
			if (isNaN(value) || value < 300 || value > 1000 || value < parseInt(document.getElementById("fessGBE-prefs-minMenuWidth-Ctrl").value))
			{
				event.target.value = parseInt(document.getElementById("fessGBE-prefs-minMenuWidth-Ctrl").value);
			}
		}

	},

	/**
	 * Сохранение настроек
	 */
	onAcceptPrefWindow : function(event)
	{
		try {
			// разделитель закладок не должен быть пустым и состоять из одного символа
			if (document.getElementById("fessGBE-prefs-nestedLabelSep-Ctrl").value == "" || 
					document.getElementById("fessGBE-prefs-nestedLabelSep-Ctrl").value.length != 1)
					{
						this._M.ErrorLog("GBE:onAcceptPrefwindow", "Seperator error! ");
						document.getElementById("fessGBE-prefs-nestedLabelSep-Ctrl").focus();
						return false;
					}	
			// Метка для закладок без метки не должна быть пустой
			if (document.getElementById("fessGBE-prefs-enableLabelUnlabeled-Ctrl").checked &&
					document.getElementById("fessGBE-prefs-labelUnlabeledName-Ctrl").value == "")
			{
				this._M.ErrorLog("GBE:onAcceptPrefwindow", "Label for Unlabeled labels error! ");
				document.getElementById("fessGBE-prefs-labelUnlabeledName-Ctrl").focus();
				return false;
			}	
			let minMenuWidth = parseInt(document.getElementById("fessGBE-prefs-minMenuWidth-Ctrl").value);
			let maxMenuWidth = parseInt(document.getElementById("fessGBE-prefs-maxMenuWidth-Ctrl").value);

			if (isNaN(minMenuWidth) || minMenuWidth < 300 || minMenuWidth > 950)
			{
				document.getElementById("fessGBE-prefs-minMenuWidth-Ctrl").value = 300;
				minMenuWidth = 300;
				return false;
			}

			if (isNaN(maxMenuWidth) || maxMenuWidth < minMenuWidth || maxMenuWidth == '' || maxMenuWidth > 1000)
			{
				maxMenuWidth = minMenuWidth;
				document.getElementById("fessGBE-prefs-maxMenuWidth-Ctrl").value = maxMenuWidth;
				return false;
			}

		
			this._M.prefs.setCharPref("nestedLabelSep", document.getElementById("fessGBE-prefs-nestedLabelSep-Ctrl").value);
			this._M.prefs.setBoolPref("showFavicons", document.getElementById("fessGBE-prefs-showFavicons-Ctrl").checked);
			this._M.prefs.setBoolPref("reverseBkmrkLeftClick", document.getElementById("fessGBE-prefs-reverseBkmrkLeftClick-Ctrl").checked);
			this._M.prefs.setCharPref("sortType", document.getElementById("fessGBE-prefs-sortType-Ctrl").value);
			this._M.prefs.setCharPref("sortOrder", document.getElementById("fessGBE-prefs-sortOrder-Ctrl").value);
			this._M.prefs.setBoolPref("suggestLabel", document.getElementById("fessGBE-prefs-suggestLabel-Ctrl").checked);
			this._M.prefs.setBoolPref("enableGBautocomplite", document.getElementById("fessGBE-prefs-enableGBautocomplite-Ctrl").checked);
			this._M.prefs.setBoolPref("enableNotes", document.getElementById("fessGBE-prefs-enableNotes-Ctrl").checked);

			if (document.getElementById("fessGBE-prefs-useMenuBar-Ctrl").value == "on")
			{
				this._M.prefs.setBoolPref("useMenuBar", true);
			}
			else
			{
				this._M.prefs.setBoolPref("useMenuBar", false);
			}
			this._M.prefs.setBoolPref("enableLabelUnlabeled", document.getElementById("fessGBE-prefs-enableLabelUnlabeled-Ctrl").checked);
			this._M.prefs.setCharPref("labelUnlabeledName", document.getElementById("fessGBE-prefs-labelUnlabeledName-Ctrl").value);
			this._M.prefs.setBoolPref("showToolbarAddBtn", document.getElementById("fessGBE-prefs-showToolbarAddBtn-Ctrl").checked);
			this._M.prefs.setBoolPref("showToolbarQuickAddBtn", document.getElementById("fessGBE-prefs-showToolbarQuickAddBtn-Ctrl").checked);
			this._M.prefs.setIntPref("minMenuWidth", minMenuWidth);
			this._M.prefs.setIntPref("maxMenuWidth", maxMenuWidth);
			this._M.prefs.setBoolPref("enable10recentBookmark", document.getElementById("fessGBE-prefs-enable10recentBookmark-Ctrl").checked);
			this._M.prefs.setBoolPref("enable10visitedBookmark", document.getElementById("fessGBE-prefs-enable10visitedBookmark-Ctrl").checked);


			this._M.needRefresh = true;
			this._M.nestedLabelSep = document.getElementById("fessGBE-prefs-nestedLabelSep-Ctrl").value;
			this._M.showFavicons = document.getElementById("fessGBE-prefs-showFavicons-Ctrl").checked;
			this._M.reverseBkmrkLeftClick = document.getElementById("fessGBE-prefs-reverseBkmrkLeftClick-Ctrl").checked;
			this._M.sortType = document.getElementById("fessGBE-prefs-sortType-Ctrl").value;
			this._M.sortOrder = document.getElementById("fessGBE-prefs-sortOrder-Ctrl").value;
			this._M.suggestLabel = document.getElementById("fessGBE-prefs-suggestLabel-Ctrl").value;
			var oldValGBautocomplite = this._M.enableGBautocomplite;
			this._M.enableGBautocomplite = document.getElementById("fessGBE-prefs-enableGBautocomplite-Ctrl").checked;
			this._M.enableNotes = document.getElementById("fessGBE-prefs-enableNotes-Ctrl").checked;
			this._M.useMenuBar = this._M.prefs.getBoolPref("useMenuBar");
			this._M.enableLabelUnlabeled = document.getElementById("fessGBE-prefs-enableLabelUnlabeled-Ctrl").checked;
			this._M.labelUnlabeledName = document.getElementById("fessGBE-prefs-labelUnlabeledName-Ctrl").value;
			this._M.minMenuWidth = minMenuWidth;
			this._M.maxMenuWidth = maxMenuWidth;
			this._M.enable10recentBookmark = document.getElementById("fessGBE-prefs-enable10recentBookmark-Ctrl").checked;
			this._M.enable10visitedBookmark = document.getElementById("fessGBE-prefs-enable10visitedBookmark-Ctrl").checked;


			if (oldValGBautocomplite !== this._M.enableGBautocomplite && this.overlay !== null)
			{
				if (this._M.enableGBautocomplite)
				{
					this.overlay.setURLBarAutocompleteList("on");
				}
				else
				{
					this.overlay.setURLBarAutocompleteList("off");
				}
			}
		}
		catch (e) {
			this._M.ErrorLog("GBE:onLoadPrefwindow", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
		return true;
	},

	/**
	 * Enable/disable поля labelUnlabeledName в зависимости от состояния флажка enableLabelUnlabeled
	 */
	onCheckboxStateChange : function()
	{
		try
		{
			if (document.getElementById("fessGBE-prefs-enableLabelUnlabeled-Ctrl").checked)
			{
				document.getElementById("fessGBE-prefs-labelUnlabeledName-Ctrl").disabled = false;
			}
			else
			{
				document.getElementById("fessGBE-prefs-labelUnlabeledName-Ctrl").disabled = true;
			}
		}
		catch(e)
		{
			this._M.ErrorLog("GBE:onCheckboxStateChange", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	/**
	 * выполняется при загрузке диалога редактирования закладок
	 */
	onLoadBookmarkDialog : function()
	{
		this.windowsParams = JSON.parse(JSON.stringify(this._M.windowsParams)); 
		if (window !== null && window.arguments !== undefined && window.arguments[0] !== undefined ) 
		{
			this.overlay = window.arguments[0];
		}
		this.windowsParams["oldUrl"] = null;
		// заполняем поля диалога редактирования
		document.getElementById("GBE-bookmark.dialog.name").value = this.windowsParams.name;
		document.getElementById("GBE-bookmark-dialog-url").value = this.windowsParams.url;
		document.getElementById("GBE-bookmark.dialog.labels").value = this.windowsParams.labels;
		document.getElementById("GBE-bookmark.dialog.notes").value = this.windowsParams.notes;
		// при редактировании поле адреса делаем только для чтения
		if (this.windowsParams.id)
		{
			document.getElementById("GBE-bookmark.dialog.enableUrlEdit").hidden = false;
			document.getElementById("GBE-bookmark.dialog.enableUrlEdit").checked = false;
			document.getElementById("GBE-bookmark-dialog-url").setAttribute("readonly", "true");

			if (!this._M.enableNotes)
			{
				// запрашиваем примечание к закладке
				this._M.doRequestBookmarkNote(this.windowsParams.id, this.windowsParams.name, document.getElementById("GBE-bookmark.dialog.notes"));
			}
			if (this.windowsParams.url == "")
			{
				document.getElementById("GBE-bookmark-dialog-url").value = this._M.doRequestBookmarkURL(this.windowsParams.id, this.windowsParams.name, this.windowsParams.index);
			}

			this.windowsParams.oldUrl = this.windowsParams.url;

		}

		var searchTextField = document.getElementById("GBE-bookmark.dialog.labels");
		// формируем список для автодополнения меток
		var labelsList = this._M.m_labelsArr;
		if (labelsList !== null)
		{
			paramsToSet = "{\"delimiter\" : \""+ this._M.nestedLabelSep + "\", \"labels\" : [";
			for (var i = 0; i < labelsList.length; i++) {
				paramsToSet += "{\"value\" : \"" + labelsList[i] + "\"},";
			};
			paramsToSet = paramsToSet.substring(0, paramsToSet.length-1); // to remove the last ","
			paramsToSet += "]}";
			searchTextField.setAttribute("autocompletesearchparam", paramsToSet);
		}
	},

	onEnableUrlEdit : function()
	{
		try
		{
			let urlCtrl = document.getElementById("GBE-bookmark-dialog-url");
			if (document.getElementById("GBE-bookmark.dialog.enableUrlEdit").checked)
			{
				urlCtrl.removeAttribute("readonly");
			}
			else
			{
				urlCtrl.setAttribute("readonly", "true");
				urlCtrl.value = this.windowsParams.oldUrl;
			}
		}
		catch(e)
		{
			this._M.ErrorLog("GBE:onEnableUrlEdit", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
		}
	},

	/**
	 * клик по кнопке сохранить в диалоге редактирования закладки
	 */
	onAcceptBookmarkDialog : function()
	{
		if (this.windowsParams !== null)
		{
			this.windowsParams.name = document.getElementById("GBE-bookmark.dialog.name").value;
			this.windowsParams.url = document.getElementById("GBE-bookmark-dialog-url").value;
			this.windowsParams.labels = document.getElementById("GBE-bookmark.dialog.labels").value;
			this.windowsParams.notes = document.getElementById("GBE-bookmark.dialog.notes").value;
			if (this.windowsParams.name == "") {
				document.getElementById("GBE-bookmark.dialog.name").focus();
				return false;
			}
			if (this.windowsParams.url == "") {
				document.getElementById("GBE-bookmark-dialog-url").focus();
				return false;
			}
			this._M.doChangeBookmark(this.windowsParams, this.overlay); 
			if (this.overlay !== null)
			{
				this.overlay.needRefresh = true;
			}
			this.windowsParams = null;
		}
	},

	/**
	 * завершение поиска при автокомплите меток
	 */
	onSearchCompliteAutocomplite : function (e)
	{
		// обнуляем предыдущее значение поиска
		this.oldSearchValue = "";
		// текущее значение поиска
		var value = e.value;
		// если в строке поиска есть запятые (у закладки несколько меток), то
		if (value.indexOf(",") > 0)
		{
			// сохраняем значения до последней запятой
			this.oldSearchValue = value.substr(0, value.lastIndexOf(',')).trim();
		}
	},

	/**
	 * при выборе значения из списка автокомплита
	 */
	onTextEnteredAutocomplite : function (e)
	{
		// если предыдущее значение поиска не пустое
		if (this.oldSearchValue.length)
		{
			// объединяем старое значение и значение из списка
			e.value = this.oldSearchValue + ', ' + (e.value);
			this.oldSearchValue = "";
		}
	},

		/**
	 * при открытии диалога удаления закладки
	 */
	onLoadDeleteDialog : function()
	{
		if (this._M.windowsParams.id !== null ) 
		{
			if (window !== null && window.arguments !== undefined && window.arguments[0] !== undefined ) 
			{
				this.overlay = window.arguments[0];
			}
			this.windowsParams = JSON.parse(JSON.stringify(this._M.windowsParams));  
			// выводим название удаляемой закладки
			document.getElementById("GBE-delete.dialog.title").value = this.windowsParams.name + "?";
		}
	},	

	/**
	 * клик по кнопке удалить в диалоге удаления закладки
	 */
	onAcceptDeleteDlg : function()
	{
		if (this.windowsParams.id !== null ) 
		{
			this._M.doDeleteBookmark(this.windowsParams, this.overlay); 
			if (this.overlay !== null)
			{
				this.overlay.needRefresh = true;
			}
			this.windowsParams = null;
		}
	},

	/**
	 * при открытии диалога редактирования метки
	 */
	onLoadFolderkDialog : function()
	{
		if (window !== null && window.arguments !== undefined && window.arguments[0] !== undefined ) 
		{
			this.overlay = window.arguments[0];
		}
		this.windowsParams = JSON.parse(JSON.stringify(this._M.windowsParams)); 
		// Заполняем поле с названием метки
		document.getElementById("GBE-folder.dialog.name").value = this.windowsParams.name;
	},

	/**
	 * подтверждение изменения метки
	 */
	onAcceptFolderDialog : function()
	{
		var oldName = this.windowsParams.name;
		var name = document.getElementById("GBE-folder.dialog.name").value.trim();
		var nested_labels = name.split(this._M.nestedLabelSep);
		if (name == "")					
		{
			document.getElementById("GBE-folder.dialog.name").focus();
			return false;
		}

		if (name == oldName)
		{
			this.windowsParams = null;
			return true;
		}

		if (name && this._M.m_bookmarkList && this._M.m_bookmarkList.length)
		{
			var old_nested_labels = oldName.split(this._M.nestedLabelSep);
			if (old_nested_labels.length == 1)
			{
				this._M.doChangeFolder(oldName, name, this._M.m_signature);
			}
			else
			{
				var labelsList = this._M.m_labelsArr;
				for (var i = 0; i < labelsList.length; i++) 
				{
					if (labelsList[i].indexOf(oldName) == 0)
					{
						this._M.doChangeFolder(labelsList[i], labelsList[i].replace(oldName, name), this._M.m_signature);
					}
				};
			}
			if (this.overlay !== null)
			{
				this.overlay.needRefresh = true;
			}
		}
		this.windowsParams = null;
	},

	/**
	 * при открытии диалога удаления метки
	 */
	onLoadFolderDeleteDialog : function()
	{
		this.windowsParams = JSON.parse(JSON.stringify(this._M.windowsParams)); 
		if (window !== null && window.arguments !== undefined && window.arguments[0] !== undefined ) 
		{
			this.overlay = window.arguments[0];
		}
		document.getElementById("GBE-folderDelete.dialog.title").value = this.windowsParams.name + "?";
	},

	/**
	 * подтверждение удаления метки
	 */
	onAcceptFolderDeleteDlg : function()
	{
		var name = this.windowsParams.name;
		// флаг удаления вложенных закладок
		var deleteChildren = document.getElementById("GBE-folderDelete.dialog.deleteChildren").checked;
		if (name && this._M.m_bookmarkList && this._M.m_bookmarkList.length)
		{
			if (!deleteChildren)
			{
				this._M.doDeleteFolder(name, this._M.m_signature);
			}
			else
			{
				for (var i = 0, m_bookmarkListLength = this._M.m_bookmarkList.length; i < m_bookmarkListLength; i++)
				{
					var labelPos = -1;
					var newLabels = this._M.m_bookmarkList[i].labels;
					if (newLabels.length)
		  		{
			  		for (var j = 0; j < newLabels.length; j++) {
			  			// if (newLabels[j] == name)
			  			if (newLabels[j].indexOf(name) == 0)
			  			{ 
			  				// запоминаем позицию искомой метки в массиве меток найденной закладки
			  				labelPos = j;
			  				break;
			  			}
			  		}
			  	}	
			  	if (labelPos >= 0)
			  	{
			  		var params = {
							id : this._M.m_bookmarkList[i].id,
							sig : this._M.m_signature
						};
						this._M.doDeleteBookmark(params); 
						if (this.overlay !== null)
						{
							this.overlay.needRefresh = true;
						}
					}
				}
			}
			this.windowsParams = null;
		}
	},

	onLoadQrDialog : function()
	{
		if (this._M.windowsParams.url != null && this._M.windowsParams.url.length)
		{
			document.getElementById("GBE-qr.dialog.image").src = "https://chart.googleapis.com/chart?cht=qr&chl=" +
				this._M.windowsParams.url + "&choe=UTF-8&chs=200x200";
		}
	},

	/*
	При открытии диалога добавления в закладки открытых вкладок
	*/
	onLoadAddOpenTabsDialog : function()
	{
		if (window !== null && window.arguments !== undefined && window.arguments[0] !== undefined ) 
		{
			this.overlay = window.arguments[0];
		}
		// автодополнение названия метки
		let searchTextField = document.getElementById("GBE-addOpenTabs.dialog.labelName");
		let labelsList = this._M.m_labelsArr;
		if (labelsList !== null)
		{
			paramsToSet = "{\"delimiter\" : \""+ this._M.nestedLabelSep + "\", \"labels\" : [";
			for (let i = 0; i < labelsList.length; i++) {
				paramsToSet += "{\"value\" : \"" + labelsList[i] + "\"},";
			};
			paramsToSet = paramsToSet.substring(0, paramsToSet.length-1); // to remove the last ","
			paramsToSet += "]}";
			searchTextField.setAttribute("autocompletesearchparam", paramsToSet);
		}

		this.windowsParams = JSON.parse(JSON.stringify(this._M.windowsParams)); 
		// название метки
		searchTextField.value = this.windowsParams.label;
		// формируем дерево добавляемых закладок
		let treechildren = document.getElementById("GBE-addOpenTabs_dialog_tree");
		while (treechildren.firstChild) {
		  treechildren.removeChild(treechildren.firstChild);
		}

		for (let i = 0; i < this.windowsParams.tabs.length; i++)
		{
			let t = this.windowsParams.tabs[i];

			let treeitem = document.createElement('treeitem');
			let treerow = document.createElement('treerow');

			let treecell_1 = document.createElement('treecell');
			let treecell_2 = document.createElement('treecell');
			let treecell_3 = document.createElement('treecell');

			treecell_1.setAttribute('value', true);
			treecell_2.setAttribute('label', t.title);
			treecell_3.setAttribute('label', t.uri);

			treerow.appendChild(treecell_1);
			treerow.appendChild(treecell_2);
			treerow.appendChild(treecell_3);

			treeitem.appendChild(treerow);

			treechildren.appendChild(treeitem);
		}
	},

	// подтверждение добавления вкладок в закладки
	onAcceptAddOpenTabsDialog : function()
	{
		let treechildren = document.getElementById("GBE-addOpenTabs_dialog_tree");
		let label = document.getElementById("GBE-addOpenTabs.dialog.labelName").value;
		// перебираем все вкладки из дерева
		let rows = treechildren.querySelectorAll("treerow");
		for (let i=0; i<rows.length; i++)
		{
			let cells = rows[i].childNodes;
			let flag = cells[0].getAttribute("value");
			let title = cells[1].getAttribute("label");
			let uri = cells[2].getAttribute("label");
			// добавляем только выбранные
			if (flag=="true")
			{
				// параметры закладки
				let windowsParams = {
						name : title,
						id : null,
						url : uri,
						labels : "",
						notes : "",
						sig : this._M.m_signature
					};
				// если такая закладка с таким адресом уже есть,
				this._M.getBookmark(windowsParams, true);
				if (windowsParams.id)
				{
					// добавляем новую метку + к предыдущим
					if (windowsParams.labels.length)
					{
						if (windowsParams.labels.indexOf(label === -1)) windowsParams.labels.push(label);
					}
					else
					{
						windowsParams.labels += label;
					}
				}
				else
				{
					// иначе - просто новая закладка
					windowsParams.labels = label;
				}

				this._M.doChangeBookmark(windowsParams, this.overlay); 
			}
		}
		if (this.overlay !== null)
		{
			this.overlay.needRefresh = true;
		}

	},

}