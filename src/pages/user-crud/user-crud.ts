import { Component, ViewChild, Renderer } from '@angular/core';
import { NavParams, ViewController, Content, Footer, Platform } from "ionic-angular";

import { UserModel } from "../../models";
import { UserService, MainService, HelperService } from "../../services";
import { AlertHelper } from "../../helpers/alert-helper";
import { Configuration } from "../../configuration/configuration";
import { Keyboard } from "@ionic-native/keyboard";

@Component({
    templateUrl: 'user-crud.html'
})
export class UserCrudComponent {
    public model: UserModel = new UserModel();
    public updateUser: any;
    public isBusy: boolean = false;
    @ViewChild(Content) content: Content;
    @ViewChild(Footer) footer: Footer;
    public keyboardHideSub: any;
    public keyboardShowSub: any;

    constructor(
        public params: NavParams,
        public viewCtrl: ViewController,
        private userService: UserService,
        private mainService: MainService,
        private alertHelper: AlertHelper,
        private helperService: HelperService,
        private keyboard: Keyboard,
        public renderer: Renderer,
        public platform: Platform) {
        this.updateUser = params.get('user');
        if (this.updateUser != undefined) {
            this.model.userID = this.updateUser.userID;
            this.model.email = this.updateUser.email;
            this.model.names = this.updateUser.names;
        }
    }

    public ionViewDidLoad(): void {
        if (this.platform.is('ios')) {
            this.addKeyboardListeners()

            let scrollContentElelment = this.content.getScrollElement();

            scrollContentElelment.style.cssText = scrollContentElelment.style.cssText + "transition: all " + 200 + "ms; -webkit-transition: all " +
                200 + "ms; -webkit-transition-timing-function: ease-out; transition-timing-function: ease-out;";
        }
    }

    private addKeyboardListeners(): void {
        let scrollContentElelment = this.content.getScrollElement();
        let footerElement = this.footer.getNativeElement();

        this.keyboardHideSub = this.keyboard.onKeyboardHide().subscribe((e) => {
            this.renderer.setElementStyle(scrollContentElelment, 'marginBottom', '44px');
            this.renderer.setElementStyle(footerElement, 'marginBottom', '0px');
        });

        this.keyboardShowSub = this.keyboard.onKeyboardShow().subscribe((e) => {
            let newHeight = (e['keyboardHeight']);
            let marginBottom = newHeight + 44 + 'px';
            this.renderer.setElementStyle(scrollContentElelment, 'marginBottom', marginBottom);
            this.renderer.setElementStyle(footerElement, 'marginBottom', newHeight + 'px');
            setTimeout(() => {
                this.content.scrollToBottom();
            }, 200);
        });
    }

    public dismiss(): void {
        this.keyboard.close();
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

    public footerTouchStart(event): void {
        if (event.target.localName !== "input" && event.target.localName !== "button") {
            event.preventDefault();
        }
    }
}