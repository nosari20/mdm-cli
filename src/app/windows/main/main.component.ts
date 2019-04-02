import { Component, HostListener, ElementRef } from '@angular/core';
import { WindowManagerService } from '../../services/window-manager.service'

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  title = 'cli';

  tabs: string[] = ['Terminal 0'];
  activeTab: number = 0;
  editTab: number = -1;


  constructor(private _windowManager: WindowManagerService, private element: ElementRef) {}

  changeTab(event, tab: number): void {
    event.stopPropagation();
    this.activeTab = tab;
    this.editTab = (this.editTab == tab ? tab : -1);
  }

  edit(event, index: number) : void {
    this.editTab = index;
    event.preventDefault();
    event.stopPropagation();
    setTimeout(function(){
      let el = event.srcElement;
      el.setSelectionRange(el.value.length, el.value.length)
      let sel = window.getSelection();
      sel.removeAllRanges();
      el.focus();
      
    }, 1)
   
  }

  trackByFn(index: any, item: any) {
    return index;
 }

 close(index: number): void {
   this.tabs.splice(index, 1);
 }

 add(): void {
   this.tabs.push('Terminal ' + this.tabs.length);
 }


 @HostListener('document:click', ["$event"]) clickOut(event){
    if(event.srcElement != this.element){
      this.editTab = -1;
    }
  }

  open(window: string, title: string) : void{
    this._windowManager.open(window, {title: title});
  }
}
