import { Component, ViewChild, Renderer } from '@angular/core';
import { Platform, NavParams, ViewController, ModalController, Content } from "ionic-angular";
import { ActionModel } from "../../models/action-model";
import { MainService, ActionService } from "../../services/index";
import { CalendarComponent } from "../calendar/calendar";
import { Keyboard } from '@ionic-native/keyboard';
import { Configuration } from "../../configuration/configuration";
import { CameraHelper } from "../../helpers/camera-helper";
import { AlertHelper } from "../../helpers/alert-helper";
import * as moment from 'moment';

@Component({
    templateUrl: 'action-crud.html'
})
export class ActionCrudComponent {
    @ViewChild('inputname') myInput;
    @ViewChild('subject') subject;
    @ViewChild(Content) content: Content;
    public model: ActionModel = new ActionModel();
    public updateAction: any;
    public users: Array<any> = new Array<any>();
    public projects: Array<any> = new Array<any>();
    public username: string;
    public projectname: string;
    public keyboardHideSub: any;
    public keyboardShowSub: any;
    public rootPath: string;
    public showAnimate: boolean = false;
    public isBusy: boolean = false;
    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController,
        public modalCtrl: ModalController,
        public mainService: MainService,
        private alertHelper: AlertHelper,
        private actionService: ActionService,
        private keyboard: Keyboard,
        public renderer: Renderer,
        private cameraHelper: CameraHelper) {
        this.rootPath = Configuration.Url;

        this.updateAction = params.get('action');
        if (this.updateAction != undefined) {
            this.actionService.get(this.updateAction.actionID).subscribe(data => {
                this.model = data.json();
                if (this.model.dueDate != null) {
                    this.model.dueDate = moment(this.model.dueDate, 'YYYY/MM/DD HH:mm:ss').format('YYYY/MM/DD');
                }
                this.subject.nativeElement.innerHTML = this.model.subject;
            }, error => {
                console.log(error);
            });
        } else {
            if (this.mainService.actionFilter.projectID != null) {
                let project = this.mainService.projects.find(t => t.projectID == this.mainService.actionFilter.projectID != null);
                if (project != undefined) {
                    this.model.projects.push(project);
                }                
            }

            if (this.mainService.actionFilter.userID != null) {
                let user = this.mainService.users.find(t => t.userID == this.mainService.actionFilter.userID != null);
                if (user != undefined) {
                    this.model.assignedUsers.push(user);
                }
            }
        }
    }

    public ionViewDidLoad(): void {
        if (this.platform.is('ios')) {
            this.addKeyboardListeners()

            let scrollContentElelment = this.content.getScrollElement();

            scrollContentElelment.style.cssText = scrollContentElelment.style.cssText + "transition: all " + 200 + "ms; -webkit-transition: all " +
                200 + "ms; -webkit-transition-timing-function: ease-out; transition-timing-function: ease-out;"
        }
    }

    public dismiss(): void {
        this.viewCtrl.dismiss();
    }

    private addKeyboardListeners(): void {
        let scrollContentElelment = this.content.getScrollElement();

        this.keyboardHideSub = this.keyboard.onKeyboardHide().subscribe(() => {
            let newHeight = 44;
            let marginBottom = newHeight + 'px';
            this.renderer.setElementStyle(scrollContentElelment, 'marginBottom', marginBottom);
        });

        this.keyboardShowSub = this.keyboard.onKeyboardShow().subscribe((e) => {
            let newHeight = (e['keyboardHeight']);
            let marginBottom = newHeight + 44 + 'px';
            this.renderer.setElementStyle(scrollContentElelment, 'marginBottom', marginBottom);
        });
    }

    public send(form: any): void {
        if (this.subject.nativeElement.innerHTML != '' && !this.isBusy) {
            this.model.subject = this.subject.nativeElement.innerHTML;
            this.isBusy = true;
            if (this.model.actionID != null) {
                this.actionService.update(this.model).subscribe(data => {
                    let call = this.params.get('call');
                    if (call != undefined) {
                        call.call(null, this.model); 
                    }

                    let act = this.mainService.actions.find(t => t.actionID == this.model.actionID);
                    let index = this.mainService.actions.indexOf(act);
                    this.mainService.actions.splice(index, 1);
                    this.mainService.actions.splice(0, 0, data.json());
                    this.dismiss();
                    this.isBusy = false;
                }, error => {
                    this.dismiss();
                    this.isBusy = false;
                    console.log(error);
                });
            } else {
                this.actionService.add(this.model).subscribe(data => {
                    this.isBusy = false;
                    let result = data.json();
                    this.model.actionID = result.actionID;
                    this.showAnimate = true;
                    this.keyboard.close();
                    
                    let push: boolean = false;

                    if (result.assignedUsers.length > 0) {
                        for (let index = 0; index < result.assignedUsers.length; index++) {
                            let user = this.mainService.users.find(t => t.userID == result.assignedUsers[index].userID);
                            user.countActiveActions++;

                            if (user.userID == this.mainService.actionFilter.userID) {
                                push = true;
                            }
                        }
                    }

                    if (result.projects.length > 0) {
                        let project = this.mainService.projects.find(t => t.projectID == result.projects[0].projectID);
                        project.countActions++;

                        if (project.projectID == this.mainService.actionFilter.projectID) {
                            push = true;
                        }
                    }

                    if (this.mainService.actionFilter.userID == null && this.mainService.actionFilter.projectID == null) {
                        push = true;
                    }

                    if (push) {
                        this.mainService.actions.unshift(result);
                        this.mainService.countAll++;
                    }
                    setTimeout(() => {
                        this.dismiss();
                    }, 2050);

                }, error => {
                    this.isBusy = false;
                    this.dismiss();
                    console.log(error);
                });
            }
        } else {
            this.alertHelper.alert('The action description is required');
        }
    }

    public calendar(): void {
        let modal = this.modalCtrl.create(CalendarComponent, { action: this.model });
        modal.present();
    }

    public displayUsers(event): void {
        if (event.target.value != '') {
            this.users = this.mainService.users.filter(e => {
                return e.names.toLocaleLowerCase().indexOf(event.target.value.toLocaleLowerCase()) > -1;
            });
        } else {
            this.users = [];
        }
    }

    public displayProjects(event): void {
        if (event.target.value != '') {
            this.projects = this.mainService.projects.filter(e => {
                return e.name.toLocaleLowerCase().indexOf(event.target.value.toLocaleLowerCase()) > -1;
            });
        } else {
            this.projects = [];
        }
    }

    public addUser(event: Event, user: any): void {
        event.preventDefault();
        this.myInput.nativeElement.focus();
        if (this.model.assignedUsers.find(t => t.userID == user.userID) == null) {
            this.model.assignedUsers.push(user);
        }
        this.users = [];
        this.username = '';
    }

    public removeLast(event): void {
        if (event.keyCode == 8 && this.username == '' && this.model.assignedUsers.length > 0) {
            this.model.assignedUsers.splice(this.model.assignedUsers.length - 1, 1);
        }
    }

    public addProject(event: Event, project: any): void {
        event.preventDefault();
        this.model.projects = [];
        this.model.projects.push(project);
        this.projects = [];
        this.projectname = '';
    }

    public removeLastProject(event): void {
        if (event.keyCode == 8 && this.username == '' && this.model.assignedUsers.length > 0) {
            this.model.assignedUsers.splice(this.model.assignedUsers.length - 1, 1);
        }
    }

    public attach(event): void {
        let countFiles = this.model.files.filter(e => { return e.fileID == 0; }).length;
        if (countFiles < 4) {
            this.cameraHelper.takeFromDevice((file) => {
                this.model.files.push(file);
            });
        } else {
            this.alertHelper.alert('The max number of files to upload is 4');
        }
    }

    public removeFile(event: Event, file: any): any {
        event.preventDefault();
        let index = this.model.files.indexOf(file);
        this.model.files.splice(index, 1);
    }
}