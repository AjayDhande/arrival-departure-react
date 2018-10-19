import React, { Component } from 'react';
import './Dashboard.css';
import 'bootstrap/dist/css/bootstrap.css';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'font-awesome/css/font-awesome.min.css';
import 'react-dates/lib/css/_datepicker.css';
import 'react-select/dist/react-select.css';
import 'react-dates/initialize';
import logo from '../risksense_logo.png';
import VariableClass from './Variables.js';
import $ from 'jquery';
import moment from 'moment';
import Multiselect from 'react-bootstrap-multiselect';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import TypeData from './Dropdown.js';

export default class DashBoard extends Component {
  constructor(props) {
    super(props);
    this.state= {
      redirect: false,
      executionData:[],
      focusedInput: null,
      startDate: moment(moment(), "DD-MM-YYYY").add(-7, 'days'),
      endDate: moment(),
      groups: [{ value: 'adobe', label: 'adobe' },{ value: 'alienvault', label: 'alienvault' },{ value: 'apple', label: 'apple' },{ value: 'beyondsecurity', label: 'beyondsecurity' },{ value: 'binarydefense', label: 'binarydefense' },{ value: 'blocklist.de', label: 'blocklist.de' },{ value: 'capec', label: 'capec' },{ value: 'cisco', label: 'cisco' },{ value: 'cisecurity', label: 'cisecurity' },{ value: 'cnnvd', label: 'cnnvd' },{ value: 'coalfire', label: 'coalfire' },{ value: 'contagiodump', label: 'contagiodump' },{ value: 'cwe', label: 'cwe' },{ value: 'cymon', label: 'cymon' },{ value: 'debian', label: 'debian' },{ value: 'dontneedcoffee', label: 'dontneedcoffee' },{ value: 'dshield', label: 'dshield' },{ value: 'DWF', label: 'DWF' },{ value: 'emergingthreats', label: 'emergingthreats' },{ value: 'exploit-db', label: 'exploit-db' },{ value: 'fedora', label: 'fedora' },{ value: 'firehol', label: 'firehol' },{ value: 'freebsd', label: 'freebsd' },{ value: 'ubuntu', label: 'ubuntu' },{ value: 'cisco', label: 'cisco' },{ value: 'redhat', label: 'redhat' } ],
      graphgroups: [],
    }
  }
  componentDidMount() {
    if (sessionStorage.auth===undefined) {
      this.logout();
    }
    else {
      var is_valid = false;
      var Datatable = window.$('#myTable').DataTable({
                        "searching": false,
                        "lengthChange": false,
                        "pageLength": 10
                      });
      $.ajax ({
        type: "POST",
        url: VariableClass.url+"auth/v1/tokens/validate?st2-api-key="+VariableClass.apiKey,
        crossDomain: true,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        data: JSON.stringify({token: sessionStorage.auth}),
        async: false,
        success: function (response) {
          is_valid = response.valid;
        },
        error: function (xhr,ajaxOptions,throwError) {
          is_valid = false;
        },
      });
      if(!is_valid) {
        alert('Token is expired, please login again to continue');
        this.logout();
      }
      else {
        $('#source_hide').addClass('show-div');
        var elements = {};
        var graphArray = [];
        var chartDictionary = {};
        var chartDataSet = {};
        var labels = [];
        /*====================START 1=======================*/
        var from = moment(this.state.startDate).format('YYYY-MM-DD');
        var to = moment(this.state.endDate).format('YYYY-MM-DD');
        var charts_data = require('./util.js').charts_data;
        localStorage.clear();
        $("#date_range").addClass("disable-class");
        $("#multiselect_div").addClass("disable-class");
        localStorage.setItem('elements_data', JSON.stringify(elements));
        setTimeout(function(){
          Datatable.destroy();
          dataDisplay(elements);
          this.setState({executionData:elements});
          this.sourceFilterValues(elements);
          graphElements(elements);
          this.datatypeFilterValues(graphArray);
          Datatable = window.$('#myTable').DataTable({
                  "searching": false,
                  "lengthChange": false,
                  "pageLength": 10
                    });
        }.bind(this),45000);
        setTimeout(function(){
          Datatable.destroy();
          dataDisplay(elements);
          this.setState({executionData:elements});
          this.sourceFilterValues(elements);
          graphElements(elements);
          this.datatypeFilterValues(graphArray);
          Datatable = window.$('#myTable').DataTable({
                  "searching": false,
                  "lengthChange": false,
                  "pageLength": 10
                    });
        }.bind(this),100000);
        setTimeout(function(){
          Datatable.destroy();
          dataDisplay(elements);
          this.setState({executionData:elements});
          this.sourceFilterValues(elements);
          graphElements(elements);
          this.datatypeFilterValues(graphArray);
          localStorage.setItem('filter_data', JSON.stringify(elements));
          $("#graph_all").show();
          $("#graph_loader, #main_loader").hide();
          chartsDataProcess(elements,chartDictionary,date_elements,labels,chartDataSet)
          localStorage.setItem('graph_filter_data', JSON.stringify(chartDictionary));
          this.setState({labels:labels});
          this.setState({chartData:chartDataSet});
          Datatable = window.$('#myTable').DataTable({
                  "searching": false,
                  "lengthChange": false,
                  "pageLength": 10
                    });
          $('#source_hide').removeClass('show-div');
          $('#loader_div').remove();
          $(".lazy-loader").hide();
          $("#multiselect_div").removeClass("disable-class");
          $("#date_range").removeClass("disable-class");
        }.bind(this),260000);
        dataAll(elements,from,to,"load","update_source","","",chartDictionary);
      }
    }
    function dataDisplay(elements){
      elements = JSON.parse(localStorage.getItem('elements_data'));
      dataProcess(elements);
      console.log('On load dictionary data');
      console.log(elements);
      $('#source_hide').removeClass('show-div');
      $('#loader_div').remove();
    }
    // Charts data process for all
    function chartsDataProcess(elements,chartDictionary,date_elements,labels,chartDataSet){
      var chartHelper = require('./util.js').chartHelper;
      var charts_data = require('./util.js').charts_data;
      // Helper for display charts
      chartDictionary = {};
      window.$.each( elements, function( key, value ) {
        date_elements[key]=[];
        window.$.each( value, function( key_2, value_2 ) {
          //=-=-=-=-=-=-= start graph 
          // var new_date = value[i]["exececution_time"]
          var new_date = moment.parseZone(value_2["exececution_time"]).format('MMM-DD-YY')
          var summary = value_2["summary"]
          if (!chartDictionary.hasOwnProperty(new_date)) {
            chartDictionary[new_date]=[];
          }
          chartDictionary[new_date].push(summary)
          //=-=-=-=-=-=-= end graph
        });
      });
      charts_data(chartDictionary,"cves",labels,chartDataSet)
      localStorage.setItem('charts_elements_data', JSON.stringify(chartDictionary));
      console.log(chartDictionary)
      localStorage.setItem('all_name_source', JSON.stringify(chartDictionary));
      chartHelper(chartDictionary);
      console.log("***************** chart dictionary of from nae of source *****************");
    }
    // End
    var datepicker_timer;
    function dataAll(elements,from,to,type,action_name,name_timer,chartDictionary1,chartDictionary){
      var offset = 0;
      var count = 100;
      var i = 0;
      var last_record = 0;
      var myVar;
      (function loopIt(i) {
        myVar = setTimeout(function(){
          var length;
          var end_time;
          localStorage.setItem('lastDataAll',myVar);
          console.log("Offset"+offset)
          if (to == from) {
            end_time = "23:59:59";
          }
          else
          {
            end_time = "00:00:00";
          }
          axios.get(VariableClass.url+'api/v1/executions?x-auth-token='+sessionStorage.auth+'&offset='+offset+'&limit=100&timestamp_lt='+to+'T'+end_time+'Z&timestamp_gt='+from+'T00:00:00Z&action=riskdb.'+action_name)
          .then(response1 => {
            length = response1.data.length;
            if (length >= 100) {
              offset = (i+1)*100;
              console.log("=====source======"+action_name);
              console.log(response1.data);
              dataCalculate(response1,action_name,chartDictionary);
            }else if (length < 100 && last_record == 0) {
              console.log("=====source===closed==="+action_name);
              console.log("Offset"+offset);
              console.log(response1.data);
              dataCalculate(response1,action_name);
              last_record = 1;
              if(action_name==="update_source"){
                dataAll(elements,from,to,type,"refresh_source","","",chartDictionary);
              }else if(action_name == "refresh_source"){
                dataAll(elements,from,to,type,"parse_scanner_plugins","third","",chartDictionary);
              }else if(action_name === "parse_scanner_plugins" && type === "datepicker"){
                datePickerData();
                clearTimeout(datepicker_timer);
              }
            }
        });
        if(i <= count)  loopIt(i+1)
      }, 24000);
      })(i)
      return elements;
    }
    var dataCodition = require('./util.js').dataCodition;
    function dataCalculate(response1,action_name){
      var error_message = undefined;
      elements = JSON.parse(localStorage.getItem('elements_data'));
      $.each( response1.data, function( key, value ) {
        var new_date = moment.parseZone(value["start_timestamp"]).format('MMM-DD-YY')
        dataCodition(value,elements,action_name,chartDictionary,new_date);
      });
      localStorage.setItem('elements_data', JSON.stringify(elements));
    }

    var calculateCount = require('./util.js').calculateCount;
    function dataProcess(elements){
      $.each( elements, function( key, value ) {
        localStorage.setItem(key,'0');
        localStorage.setItem(key+'fail','0');
      });
      $.each( elements, function( key, value ) {
        $.each( value, function( key2, data ) {
          calculateCount(key,data["status"]);
        });
      });
      var data="";
      $.each( elements, function( key, value ) {
        data = value.sort(function(a, b){
          var dateA=new Date(a.exececution_time), dateB=new Date(b.exececution_time);
          return dateA-dateB;//sort by date ascending
        })
        data = data.reverse();
        elements[key]=[];
        var i = 0;
        for (i = 0; i < data.length; i++) {
          elements[key].push(data[i]);
        } 
      });
    }
    function displayTable(elements){
      var datavalue = require('./util.js').datavalue;
      var onhoverSuccessfulExecution = require('./util.js').onhoverSuccessfulExecution;
      var success = require('./util.js').success;
      var failed = require('./util.js').failed;
      $.each(elements, function(key,data){
        var title_show = "";
        if(data[0]["status"] === "running" ) {
          title_show = moment(onhoverSuccessfulExecution(data)).format('MMMM DD YYYY, hh:mm a')
        } else if(data[0]["error_message"] !== undefined ){
          title_show = data[0]["error_message"].replace(/(<([^>]+)>)/ig,"").replace(/"/g, "").replace(/'/g, "").replace(/<br\s*\/?>/mg,"<br>").replace(/[\n\r]/g,' ');
        }
        $('#myTable tbody').append('<tr key='+data[0]["id"]+
                    ' id='+key+'><td>'+key+
                    '</td><td> <span title="'+ title_show +'" class="'+
                    datavalue(data[0]["status"])+'">'+
                    data[0]["status"]+
                    ' </span></td><td>'+
                    moment.parseZone(data[0]["exececution_time"]).format('MMMM DD YYYY, hh:mm a')+
                    '</td><td>'+success(key)+
                    '/'+failed(key)+'</td></tr>');
      });
    }
    /*===============DatepiCker===============*/
    var elements = {};
    var date_elements = {};
    var start = moment().subtract(7, 'days');
    var end = moment();
    localStorage.startDate = start;
    localStorage.endDate = end;
    window.$("#date_range").click(function (){
      window.$('#date_range').data('daterangepicker').setStartDate(moment(localStorage.startDate).format('MM/DD/YYYY'));
      window.$('#date_range').data('daterangepicker').setEndDate(moment(localStorage.endDate).format('MM/DD/YYYY'));    
    });
    $('#date_range span').html(start.format('MMM D, YYYY') + ' - ' + end.format('MMM D, YYYY'));
    window.$('#date_range').daterangepicker({
        "startDate": start,
        "endDate": end,
        "maxDate": end,
        "autoUpdateInput": true
    });
    $(document).on('click', '.applyBtn', function(ev, picker) {
      var startDate = window.$('#date_range').data('daterangepicker').startDate._d;
      var endDate = window.$('#date_range').data('daterangepicker').endDate._d;
      localStorage.startDate = startDate;
      localStorage.endDate = endDate;
      window.$('#date_range').data('daterangepicker').setStartDate(startDate);
      window.$('#date_range').data('daterangepicker').setEndDate(endDate);
      window.$('#date_range span').html(moment(startDate).format("MMM D, YYYY") + ' - ' + moment(endDate).format("MMM D, YYYY"));
      var from = moment(startDate).format('YYYY-MM-DD');
      var to = moment(endDate).format('YYYY-MM-DD');
      var elements = {};
      localStorage.setItem('elements_data', JSON.stringify(elements));
      for(i=0; i<500; i++)
      {
        window.clearTimeout(i);
      }
      clearTimeout(localStorage.lastExecution);
      clearAllTimeouts();
      chartDictionary = {};
      chartDataSet= {};
      labels = [];
      setTimeout(function(){
        clearTimeout(localStorage.getItem('lastDataAll'));
        var count;
        count = datediff(parseDate(moment(from).format('MM/DD/YYYY')), parseDate(moment(to).format('MM/DD/YYYY')))
        if(to=="Invalid date" || from=="Invalid date"){
          $(".lazy-loading").hide();
          return false;
        }
        $("#graph_all").hide();
        $("#graph_loader, #main_loader").show();
        $(".lazy-loading").show();
        $("#multiselect_div").addClass("disable-class");
        $("#date_range").addClass("disable-class");
        $('ul li').attr('class', " ");
        $("#multi-source option:selected").prop("selected", false);
        document.getElementsByClassName("dropdown-toggle")[0].title = "None selected";
        $('.multiselect-selected-text').text("None selected");
        $('input[type="checkbox"]').prop('checked', false);
        $('.multiselect.dropdown-toggle.btn.btn-default').attr('title', "");
        var type = "datepicker";
        var elements = {};
        var total_time;
        if (count < 5) {
          total_time = (1+count)*32000+50000;
          if (count === 0) { total_time = total_time + 7000 };
          console.log('first');
        }else if(count < 20)
        {
          var total_time = count*38000+40000;
          console.log('second');
        }else
        {
          var total_time = count*40000+40000;
          console.log('third');
        }
        console.log(count);
        console.log('total time in minutes'+(total_time/1000)/60)
        dataAll(elements,from,to,"datepicker","update_source","","",chartDictionary);
        setTimeout(function(){
          console.log("datepicker=====dictionary object======");
          elements = JSON.parse(localStorage.getItem('elements_data'));
          console.log(elements);
          dataProcess(elements);
          Datatable.destroy();
          $('#myTable tbody').empty();
          displayTable(elements);
          Datatable = window.$("#myTable").DataTable({
                        "searching": false,
                        "lengthChange": false,
                        "pageLength": 10
                      });
        },45000);
        setTimeout(function(){
          console.log("datepicker=====dictionary object======");
          elements = JSON.parse(localStorage.getItem('elements_data'));
          console.log(elements);
          dataProcess(elements);
          Datatable.destroy();
          $('#myTable tbody').empty();
          displayTable(elements);
          Datatable = window.$("#myTable").DataTable({
                        "searching": false,
                        "lengthChange": false,
                        "pageLength": 10
                      });
        },total_time/2);
       var datepicker_timer = setTimeout(function(){
          datePickerData();
        },total_time);
      }, 2000);
    });
    function datePickerData(){
      var labels = [];
      var chartDataSet = {};
      console.log("datepicker=====dictionary object======");
      elements = JSON.parse(localStorage.getItem('elements_data'));
      console.log(elements);
      dataProcess(elements);
      $(".lazy-loading").hide();
      $("#multiselect_div").removeClass("disable-class");
      $("#date_range").removeClass("disable-class");
      Datatable.destroy();
      $('#myTable tbody').empty();
      graphElements(elements);
      chartsDataProcess(elements,chartDictionary,date_elements,labels,chartDataSet)
      displayTable(elements)
      $("#graph_all").show()
      $("#graph_loader, #main_loader").hide();
      localStorage.setItem('filter_data', JSON.stringify(elements));
      localStorage.setItem('graph_filter_data', JSON.stringify(chartDictionary));
      Datatable = window.$("#myTable").DataTable({
                    "searching": false,
                    "lengthChange": false,
                    "pageLength": 10
                  });
    }
    var parseDate = require('./util.js').parseDate;
    var datediff = require('./util.js').datediff;
    var i;
    function clearAllTimeouts(){
      if (typeof clearAllTimeouts.last == 'undefined' ) {
        clearAllTimeouts.last = setTimeout("||void",0); // Opera || IE other browsers accept "" or "void"
      }
      var mx = setTimeout("||void",0);
      for(var i=clearAllTimeouts.last;i<=mx;i++){
        clearTimeout(i);
      }
      clearAllTimeouts.last = i;
    }
    function graphElements(elements) {     
      graphArray = [];
      $.each( elements, function( key, value ) {
        $.each( value, function( key_graph, value_graph ) {
          var graph1 = value_graph["summary"];      
          $.each( graph1, function( key, value ) {
            if (graphArray.indexOf(key) == -1) {
              graphArray.push(key);            
            }
          });  
        });       
      });
      var typeOfDataUpdate = require('./util.js').typeOfDataUpdate;
      typeOfDataUpdate(graphArray);
      localStorage.setItem('typeData',JSON.stringify(graphArray))
    }
    $(document).on('change', ':checkbox', function() {
      chartDictionary = {};
      chartDataSet= {};
      labels = [];
      Datatable.destroy();
      $('#myTable tbody').empty();
      var date_elements = {};
      var data_from_source = JSON.parse(localStorage.getItem('filter_data'))
      var selection = document.getElementsByClassName("dropdown-toggle")[0].title;
      if (selection=="None selected"){
        date_elements = data_from_source;
        chartDictionary = JSON.parse(localStorage.getItem('all_name_source'));
      }
      else
      {
        $.each( data_from_source, function( key, value ) {
          $.each( selection.split(','), function(key_selection,value_selection ) {
            if(value_selection.trim()==key)
            {
              date_elements[key]=[];
              var i = 0;
              for (i = 0; i < value.length; i++) {
                date_elements[key].push(value[i])
                //=-=-=-=-=-=-= start graph 
                var new_date = value[i]["exececution_time"];
                new_date = moment.parseZone(new_date).format('MMM-DD-YY');
                var summary = value[i]["summary"];
                if (!chartDictionary.hasOwnProperty(new_date)) {
                  chartDictionary[new_date]=[];
                }
                chartDictionary[new_date].push(summary);
                //=-=-=-=-=-=-= end graph
              }
            }
          });
        });
      }
      var chartHelper = require('./util.js').chartHelper;
      localStorage.setItem('charts_elements_data', JSON.stringify(chartDictionary));
      var charts_data = require('./util.js').charts_data;
      charts_data(chartDictionary,"cves",labels,chartDataSet);
      chartHelper(chartDictionary);
      dataProcess(date_elements);
      displayTable(date_elements);
      Datatable = window.$("#myTable").DataTable({
                    "searching": false,
                    "lengthChange": false,
                    "pageLength": 10
        });
      $(".lazy-loader").hide();
    });
    // end of name of source function
    //Graph methods
    var graph_counts = [2,3,4,5,6];
    var graph_closed = [];
    var displayCharts = require('./util.js').displayCharts;
    $("#plus_button").click(function(){
      var id = this.id;
      var number_range = graph_counts[0];
      var title;
      var exists = true ;
      if (graph_closed.indexOf(number_range) != -1) {
        $('#select_'+number_range+' option').each(function(){
          if (this.value == '#') {
            exists = false;
          }
        });
        if (exists) {
          $("#select_"+number_range).prepend('<option className="type-data-option" selected value="#">None selected</option>')
        }else{
          $("#select_"+number_range).val($('#select_'+number_range+' option:first').val());
        }
        displayCharts("canvas_charts_"+number_range,[],{},"#",number_range);
      };
      graph_counts.shift();
      title = "label_"+(parseInt(number_range));
      $("#"+title).show();
      var number = "chart_"+number_range;
      $("#"+number).show();
      var line_number = "new_line_"+number_range;
      $("#"+line_number).show();
      number = "next_"+(parseInt(number_range)+1);
      $("#"+number).show();
      number = "button_"+(parseInt(number_range)+1);
      var chart_number = "chart_"+(parseInt(number_range)+1);
      if ($("#"+chart_number).is(":hidden")) {
        $("#"+number).show();
      };
      number = "hide_"+(parseInt(number_range));
      $("#"+number).show();
      number = "type_"+(parseInt(number_range));
      $("#"+number).show();
      if (graph_counts.length === 0) {
        $("#plus_button").hide();
      };
    });
    $(".hide_graph_button").click(function(){
      var id = this.id;
      var number_range = id.split("_")[1];
      graph_counts.push(parseInt(number_range));
      graph_closed.push(parseInt(number_range));
      console.log(graph_counts);
      var number = "chart_"+number_range;
      var title;
      $("#"+number).hide();
      number = "type_"+number_range;
      $("#"+number).hide();
      title = "label_"+number_range;
      $("#"+title).hide();
      var type = "hide_"+number_range;
      $("#"+type).hide();
      var hide_line = "new_line_"+number_range;
      $("#"+hide_line).hide();
      if (graph_counts.length !== 0) {
        $("#plus_button").show();
      };
    });
    //End of Graph methods
  }
  logout = () => {
    sessionStorage.setItem('auth','');
    sessionStorage.clear();
    this.setState({redirect: true});
  }
  
  /* Function for dynamic name of source values */
  sourceFilterValues = (elements) => {
    var sourceArray = elements;
    var sourceArray = Object.keys(sourceArray);
    var newValues = {};
    var newGroups = [];
    $.each(sourceArray, function( index, sourceValue ) {
      newValues = {value: sourceValue, label:sourceValue}
      newGroups.push(newValues);
    });
    setTimeout(function(){
      this.setState({groups:newGroups.sort((a, b) => a.value.localeCompare(b.value))});
    }.bind(this),1);    
  }

  datatypeFilterValues = (elements)  => {
    var sourceArray = elements;
    var newValues = {};
    var newGroups = [];
    $.each(sourceArray, function( index, sourceValue ) {
      newValues = {value: sourceValue, label:sourceValue}
      newGroups.push(sourceValue);
    });
    var typeOfDataUpdate = require('./util.js').typeOfDataUpdate;
    typeOfDataUpdate(newGroups);
    localStorage.setItem('typeData',JSON.stringify(newGroups));
  }
  handleClick(id) {
    if(id.indexOf("data")!==-1) {
      $("#data_div").slideToggle();
      $("#data_sign_plus").toggle();
      $("#data_sign_minus").toggle();
    }
    if(id.indexOf("search")!==-1) {
      $("#source_div").slideToggle();
      $("#source_sign_plus").toggle();
      $("#source_sign_minus").toggle();
    }
  }
  handleChange(event) {
    var singleSelectChange = require('./util.js').singleSelectChange;
    singleSelectChange(event.target.name, event.target.value);
  }
  render() {
    var {status} = '';
    var {nameSource} = '';
    var {count} = 0;
    var {exececution_time} = '';
    var onhoverSuccessfulExecution = require('./util.js').onhoverSuccessfulExecution;
    if(this.state.redirect) {
      return(<Redirect to={'/'} />);
    }
    var rows = Object.entries(this.state.executionData).map(([key,value])=>{
    if (value[0]["status"] === "running" ) {
      var title_show = moment(onhoverSuccessfulExecution(value)).format('MMMM DD YYYY, hh:mm a');
    } else {
      if (value[0]["error_message"] != undefined ) {
        var title_show = value[0]["error_message"].replace(/(<([^>]+)>)/ig,"").replace(/"/g, "").replace(/'/g, "").replace(/<br\s*\/?>/mg,"<br>").replace(/[\n\r]/g,' ');
      }
    }

    if (value[0]["status"] == "succeeded") {
      exececution_time = value[0]["exececution_time"];
    } else {
      value.map((item, index) => {
        if (item["status"]=="succeeded") {
          exececution_time = item["execution_time"];
          return true;
        }
        else
        {
          exececution_time = value[0]["exececution_time"];
        }
      })
    }
    return (
          <tr key={key} id={key}>
            <td>{key}</td>
            <td><span title={title_show} className={(() => {
                switch (value[0]["status"]) {
                  case "succeeded": return "label label-success  label-btn robot-font";
                  case "running": return "label label-primary  label-btn robot-font";
                  case "failed": return "label label-danger  label-btn robot-font";
                  case "ERROR": return "label label-danger  label-btn robot-font";
                  case "canceling": return "label label-secondary  label-btn robot-font";
                  case "canceled": return "label label-warning  label-btn robot-font";
                  case "disabled": return "label label-default  label-btn robot-font";
                  default: return "label label-light  label-btn robot-font";
                }
              })()}>{value[0]["status"]}</span></td>
            <td>{moment.parseZone(exececution_time).format('MMMM DD YYYY, hh:mm a')}</td>
            <td>{localStorage.getItem(key)}/{localStorage.getItem(key+"fail")}</td>
          </tr>
        )
     })
    return (
      <div className="App ">
        <div className="row text-center" id="loader_div">
          <p className="img-loader text-center robot-font"><i className="fa fa-spinner fa-spin main-loader"></i></p>
        </div>
        <div id="source_hide">
          <header>
            <div className="row">
              <div className="col-md-1 col-sm-1 col-lg-1 col-xs-1">                
                <img src={logo} className="App-logo" alt="logo" />
              </div>
              <div className="col-md-10 col-sm-10 col-lg-10 col-xs-10">
                <p className="header-text robot-font"> RiskFusion JobScheduler Dashboard</p>
              </div>            
              <div className="col-md-1 col-sm-1 col-lg-1 col-xs-1 logout-button-div">                
                <button type="button" id="logout" className="btn btn-success robot-font" onClick={this.logout} >Logout</button>
              </div>
            </div>
          </header>
          <div className="empty-div"></div>
          <div className="custom-sticky">
            <div className="row">
              <div className="col-sm-7">
                <label className="input-label robot-font from-label">From Date</label>
                <label className="input-label robot-font to-label">To Date</label>
                <div className="row">
                  <div name="daterange" id="date_range" style={{background: '#fff', cursor: 'pointer', padding: '5px 10px', border: '1px solid #ccc', width: '60%'}}>
                    <span></span>
                    &nbsp;<i className="fa fa-calendar"></i>
                  </div>
                </div>
              </div>
              <div className="col-sm-1"></div>
              <div className="col-sm-4">
                <label className="input-label robot-font">Name of Source</label>
                <div id="multiselect_div">
                  <Multiselect data={this.state.groups} multiple id="multi-source" />
                </div>
              </div>
            </div>
          </div>
          <div className="container container-dash">
            <div className="row">
            </div>
            <div className="row" id="main_loader">
              <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                <i className="fa fa-spinner fa-spin table-loader main_loader"></i>
              </div>
             </div>
            <div className="col-md-8 margin-auto card-panel">
            <div className="body-card">
              <div className="col-md-12 col-sm-12 col-lg-12 col-xs-12 margin-top toggle-box">
                <button type="button" id ="search_show" className="robot-font btn btn-secondary btn-block btn-lg" onClick={(e) => this.handleClick("search_show")}>
                Source Status <strong  className="stick-right"><span id="source_sign_plus" className="fa fa-plus"></span><span id="source_sign_minus" className="fa fa-minus"></span></strong> </button>
                <div id="source_div" className="text-center col-md-12 col-sm-12 col-xs-12">
                  <div className="row lazy-loader ">
                    <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                      <i className="fa fa-spinner fa-spin table-loader"></i>
                    </div>
                  </div>
                  <div className="row lazy-loading">
                    <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                      <i className="fa fa-spinner fa-spin table-loader"></i>
                    </div>
                  </div>
                  <table className="table table-bordered table-striped table-responsive t-table" id="myTable">
                    <thead>
                      <tr>
                        <th className="table-heading-color th-name robot-font">Name <i className="fa fa-sort"></i></th>
                        <th className="table-heading-color th-status robot-font">Status <i className="fa fa-sort"></i></th>
                        <th className="table-heading-color th-last-sucessful robot-font">Last Successful Execution <i className="fa fa-sort"></i></th>
                        <th className="table-heading-color th-no-sucess robot-font">Number of Successful/Failed Execution <i className="fa fa-sort"></i></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="col-md-12 col-sm-12 col-lg-12 col-xs-12 margin-top toggle-box">
                <button type="button" id ="data_show" className="robot-font btn btn-secondary btn-block btn-lg" onClick={(e) => this.handleClick("data_show")} >
                Data Visualization <strong className="stick-right"><span id="data_sign_plus" className="fa fa-plus"></span><span id="data_sign_minus" className="fa fa-minus"></span></strong> </button>
                <div id="data_div" className="text-center col-md-12 col-sm-12 col-xs-12">
                  <div className="row" id="graph_loader">
                    <div className="col-md-12 col-sm-12 col-xs-12 text-center">
                      <i className="fa fa-spinner fa-spin table-loader graph_loader"></i>
                    </div>
                  </div>
                  <div id="graph_all">
                    <div className="row">
                      <div className="col-sm-12">
                        <div className="row">
                          <div className="col-sm-3">
                            <label className="input-label robot-font" id="label_1">Type of Data</label>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-sm-6" id="type_1">
                            <select id="select_1" name="canvas_charts_1" className="type-data form-control" onChange={this.handleChange}></select>
                          </div>
                          <div className="col-sm-6">
                            <button id="hide_1" className="hide_graph_button close_graph"> <strong><span id="" className="fa fa-close"></span></strong> </button>
                          </div>
                        </div>
                        <div id="chart_1"><canvas id="canvas_charts_1"/></div>
                      </div>
                    </div>
                    <hr id="new_line_1" />
                    <div className="row" id="next_2">
                      <div className="row">
                        <div>
                          <label className="input-label robot-font" id="label_2">Type of Data</label>
                        </div>
                      </div>
                      <div className="col-sm-12">
                        <div className="row">
                          <div className="col-sm-6" id="type_2">
                            <select id="select_2" name="canvas_charts_2" className="type-data form-control" onChange={this.handleChange}></select>
                          </div>
                          <div className="col-sm-6">
                            <button id="hide_2" className="hide_graph_button close_graph"> <strong><span id="" className="fa fa-close"></span></strong> </button>
                          </div>
                        </div>
                        <div id="chart_2"><canvas id="canvas_charts_2"/></div>
                      </div>
                    </div>
                    <hr id="new_line_2" />
                    <div className="row" id="next_3">
                      <div className="row">
                        <div>
                          <label className="input-label robot-font" id="label_3">Type of Data</label>
                        </div>
                      </div>
                      <div className="col-sm-12">
                        <div className="row">
                          <div className="col-sm-6" id="type_3">
                            <select id="select_3" name="canvas_charts_3" className="type-data form-control" onChange={this.handleChange}></select>
                          </div>
                          <div className="col-sm-6">
                            <button id="hide_3" className="hide_graph_button close_graph"> <strong><span id="" className="fa fa-close"></span></strong> </button>
                          </div>
                        </div>
                        <div id="chart_3"><canvas id="canvas_charts_3"/></div>
                      </div>
                    </div>
                    <hr id="new_line_3" />
                    <div className="row" id="next_4">
                      <div className="row">
                        <div>
                          <label className="input-label robot-font" id="label_4">Type of Data</label>
                        </div>
                      </div>
                      <div className="col-sm-12">
                        <div className="row">
                          <div className="col-sm-6" id="type_4">
                            <select id="select_4" name="canvas_charts_4" className="type-data form-control" onChange={this.handleChange}></select>
                          </div>
                          <div className="col-sm-6">
                            <button id="hide_4" className="hide_graph_button close_graph"> <strong><span id="" className="fa fa-close"></span></strong> </button>
                          </div>
                        </div>
                        <div id="chart_4"><canvas id="canvas_charts_4" /></div>
                      </div>
                    </div>
                    <hr id="new_line_4" />
                    <div className="row" id="next_5">
                      <div className="row">
                        <div>
                          <label className="input-label robot-font" id="label_5">Type of Data</label>
                        </div>
                      </div>
                      <div className="col-sm-12">
                        <div className="row">
                          <div className="col-sm-6" id="type_5">
                            <select id="select_5" name="canvas_charts_5" className="type-data form-control" onChange={this.handleChange}></select>
                          </div>
                          <div className="col-sm-6">
                            <button id="hide_5" className="hide_graph_button close_graph"> <strong><span id="" className="fa fa-close"></span></strong> </button>
                          </div>
                        </div>
                        <div id="chart_5"><canvas id="canvas_charts_5"/></div>
                      </div>
                    </div>
                    <hr id="new_line_5" />
                    <div className="row" id="next_6">
                      <div className="row">
                        <div>
                          <label className="input-label robot-font" id="label_6">Type of Data</label>
                        </div>
                      </div>
                      <div className="col-sm-12">
                        <div className="row">
                          <div className="col-sm-6" id="type_6">
                            <select id="select_6" name="canvas_charts_6" className="type-data form-control" onChange={this.handleChange}></select>
                          </div>
                          <div className="col-sm-6">
                            <button id="hide_6" className="hide_graph_button close_graph"> <strong><span id="" className="fa fa-close"></span></strong> </button>
                          </div>
                        </div>
                        <div id="chart_6"><canvas id="canvas_charts_6"/></div>
                      </div>
                    </div>
                    <hr id="new_line_6" />
                    <button id="plus_button" className="show_graph_button add_graph"> <strong><span id="" className="fa fa-plus"></span></strong> </button>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
          <div>
            <div className="footer footer-color">
              <p className="white-color robot-font">&copy; 2018 RiskSense, Inc. All rights reserved</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

