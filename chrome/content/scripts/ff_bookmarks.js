Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");

Components.utils.import('chrome://GBE/content/scripts/module.js');


var fessGoogleBookmarksFFbookmarks = {

	"_M" : fGoogleBookmarksModule,
	"overlay" : null,

	/**
	 * обработчик onload окна импорта/экспорта
	 */
	ff_bookmarks_onLoad : function()
	{
		let menuPopup = document.getElementById("GBE-ffBookmark.GBmenulist");
		menuPopup.removeAllItems();
		menuPopup.appendItem(document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.ImportRoot"), "_GBE-root_", "");
		
		let labelsList = this._M.m_labelsArr;
		// заполняем список гугл меток
		if (labelsList !== null)
		{
			if (window !== null && window.arguments !== undefined && window.arguments[0] !== undefined ) 
			{
				this.overlay = window.arguments[0];//.wrappedJSObject;
			}

			for (let i = 0; i < labelsList.length; i++) 
			{
				menuPopup.appendItem(labelsList[i],labelsList[i],"");
			}
		}
		menuPopup.selectedIndex = 0;
	},

	ff_bookmarks_onSelectTreeItem : function(event)
	{
		var tree = document.getElementById("GBE-ffBookmark.Tree");
		this.selectedFFbookmarkFolderId = -1;
		if (tree.currentIndex !== -1)
		{
		  var selection = tree.view.selection;
		  var cellText = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(0));
		  var historyResultNode = tree.view.nodeForTreeIndex(tree.currentIndex);
		  this.selectedFFbookmarkFolderId = historyResultNode.itemId;
		}
	},

	FileManager : {
		Write:
	    function (File, Text)
	    {
        if (!File) return;
        const unicodeConverter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
            .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

        unicodeConverter.charset = "UTF-8";

        Text = unicodeConverter.ConvertFromUnicode(Text);
        const os = Components.classes["@mozilla.org/network/file-output-stream;1"]
          .createInstance(Components.interfaces.nsIFileOutputStream);
        os.init(File, 0x02 | 0x08 | 0x20, 0700, 0);
        os.write(Text, Text.length);
        os.close();
	    },

		Read:
	    function (File)
	    {
        if (!File) return;
        let res;

        const is = Components.classes["@mozilla.org/network/file-input-stream;1"]
            .createInstance(Components.interfaces.nsIFileInputStream);
        const sis = Components.classes["@mozilla.org/scriptableinputstream;1"]
            .createInstance(Components.interfaces.nsIScriptableInputStream);
        is.init(File, 0x01, 0400, null);
        sis.init(is);

        res = sis.read(sis.available());

        let utf8Converter = Components.classes["@mozilla.org/intl/utf8converterservice;1"].
            getService(Components.interfaces.nsIUTF8ConverterService);
        let data = utf8Converter.convertURISpecToUTF8 (res, "UTF-8"); 

        is.close();

        return data;
	    },
	},

	parseJsonFile : function(jsonString)
	{
		// jQuery.noConflict();
		// let arr = jQuery.parseJSON(jsonString);
		try 
		{
			let arr = JSON.parse(jsonString);
			if (arr !== null && arr.bookmarks.length && arr.labels.length )
			{
				this._M.m_bookmarkList = arr.bookmarks;
				this._M.m_labelsArr = arr.labels;
				this._M.m_recent10bkmrk = arr.recent10bkmrk
				return this.overlay.refreshBookmarks(false,true);
			}
			return false;
		} catch (e) 
		{
			this._M.ErrorLog("Parsing error:", e);
			return false;
		}
	},

	// сохранение this.m_bookmarkList и this.m_labelsArr в файл в json формате
	ff_bookmarks_save : function()
	{
		let nsIFilePicker = Ci.nsIFilePicker;
		let fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.init(window, document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.SaveFileDialog.Title"), nsIFilePicker.modeSave);
		fp.defaultExtension = "json";
		fp.appendFilter("json","*.json");
		let res = fp.show();

		if (res != nsIFilePicker.returnCancel)
		{
		  let jsonString = JSON.stringify({
		  	bookmarks : this._M.m_bookmarkList, 
		  	labels : this._M.m_labelsArr, 
		  	recent10bkmrk : this._M.m_recent10bkmrk
		  });
		  let fileName = fp.fileURL.spec + ".json";
			var x = this.FileManager.Write(fp.file, jsonString);
		}
	},

	// загрузка закладок из файла
	ff_bookmarks_load : function()
	{
		if (window !== null && window.arguments !== undefined && window.arguments[0] !== undefined ) 
		{
			this.overlay = window.arguments[0];
		}
		let nsIFilePicker = Ci.nsIFilePicker;
		let fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.init(window, document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.LoadFileDialog.Title"), nsIFilePicker.modeOpen);
		fp.appendFilter("json","*.json");
		let res = fp.show();

		if (res != nsIFilePicker.returnCancel)
		{
			let x = this.FileManager.Read(fp.file);
			let parseFlag = this.parseJsonFile(x);
			var txtLog = document.getElementById("GBE-ffBookmark.textbox.log");
			if (parseFlag)
			{
				txtLog.value = "Bookmarks loaded to addon menu.";
				let prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
				if (!prompts.confirm(window, 
					document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.LoadConfirmDialog.Title"),
					document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.LoadConfirmDialog.Text")
				))
				{
				  txtLog.value = "Saving to Google Bookmarks canceled!!!"
				  return;
				}
				else
				{
					if ((this._M.m_bookmarkList !== null) && (this._M.m_bookmarkList.length))
					{
						let m_bookmarkListLength = this._M.m_bookmarkList.length;
						// перебираем закладки
						for (let i = 0 ; i < m_bookmarkListLength; i++)
						{
							let params = {
									name : (this._M.m_bookmarkList[i].title || uri),
									id : this._M.m_bookmarkList[i].id,
									url : this._M.m_bookmarkList[i].url,
									labels : (this._M.m_bookmarkList[i].labels.length > 0 ? this._M.m_bookmarkList[i].labels.join(",") : ""),
									notes : this._M.m_bookmarkList[i].notes,
									sig : this._M.m_signature
								};
							if (params.uri == "")
							{
								txtLog.value +=	"\nError: " + params.name + ", " + params.url + ", [" + params.labels + "], " + params.notes + "\n\n";
							}
							txtLog.value +=	"Import bookmark: " + params.name + ", " + params.url + ", [" + params.labels + "], " + params.notes + "\n";
							this._M.doChangeBookmarkJQuery(params);
						}
						this._M.needRefresh = true;
						this.overlay.needRefresh = true;
					}
				}
			}
			else
			{
				txtLog.value = "Parse bookmarks file - error!!!"
			}
		}
	},

	/**
	 * Импорт ФФ закладок в гугл закладки
	 */
	ff_bookmarks_import : function()
	{
		if (this.selectedFFbookmarkFolderId !== -1)
		{
			let prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
			if (!prompts.confirm(window, 
				document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.ConfirmImport.Title"), 
				document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.ConfirmImport.Text"))) 
			{
			  return;
			}

			var historyService = Cc["@mozilla.org/browser/nav-history-service;1"].getService(Ci.nsINavHistoryService);
			var annotationService = Cc["@mozilla.org/browser/annotation-service;1"].getService(Ci.nsIAnnotationService);
			var taggingSvc = Cc["@mozilla.org/browser/tagging-service;1"].getService(Ci.nsITaggingService);		                          
			var annotationName = "bookmarkProperties/description";
			var self = this;
			var labels = [];
			var bookmarks = [];

			var txtLog = document.getElementById("GBE-ffBookmark.textbox.log");
			txtLog.value = "";

			//корневая метка для импортуруемых закладок
			var gbRootLabel = document.getElementById("GBE-ffBookmark.GBmenulist").value;
			var flagAddLabel = true;
			if (gbRootLabel == "_GBE-root_")
			{
				flagAddLabel = false;
			}
			var flagImportTags = document.getElementById("GBE-ffBookmark.ImportTags").checked;

			var flagImportAddFolder = document.getElementById("GBE-ffBookmark.ImportAddFolder").checked;

			// заполняем параметры импортируемой закладки
			var process_bookmark = function(node)
			{
				try
				{
					let arr = (flagImportAddFolder ? labels.slice(0) : labels.slice(1));
					if (flagAddLabel) 
					{
						arr.unshift(gbRootLabel);
					}
					let uri = NetUtil.newURI(node.uri);
					let description = "";
					if (annotationService.itemHasAnnotation(node.itemId, annotationName))
					{
						description = annotationService.getItemAnnotation(node.itemId, annotationName);
					}
					let tags = taggingSvc.getTagsForURI(uri);
					if (bookmarks[node.uri] == undefined)
					{
						bookmarks[node.uri] = {
							"title" : node.title,
							"description": description
						};
					}
					if (bookmarks[node.uri].labels == undefined)
					{
						if (flagImportTags)
						{
							bookmarks[node.uri].labels = tags;
						}
						else
						{
							bookmarks[node.uri].labels = [];
						}
					}
					bookmarks[node.uri].labels.push(arr.join(self._M.nestedLabelSep));
				}
				catch(e)
				{
					self._M.ErrorLog("bookmark:", node.title, node.itemId, node.uri, tags);
					self._M.ErrorLog("labels:", arr.join(self._M.nestedLabelSep));
					self._M.ErrorLog("GBE:ff_bookmarks_import:process_bookmark", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
				}
			};

			var query_bookmarks = function(itemId)
			{
				try
				{
					let options = historyService.getNewQueryOptions();
					let query = historyService.getNewQuery();
					query.onlyBookmarked = true;
					query.setFolders([itemId], 1);
					let result = historyService.executeQuery(query, options);
					let rootNode = result.root;
					rootNode.containerOpen = true;
					labels.push(rootNode.title);
					for (let i = 0; i < rootNode.childCount; i ++) {
					  let node = rootNode.getChild(i);
					  if (node.type == 6)
					  {
					  	query_bookmarks(node.itemId);
					  }
					  if (node.type == 0) 
					  {
					  	process_bookmark(node);
					  }
					}
					rootNode.containerOpen = false;
					labels.pop();
				}
				catch(e)
				{
					self._M.ErrorLog("folder:", rootNode.title);
					self._M.ErrorLog("GBE:ff_bookmarks_import:query_bookmarks", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
				}
			};

			query_bookmarks(this.selectedFFbookmarkFolderId);

			for(var uri in bookmarks)
			{
				var params = {
						name : (bookmarks[uri].title || uri),
						id : null,
						url : uri,
						labels : (bookmarks[uri].labels.length > 0 ? bookmarks[uri].labels.join(",") : ""),
						notes : bookmarks[uri].description,
						sig : this._M.m_signature
					};
				if (params.uri == "")
				{
					txtLog.value +=	"\nError: " + params.name + ", " + params.url + ", [" + params.labels + "], " + params.notes + "\n\n";
				}
				txtLog.value +=	"Import bookmark: " + params.name + ", " + params.url + ", [" + params.labels + "], " + params.notes + "\n";
				this._M.doChangeBookmarkJQuery(params);
			}
			this._M.needRefresh = true;
			this.overlay.needRefresh = true;
			bookmarks = [];

		}
		else
		{
			alert("Select FF bookmark folder as import source!");
		}
	},

	/*
	Экспорт гугл закладок в закладки огнелиса
	 */
	ff_bookmarks_export : function()
	{
		if (this.selectedFFbookmarkFolderId !== -1)
		{
			let prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
			if (!prompts.confirm(window, 
				document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.ConfirmExport.Title"), 
				document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.ConfirmExport.Text"))) 
			{
			  return;
			}


		 	var bmsvc = Cc["@mozilla.org/browser/nav-bookmarks-service;1"].getService(Ci.nsINavBookmarksService);
			var annotationService = Cc["@mozilla.org/browser/annotation-service;1"].getService(Ci.nsIAnnotationService);
			var annotationName = "bookmarkProperties/description";	    

			var historyService = Cc["@mozilla.org/browser/nav-history-service;1"].getService(Ci.nsINavHistoryService);                  	

			var GBE_GBlist = this.overlay.GBE_menupopup;

			var txtLog = document.getElementById("GBE-ffBookmark.textbox.log");
			txtLog.value = "";

			var children = GBE_GBlist.children;
			var ch_length = children.length;
			
			if (!this._M.useMenuBar)
			{
				var GBE_GBlist_separator = "GBE-tb-";
			}
			else
			{
				var GBE_GBlist_separator = "GBE-mb-";
			}

			var self = this;

			/*
			поиск в папке с folderId подпапки с заголовком равным subFolderTitle (в ФФ закладках)
			 */
			var check_subfolder = function(folderId, subFolderTitle)
			{
				var options = historyService.getNewQueryOptions();
				var query = historyService.getNewQuery();
				query.onlyBookmarked = true;
				query.setFolders([folderId], 1);
				var queryResult = historyService.executeQuery(query, options);
				var rootNode = queryResult.root;
				rootNode.containerOpen = true;
				var result = 0;
				for (var i = 0; i < rootNode.childCount; i ++) {
				  var node = rootNode.getChild(i);
				  if (node.type == 6)
				  {
				  	if (node.title == subFolderTitle)
				  	{
				  		result = node.itemId;
				  		break;
				  	}
				  }
				}
				rootNode.containerOpen = false;
				return result;
			};

			/*
			создание/обновление ФФ закладки
			 */
			var ff_create_bookmark = function (parentNodeId, node)
			{
				let params = {name : "", id : node.getAttribute("id"),	url : "", labels : "", notes : "", sig : self._M.m_signature};
				self._M.getBookmark(params);
				if (params.url == "")
				{
					txtLog.value +=	"***Warning: bookmark " + params.name + " has empty (or local) URL!!!\n";
					txtLog.value +=	"***Warning: Trying obtain its value!!!\n";
					let url = self._M.doRequestBookmarkURL(params.id, params.name, params.index);
					if (url !== "")
					{
						params.url = url;
						txtLog.value +=	"***Warning: Obtained URL is " + url + "\n";
					}
					else
					{	
						txtLog.value +=	"\n!!!Error: bookmark " + params.name + 
														" with URL (" + params.url + ") can't be added!!!\n\n";
						return;
					}
				}
				var uri = NetUtil.newURI(params.url);
				if (!historyService.canAddURI(uri))
				{
					txtLog.value +=	"\n!!!Error: bookmark " + params.name + 
													" with URL (" + params.url + ") can't be added!!!\n\n";
				}
				else
				{
					var idsCoutn = 0;
					// ищем закладки с данным uri
					var list = bmsvc.getBookmarkIdsForURI(uri);
					var newBkmkId = 0;
					for (var i = 0; i < list.length; i++)
					{
						// если закладка с таким uri уже есть в папке с parentNodeId, то обновляем ее,
						if (bmsvc.getFolderIdForItem(list[i]) == parentNodeId)
						{
							newBkmkId = list[i];
							txtLog.value += "Update bookmark: ";
							break;
						}
					}
					// иначе - создаем новую закладку
					if (newBkmkId == 0)
					{
						newBkmkId = bmsvc.insertBookmark(parentNodeId, uri, bmsvc.DEFAULT_INDEX, "");
						txtLog.value += "Create bookmark: ";
					}
					bmsvc.setItemTitle(newBkmkId, params.name);
					annotationService.setItemAnnotation(newBkmkId, annotationName, params.notes, 0, Ci.nsIAnnotationService.EXPIRE_NEVER);
					txtLog.value += "title - " + params.name + "; url - " + params.url  + "\n";
				}
			};

			/*
			создание папки в ФФ закладках 
			 */
			var ff_create_folder = function(parentNodeId, node, isCreate = true)
			{
				var newFolderId;
				if (isCreate)
				{
					let subFolderTitle = node.getAttribute("label");
					newFolderId = check_subfolder(parentNodeId, subFolderTitle);
					// если такой папки еще нет - создаем, иначе - используем существующую
					if (newFolderId == 0)
					{
						newFolderId = bmsvc.createFolder(parentNodeId, subFolderTitle, bmsvc.DEFAULT_INDEX);
						txtLog.value += "Create new folder: " + subFolderTitle + "\n";
					}
					else
					{
						txtLog.value += "Use existing folder: " + subFolderTitle + "\n";
					}
				}
				else
				{
					newFolderId = parentNodeId;
					txtLog.value += "Use existing folder: " + bmsvc.getItemTitle(parentNodeId) + "\n";
				}
				var menuPopup = node.firstChild;
				var children = menuPopup.children;
				var ch_length = children.length;
				for (var i = 0; i < ch_length; i++)
				{
					if (children[i].nodeName == "menuitem")
					{
						ff_create_bookmark(newFolderId, children[i]);
					}
					if (children[i].nodeName == "menu")
					{
						ff_create_folder(newFolderId, children[i]);
					}
				}
			};		

			if (document.getElementById("GBE-ffBookmark.GBmenulist").value == "_GBE-root_")
			{
				// выбран экспорт всех гугл закладок
				for (var i = 0; i < ch_length; i++)
				{
					let nodeId = children[i].getAttribute("id");
					if (nodeId == GBE_GBlist_separator+"GBlist-EndSeparator" || nodeId == "GBE-searchResultList")
					{
						break;
					}
					if (children[i].nodeName == "menuitem")
					{
						ff_create_bookmark(this.selectedFFbookmarkFolderId, children[i]);
					}
					if (children[i].nodeName == "menu")
					{
						// для закладок без метки папку не создаем
						if (self._M.enableLabelUnlabeled && children[i].getAttribute("label") == self._M.labelUnlabeledName)
						{
							ff_create_folder(this.selectedFFbookmarkFolderId, children[i], false);
						}
						else
						{
							ff_create_folder(this.selectedFFbookmarkFolderId, children[i]);
						}
					}
					
				}
			}
			else
			{
				// выбрана метка для экспорта
				var exportLabel = GBE_GBlist.getElementsByAttribute("id", "GBE_" + document.getElementById("GBE-ffBookmark.GBmenulist").value)[0];
				ff_create_folder(this.selectedFFbookmarkFolderId, exportLabel);
			}
		}
		else
		{
			alert("Select FF bookmark folder as export target!");
		}
	}

}