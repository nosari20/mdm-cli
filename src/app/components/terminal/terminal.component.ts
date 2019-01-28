import { Component, OnInit, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { Command } from '../../types/Command'
import {EngineService } from '../../services/engine.service'
import { IO } from '../../types/IO';
import { exists } from 'fs';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements OnInit {

  cliName: string = 'cli';
  prompt: boolean = true;
  entry: string = '';
  session: Command[] = [];
  waitForEntry: boolean = false;
  inCallBacks: ((a: string|number) => void)[] = [];
  stack: number = 0;
  execCallBacks: (() => void)[] = [];
  history: string[];
  historyIndex: number;

  
  @ViewChild('input') myInput: ElementRef; 

  constructor(private element: ElementRef,private changeDetector: ChangeDetectorRef, private engine: EngineService) { }

  ngOnInit() {
    this.loadHistory();
  }

  ngAfterViewInit(){
    this.setFocus();
  }

  ngAfterViewChecked() {        
    try {
      this.element.nativeElement.scrollTop = this.element.nativeElement.clientHeight;
    } catch(err) { 
      console.log(err);
    }        
  } 

  @HostListener('click') onClick(){
    this.setFocus();
  }

  setFocus() { 
    if(this.prompt || this.waitForEntry)
      this.myInput.nativeElement.focus(); 
  } 

  resetPrompt(): void {
    this.entry = '';  
    this.showPrompt();  
  }


  refresh(){
    this.changeDetector.detectChanges();
  }

  showPrompt(): void {
    this.prompt = true;
    this.refresh();
    this.setFocus();
  }

  hidePrompt(): void {
    this.prompt = false;
    this.refresh();
  }

  enter(event): void {
    if(this.waitForEntry){
      this.waitForEntry = false;
      let cb = this.inCallBacks.pop();
      cb(this.entry);   
    }else{
      this.execute(this.entry);
    }
    this.entry = '';
    this.refresh();
  }

  execute(entry: string, sub: boolean = false): void {
    this.hidePrompt();
    this.addHistory(entry);
    if(!sub){
      this.session.push(this.createCommandObject(entry));
    }
    this.engine.execute(this.createIO(), this.session[this.session.length - 1]);
  }

  createCommandObject(string : string) : Command {
    let args = string.split(' ');
    let command = args.shift();
    return <Command>{
      command: command,
      args: args,
      result: '',
      exit: 0
    }
  }

  createIO() : IO{
    return <IO> {
      in: this.in.bind(this),
      out: this.out.bind(this),
      EOL: this.newLine(),
      exit: this.exit.bind(this),
      exec: this.exec.bind(this),
    }
  }

  loadHistory(): void {
    this.history = JSON.parse(localStorage.getItem('history')) || [];
    this.historyIndex = this.history.length; 
  }

  addHistory(entry: string): void {
    this.history.push(entry);
    this.historyIndex = this.history.length;
    localStorage.setItem('history',JSON.stringify(this.history));
  }

  keyUp(): void {
    if(this.historyIndex > 0){
      this.historyIndex --;
      this.entry = this.history[this.historyIndex];
    }
  }

  keyDown(): void{
    if(this.historyIndex < this.history.length -1){
      this.historyIndex ++;
      this.entry = this.history[this.historyIndex];
    }else{
      this.entry = '';
    }
  }



  /* Usable functions */ 

  in(callback: (a: string|number) => void) : void {
    this.inCallBacks.push(callback);
    this.waitForEntry = true;
    this.refresh();
  }  

  out(string: string|number, style: string = null) : void {
    this.session[this.session.length - 1].result += ('<span '+(style?'style='+style:'')+'>'+string+'</span>');
    this.refresh();
  }

  newLine() : string {
    return String.fromCharCode(13, 10);
  }

  exit(code: number) : void {
    console.log(this.stack);
    if(this.stack == 0){
      this.session[this.session.length - 1].exit = code
      this.session = Object.assign([], this.session);
      this.resetPrompt();
    }else{
      this.stack --;
      let cb = this.execCallBacks.pop();
      cb();
    }   
  }

  exec(command: string, callBack: () => void) : void {
    this.stack ++;
    this.execCallBacks.push(callBack);
    this.engine.execute(this.createIO(), this.createCommandObject(command));
  }
  
}
