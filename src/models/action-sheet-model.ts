export class ActionSheetModel {
    name:string;
    handler?:(data?: any) => void;
    colors:boolean = false;
    icon?:string;
}