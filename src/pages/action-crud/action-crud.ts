import { Component, ViewChild, OnInit, Renderer } from '@angular/core';
import { Platform, NavParams, ViewController, ModalController, Content } from "ionic-angular";
import { ActionModel } from "../../models/action-model";
import { MainService, HelperService, ActionService } from "../../services/index";
import { CalendarComponent } from "../calendar/calendar";
import { Keyboard } from '@ionic-native/keyboard';

@Component({
    templateUrl: 'action-crud.html'
})
export class ActionCrudComponent implements OnInit {
    @ViewChild('inputname') myInput;
    @ViewChild('subject') subject;
    @ViewChild(Content) content: Content;
    model: ActionModel = new ActionModel();
    updateAction: any;
    users: Array<any> = new Array<any>();
    projects: Array<any> = new Array<any>();
    username: string;
    projectname: string;
    keyboardHideSub: any;
    keyboardShowSub: any;
    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController,
        public modalCtrl: ModalController,
        public mainService: MainService,
        private helperService: HelperService,
        private actionService: ActionService,
        private keyboard: Keyboard,
        public renderer: Renderer) { }

    ngOnInit() {

    }

    ionViewDidLoad() {
        if (this.platform.is('ios')) {
            this.addKeyboardListeners()

            let scrollContentElelment = this.content.getScrollElement();

            scrollContentElelment.style.cssText = scrollContentElelment.style.cssText + "transition: all " + 200 + "ms; -webkit-transition: all " +
                200 + "ms; -webkit-transition-timing-function: ease-out; transition-timing-function: ease-out;"
        }
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    addKeyboardListeners() {
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

    send(form: any) {
        if (this.subject.nativeElement.innerHTML != '') {
            this.model.subject = this.subject.nativeElement.innerHTML;

            if (this.model.actionID != null) {
                this.actionService.update(this.model).subscribe(data => {

                }, error => {
                    console.log(error);
                })
            } else {
                this.actionService.add(this.model).subscribe(data => {
                    let result = data.json();
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

                    this.dismiss();
                }, error => {
                    console.log(error);
                })
            }
        } else {
            this.helperService.alert('The subject is required');
        }
    }

    calendar() {
        let modal = this.modalCtrl.create(CalendarComponent, { action: this.model });
        modal.present();
    }

    displayUsers(event) {
        if (event.target.value != '') {
            this.users = this.mainService.users.filter(e => {
                return e.names.toLocaleLowerCase().indexOf(event.target.value.toLocaleLowerCase()) > -1;
            });
        } else {
            this.users = [];
        }
    }

    displayProjects(event) {
        if (event.target.value != '') {
            this.projects = this.mainService.projects.filter(e => {
                return e.name.toLocaleLowerCase().indexOf(event.target.value.toLocaleLowerCase()) > -1;
            });
        } else {
            this.projects = [];
        }
    }

    addUser(user: any) {
        if (this.model.assignedUsers.find(t => t.userID == user.userID) == null) {
            this.model.assignedUsers.push(user);
        }
        this.users = [];
        this.username = '';
        this.myInput.nativeElement.focus();
    }

    removeLast(event) {
        if (event.keyCode == 8 && this.username == '' && this.model.assignedUsers.length > 0) {
            this.model.assignedUsers.splice(this.model.assignedUsers.length - 1, 1);
        }
    }

    addProject(project: any) {
        this.model.projects = [];
        this.model.projects.push(project);
        this.projects = [];
        this.projectname = '';
    }

    removeLastProject(event) {
        if (event.keyCode == 8 && this.username == '' && this.model.assignedUsers.length > 0) {
            this.model.assignedUsers.splice(this.model.assignedUsers.length - 1, 1);
        }
    }

    attach() {

    }
}