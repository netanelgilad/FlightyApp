// ------------ Helper Function -------

function _loadNeWMIScript(p_src, p_funcCallback, scope){
	var head = document.getElementsByTagName('head')[0];
	var NewScript = document.createElement("script");
    NewScript.type = "text/javascript";
    NewScript.src = p_src;
    NewScript.onload = (p_funcCallback) ?
    		function(){ p_funcCallback.call(scope); } :
			null;
    //document.head.appendChild(NewScript);
	head.appendChild(NewScript);
}

function _loadNeWMIScripts(p_srcs, p_funcCallback, scope)
{
	function onReadyScript()
	{		
		if (p_srcs.length == 0)
		{
			if (p_funcCallback)	{p_funcCallback.call(scope);}
		}
		else
		{
		    _loadNeWMIScript(p_srcs.shift(), onReadyScript, this);
		}
	}
	
	_loadNeWMIScript(p_srcs.shift(), onReadyScript, this);
}

function _loadNeWMIStyle(p_src){
	var head = document.getElementsByTagName('head')[0];
	var NewStyles = document.createElement("link");
    NewStyles.rel = "stylesheet";
    NewStyles.type = "text/css";
    NewStyles.href = p_src;
    //document.head.appendChild(NewStyles);
    head.appendChild(NewStyles);
}

//----------------- DOJO Main Loader -----------------

function _getNeWMIDojoUrl()
{
	return (newmiConfig.url +  "/3rdParty/Dojo_1.8.3/dojo/dojo/dojo.js");
}

var     NeWMI = NeWMI || {};

//-----------NewMI Defaults------------------
function _createNeWMIDefaults()
{
    
    NeWMI.defaults = {};

    NeWMI.defaults.hitTolerance = 5;
}

//-------------------------------------------


//------- newmiConfig Object ------- 
////////////////////////////
// {
// 	url: "/dev/NeWMI",
// 	engine : ["esri"],
// 	callback: onScriptLoad
// }
////////////////////////////


/////////////////////////////////////////// Import Script ///////////////////////////////////////////

//----------------- Loader -------------------

loadNeWMI(this);

var dojoConfig;

/**
* @method loadNeWMI
* 
* <p>Loading NeWMI for the first time. </p>
* <p>In order for NeWMI to be loaded we must define a global object called 'newmiConfig', which contains:
* <ul>
*   <li>url - The URL NeWMI code exists.</li>
*   <li>engine - String array that defines which mapping engines will be loaded by the NeWMI components. (esri, Google)</li>
*   <li>callback - The callback function that will be called after NeWMI Loading process completed.</li>
* </ul>
* </p>
* When 'newmiConfig' object is defined before we include 'NeWMI-(version).js' file to our HTML, then this method will be called automatically.
* In case we define this object after we include NeWMI js file, we need to call it explicitly.
* @param {Object} scope The scope of the callback function we use in newmiConfig.callback.
*/
function loadNeWMI(scope)
{
	if (typeof newmiConfig !== 'undefined')
	{
		//------------------------- Dojo Config -------------------------
		
		var newmiScriptsToLoad = [];
		
		if (!dojoConfig)
		{
			dojoConfig = 
			{ 
				parseOnLoad: true,
				async: true,
				baseUrl: newmiConfig.url,
				packages: [
			        {
			            name: 'esri',
			            location: newmiConfig.url + "/3rdParty/ArcGIS_3.6/js/esri"
			        },
			        {
						name: 'jquery', 
						location: newmiConfig.url + "/3rdParty/jQuery_1.9.1", 
						main: 'jquery-1.9.1.min'
					},
					{
						name: 'SPServices', 
						location: newmiConfig.url + "/3rdParty/SPServices_2013.01", 
						main: 'jquery.SPServices-2013.01.min'
					},
			        {
			            name: 'dojo',
			            location: newmiConfig.url + "/3rdParty/Dojo_1.8.3/dojo/dojo"
			        },
			        {
			            name: 'dojox',
			            location: newmiConfig.url + "/3rdParty/Dojo_1.8.3/dojo/dojox"
			        },
			        {
			            name: 'dijit',
			            location: newmiConfig.url + "/3rdParty/Dojo_1.8.3/dojo/dijit"
			        },
			        {
			            name: 'NeWMI',
			            location: newmiConfig.url
			        }
			    ]
			};
	
			newmiScriptsToLoad.push.apply(newmiScriptsToLoad, [newmiConfig.url +  "/Draw/WGLExtension.js",
					newmiConfig.url +  "/3rdParty/lightgl/matrix.js",
					newmiConfig.url +  "/3rdParty/lightgl/mesh.js",
					newmiConfig.url +  "/3rdParty/lightgl/raytracer.js",
					newmiConfig.url +  "/3rdParty/lightgl/shader.js",
					newmiConfig.url +  "/3rdParty/lightgl/texture.js",
					newmiConfig.url +  "/3rdParty/lightgl/vector.js",
					newmiConfig.url +  "/3rdParty/lightgl/main.js"]);
	
			//		----------------- Dijit Themes -------------------
	
			_loadNeWMIStyle(newmiConfig.url +  "/3rdParty/Dojo_1.8.3/dojo/dojo/resources/dojo.css");
			_loadNeWMIStyle(newmiConfig.url +  "/3rdParty/Dojo_1.8.3/dojo/dijit/themes/claro/claro.css");
			_loadNeWMIStyle(newmiConfig.url +  "/3rdParty/Dojo_1.8.3/dojo/dojox/grid/enhanced/resources/claro/EnhancedGrid.css");
			_loadNeWMIStyle(newmiConfig.url +  "/3rdParty/Dojo_1.8.3/dojo/dojox/grid/enhanced/resources/EnhancedGrid_rtl.css");
			_loadNeWMIStyle(newmiConfig.url +  "/3rdParty/Dojo_1.8.3/dojo/dojox/grid/enhanced/resources/DnD.css");
			_loadNeWMIStyle(newmiConfig.url +  "/3rdParty/Dojo_1.8.3/dojo/dojox/grid/enhanced/resources/DnD_rtl.css");
	
			//		----------------- NeWMI Themes -------------------
	
			_loadNeWMIStyle(newmiConfig.url +  "/Resources/Style/NeWMI.css");
	
			//		----------------- NeWMI Engine -------------------
		}
		
		for (var intCurrEngineIdx = 0; intCurrEngineIdx < newmiConfig.engine.length; ++intCurrEngineIdx)
		{
			var strCurrEngine = newmiConfig.engine[intCurrEngineIdx].toLocaleLowerCase();

			if (strCurrEngine == "esri")
			{
				if (!dojoConfig.blnIsDojoIncluded)
				{
					dojoConfig.blnIsDojoIncluded = true;
				}
				
				_loadNeWMIStyle(newmiConfig.url +  "/3rdParty/ArcGIS_3.6/js/esri/css/esri.css");
				newmiScriptsToLoad.push(newmiConfig.url + "/3rdParty/ArcGIS_3.6/init.js");
			}
			else if (strCurrEngine == "google")
			{
				//newmiScriptsToLoad.push("https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false");
				if (!dojoConfig.blnIsDojoIncluded)
				{
					newmiScriptsToLoad.push(_getNeWMIDojoUrl());
					dojoConfig.blnIsDojoIncluded = true;
				}
				//newmiScriptsToLoad.push("https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false");
				newmiScriptsToLoad.push(newmiConfig.url + "/3rdParty/ArcGIS_Google_Map/arcgislink.js");
			}

			else
			{
				if (!dojoConfig.blnIsDojoIncluded)
				{
					newmiScriptsToLoad.push(_getNeWMIDojoUrl());
					dojoConfig.blnIsDojoIncluded = true;
				}
			}
		}

		if (newmiConfig.engine.length == 0)
		{
			if (!dojoConfig.blnIsDojoIncluded)
			{
				newmiScriptsToLoad.push(_getNeWMIDojoUrl());
				dojoConfig.blnIsDojoIncluded = true;
			}
		}

		//newmiScriptsToLoad.push(newmiConfig.url + "/3rdParty/stacktrace/stacktrace.js");
		
        // Adding the newmi log
		_loadNeWMIScripts(newmiScriptsToLoad, newmiConfig.callback, scope);
	}

	_createNeWMIDefaults();
}

/**
* @method loadNeWMIModules
* 
* <p>For further customizing your application with additional built-in or customized dojo modules,  
* NeWMI provides this method, which you'll after NeWMI has been loaded already.</p>
* This method is loading asynchronously the wanted modules (Each module contains set of objects NeWMI provide)
* @param {Object} p_objOptions The wanted modules to load
* @param {Function} p_objOptions.callback The callback function that will be called after loading process completed.
* @param {String[]} p_objOptions.modules The names of the modules NeWMI provides. For list of modules [click here](#!/guide/Modules_ModulesList)
* @param {String[]} p_objOptions.extras Urls to dojo files we want to load, for example our custom layer\tool...
* <pre><code>
* 
* loadNeWMIModules(
*				{
*					callback: onReady,
*					modules: ["ESRIEngine", "Layer" ]
*				});	
*
* .
* .
* .
* function onReady()
* {
*   alert("modules ESRIEngine and Layer have been loaded");
* }
* </code></pre>
*/
function loadNeWMIModules(p_objOptions)
{
	var myConfig = {
		
		callback: p_objOptions.callback || null,
		modules: p_objOptions.modules || [],
		extras:  p_objOptions.extras || []
	};
	
	var arrModulesReq = [];
	var arrAllReq = [];
	
	// Adding the dojo must request
	var arrAlwaysReq = ["dojo/domReady!", newmiConfig.url + "/Log/Log.js"];

	arrAllReq = arrAllReq.concat(arrAlwaysReq);
	
	// Adding all the request modules
	for (var intCurrModule = 0; intCurrModule < myConfig.modules.length; ++intCurrModule)
	{
		arrModulesReq.push("NeWMI/Modules/" + myConfig.modules[intCurrModule] + "Module");
		
		if (myConfig.modules[intCurrModule] == "JQuery")
		{
			define.amd.jQuery = true;
		}
	}
	
	arrAllReq = arrAllReq.concat(arrModulesReq);
	
	// Adding the custom modules requests
	if (myConfig.extras != null)
	{
		arrAllReq = arrAllReq.concat(myConfig.extras);
	}
	
	///////////////////////////////////////// End of Import Script ///////////////////////////////////////////
	
	require(arrAllReq,
		function()
			{
				if (myConfig.callback != null)
				{
					myConfig.callback.call(this);
				}
			
	});
	
	//---------------------------------------------------------------
}

if (typeof (angular) != 'undefined')
{
    newmiApp = angular.module("newmiApp", []);
}

