import React from 'react';
import ReactDOM from 'react-dom';
import Route from './router';
import registerServiceWorker from './registerServiceWorker';
import "./style/main.css"

ReactDOM.render(<Route/>, document.getElementById('root'));
registerServiceWorker();
