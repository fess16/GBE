Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");

Components.utils.import('chrome://GBE/content/scripts/module.js');

fGoogleBookmarksExtension.ff_test = function()
{
	var historyService = Components.classes["@mozilla.org/browser/nav-history-service;1"]
	                               .getService(Components.interfaces.nsINavHistoryService);
	var options = historyService.getNewQueryOptions();
	var query = historyService.getNewQuery();

	var bookmarksService = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"]
	                                 .getService(Components.interfaces.nsINavBookmarksService);
// bookmarksMenuFolder unfiledBookmarksFolder toolbarFolder
	var toolbarFolder = bookmarksService.placesRoot ;

	query.setFolders([toolbarFolder], 1);

	var result = historyService.executeQuery(query, options);
	var rootNode = result.root;
	rootNode.containerOpen = true;

	// iterate over the immediate children of this folder and dump to console
	for (var i = 0; i < rootNode.childCount; i ++) {
	  var node = rootNode.getChild(i);
	  this.ErrorLog("Child: " + node.title + "\n");
	}

	// close a container after using it!
	rootNode.containerOpen = false;

}