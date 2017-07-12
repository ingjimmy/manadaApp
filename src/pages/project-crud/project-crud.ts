import { Component, ViewChild, Renderer } from '@angular/core';
import { NavParams, ViewController, Content, Footer, Platform } from "ionic-angular";
import { Keyboard } from '@ionic-native/keyboard';

import { Configuration } from './../../configuration/configuration';
import { ProjectService, MainService, HelperService } from "../../services";
import { AlertHelper } from "../../helpers/alert-helper";

@Component({
    templateUrl: 'project-crud.html'
})
export class ProjectCrudComponent {
    public model: any = {};
    public updateProject: any;
    public isBusy: boolean = false;
    @ViewChild(Content) content: Content;
    @ViewChild(Footer) footer: Footer;
    public keyboardHideSub: any;
    public keyboardShowSub: any;
    constructor(
        public params: NavParams,
        public viewCtrl: ViewController,
        private projectService: ProjectService,
        private mainService: MainService,
        private alertHelper: AlertHelper,
        private helperService: HelperService,
        private keyboard: Keyboard,
        public renderer: Renderer,
        public platform: Platform) {
        this.model.name = '';
        this.updateProject = params.get('project');
        if (this.updateProject != undefined) {
            this.model.name = this.updateProject.name;
            this.model.projectID = this.updateProject.projectID;
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
            if (this.updateProject != undefined) {
                this.projectService.update(this.model).subscribe(data => {
                    this.updateProject.projectID = this.model.projectID;
                    this.updateProject.name = this.model.name;
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
                let flag: string = this.model.name;
                let count: number = 1;

                while (this.mainService.projects.find(t => t.name == flag) != undefined) {
                    flag = `${count} ${this.model.name}`;
                    count++;
                }

                this.model.name = flag;

                this.projectService.add(this.model).subscribe(data => {
                    this.mainService.bindProjects();
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