//Canvas signature
let canvas = document.getElementById('signatureCanvas');
let ctx = canvas.getContext('2d');

let x = 0;
let y = 0;
let draw = true;

ctx.drawImage(canvas, x, y);

$(canvas).on('mousedown', (e) => {
    draw= true
    let Xstart =  e.originalEvent.offsetX ;
    let Ystart =  e.originalEvent.offsetY;
    ctx.moveTo(Xstart, Ystart);
    
    $(canvas).on('mousemove', e => {
        if (draw) {
            //Creating the move X and Y  
            let Xfinal =  e.originalEvent.offsetX ;
            let Yfinal =  e.originalEvent.offsetY;

            ctx.lineTo(Xfinal, Yfinal);
            ctx.stroke();
            drawCanvas(Xfinal, Yfinal, Xfinal, Yfinal)
            
        }
        $(canvas).on('mouseup', () => {
            draw= false
            $('#signature').val( canvas.toDataURL('image/png', 1.0))
           
        })

    });
});

const drawCanvas = (Xstart, Ystart, Xend, Yend) => {
    ctx.beginPath();
    ctx.lineWitdh = 5;
    ctx.moveTo(Xstart, Ystart);
    ctx.lineTo(Xend, Yend);
    ctx.stroke();
    ctx.fill();

};
