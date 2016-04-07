import 'styles/main.scss';

// Needed for material-ui before React 1.0
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import React from 'react';
import ReactDOM from 'react-dom';
import MainView from 'containers/MainView';

ReactDOM.render(
  <MainView />,
  document.getElementById('root')
);
