Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");

Components.utils.import('chrome://GBE/content/scripts/module.js');

fGoogleBookmarksExtension.ff_bookmarks_onLoad = function()
{
	var labelsList = this.m_labelsArr;
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
		var process_bookmark = function(node)
		{
			//TODO: как добавлять заметки?
			var arr = labels.slice(1);
			//var arr = labels.slice();
			var uri = NetUtil.newURI(node.uri);
			var description = "";
			if (annotationService.itemHasAnnotation(node.itemId, annotationName))
			{
				description = annotationService.getItemAnnotation(node.itemId, annotationName);
			}
			var tags = taggingSvc.getTagsForURI(uri);


			bookmarks[node.uri] = {
				"title" : node.title,
				"description": description
			};
			if (bookmarks[node.uri].labels == undefined)
			{
				bookmarks[node.uri].labels = tags;
			}
			bookmarks[node.uri].labels.push(arr.join(self.nestedLabelSep));
			//self.ErrorLog(arr.join(self.nestedLabelSep));
			//self.ErrorLog("bookmark", node.title, node.itemId, node.uri, tags);
		};

		var query_bookmarks = function(itemId)
		{
			var options = historyService.getNewQueryOptions();
			var query = historyService.getNewQuery();
			query.onlyBookmarked = true;
			query.setFolders([itemId], 1);
			var result = historyService.executeQuery(query, options);
			var rootNode = result.root;
			rootNode.containerOpen = true;
			labels.push(rootNode.title);

			// iterate over the immediate children of this folder and dump to console
			for (var i = 0; i < rootNode.childCount; i ++) {
			  var node = rootNode.getChild(i);
			  if (node.type == 6)
			  {
			  	// self.ErrorLog("folder", node.title, node.itemId);
			  	query_bookmarks(node.itemId);
			  }
			  if (node.type == 0) 
			  {
			  	process_bookmark(node);
			  }
			  // this.ErrorLog("Child: ", node.title, node.itemId, node.type);
			}

			// close a container after using it!
			rootNode.containerOpen = false;
			labels.pop();

		};

		query_bookmarks(this.selectedFFbookmarkFolderId);

		for(var uri in bookmarks)
		{
			//this.ErrorLog(uri, "|", bookmarks[uri].title, "|", bookmarks[uri].labels);
			var params = {
					name : (bookmarks[uri].title || uri),
					id : null,
					url : uri,
					labels : (bookmarks[uri].labels.length > 0 ? bookmarks[uri].labels.join(",") : ""),
					notes : bookmarks[uri].description,
					sig : this.m_signature
				};


			this.doChangeBookmarkJQuery(params);
		}

		bookmarks = [];

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
	  // this.ErrorLog("cellText:", cellText, tree.currentIndex);
	  var historyResultNode = tree.view.nodeForTreeIndex(tree.currentIndex);
	  // this.ErrorLog("type:", historyResultNode.type);
	  // this.ErrorLog("uri:", historyResultNode.uri);
	  // this.ErrorLog("parentResult:", historyResultNode.parentResult);
	  // this.ErrorLog("title:", historyResultNode.title);
	  // this.ErrorLog("parent:", historyResultNode.parent);
	  // this.ErrorLog("itemId:", historyResultNode.itemId);
	  // this.ErrorLog("indentLevel:", historyResultNode.indentLevel);
	  this.selectedFFbookmarkFolderId = historyResultNode.itemId;
	}
};

fGoogleBookmarksExtension.ff_bookmarks_export = function()
{
	if (this.selectedFFbookmarkFolderId !== -1)
	{
	 	var bmsvc = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
	                      	.getService(Components.interfaces.nsINavBookmarksService);

		var GBE_GBlist = this.GBE_menupopup;

		var pm_max = GBE_GBlist.getElementsByClassName("menuitem-iconic google-bookmarks").length + 
			GBE_GBlist.getElementsByClassName("menu-iconic google-bookmarks").length;

		var PMeter = document.getElementById("GBE-ffBookmark-progressmeter");
		PMeter.value = 0;
		PMeter.setAttribute("hidden", false);
		// this.ErrorLog(GBE_GBlist);
		// 
		// var children = GBE_GBlist.childNodes;
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
		var countImport = 0;

		var setProgress = function(value)
		{
			PMeter.value = parseInt(value*100/pm_max);
		};

		var ff_create_bookmark = function (bmsvc, parentNodeId, node)
		{
			//TODO: как добавлять заметки? отдельно закладки без метки!!!!
			var uri = NetUtil.newURI(node.getAttribute("url"));
			var newBkmkId = bmsvc.insertBookmark(parentNodeId, uri, bmsvc.DEFAULT_INDEX, "");
			bmsvc.setItemTitle(newBkmkId, node.getAttribute("label"));
			setProgress(++countImport);
		};

		var ff_create_folder = function(bmsvc, parentNodeId, node)
		{
			var newFolderId = bmsvc.createFolder(parentNodeId, node.getAttribute("label"), bmsvc.DEFAULT_INDEX);
			setProgress(++countImport);
			var menuPopup = node.firstChild;
			var children = menuPopup.children;
			var ch_length = children.length;
			for (var i = 0; i < ch_length; i++)
			{
				if (children[i].nodeName == "menuitem")
				{
					ff_create_bookmark(bmsvc, newFolderId, children[i]);
				}
				if (children[i].nodeName == "menu")
				{
					ff_create_folder(bmsvc, newFolderId, children[i]);
				}
			}
		};		

		var start_flag = false;
		for (var i = 0; i < ch_length; i++)
		{
			let nodeId = children[i].getAttribute("id");
			while(!start_flag && nodeId != GBE_GBlist_separator+"GBlist-StartSeparator")
			{
				nodeId = children[i++].getAttribute("id");
			}
			start_flag = true;
			if (nodeId == GBE_GBlist_separator+"GBlist-StartSeparator")
			{
				i--;
				continue;
			}
			if (	nodeId == GBE_GBlist_separator+"GBlist-EndSeparator" || nodeId == "GBE-searchResultList")
			{
				break;
			}
			if (children[i].nodeName == "menuitem")
			{
				ff_create_bookmark(bmsvc, this.selectedFFbookmarkFolderId, children[i]);
			}
			if (children[i].nodeName == "menu")
			{
				ff_create_folder(bmsvc, this.selectedFFbookmarkFolderId, children[i]);
			}
			
		}
		PMeter.value = 0;
		PMeter.setAttribute("hidden", true);
	}
};
