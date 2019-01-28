import { Injectable } from '@angular/core';
import { Command } from '../types/Command';
import { IO } from '../types/IO';
import { Program } from '../types/Program';
import { MI } from '../programs/MI/MI';

@Injectable({
  providedIn: 'root'
})
export class EngineService {

  programs : Program[] = []

  constructor() {
    this.init();
  }

  private init(){

    this.programs.push(MI);


  }

  public execute(io: IO, command : Command): void {
    if(command.command == 'help') return this.help(io);

    for (let p of this.programs) {
      if(p.command == command.command){
        if(command.args.length > 0 && (command.args[0]=='--help' || command.args[0]=='help')) return p.help(io);
        p.main(io, command.args);
        return;
      }
    }

    io.out("Command " + command.command +" not found");
    io.exit(-1);

    /*
    if(command.command == '1'){
      io.out("start 1");
      io.in((string: string) => {
        io.out(string);
        io.exec(string, () => {
          io.out("end 1")
          io.exit(0);
        });
        
      })
    }else{
      io.out("start 2");
      io.in((string: string) => {     
        io.out("end 2")
        io.exit(0);     
      })
    }

    io.in((string: string) => {
      io.out(string+io.EOL);
      io.out('----');
      io.exit(0);
    })
    */
    
  
  }

  public help(io: IO): void {
    io.out('Available commands :' + io.EOL);
    for (let p of this.programs) {
      io.out(p.command + ' : ' + p.descritpion);
    }
    io.exit(0);
  }
}
