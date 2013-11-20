Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");

Components.utils.import('chrome://GBE/content/scripts/module.js');


/**
 * При загрузке окна настроек дополнения
 */
fGoogleBookmarksExtension.onLoadPrefWindow = function()
{
	if (this.useMenuBar)
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
};

/**
 * Сохранение настроек
 */
fGoogleBookmarksExtension.onAcceptPrefWindow = function(event)
{
	try {
		// разделитель закладок не должен быть пустым и состоять из одного символа
		if (document.getElementById("fessGBE-prefs-nestedLabelSep-Ctrl").value == "" || 
				document.getElementById("fessGBE-prefs-nestedLabelSep-Ctrl").value.length != 1)
				{
					this.ErrorLog("GBE:onAcceptPrefwindow", "Seperator error! ");
					document.getElementById("fessGBE-prefs-nestedLabelSep-Ctrl").focus();
					return false;
				}	
		// Метка для закладок без метки не должна быть пустой
		if (document.getElementById("fessGBE-prefs-enableLabelUnlabeled-Ctrl").checked &&
				document.getElementById("fessGBE-prefs-labelUnlabeledName-Ctrl").value == "")
		{
			this.ErrorLog("GBE:onAcceptPrefwindow", "Label for Unlabeled labels error! ");
			document.getElementById("fessGBE-prefs-labelUnlabeledName-Ctrl").focus();
			return false;
		}	
		
		this.prefs.setCharPref("nestedLabelSep", document.getElementById("fessGBE-prefs-nestedLabelSep-Ctrl").value);
		this.prefs.setBoolPref("showFavicons", document.getElementById("fessGBE-prefs-showFavicons-Ctrl").checked);
		this.prefs.setBoolPref("reverseBkmrkLeftClick", document.getElementById("fessGBE-prefs-reverseBkmrkLeftClick-Ctrl").checked);
		this.prefs.setCharPref("sortType", document.getElementById("fessGBE-prefs-sortType-Ctrl").value);
		this.prefs.setCharPref("sortOrder", document.getElementById("fessGBE-prefs-sortOrder-Ctrl").value);
		this.prefs.setBoolPref("suggestLabel", document.getElementById("fessGBE-prefs-suggestLabel-Ctrl").checked);
		this.prefs.setBoolPref("enableGBautocomplite", document.getElementById("fessGBE-prefs-enableGBautocomplite-Ctrl").checked);
		this.prefs.setBoolPref("enableNotes", document.getElementById("fessGBE-prefs-enableNotes-Ctrl").checked);

		if (document.getElementById("fessGBE-prefs-useMenuBar-Ctrl").value == "on")
		{
			this.prefs.setBoolPref("useMenuBar", true);
		}
		else
		{
			this.prefs.setBoolPref("useMenuBar", false);
		}
		this.prefs.setBoolPref("enableLabelUnlabeled", document.getElementById("fessGBE-prefs-enableLabelUnlabeled-Ctrl").checked);
		this.prefs.setCharPref("labelUnlabeledName", document.getElementById("fessGBE-prefs-labelUnlabeledName-Ctrl").value);

		this.needRefresh = true;
		this.nestedLabelSep = document.getElementById("fessGBE-prefs-nestedLabelSep-Ctrl").value;
		this.showFavicons = document.getElementById("fessGBE-prefs-showFavicons-Ctrl").checked;
		this.reverseBkmrkLeftClick = document.getElementById("fessGBE-prefs-reverseBkmrkLeftClick-Ctrl").checked;
		this.sortType = document.getElementById("fessGBE-prefs-sortType-Ctrl").value;
		this.sortOrder = document.getElementById("fessGBE-prefs-sortOrder-Ctrl").value;
		this.suggestLabel = document.getElementById("fessGBE-prefs-suggestLabel-Ctrl").value;
		var oldValGBautocomplite = this.enableGBautocomplite;
		this.enableGBautocomplite = document.getElementById("fessGBE-prefs-enableGBautocomplite-Ctrl").checked;
		this.enableNotes = document.getElementById("fessGBE-prefs-enableNotes-Ctrl").checked;
		this.useMenuBar = this.prefs.getBoolPref("useMenuBar");
		this.enableLabelUnlabeled = document.getElementById("fessGBE-prefs-enableLabelUnlabeled-Ctrl").checked;
		this.labelUnlabeledName = document.getElementById("fessGBE-prefs-labelUnlabeledName-Ctrl").value;

		if (oldValGBautocomplite !== this.enableGBautocomplite)
		{
			if (this.enableGBautocomplite)
			{
				this.setURLBarAutocompleteList("on");
			}
			else
			{
				this.setURLBarAutocompleteList("off");
			}
		}
	}
	catch (e) {
		this.ErrorLog("GBE:onLoadPrefwindow", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
	return true;
};

/**
 * Enable/disable поля labelUnlabeledName в зависимости от состояния флажка enableLabelUnlabeled
 */
fGoogleBookmarksExtension.onCheckboxStateChange = function()
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
		this.ErrorLog("GBE:onCheckboxStateChange", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
	}
};

/**
 * выполняется при загрузке диалога редактирования закладок
 */
fGoogleBookmarksExtension.onLoadBookmarkDialog = function()
{
	// заполняем поля диалога редактирования
	document.getElementById("GBE-bookmark.dialog.name").value = this.windowsParams.name;
	document.getElementById("GBE-bookmark.dialog.url").value = this.windowsParams.url;
	document.getElementById("GBE-bookmark.dialog.labels").value = this.windowsParams.labels;
	document.getElementById("GBE-bookmark.dialog.notes").value = this.windowsParams.notes;
	// при редактировании поле адреса делаем только для чтения
	if (this.windowsParams.id)
	{
		document.getElementById("GBE-bookmark.dialog.url").setAttribute("readonly", "true");
	}

	var searchTextField = document.getElementById("GBE-bookmark.dialog.labels");
	// формируем список для автодополнения меток
	var labelsList = this.m_labelsArr;
	if (labelsList !== null)
	{
		paramsToSet = "{\"delimiter\" : \""+ this.nestedLabelSep + "\", \"labels\" : [";
		for (var i = 0; i < labelsList.length; i++) {
			paramsToSet += "{\"value\" : \"" + labelsList[i] + "\"},";
		};
		paramsToSet = paramsToSet.substring(0, paramsToSet.length-1); // to remove the last ","
		paramsToSet += "]}";
		searchTextField.setAttribute("autocompletesearchparam", paramsToSet);
	}
};

/**
 * клик по кнопке сохранить в диалоге редактирования закладки
 */
fGoogleBookmarksExtension.onAcceptBookmarkDialog = function()
{
	this.windowsParams.name = document.getElementById("GBE-bookmark.dialog.name").value;
	this.windowsParams.url = document.getElementById("GBE-bookmark.dialog.url").value;
	this.windowsParams.labels = document.getElementById("GBE-bookmark.dialog.labels").value;
	this.windowsParams.notes = document.getElementById("GBE-bookmark.dialog.notes").value;
	if (this.windowsParams.name == "") {
		document.getElementById("GBE-bookmark.dialog.name").focus();
		return false;
	}
	if (this.windowsParams.url == "") {
		document.getElementById("GBE-bookmark.dialog.url").focus();
		return false;
	}
	this.doChangeBookmarkJQuery(this.windowsParams);
};


/**
 * завершение поиска при автокомплите меток
 */
fGoogleBookmarksExtension.onSearchCompliteAutocomplite = function (e)
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
};

/**
 * при выборе значения из списка автокомплита
 */
fGoogleBookmarksExtension.onTextEnteredAutocomplite = function (e)
{
	// если предыдущее значение поиска не пустое
	if (this.oldSearchValue.length)
	{
		// объединяем старое значение и значение из списка
		e.value = this.oldSearchValue + ', ' + (e.value);
		this.oldSearchValue = "";
	}
};

	/**
 * при открытии диалога удаления закладки
 */
fGoogleBookmarksExtension.onLoadDeleteDialog = function()
{
	if (this.windowsParams.id !== null ) 
	{
		// выводим название удаляемой закладки
		document.getElementById("GBE-delete.dialog.title").value = this.windowsParams.name + "?";
	}
};	

/**
 * клик по кнопке удалить в диалоге удаления закладки
 */
fGoogleBookmarksExtension.onAcceptDeleteDlg = function()
{
	if (this.windowsParams.id !== null ) 
	{
		this.doDeleteBookmarkJQuery(this.windowsParams);
	}
};

/**
 * при открытии диалога редактирования метки
 */
fGoogleBookmarksExtension.onLoadFolderkDialog = function()
{
	// Заполняем поле с названием метки
	document.getElementById("GBE-folder.dialog.name").value = this.windowsParams.name;
};

/**
 * подтверждение изменения метки
 */
fGoogleBookmarksExtension.onAcceptFolderDialog = function()
{
	var oldName = this.windowsParams.name;
	var name = document.getElementById("GBE-folder.dialog.name").value.trim();
	var nested_labels = name.split(this.nestedLabelSep);
	if (name == "")					
	{
		document.getElementById("GBE-folder.dialog.name").focus();
		return false;
	}

	if (name == oldName)
	{
		return true;
	}

	if (name && this.m_bookmarkList && this.m_bookmarkList.length)
	{
		var old_nested_labels = oldName.split(this.nestedLabelSep);
	if (old_nested_labels.length == 1)
		{
			this.doChangeFolderJQuery(oldName, name, this.m_signature);
		}
		else
		{
		var labelsList = this.m_labelsArr;
		for (var i = 0; i < labelsList.length; i++) {
			if (labelsList[i].indexOf(oldName) == 0)
			{
				this.doChangeFolderJQuery(labelsList[i], labelsList[i].replace(oldName, name), this.m_signature);
			}
		};
		}
	}
};

/**
 * при открытии диалога удаления метки
 */
fGoogleBookmarksExtension.onLoadFolderDeleteDialog = function()
{
	document.getElementById("GBE-folderDelete.dialog.title").value = this.windowsParams.name + "?";
};

/**
 * подтверждение удаления метки
 */
fGoogleBookmarksExtension.onAcceptFolderDeleteDlg = function()
{
	var name = this.windowsParams.name;
	// флаг удаления вложенных закладок
	var deleteChildren = document.getElementById("GBE-folderDelete.dialog.deleteChildren").checked;
	if (name && this.m_bookmarkList && this.m_bookmarkList.length)
	{
		if (!deleteChildren)
		{
			this.doDeleteFolderJQuery(name, this.m_signature);
		}
		else
		{
			for (var i = 0, m_bookmarkListLength = this.m_bookmarkList.length; i < m_bookmarkListLength; i++)
			{
				var labelPos = -1;
				var newLabels = this.m_bookmarkList[i][3];
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
						id : this.m_bookmarkList[i][2],
						sig : this.m_signature
					};
					this.doDeleteBookmarkJQuery(params);
				}
			}
		}
	}
};