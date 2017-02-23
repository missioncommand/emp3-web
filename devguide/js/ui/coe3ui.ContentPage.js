 /*global emp3ui, React */
 (function() {
     "use strict";
     window.coe3ui = window.coe3ui || {};
     var ContentPage = React.createClass({
         displayName: "ContentPage",

         getInitialState: function() {
             return {
                 theme: null
             };
         },
         handleThemeUpdate2: function(theme) {
             this.setState({ theme: theme });
         },
         componentWillMount: function() {
             var curTheme = null;
             if (this.props.themeManager) {
                 curTheme = this.props.themeManager.getTheme();
             }

             this.setState({ theme: curTheme });
         },

         componentDidMount: function() {
             if (this.props.themeManager) {
                 this.props.themeManager.registerThemeListener(this.handleThemeUpdate2);
             }
         },
         componentWillUnmount: function() {
             if (this.props.themeManager) {
                 this.props.themeManager.removeThemeListener(this.handleThemeUpdate2);
             }
         },
         render: function render() {
             return React.createElement("div", {
                 style: {
                     "overflow": "auto",
                     "postion": "absolute",
                     "top":"0px",
                     "bottom":"0px",
                     "left":"0px",
                     "right":"0px",
                     "backgroundColor": this.state.theme.BG,
                     "padding": "24px"
                 }
             }, this.props.children);
         }
     });

     window.coe3ui.ContentPage = ContentPage;
 }());
