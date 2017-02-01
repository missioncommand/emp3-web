 /*global emp3ui, window, alert, componentHandler, React */

 (function() {
     "use strict";
     // Ensure the coe3ui namespace exisits and create it if it does not.
     window.coe3ui = window.coe3ui || {};
     var menuItem = React.createClass({
         displayName: "menuItem",

         render: function render() {

             return React.createElement(
                 "li", { className: "mdl-menu__item", onClick: function() { alert("clicked"); } },
                 this.props.label
             );
         }
     });
     var handleClick = function (i, props) {
         console.log('You clicked: ' + props.items[i]);
     };
     window.coe3ui.DropDownMenu = React.createClass({
         displayName: "DropDownMenu",
         getInitialState: function() {
             return {
                 selectedValue: this.props.defaultSelection || "Select"
             };
         },
         handleOptionSelect: function(e, item) {
             alert(e);
             this.setState({
                 selectedValue: item.label
             });
         },
         generateItems: function() {
             var items = [],
                 i,
                 len;

             if (this.props && this.props.hasOwnProperty("options")) {
                 len = this.props.options.length;
                 //var boundClick = this.handleOptionSelect.bind(this);
                 for (i = 0; i < len; i += 1) {
                     items.push(React.createElement(
                         menuItem, { label: this.props.options[i].label, onClick: alert }
                     ));
                 }
             }
             return items;
         },
         componentDidUpdate: function() {
             componentHandler.upgradeDom();

         },
         render: function () {

             return React.createElement(
                 "div",
                 null,
                 React.createElement(
                     "div", {
                         id: "menu-speed",
                         style: {
                             borderBottom: "1px solid rgba(255, 255, 255, 0.54)",
                             color: "rgba(255, 255, 255, 0.54)",
                             height: "32px",
                             fontSize: "16px",
                             verticalAlign: "middle",
                             lineHeight: "32px",
                             width: "100%",
                             marginTop: "32px",
                             marginBottom: "32px"
                         }
                     },
                     React.createElement(
                         "span", { style: { height: "32px", verticalAlign: "middle", lineHeight: "32px", width: "100%" } },
                         this.state.selectedValue,
                         React.createElement(
                             "i", { className: "material-icons", style: { float: "right", verticalAlign: "middle", lineHeight: "32px" } },
                             "arrow_drop_down"
                         )
                     )
                 ),
                 React.createElement(
                     "ul", { className: "mdl-menu mdl-js-menu", onClick: handleClick, for: "menu-speed", style: { marginTop: "0px", width: "205px", maxHeight: "120px", overflow: "auto" } },
                     //[this.generateItems(this.props.options)]
                     this.props.options.map(function(item) {
                         return React.createElement(
                             menuItem, { key: item.label, label: item.label, onClick: function() { alert("clicked"); } }
                         );
                     })
                 )
             );
         }
     });
 }());
