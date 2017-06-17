import { Component } from '@angular/core';
import { Platform, NavParams, ViewController } from "ionic-angular";
import { UserModel } from "../../models/user-model";
import { UserService, MainService, HelperService } from "../../services/index";

@Component({
    templateUrl: 'user-crud.html'
})
export class UserCrudComponent {
    model: UserModel = new UserModel();

    updateUser:any;

    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController,
        private userService: UserService,
        private mainService: MainService,

        private helperService: HelperService
    ) {
        this.updateUser = params.get('user');
        if (this.updateUser != undefined) {
            this.model.userID = this.updateUser.userID;
            this.model.email = this.updateUser.email;
            this.model.names = this.updateUser.names;
        }
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    send(form: any) {
        if (form.valid) {
            if (this.params.get('user') != undefined) {
                this.userService.update(this.model).subscribe(data => {
                    this.updateUser.email = this.model.email;
                    this.updateUser.names = this.model.names;
                    this.dismiss();
                }, error => {
                    let message = error.json();
                    if (message.message != undefined) {
                        this.helperService.alert(message.message);
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
                        this.helperService.alert(message.message);
                    }
                    this.dismiss();
                });
            }
        }
    }
}