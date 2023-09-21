import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './src/App';
import store from './src/store';

document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('.ozplugin_settings_page')) return;
    ReactDOM.render(<Provider store={store}><App /></Provider>, document.querySelector('.ozplugin_settings_page'));
})

const onLoad = () => {
    store.dispatch({type: 'ONLOAD'})
}

window.addEventListener("load",onLoad,false)