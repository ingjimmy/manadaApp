import { Component } from '@angular/core';
import * as moment from 'moment';
import { ViewController, NavParams } from "ionic-angular";
import { ActionModel } from "../../models/action-model";

@Component({
    templateUrl: 'calendar.html'
})
export class CalendarComponent {
    public weeks: Array<Array<any>> = new Array<Array<any>>();
    public monthName: string = null;
    public date: any;
    public currentDay: any;
    public currentDate: any;
    public year: any;
    public weekdays: Array<string> = new Array<string>();
    public model: ActionModel = new ActionModel();

    constructor(
        public viewCtrl: ViewController,
        public params: NavParams) {
        this.model = params.get('action');
        this.currentDate = new Date();
        this.currentDay = moment(this.currentDate).format('YYYY/MM/DD');
        
        if (this.model.dueDate != undefined) {
            this.date = moment(this.model.dueDate, 'YYYY/MM/DD').toDate();
        } else {
            this.date = new Date();
        }
        [].forEach.call(moment().localeData().weekdays(), d => {
            this.weekdays.push(d.toUpperCase()[0]);
        });
        this.bind();
    }

    public bind(): void {
        let currentMonth = this.date.getMonth();
        this.monthName = moment(this.date).format('MMMM');
        this.year = this.date.getFullYear();

        let firstDayOfMonth = new Date(this.date.getFullYear(), currentMonth, 1).getDay();
        let numberOfDays = moment(this.date).daysInMonth();
        let numberOfWeeks = Math.ceil(numberOfDays / 7) + 1;

        var numberDay = 1;
        for (var i = 0; i < numberOfWeeks; i++) {
            this.weeks[i] = [];
            for (var j = 0; j < 7; j++) {
                if (i == 0 && j < firstDayOfMonth) {
                    this.weeks[i][j] = { date: null, day: null };
                } else {
                    if (numberDay <= numberOfDays) {
                        this.weeks[i][j] = { date: moment(new Date(this.date.getFullYear(), currentMonth, numberDay)).format('YYYY/MM/DD'), day: numberDay };
                        numberDay++;
                    } else {
                        this.weeks[i][j] = { date: null, day: null };
                    }
                }
            }
        }
    }

    public back(): void {
        this.date = moment(this.date).subtract(1, 'months').toDate();
        this.bind();
    }

    public next(): void {
        this.date = moment(this.date).add(1, 'months').toDate();
        this.bind();
    }

    public setDate(date:any): void {
        this.model.dueDate = date.date;
        this.dismiss();
    }

    public dismiss(): void {
        this.viewCtrl.dismiss();
    }

    public tapEvent(event): void {
        if (event.direction == 2) {
            this.back();
        } else {
            this.next();
        }
    }
}