import { Component } from '@angular/core';
import { NavParams, ViewController } from "ionic-angular";

import { UserModel } from "../../models";
import { UserService, MainService, HelperService } from "../../services";
import { AlertHelper } from "../../helpers/alert-helper";
import { Configuration } from "../../configuration/configuration";

@Component({
    templateUrl: 'user-crud.html'
})
export class UserCrudComponent {
    public model: UserModel = new UserModel();
    public updateUser:any;
    public isBusy:boolean = false;

    constructor(        
        public params: NavParams,
        public viewCtrl: ViewController,
        private userService: UserService,
        private mainService: MainService,
        private alertHelper: AlertHelper,
        private helperService: HelperService
    ) {
        this.updateUser = params.get('user');
        if (this.updateUser != undefined) {
            this.model.userID = this.updateUser.userID;
            this.model.email = this.updateUser.email;
            this.model.names = this.updateUser.names;
        }
    }

    public dismiss(): void {
        this.viewCtrl.dismiss();
    }

    public send(form: any): void {
        if (form.valid && !this.isBusy) {
            this.isBusy = true;
            if (this.params.get('user') != undefined) {
                this.userService.update(this.model).subscribe(data => {
                    this.updateUser.email = this.model.email;
                    this.updateUser.names = this.model.names;
                    this.isBusy = false;
                    this.dismiss();
                }, error => {
                    let message = error.json();
                    if (message.message != undefined) {
                        this.alertHelper.alert(message.message);
                    } else {
                        this.helperService.presentToastMessage(Configuration.ErrorMessage);
                    }
                    this.isBusy = false;
                    this.dismiss();
                });
            } else {
                this.userService.add(this.model).subscribe(data => {
                    this.mainService.bindUsers();
                    this.isBusy = false;
                    this.dismiss();
                }, error => {
                    let message = error.json();
                    if (message.message != undefined) {
                        this.alertHelper.alert(message.message);
                    } else {
                        this.helperService.presentToastMessage(Configuration.ErrorMessage);
                    }
                    this.isBusy = false;
                    this.dismiss();
                });
            }
        }
    }
}