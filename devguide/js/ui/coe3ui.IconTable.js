 /*global emp3ui, React */
 (function() {
     "use strict";
     window.coe3ui = window.coe3ui || {};

     var ProductRow = React.createClass({
         displayName: "ProductRow",
         render: function render() {

             var title = "Use this Icon: <i class=\"material-icons\" >" + this.props.icon.lignet + "</i>";
             return React.createElement(
                 "tr", {
                     title: title,
                     style: { backgroundColor: this.props.theme.BG_CARDS }
                 },
                 React.createElement(
                     "td", {
                         className: "mdl-data-table__cell--non-numeric",
                         style: {
                             "width": "25%",
                             backgroundColor: this.props.theme.BG_CARDS,
                             color: this.props.theme.FONT_COLOR
                         }
                     },
                     this.props.icon.name
                 ),
                 React.createElement(
                     "td", {
                         className: "mdl-data-table__cell--non-numeric",
                         style: { "width": "20%", backgroundColor: this.props.theme.BG_CARDS }
                     },
                     React.createElement(
                         "i", {
                             className: "material-icons"
                         },
                         this.props.icon.lignet
                     )
                 ),
                 React.createElement(
                     "td", {
                         className: "mdl-data-table__cell--non-numeric",
                         style: { "width": "55%" }
                     },
                     this.props.icon.useCase === "" ? "" : this.props.icon.useCase
                 )
             );
         }
     });

     var ProductTable = React.createClass({
         displayName: "ProductTable",

         render: function render() {
             var rows = [],
                 tableStyle = {
                     width: '100%',
                     whiteSpace: 'normal',
                     boxSizing: "border-box",
                     backgroundColor: this.props.theme.BG_CARDS
                 },
                 i,
                 len = this.props.iconList.length,
                 filterItem = false,
                 icon,
                 theme = this.props.theme,
                 lastCategory = null;
             for (i = 0; i < len; i++) {
                 icon = this.props.iconList[i];
                 filterItem = false;
                 if (this.props.filterText !== "" && icon.name.toLowerCase().indexOf(this.props.filterText.toLowerCase()) === -1) {
                     filterItem = true;
                 }
                 if (this.props.filterLevel === "1" && icon.useCase === "") {
                     filterItem = true;
                 } else if (this.props.filterLevel === "2" && icon.useCase.length > 0) {
                     filterItem = true;
                 }
                 if (filterItem === false) {

                     rows.push(React.createElement(ProductRow, {
                         icon: icon,
                         key: icon.name,
                         theme: theme
                     }));
                 }
             }
             return React.createElement(
                 "table", {
                     style: tableStyle,
                     className: "mdl-data-table mdl-js-data-table mdl-shadow--2dp"
                 },
                 React.createElement(
                     "thead",
                     null,
                     React.createElement(
                         "tr",
                         null,
                         React.createElement(
                             "th", {
                                 className: "mdl-data-table__cell--non-numeric"
                             },
                             "Name"
                         ),
                         React.createElement(
                             "th", {
                                 className: "mdl-data-table__cell--non-numeric"
                             },
                             "Icon"
                         ),
                         React.createElement(
                             "th", {
                                 className: "mdl-data-table__cell--non-numeric"
                             },
                             "When to use"
                         )
                     )
                 ),
                 React.createElement(
                     "tbody",
                     null,
                     rows
                 )
             );
         }
     });

     var SearchBar = React.createClass({
         displayName: "SearchBar",

         handleChange: function handleChange() {
             this.props.onUserInput(this.refs.filterTextInput.getDOMNode().value);
         },
         onFilterChange: function onFilterChange(e) {
             this.props.onFilterChanged(e.currentTarget.value);
         },
         render: function render() {
             var radioStyle = {
                     marginLeft: '16px',
                     marginBottom: '16px',
                     float: "left"
                 },
                 searchStyle = {
                     float: "right"
                 },
                 filterStyle = {
                     float: "left"
                 };
             return React.createElement(
                 "form",
                 null,
                 React.createElement(
                     "div", {
                         className: "mdl-textfield mdl-js-textfield textfield-demo",
                         style: searchStyle
                     },
                     React.createElement("input", {
                         className: "mdl-textfield__input",
                         title: "Enter a keyword to filter the icon set",
                         type: "text",
                         id: "sample1",
                         ref: "filterTextInput",
                         onChange: this.handleChange
                     }),
                     React.createElement(
                         "label", {
                             className: "mdl-textfield__label",
                             "for": "sample1"
                         },
                         React.createElement(
                             "i", {
                                 className: "material-icons"
                             },
                             "search"
                         )
                     )
                 ),
                 React.createElement(
                     "div", {
                         style: filterStyle
                     },
                     React.createElement(
                         "label", {
                             className: "mdl-radio mdl-js-radio mdl-js-ripple-effect",
                             style: radioStyle,
                             "for": "option-1"
                         },
                         React.createElement("input", {
                             type: "radio",
                             onChange: this.onFilterChange,
                             id: "option-1",
                             className: "mdl-radio__button",
                             name: "options",
                             value: "1",
                             checked: this.props.filterLevel === "1"
                         }),
                         React.createElement(
                             "span", {
                                 className: "mdl-radio__label"
                             },
                             "Recomended"
                         )
                     ),
                     React.createElement(
                         "label", {
                             className: "mdl-radio mdl-js-radio mdl-js-ripple-effect",
                             style: radioStyle,
                             "for": "option-2"
                         },
                         React.createElement("input", {
                             type: "radio",
                             onChange: this.onFilterChange,
                             id: "option-2",
                             className: "mdl-radio__button",
                             name: "options",
                             value: "2",
                             checked: this.props.filterLevel === "2"
                         }),
                         React.createElement(
                             "span", {
                                 className: "mdl-radio__label"
                             },
                             "Unused"
                         )
                     ),
                     React.createElement(
                         "label", {
                             className: "mdl-radio mdl-js-radio mdl-js-ripple-effect",
                             style: radioStyle,
                             "for": "option-3"
                         },
                         React.createElement("input", {
                             type: "radio",
                             onChange: this.onFilterChange,
                             id: "option-3",
                             className: "mdl-radio__button",
                             name: "options",
                             value: "3",
                             checked: this.props.filterLevel === "3"
                         }),
                         React.createElement(
                             "span", {
                                 className: "mdl-radio__label"
                             },
                             "All"
                         )
                     )
                 )
             );
         }
     });

     var FilterableProductTable = React.createClass({
         displayName: "FilterableProductTable",

         getInitialState: function() {
             return {
                 filterText: '',
                 filterLevel: '3',
                 theme: null
             };
         },
         componentWillMount: function() {
             var curTheme = null;
             if (this.props.themeManager) {
                 curTheme = this.props.themeManager.getTheme();
                 this.props.themeManager.registerThemeListener(this.handleThemeUpdate);
             }
             this.setState({ theme: curTheme });
         },

         handleThemeUpdate: function(theme) {
             this.setState({ theme: theme });
         },
         handleUserInput: function(filterText) {
             this.setState({
                 filterText: filterText
             });
         },
         handleFilterChange: function(filterLevel) {
             this.setState({
                 filterLevel: filterLevel
             });
         },
         render: function render() {
             return React.createElement(
                 "div", {
                     style: {
                         "overflow": "auto",
                         "width": "100%",
                         "padding": "24px",
                         boxSizing: "border-box",
                         "backgroundColor": this.state.theme.BG,
                         color: this.state.theme.FONT_COLOR
                     }
                 },
                 React.createElement(SearchBar, {
                     filterText: this.state.filterText,
                     filterLevel: this.state.filterLevel,
                     onUserInput: this.handleUserInput,
                     onFilterChanged: this.handleFilterChange,
                     theme: this.state.theme
                 }),
                 React.createElement(ProductTable, {
                     iconList: this.props.iconList,
                     filterText: this.state.filterText,
                     filterLevel: this.state.filterLevel,
                     theme: this.state.theme
                 })
             );
         }
     });

     window.coe3ui.IconTable = FilterableProductTable;


 }());

 ReactDOM.render(
     React.createElement(window.coe3ui.IconTable, {
         themeManager: coe3ui.themeManager,
         iconList: coe3isg.materialicons
     }),
     document.getElementById('IconTable')
 );
