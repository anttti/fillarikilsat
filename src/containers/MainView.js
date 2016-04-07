import React, { Component } from 'react';
import moment from 'moment';
import Highcharts from 'highcharts';
import ReactHighcharts from 'react-highcharts';

import Firebase from 'firebase';
import AppBar from 'material-ui/lib/app-bar';
import DatePicker from 'material-ui/lib/date-picker/date-picker';
import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';

import Table from 'material-ui/lib/table/table';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableHeader from 'material-ui/lib/table/table-header';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import TableBody from 'material-ui/lib/table/table-body';

import areIntlLocalesSupported from 'intl-locales-supported';

const ROOT_URL = 'https://brilliant-torch-3113.firebaseio.com/entry';
const DATE_FORMAT = 'YYYY-MM-DD';

let DateTimeFormat;
if (areIntlLocalesSupported('fi')) {
  DateTimeFormat = global.Intl.DateTimeFormat;
} else {
  const IntlPolyfill = require('intl');
  require('intl/locale-data/jsonp/fi');
  DateTimeFormat = IntlPolyfill.DateTimeFormat;
}

class MainView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: moment(),
      distance: 0,
      entries: []
    };
    this.onDateChange = this.onDateChange.bind(this);
    this.onDistanceChange = this.onDistanceChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillMount() {
    this.firebaseRef = new Firebase(ROOT_URL);
    this.firebaseRef.orderByChild('date').once('value', initialData => {
      const entries = [];
      initialData.forEach(entry => {
        entries.push({
          date: moment(entry.val().date, DATE_FORMAT),
          distance: entry.val().distance
        });
      });
      this.setState({ entries });
    });
  }

  onDateChange(e, date) {
    this.setState({ date: moment(date) });
  }

  onDistanceChange(e, str) {
    this.setState({ distance: str });
  }

  onSubmit() {
    const date = this.state.date.format(DATE_FORMAT);
    const distance = parseInt(this.state.distance, 10);

    this.firebaseRef.push({ date, distance });
    this.setState({
      entries: this.state.entries.concat([{
        date: this.state.date,
        distance
      }])
    });
  }

  render() {
    const dates = this.state.entries.map(entry => entry.date.format('D.M.'));

    const dayChartConfig = {
      title: { text: 'Päivittäinen edistyminen' },
      xAxis: { categories: dates },
      series: [
        { data: this.state.entries.map(entry => entry.distance) }
      ]
    };

    const cumulativeDistance = this.state.entries
      .map(entry => entry.distance)
      .reduce((acc, curr) => {
        const next = acc[acc.length - 1] + curr;
        return acc.concat([next]);
      }, [0]);

    const cumulativeChartConfig = {
      title: { text: 'Kumulatiivinen edistyminen' },
      xAxis: { categories: dates },
      series: [
        { data: cumulativeDistance.slice(1, cumulativeDistance.length) }
      ]
    };

    return (
      <div>
        <AppBar title="Fillarikilsat" iconElementLeft={<div></div>} />
        <section className="main-content">
          <div>
            <DatePicker
              DateTimeFormat={DateTimeFormat}
              okLabel="OK"
              cancelLabel="Peruuta"
              firstDayOfWeek={1}
              locale="fi"
              hintText="Päivämäärä"
              floatingLabelText="Päivämäärä"
              onChange={this.onDateChange}
              value={this.state.date.toDate()}
            />
            <TextField
              hintText="Kilometrit"
              floatingLabelText="Kilometrit"
              onChange={this.onDistanceChange}
              value={this.state.distance}
            />
          </div>
          <div>
            <RaisedButton
              label="Tallenna"
              primary={true}
              onMouseUp={this.onSubmit}
            />
          </div>
        </section>
        <section className="side-content">
          <Table>
            <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
              <TableRow>
                <TableHeaderColumn>Pvm</TableHeaderColumn>
                <TableHeaderColumn>Kilometrit</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {this.state.entries.map((entry, i) =>
                <TableRow key={`entry-${i}`}>
                  <TableRowColumn>{entry.date.format('D.M.YYYY')}</TableRowColumn>
                  <TableRowColumn>{entry.distance}</TableRowColumn>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>
        <ReactHighcharts config={dayChartConfig}></ReactHighcharts>
        <ReactHighcharts config={cumulativeChartConfig}></ReactHighcharts>
      </div>
    );
  }
}

export default MainView;
