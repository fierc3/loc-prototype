import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.tsx';
import Editor from './Editor.tsx';
import MapGrid from './MapGrid.tsx'
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";

ReactDOM.render(
  <BrowserRouter>
    <Route path="/editor" component={Editor} exact />
    <Route path="/" component={App} exact />

    </BrowserRouter>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
