export class ActionModel {
    subject:string;
    dueDate:string;
    assignedUsers:Array<any> = new Array<any>();
    color:string;
    countUpdates?:number;
    creationDate:string;
    creator:any;
    files:Array<any> = new Array<any>();
    finalizedDate:string;
    modificationDate:string;
    projects:Array<any> = new Array<any>();
    actionID?:number;
    status:number;
    shortSubject:string;
    comments:Array<any> = null;
}