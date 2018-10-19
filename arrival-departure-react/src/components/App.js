import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import DashBoard from './Dashboard.js';

export default class App extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path='/' component= {DashBoard} />
          <Route path='/dashboard' component= {DashBoard} />
        </Switch>
      </Router>
    );
  }
}
