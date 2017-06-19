import { Component } from '@angular/core';
import { NavParams, ViewController } from "ionic-angular";
import { UserModel } from "../../models/user-model";
import { UserService, MainService } from "../../services/index";
import { AlertHelper } from "../../helpers/alert-helper";

@Component({
    templateUrl: 'user-crud.html'
})
export class UserCrudComponent {
    public model: UserModel = new UserModel();

    public updateUser:any;

    constructor(
        public params: NavParams,
        public viewCtrl: ViewController,
        private userService: UserService,
        private mainService: MainService,
        private alertHelper: AlertHelper
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
        if (form.valid) {
            if (this.params.get('user') != undefined) {
                this.userService.update(this.model).subscribe(data => {
                    this.updateUser.email = this.model.email;
                    this.updateUser.names = this.model.names;
                    this.dismiss();
                }, error => {
                    let message = error.json();
                    if (message.message != undefined) {
                        this.alertHelper.alert(message.message);
                    }
                    this.dismiss();
                });
            } else {
                this.userService.add(this.model).subscribe(data => {
                    this.mainService.bindUsers();
                    this.dismiss();
                }, error => {
                    let message = error.json();
                    if (message.message != undefined) {
                        this.alertHelper.alert(message.message);
                    }
                    this.dismiss();
                });
            }
        }
    }
}