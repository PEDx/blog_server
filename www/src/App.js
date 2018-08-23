import React from 'react';
import ReactDOM from 'react-dom';
import Route from './router';
import registerServiceWorker from './registerServiceWorker';
import "./style/main.css"
import echarts from 'echarts/lib/echarts';
import themeJson from "./theme/darkness.json"


echarts.registerTheme('darkness', themeJson)

ReactDOM.render(<Route/>, document.getElementById('root'));
registerServiceWorker();
