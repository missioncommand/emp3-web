 /*global emp3ui, React */
 (function() {
     "use strict";
     window.coe3ui = window.coe3ui || {};


     var LoginForm = React.createClass({
         displayName: "LoginFrom",
         userInfo: {
             username: "",
             password: "",
             org: "",
             role: ""
         },
         authTime: null,
         submitAuth: function(event) {
             this.setState({ step: 2 });
             this.authTime = setTimeout(function() {

                 if (this.userInfo.password === "thepassword") {
                     this.setState({ step: 3 });
                     this.userInfo.username = "";
                     this.userInfo.password = "";
                 } else {
                     this.setState({ step: 4 });
                 }
             }, 2500).bind(this);

         },
         cancelAuth: function(event) {

             this.setState({ step: 2 });

         },
         continueAuth: function(event) {

             this.setState({ step: 1 });

         },
         errorAuth: function(event) {

             this.setState({ step: 4 });

         },

         retryAuth: function(event) {

             this.setState({ step: 1 });

         },
         getInitialState: function() {
             return { step: 3 };
         },
         handlePassChange: function(event) {
             this.userInfo.password = event.target.value;
         },
         handleNameChange: function(event) {
             this.userInfo.username = event.target.value;
         },
         componentDidUpdate: function() {
             componentHandler.upgradeDom();
         },
         render: function () {
             switch (this.state.step) {
                 case 1:

                     return React.createElement(
                         "div", { className: "mdl-card mdl-shadow--2dp ", style: { width: "100%", maxWidth: "500px", height: "300px" } },
                         React.createElement(
                             "div", { className: "mdl-card__title mdl-color--light-blue-900" },
                             React.createElement(
                                 "h2", { className: "mdl-card__title-text " },
                                 "Login"
                             )
                         ),
                         React.createElement(
                             "div", { className: "mdl-card__supporting-text ", style: { padding: "24px", boxSizing: "border-box", width: "100%", height: "300px" } },
                             React.createElement(
                                 "div", { style: { float: "left", marginTop: "24px", paddingLeft: "16px" } },
                                 React.createElement(
                                     "i", { className: "material-icons" },
                                     "account_circle"
                                 )
                             ),
                             React.createElement(
                                 "div", { style: { marginLeft: "48px", marginRight: "48px" } },
                                 React.createElement(
                                     "div", { className: "mdl-textfield mdl-js-textfield mdl-textfield--floating-label", style: { width: "100%" } },
                                     React.createElement("input", { className: "mdl-textfield__input", type: "text", id: "username", onChange: this.handleNameChange }),
                                     React.createElement(
                                         "label", { className: "mdl-textfield__label", "for": "username" },
                                         "Username"
                                     )
                                 ),
                                 React.createElement(
                                     "div", { className: "mdl-textfield mdl-js-textfield mdl-textfield--floating-label", style: { width: "100%" } },
                                     React.createElement("input", { className: "mdl-textfield__input", type: "password", id: "password", onChange: this.handlePassChange }),
                                     React.createElement(
                                         "label", { className: "mdl-textfield__label", "for": "password" },
                                         "Password"
                                     )
                                 )
                             )
                         ),
                         React.createElement(
                             "div", { className: "mdl-card__actions mdl-card--border" },
                             React.createElement(
                                 "a", { className: "mdl-button mdl-js-button mdl-js-ripple-effect", style: { float: "right" }, onClick: this.submitAuth },
                                 "Sign In"
                             )
                         )
                     );
                 case 2:
                     return React.createElement(
                         "div", { className: "mdl-card mdl-shadow--2dp ", style: { width: "100%", maxWidth: "500px", height: "300px" } },
                         React.createElement(
                             "div", { className: "mdl-card__title mdl-color--light-blue-900" },
                             React.createElement(
                                 "h2", { className: "mdl-card__title-text " },
                                 "Login"
                             )
                         ),
                         React.createElement(
                             "div", { className: "mdl-card__supporting-text ", style: { padding: "0px", boxSizing: "border-box", width: "100%", height: "300px" } },
                             React.createElement(
                                 "div", { style: { paddingTop: "75px" } },
                                 React.createElement("div", {
                                     style: { left: "47%" },
                                     className: "mdl-spinner mdl-js-spinner is-active"
                                 }),
                                 React.createElement(
                                     "div", { style: { width: "100%", textAlign: "center" } },
                                     "Logging you in..."
                                 )
                             )
                         ),
                         React.createElement(
                             "div", { className: "mdl-card__actions mdl-card--border" }, React.createElement(
                                 "a", { className: "mdl-button mdl-js-button mdl-js-ripple-effect", style: { float: "right" }, onClick: this.errorAuth },
                                 "Cancel"
                             )

                         )
                     );
                 case 3:

                     return React.createElement(
                         "div", { className: "mdl-card mdl-shadow--2dp ", style: { width: "100%", maxWidth: "500px", height: "300px" } },
                         React.createElement(
                             "div", { className: "mdl-card__title mdl-color--light-blue-900" },
                             React.createElement(
                                 "h2", { className: "mdl-card__title-text " },
                                 "Login"
                             )
                         ),
                         React.createElement(
                             "div", { className: "mdl-card__supporting-text ", style: { padding: "24px", boxSizing: "border-box", width: "100%", height: "300px" } },
                             /* React.createElement(
                                  "div", { style: {marginLeft: "48px", marginRight: "48px"} },
                                  "Welcome, " + this.userInfo.username 
                              ),
                              React.createElement(
                                  "div", { style: {marginLeft: "48px", marginRight: "48px", marginTop: "6px"} },
                                  "Select you organization and role"
                              ),*/
                             React.createElement(
                                 "div", { style: { marginLeft: "48px", marginRight: "48px" } },
                                 React.createElement(window.coe3ui.DropDownMenu, { defaultSelection: "Organization", options: [{ label: "1st BCT, 3rd ID" }, { label: "2nd BCT, 101st INF DIV" }] }),
                                 React.createElement(window.coe3ui.DropDownMenu, { defaultSelection: "Role", options: [{ label: "1st BCT, 3rd ID" }, { label: "2nd BCT, 101st INF DIV" }] })

                             )
                         ),
                         React.createElement(
                             "div", { className: "mdl-card__actions mdl-card--border" },
                             React.createElement(
                                 "a", { className: "mdl-button mdl-js-button mdl-js-ripple-effect", style: { float: "right" }, onClick: this.continueAuth },
                                 "Continue"
                             )
                         )
                     );
                 case 4:
                     return React.createElement(
                         "div", { className: "mdl-card mdl-shadow--2dp ", style: { width: "100%", maxWidth: "500px", height: "300px" } },
                         React.createElement(
                             "div", { className: "mdl-card__title mdl-color--light-blue-900" },
                             React.createElement(
                                 "h2", { className: "mdl-card__title-text " },
                                 "Login"
                             )
                         ),
                         React.createElement(
                             "div", { className: "mdl-card__supporting-text ", style: { padding: "0px", boxSizing: "border-box", width: "100%", height: "300px" } },
                             React.createElement(
                                 "div", { style: { paddingTop: "75px" } },

                                 React.createElement(
                                     "div", { style: { width: "100%", boxSizing: "border-box", padding: "24px" } },
                                     "Unable to log you in, Please check your username and password"
                                 )
                             )
                         ),
                         React.createElement(
                             "div", { className: "mdl-card__actions mdl-card--border" }, React.createElement(
                                 "a", { className: "mdl-button mdl-js-button mdl-js-ripple-effect", style: { float: "right" }, onClick: this.retryAuth },
                                 "Try Again"
                             )

                         )
                     );

             }

         }
     });
     window.coe3ui.LoginForm = LoginForm;
 }());
