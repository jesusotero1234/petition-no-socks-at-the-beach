//Canvas signature
let canvas = document.getElementById('signatureCanvas');
let ctx = canvas.getContext('2d');

let x = 0;
let y = 0;
let draw = true;

ctx.drawImage(canvas, x, y);

$(canvas).on('mousedown', e => {
    draw = true;
    let Xstart = e.originalEvent.offsetX;
    let Ystart = e.originalEvent.offsetY;
    ctx.moveTo(Xstart, Ystart);

    $(canvas).on('mousemove', e => {
        // console.log(e.originalEvent.offsetX);    
        //if the user goes outside without clicking
        if (
            e.originalEvent.offsetX >= 580 ||e.originalEvent.offsetX <= 50||
            e.originalEvent.offsetY >= 139 ||e.originalEvent.offsetY <= 20
        ) {
            console.log('entered')
            draw=false
        }
        if (draw) {
            //Creating the move X and Y
            let Xfinal = e.originalEvent.offsetX;
            let Yfinal = e.originalEvent.offsetY;

            ctx.lineTo(Xfinal, Yfinal);
            ctx.stroke();
            drawCanvas(Xfinal, Yfinal, Xfinal, Yfinal);
        }

        $(canvas).on('mouseup', () => {
            draw = false;
            $('#signature').val(canvas.toDataURL('image/png', 1.0));
        });
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

//restart canvas
$('#resetSignature').click((e) => {
    e.preventDefault()
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    $('input[name="signature"]').val('');
});
