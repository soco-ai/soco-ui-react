import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {message} from "antd";
import * as serviceWorker from './serviceWorker';
import configureStore from './store/configureStore.js';
import MainSearch from "./components/Search/MainSearch";
import NotFoundPage from "./components/NotFoundPage";
import AggregateSearch from "./components/Search/AggregateSearch";
import './styles/root.css';

// ANTD message configuration
message.config({
  duration: 3, maxCount: 3,
});

// Routers
const store = configureStore();
ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter
            getUserConfirmation={(message, callback) => {
                callback(window.confirm(message))
            }}
        >
            <Switch>
                <Route path={"/search/result"} component={AggregateSearch} exact={true}/>
                <Route path={"/"} component={MainSearch} exact={true}/>
                <Route component={NotFoundPage}/>
            </Switch>
        </BrowserRouter>
    </Provider>, document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
