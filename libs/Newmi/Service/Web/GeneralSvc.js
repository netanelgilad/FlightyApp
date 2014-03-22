
define(["dojo/_base/declare", "dojox/timing"], function(declare, Timing){
	
	var GeneralSvc = declare("NeWMI.Service.Web.GeneralSvc", null, {});

	GeneralSvc.GetURLParams = function(p_strURL)
	{
		var objParams = {};
		
		if (p_strURL)
		{
			p_strURL = p_strURL.substr(p_strURL.indexOf('?'));
		}
		else
			p_strURL = document.location.search;

		p_strURL.replace(/\??(?:([^=]+)=([^&]*)&?)/g, 
				function () 
				{
					function decode(s) 
					{
						return decodeURIComponent(s.split("+").join(" "));
					}
	
				objParams[decode(arguments[1])] = decode(arguments[2]);
			});
		
		return objParams;
	};
		
	
	return GeneralSvc;
});