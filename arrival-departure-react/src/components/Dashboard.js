import React, { Component } from 'react';
import './Dashboard.css';
import 'bootstrap/dist/css/bootstrap.css'
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'font-awesome/css/font-awesome.min.css';
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import $ from 'jquery';
import moment from 'moment';
import Multiselect from 'react-bootstrap-multiselect'
import axios from 'axios';
import { Redirect } from 'react-router-dom';

export default class DashBoard extends Component {
  constructor(props) {
    super(props);
    this.state= {
      flightsData:[],
    }
  }
  componentDidMount() {

    window.$('#date_filter').daterangepicker({
      "singleDatePicker": true,
      // "timePicker": true,
      // "timePicker24Hour": true,
      "startDate": moment(moment(), "MM-DD-YYYY"),
      locale: {
        format: 'YYYY-MM-DD'
      },
      minDate:moment(moment(), "MM-DD-YYYY"),
    },

    function(start, end, label) {
      console.log('New date range selected: ' + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD') + ' (predefined range: ' + label + ')');
    });

    $("#searchButton").click(function(){
      var searchResult; 
      console.log("The text has been changed.");
      var from = $("#from").val();
      var number = $("#number").val();
      var airline_company = $("#airline_company").val();
      var arrival = document.getElementById("arrival").checked
      var departure = document.getElementById("departure").checked
      var selected_date = $("#date_filter").val();
      // var hour = $('.hourselect').val();
      // var minute = $('.minuteselect').val();
      // var time = hour+":"+minute;
      console.log("from: "+from+" number: "+number+" airline_company: "+airline_company+ " ankomster: "+arrival+ " Afgange: "+departure+" date: "+selected_date);
      $.ajax ({
        type: "POST",
        url: "http://localhost:3000/api/v1/search",
        crossDomain: true,
        data: {"from": from, "number": number, "airline_company": airline_company,"ankomster":arrival, "afgange":departure, "date": selected_date},
        success: function (response) {
          console.log(response);
          searchResult = response["flights"]
        },
        error: function (xhr,ajaxOptions,throwError) {
        },
      });
      setTimeout(function(){
        this.setState({flightsData:searchResult});
        console.log("set state");
      }.bind(this),3000);
    }.bind(this));

    console.log("Inside componentDidMount");
    var flights_data;
    $.ajax ({
      type: "GET",
      url: "http://localhost:3000/api/v1/flights",
      crossDomain: true,
      success: function (response) {
        console.log(response)
        flights_data = response["flights"]
      },
      error: function (xhr,ajaxOptions,throwError) {
      },
    });
    setTimeout(function(){
      this.setState({flightsData:flights_data});
      console.log("set state");
    }.bind(this),3000);
  }
  render() {
   var rows = Object.entries(this.state.flightsData).map(([key,value])=>{
    return (
          <tr key={key} id={key}>
            
            <td>{ value["flight_type"]=="afgange"?"Departure": "Arrival" }</td>
            <td>{value["time"]}</td>
            <td>{value["expected_time"]}</td>
            <td>{value["from"]}</td>
            <td>{value["number"]}</td>
            <td>{value["airline_company"]}</td>
            <td>{value["gate"]}</td>
            <td>{value["status"]}</td>
            <td>{value["date"]}</td>
          </tr>
        )

     })
    return (
      <div className="App ">
        <div id="source_hide">
          <header>
            <div className="row">
              <div className="col-md-1 col-sm-1 col-lg-1 col-xs-1"></div>

              <div className="col-md-10 col-sm-10 col-lg-10 col-xs-10">
                <p className="header-text robot-font"> Arrival-Departure</p>
                <p></p>
              </div>            
            </div>
          </header>
          <div className="container container-dash">
            <div className="row">
            <h3><b>Search:</b></h3>
             </div>
             <div className="row">
              <div className="col-sm">
                <label htmlFor="from">flights from/to a specific city:</label>
                <input type="text" className="form-control" id="from" />
              </div>
              <div className="col-sm">
                <label htmlFor="number">Flight number:</label>
                <input type="text" className="form-control" id="number" />
              </div>
              <div className="col-sm">
                <label htmlFor="airline_company">Flight airline company:</label>
                <input type="text" className="form-control" id="airline_company" />
              </div>
            </div>
            <br />

            <div className="row">
              <div className="col-sm-2">
                <input type="checkbox" name="Arrival" defaultValue="Arrival" id="arrival" /> Arrival<br />
              </div>
              <div className="col-sm-2">
                <input type="checkbox" name="Departure" defaultValue="Departure" id="departure" />Departure<br />
              </div>
              <div className="col-sm-4">
               <p>Date: <input type="text" id="date_filter" /></p>
 
                {/*<div name="daterange" id="date_filter" style={{background: '#fff', cursor: 'pointer', padding: '5px 10px', border: '1px solid #ccc', width: '60%'}}> </div>*/}
             </div>
              <div className="col-sm-2">             
                <button type="button" className="btn btn-primary" id="searchButton">Search</button>
              </div>
            </div>
            <br />

            <div className="row">
              <table className="table table-bordered table-striped table-responsive table-hover">
                <thead>
                  <tr>
                    <th>flight_type</th>
                    <th>time</th>
                    <th>expected_time</th>
                    <th>from</th>
                    <th>number</th>
                    <th>airline_company</th>
                    <th>gate</th>
                    <th>status</th>                 
                    <th>date</th>                 
                  </tr>
                </thead>
                <tbody>
                  {rows}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <div className="footer footer-color">
              <p className="white-color robot-font">&copy; 2018 Arrival-Departure, Inc. All rights reserved</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
