let loader = {
    left : '[',
    right : ']',
    full : '=',
    empty : ' ',
    size : 50,
    interval: 100
}
let count = 0
io.println('');

let routine = function(){
    count++;
    if(count > loader.size){
        io.exit(0);
        clearInterval(routine);
    }else{
        io.clear(1);
        io.println(loader.left);
        for (let index = 0; index < count; index++) {
            io.print(loader.full);            
        }
        for (let index = 0; index < loader.size - count; index++) {
            io.print(loader.empty);            
        }
        io.print(loader.right);
        setTimeout(routine, loader.interval);
    }
}
setTimeout(routine,loader.interval);