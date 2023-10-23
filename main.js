//------ Constants ------//
//--- Canvas ---//
const   canvas  = document.querySelector('canvas');
const   ctx     = canvas.getContext('2d');

canvas.width    = window.innerWidth;
canvas.height   = window.innerHeight;
//--- Canvas ---//

//--- Pixelbox ---//
const   res     = 10;
//--- Pixelbox ---//
//------ Constants ------//

//------ Classes ------//
//------ Classes ------//

//------ Main ------//
function main() {
    //  Background
    canvas.style = "background: black;";

    //  Init
    initEvents();

    //  Run
    const animate = () => {
        //  Loop
        window.requestAnimationFrame(animate);
    };
    animate();
}
//------ Main ------//

//------ Events ------//
window.addEventListener('load', () => {
    main();
});

function initEvents() {
    
}
//------ Events ------//