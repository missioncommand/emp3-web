# URL Proxy Instructions

In some cases, the map may not be able to communicate to WMS, WMTS, TMS, WCS, or KML services if the service resides on a domain outside of the hosted web application.  This is due to cross-domain browser restrictions.  This problem is typically fixed by hosting your own proxy service, or by the service provider allowing cross-domain access.  

For your convenience, we've included our own proxy in cases where neither of the options are available to you.  To use this proxy, you will need to configure few things.

Our proxy can be found at the root of the emp3-map.zip distribution and is a file called "urlProxy.jsp."  To use the URL Proxy, first host it on a JSP compatible web server such as Tomcat.  We recommend placing this file at the root of your project.  After you have included emp3.min.js, set the emp3.api.global.configuration.urlProxy to the address of the urlProxy.jsp.  

    emp3.api.global.configuration.urlProxy = '/urlProxy.jsp';

If you put the proxy at the root of your project it will be "/urlProxy.jsp".  This tells the map where to find the proxy if it needs it.  It will not use the proxy until it is requested.  

To tell the map to use the proxy for a service, create a new emp3.api.WMS, emp3.api.KMLLayer, emp3.api.WMTS, or any other MapService object and set the useProxy argument to 'true'.  This is an example for a WMS map service:

    var service = new emp3.api.WMS({
	    name: myName,
	    geoId: myId,
	    url: myURL,
	    layer: myLayer,
	    useProxy: true
    });

This will use the proxy set in emp3.api.global.configuration.urlProxy when communicating to this service only.  Repeat this step whenever creating a service requiring a proxy.
