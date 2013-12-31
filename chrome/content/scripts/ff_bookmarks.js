Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");

Components.utils.import('chrome://GBE/content/scripts/module.js');

/**
 * обработчик onload окна импорта/экспорта
 */
fGoogleBookmarksExtension.ff_bookmarks_onLoad = function()
{
	var labelsList = this.m_labelsArr;
	// заполняем список гугл меток
	if (labelsList !== null)
	{
		var menuPopup = document.getElementById("GBE-ffBookmark.GBmenulist");
		menuPopup.removeAllItems();
		menuPopup.appendItem(document.getElementById("fGoogleBookmarksExtension.strings").getString("fessGBE.ImportRoot"), "_GBE-root_", "");
		for (var i = 0; i < labelsList.length; i++) 
		{
			menuPopup.appendItem(labelsList[i],labelsList[i],"");
		}
		menuPopup.selectedIndex = 0;
	}
};

/**
 * Импорт ФФ закладок в гугл закладки
 */
fGoogleBookmarksExtension.ff_bookmarks_import = function()
{
	if (this.selectedFFbookmarkFolderId !== -1)
	{
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

		// заполняем параметры импортируемой закладки
		var process_bookmark = function(node)
		{
			try
			{
				var arr = labels.slice(1);
				if (flagAddLabel) 
				{
					arr.unshift(gbRootLabel);
				}
				var uri = NetUtil.newURI(node.uri);
				var description = "";
				if (annotationService.itemHasAnnotation(node.itemId, annotationName))
				{
					description = annotationService.getItemAnnotation(node.itemId, annotationName);
				}
				var tags = taggingSvc.getTagsForURI(uri);
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
				bookmarks[node.uri].labels.push(arr.join(self.nestedLabelSep));
			}
			catch(e)
			{
				self.ErrorLog("bookmark:", node.title, node.itemId, node.uri, tags);
				self.ErrorLog("labels:", arr.join(self.nestedLabelSep));
				self.ErrorLog("GBE:ff_bookmarks_import:process_bookmark", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
			}
		};

		var query_bookmarks = function(itemId)
		{
			try
			{
				var options = historyService.getNewQueryOptions();
				var query = historyService.getNewQuery();
				query.onlyBookmarked = true;
				query.setFolders([itemId], 1);
				var result = historyService.executeQuery(query, options);
				var rootNode = result.root;
				rootNode.containerOpen = true;
				labels.push(rootNode.title);

				for (var i = 0; i < rootNode.childCount; i ++) {
				  var node = rootNode.getChild(i);
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
				self.ErrorLog("folder:", rootNode.title);
				self.ErrorLog("GBE:ff_bookmarks_import:query_bookmarks", " " + e + '(line = ' + e.lineNumber + ", col = " + e.columnNumber + ", file = " +  e.fileName);
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
					sig : this.m_signature
				};
			if (params.uri == "")
			{
				txtLog.value +=	"\nError: " + params.name + ", " + params.url + ", [" + params.labels + "], " + params.notes + "\n\n";
			}
			txtLog.value +=	"Import bookmark: " + params.name + ", " + params.url + ", [" + params.labels + "], " + params.notes + "\n";
			this.doChangeBookmarkJQuery(params);
		}

		bookmarks = [];

	}
	else
	{
		alert("Select FF bookmark folder as import source!");
	}
};

fGoogleBookmarksExtension.ff_bookmarks_onSelectTreeItem = function(event)
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
};

/*
Экспорт гугл закладок в закладки огнелиса
 */
fGoogleBookmarksExtension.ff_bookmarks_export = function()
{
	if (this.selectedFFbookmarkFolderId !== -1)
	{
	 	var bmsvc = Cc["@mozilla.org/browser/nav-bookmarks-service;1"].getService(Ci.nsINavBookmarksService);
		var annotationService = Cc["@mozilla.org/browser/annotation-service;1"].getService(Ci.nsIAnnotationService);
		var annotationName = "bookmarkProperties/description";	    

		var historyService = Cc["@mozilla.org/browser/nav-history-service;1"].getService(Ci.nsINavHistoryService);                  	

		var GBE_GBlist = this.GBE_menupopup;

		var txtLog = document.getElementById("GBE-ffBookmark.textbox.log");
		txtLog.value = "";

		var children = GBE_GBlist.children;
		var ch_length = children.length;
		
		if (!this.useMenuBar)
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
			if (node.getAttribute("url") == "")
			{
				txtLog.value +=	"\n!!!Error: bookmark " + node.getAttribute("label") + 
												" with URL (" + node.getAttribute("url") + ") can't be added!!!\n\n";
				return;
			}
			var uri = NetUtil.newURI(node.getAttribute("url"));
			if (!historyService.canAddURI(uri))
			{
				txtLog.value +=	"\n!!!Error: bookmark " + node.getAttribute("label") + 
												" with URL (" + node.getAttribute("url") + ") can't be added!!!\n\n";
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
				bmsvc.setItemTitle(newBkmkId, node.getAttribute("label"));
				var params = {name : "", id : node.getAttribute("id").replace("GBE_",""),	url : "", labels : "", notes : "", sig : self.m_signature};
				self.getBookmark(params);
				annotationService.setItemAnnotation(newBkmkId, annotationName, params.notes, 0, Ci.nsIAnnotationService.EXPIRE_NEVER);
				txtLog.value += "title - " + node.getAttribute("label") + "; url - " + node.getAttribute("url")  + "\n";
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
					if (self.enableLabelUnlabeled && children[i].getAttribute("label") == self.labelUnlabeledName)
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
};
