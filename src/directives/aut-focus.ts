import { Directive, Renderer, ElementRef } from '@angular/core';

@Directive({
    selector: '[focuser]'
})
export class Focuser {
    constructor(
        private renderer: Renderer, 
        private elementRef: ElementRef) {
    }
    ngAfterViewInit() {
        const element = this.elementRef.nativeElement.querySelector('input');
        setTimeout(() => {
            this.renderer.invokeElementMethod(element, 'focus', []);
        }, 200);
    }
}