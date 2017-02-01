import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import configureStore from './js/store/configureStore';
import ValidationContainer from './js/ValidationApp.js';

import 'material-design-lite';

// Apply styling
import './vendor/mil-sym/renderer.css';
import 'font-awesome/css/font-awesome.css';
import 'toastr/toastr.scss';
import 'material-design-lite/material.css';
import './stylesheets/emp3-web-sdk-validationV2.css';
import 'react-widgets/lib/less/react-widgets.less';
import 'codemirror/lib/codemirror.css';

let store = configureStore();

// TODO add react-router

const rootNode = document.getElementById('root');
render(
  <Provider store={store}>
    <ValidationContainer />
  </Provider>,
  rootNode
);
