<%@page import="java.util.Map"%>
<%@page import="java.util.List"%>
<%@page import="java.util.Enumeration"%>
<%@ page import="java.io.ByteArrayOutputStream"%>
<%@ page import="java.io.IOException"%>
<%@ page import="java.net.CookieHandler"%>
<%@ page import="java.net.CookieManager"%>
<%@ page import="java.net.CookiePolicy"%>
<%@ page import="java.net.URLConnection"%>
<%@ page import="java.net.URL"%>
<%@ page import="java.net.HttpURLConnection"%>
<%@ page import="java.io.InputStream"%>
<%@ page import="javax.net.ssl.*"%>
<%@ page import="javax.net.ssl.X509TrustManager"%>
<%@ page import="java.io.InputStreamReader"%>
<%@ page import="java.io.Reader"%>
<%@ page import="java.net.MalformedURLException"%>
<%@ page import="java.lang.IllegalStateException"%>
<%@ page import="java.net.UnknownServiceException"%>
<%@ page import="javax.net.ssl.HostnameVerifier"%>
<%@ page import="javax.net.ssl.HttpsURLConnection"%>
<%@ page import="javax.net.ssl.SSLContext"%>
<%@ page import="javax.net.ssl.SSLSession"%>
<%@ page import="javax.net.ssl.TrustManager"%>
<%@ page import="java.security.cert.X509Certificate" %>
<%@ page import="javax.servlet.http.*"%>
<%@ page import="javax.servlet.ServletException"%>

<%@ page trimDirectiveWhitespaces="true"  %>

<%
    /*
     * FROM: http://www.rgagnon.com/javadetails/java-fix-certificate-problem-in-HTTPS.html
     *  fix for
     *    Exception in thread "main" javax.net.ssl.SSLHandshakeException:
     *       sun.security.validator.ValidatorException:
     *           PKIX path building failed: sun.security.provider.certpath.SunCertPathBuilderException:
     *               unable to find valid certification path to requested target
     */
/*     TrustManager[] trustAllCerts = new TrustManager[] {
       new X509TrustManager() {
          public java.security.cert.X509Certificate[] getAcceptedIssuers() {
            return null;
          }

          public void checkClientTrusted(X509Certificate[] certs, String authType) {  }

          public void checkServerTrusted(X509Certificate[] certs, String authType) {  }

       }
    };

    SSLContext sc = SSLContext.getInstance("SSL");
    sc.init(null, trustAllCerts, new java.security.SecureRandom());
    HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());

    // Create all-trusting host name verifier
    HostnameVerifier allHostsValid = new HostnameVerifier() {
        public boolean verify(String hostname, SSLSession session) {
          return true;
        }
    };
    // Install the all-trusting host verifier
    HttpsURLConnection.setDefaultHostnameVerifier(allHostsValid);
*/
    /*
     * end of the fix
     */ 
     
     
//	System.setProperty( "sun.security.ssl.allowUnsafeRenegotiation", "true" );

    String queryStr = (request.getQueryString()     != null) ? request.getQueryString() 	: "";
    String mime 	= (request.getParameter("mime") != null) ? request.getParameter("mime") : "application/xml";
    String urlProxy = (request.getParameter("url")  != null) ? request.getParameter("url") 	: "";	

    System.out.println("Proxing request for url = " + urlProxy);
    HttpURLConnection con = null;
    try {
        CookieHandler.setDefault(new CookieManager(null, CookiePolicy.ACCEPT_ALL));
    }
    catch(SecurityException Ex)
    {
       String sStr = "This server does not allow setting of the default cookie handler. Proceeding without cookie support.";

        if (Ex.getCause() != null)
        {
            sStr += " " + Ex.getCause().getLocalizedMessage();
        }
        else
        {
            sStr += " " + Ex.getLocalizedMessage();
        }
        System.out.println("  Exception: " + sStr);
    }
    try {
        con = (HttpURLConnection) new URL(urlProxy).openConnection();
        con.setUseCaches(false);
    	//con.setRequestProperty("Accept-Charset", "UTF-8");
    	//con.setRequestProperty("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
        
        Enumeration<String> oEnum = request.getHeaderNames();
        while (oEnum.hasMoreElements())
        {
            String sHeader = oEnum.nextElement();
            
            con.setRequestProperty(sHeader, request.getHeader(sHeader));
        }
        con.setRequestMethod("GET");
        //con.connect();
        int responseCode = con.getResponseCode();
        System.out.println("Connection Response Code is " + responseCode);

        //response.setContentType(mime.trim());
        int iIndex = 0;
        String oHeaderField;
        Map<String, List<String>> map = con.getHeaderFields();

	//System.out.println("Printing Response Header...\n");

        for (Map.Entry<String, List<String>> entry : map.entrySet())
        {
            //System.out.println("Key : " + entry.getKey() 
            //               + " ,Value : " + entry.getValue());
            
            for (String sValue: entry.getValue())
            {
                // do not add  transfer-encoding when the value is chunked
                if ( (entry.getKey()  == null) || (entry.getKey()  != null && entry.getKey().equalsIgnoreCase("transfer-encoding") && sValue != null && sValue.equalsIgnoreCase("chunked") ) )
               {
                   //System.out.println(entry.getKey() + "   " + sValue );
                   continue;
               }
                response.addHeader(entry.getKey(), sValue);
            }
        }
        response.setStatus(responseCode);

        //while (con.getHeaderFieldKey(iIndex) != null)
        //{
        //    oHeaderField = con.getHeaderFieldKey(iIndex);
        //    response.addHeader(oHeaderField, con.getHeaderField(iIndex));
        //    iIndex++;
        //}
    	InputStream in = con.getInputStream();
        
        ServletOutputStream oOutStream = response.getOutputStream();
        //ByteArrayOutputStream os = new ByteArrayOutputStream();
        byte[] buff = new byte[4096];
        int len = 0;
        while ((len = in.read(buff)) != -1) {
            //os.write(buff, 0, len);
            oOutStream.write(buff, 0, len);
        }
    }
    // The sendError set the error number but the error message is being overwritten
    // by the server environment.
    catch (MalformedURLException Ex)
    {
        String sStr = "";

        if (Ex.getCause() != null)
        {
            sStr = Ex.getCause().getLocalizedMessage();
        }
        else
        {
            sStr = Ex.getLocalizedMessage();
        }
        sStr += " Malformed URL.";
        System.out.println("  Exception: " + HttpServletResponse.SC_BAD_GATEWAY + " " + sStr);
        response.sendError(HttpServletResponse.SC_BAD_GATEWAY, sStr);
        //throw new ServletException(sStr);
    }
    catch (IllegalStateException Ex)
    {
        String sStr = "";

        if (Ex.getCause() != null)
        {
            sStr = Ex.getCause().getLocalizedMessage();
        }
        else
        {
            sStr = Ex.getLocalizedMessage();
        }
        sStr += " Illegal State Exception occured.";
        System.out.println("  Exception: " + HttpServletResponse.SC_BAD_GATEWAY + " " + sStr);
        response.sendError(HttpServletResponse.SC_BAD_GATEWAY, sStr);
        //throw new ServletException(sStr);
    }
    catch (UnknownServiceException Ex)
    {
        String sStr = "";

        if (Ex.getCause() != null)
        {
            sStr = Ex.getCause().getLocalizedMessage();
        }
        else
        {
            sStr = Ex.getLocalizedMessage();
        }
        sStr += "  The protocol does not support input.";

        System.out.println("  Exception: " + HttpServletResponse.SC_BAD_GATEWAY + " " + sStr);
        response.sendError(HttpServletResponse.SC_BAD_GATEWAY, sStr);
        //throw new ServletException(sStr);
    }
    catch (IOException Ex)
    {
        String sStr = "";

        if (Ex.getCause() != null)
        {
            sStr = Ex.getCause().getLocalizedMessage();
        }
        else
        {
            sStr = Ex.getLocalizedMessage();
        }
        sStr += " IO Exception occured.";
        System.out.println("  Exception: " + HttpServletResponse.SC_BAD_GATEWAY + " " + sStr);
        response.sendError(HttpServletResponse.SC_BAD_GATEWAY, sStr);
        //throw new ServletException(sStr);
    }
    catch (Exception Ex)
    {
        String sStr = "";

        if (Ex.getCause() != null)
        {
            sStr = Ex.getCause().getLocalizedMessage();
        }
        else
        {
            sStr = Ex.getLocalizedMessage();
        }
        System.out.println("  Exception: " + HttpServletResponse.SC_BAD_GATEWAY + " " + sStr);
        response.sendError(HttpServletResponse.SC_BAD_GATEWAY, sStr);
    } finally {
		// System.setProperty( "sun.security.ssl.allowUnsafeRenegotiation", "false" );
    }
%> 
