import { Component, OnInit, ViewChild, ElementRef, HostListener, ChangeDetectorRef, Input } from '@angular/core';
import { Command } from '../../types/Command'
import {EngineService } from '../../services/engine.service'
import { IO, Result } from '../../types/IO';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent implements OnInit {

  @Input() cliName: string = 'cli';
  @Input() active: boolean = true;;
  prompt: boolean = true;
  entry: string = '';
  session: Command[] = [];
  waitForEntry: boolean = false;
  inCallBacks: ((a: string|number) => void)[] = [];
  stack: number = 0;
  execCallBacks: ((result: Result) => void)[] = [];
  history: string[];
  historyIndex: number;
  quiet: boolean = false;
  process: IO;
  

  
  @ViewChild('input') myInput: ElementRef; 

  constructor(private element: ElementRef,private changeDetector: ChangeDetectorRef, private engine: EngineService) { }

  ngOnInit() {
    this.loadHistory();
  }


  scroll() {
    try {
      this.element.nativeElement.scrollTop = this.element.nativeElement.scrollHeight;
    } catch(err) { 

    } 
  }


  setFocus() { 
    if(this.prompt || this.waitForEntry)
      this.myInput.nativeElement.focus(); 
  } 

  resetPrompt(): void {
    this.entry = '';  
    this.showPrompt();  
  }

  moveCursor(){
    let el = this.myInput.nativeElement;
    if(el.textContent <= 0) return;

    let sel = window.getSelection();
    sel.collapse(el.firstChild,el.textContent.length);
    this.scroll(); 
  }

  refresh(){
    this.changeDetector.detectChanges();
    this.scroll();  
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

  enter(event): boolean {
    this.entry = this.entry.replace(/(\r\n|\n|\r)/gm,'');
    if(this.entry){
      if(this.waitForEntry){
        this.waitForEntry = false;
        this.out(this.entry+this.newLine());
        let cb = this.inCallBacks.pop();
        cb(this.entry);   
      }else{
        this.execute(this.entry);
      }
    }else{
      let empty = <Command>{
        command: '',
        args: null,
        options: null,
        result: '',
        exit: 0,
        raw: ''
      }
      this.session.push(empty);
      this.exit(0);
    }
    this.entry = '';
    this.refresh();
    event.preventDefault();
    return true;
  }
  

  execute(entry: string): void {
    this.hidePrompt();
    this.addHistory(new String(entry).toString());    
    let input = this.sanitizeEntry(entry);    
    this.session.push(this.createCommandObject(input));

    setTimeout(function(){
      this.process = this.createIO();
      this.engine.execute(this.process, this.session[this.session.length - 1]);
    }.bind(this),0);
  }

  createCommandObject(string : string) : Command {
    let args = this.splitArgs(string);
    let command = args.args.shift();
    return <Command>{
      command: command,
      args: args.args,
      options: args.options,
      result: '',
      exit: 0,
      raw: string
    }
  }

  sanitizeEntry(str: string){
    let sanitized = str.replace(/&nbsp;/g, ' ')
    sanitized = sanitized.replace(/\s\s+/g,' ')
    if(sanitized.endsWith(' ')) sanitized = sanitized.slice(0,-1)
    return sanitized;
  }

  splitArgs(str: string) : any {
    let re = /[^" ]+|("[^"]*")/g
    let args: any = str.match(re);
    args.forEach(function(v,i){
      args[i] = v.replace(/\"/g,'')
    })

    let ret = {
      args : [],
      options: []
    };

    args.forEach(function(v,i){
      if(v.startsWith('--')){
        let arr = v.split('=');
        if(arr.length >= 2) {
          ret.options[arr[0].replace('--','')] = arr[1];
        }else{
          ret.options[v.replace('--','')] = true;
        }
      }else if(v.startsWith('-')){
        ret.options[v.replace('-','')] = true;
      }else{
        ret.args.push(v);
      }
    })

    return ret;
  }

  createIO() : IO{
    return <IO> {
      in: this.in.bind(this),
      out: this.out.bind(this),
      EOL: this.newLine(),
      exit: this.exit.bind(this),
      exec: this.exec.bind(this),
      clear: this.clear.bind(this)
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

  deleteHistory() : void {
    localStorage.setItem('history',JSON.stringify([]));
    this.loadHistory();
  }
 

  
  @HostListener('click') autofocus(){
    if(this.active){
      this.setFocus();
    }    
  }
  

  keyUp(): void {
    if(this.historyIndex > 0){
      this.historyIndex --;
      this.entry = this.history[this.historyIndex];
      this.moveCursor();
      this.scroll();
    }
  }

  keyDown(): void{
    if(this.historyIndex < this.history.length -1){
      this.historyIndex ++;
      this.entry = this.history[this.historyIndex];
    }else{
      this.entry = '';
    }
    this.moveCursor();
    this.scroll();
  }

  
  
  @HostListener('document:keydown.control.c') CtrlC(){
    this.process.out = function(string: string|number, style: string = null){};
    this.process.in = function(callback: (a: string|number) => void){};
    this.process.exit = function(code: number, result?: any){};
    this.process.exec = function(entry: string, callBack: (result?: Result) => void, quiet: boolean = false){};
    this.resetPrompt();
  }
  
  



  /* Usable functions */ 

  in(callback: (a: string|number) => void) : void {
    this.inCallBacks.push(callback);
    this.waitForEntry = true;
    this.refresh();
  }  

  out(obj: any, style: string = null) : void {
    if(this.quiet) return;
    var type = typeof obj;
    if(type === 'function'){
      obj = obj.toString();
    }else if(type === 'object'){
      obj = JSON.stringify(obj, null, 4);
    }
    this.session[this.session.length - 1].result += ('<span '+(style?'style="'+style+'"':'')+'>'+obj+'</span>');
    this.refresh();
  }

  newLine() : string {
    return String.fromCharCode(13, 10);
  }

  exit(code: number, result?: any) : void {
    if(this.stack == 0){
      if(this.session.length > 0)
      this.session[this.session.length - 1].exit = code
      this.session = Object.assign([], this.session);
      this.resetPrompt();
    }else{
      this.stack --;
      let cb = this.execCallBacks.pop();
      this.quiet = false;
      if(result){
        cb(<Result> {
          exitCode : code,
          result : result
        });
      }else{
        cb(<Result> {
          exitCode : code,
        });
      }      
    }   
  }

  exec(entry: string, callBack: (result?: Result) => void, quiet: boolean = false) : void {
    this.stack ++;
    this.quiet = quiet;
    this.execCallBacks.push(callBack);
    this.engine.execute(this.process, this.createCommandObject(this.sanitizeEntry(entry)));
  }

  clear(line: number = 0): void {
    if(line > 0){
      this.session = this.session.slice(0, -line);
    }else{
      this.session = [];
    }    
    this.refresh();
  }
  
}
