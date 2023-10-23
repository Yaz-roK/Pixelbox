//------ Constants ------//
//--- Canvas ---//
const   canvas  = document.querySelector('canvas');
const   ctx     = canvas.getContext('2d');

canvas.width    = window.innerWidth;
canvas.height   = window.innerHeight;
//--- Canvas ---//

//--- Pixelbox ---//
const   RES         = 10;

const   VOIDCOLOR   = "#000000";

const   SAND        = 0;
const   SANDCOLOR1  = "#ffda79";
const   SANDCOLOR2  = "#ccae62";
//--- Pixelbox ---//
//------ Constants ------//

//------ Classes ------//
class Element {
    constructor(_x, _y, _type, _grid) {
        this.type   = _type;
        this.grid   = _grid;

        this.x      = _x;
        this.y      = _y;
        this.color  = Element.initColor(this.type);
    }

    static initColor(_type) {
        const rnd = Math.random();

        switch (_type) {
            case SAND:
                if (rnd <= .9)  return SANDCOLOR1;
                                return SANDCOLOR2;
        }
    }

    move(_dx, _dy) {
        const nextX = this.x + _dx;
        const nextY = this.y + _dy;

        if (this.grid.isOutOfBound(nextX, nextY))
            return false;

        const el    = this.grid.getElement(nextX, nextY);

        if (el == null) {
            this.clear();
            this.grid.setElement(this.x, this.y, null);

            this.x = nextX;
            this.y = nextY;
            this.grid.setElement(this.x, this.y, this);
            this.draw();

            return true;
        }
    }

    clear() {
        ctx.save();
            ctx.fillStyle = VOIDCOLOR;
            ctx.fillRect(this.x * RES, this.y * RES, RES, RES);
        ctx.restore();
    }

    draw() {
        ctx.save();
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x * RES, this.y * RES, RES, RES);
        ctx.restore();
    }
}

class Grid {
    constructor() {
        this.cols       = Math.ceil(canvas.width    / RES);
        this.rows       = Math.ceil(canvas.height   / RES);
        this.elements   = new Array(this.cols * this.rows).fill(null);
    }

    isOutOfBound(_x, _y) {
        return _x < 0 || _x >= this.cols || _y < 0 || _y >= this.rows;
    }

    setElement(_x, _y, _el) {
        const index             = _y * this.cols + _x;
        this.elements[index]    = _el;
    }

    getElement(_x, _y) {
        const index = _y * this.cols + _x;
        return this.elements[index];
    }

    addElement(_x, _y, _el) {
        //  Can't adding an element out of the grid
        if (this.isOutOfBound(_x, _y))
            return false;

        //  Can't adding an element on another element
        if (this.getElement(_x, _y) != null)
            return false;

        //  Adding element
        this.setElement(_x, _y, _el);
        return true;
    }

    removeElement(_x, _y) {
        //  Can't remove an element out of the grid
        if (this.isOutOfBound(_x, _y))
            return null;

        //  Can't remove an element if there is no element
        const el = this.getElement(_x, _y);
        if (el == null)
            return null;

        //  Removing element
        this.setElement(_x, _y, null);
        return el;
    }
}

class Scheduler {
    constructor() {
        this.grid       = new Grid();
        this.elements   = [];
    }

    addElement(_x, _y, _type) {
        const el = new Element(_x, _y, _type, this.grid);

        if (this.grid.addElement(_x, _y, el))
            this.elements.push(el);

        el.draw();
    }

    removeElement(_x, _y) {
        const el = this.grid.removeElement(_x, _y);
        if (el != null) {
            el.clear();
            const index = this.elements.indexOf(el);
            this.elements.splice(index, 1);
        }
    }

    simulateSAND(_el) {
        if (_el.move(0, 1))
            return;

        let delta = Math.floor(Math.random() * 2) * 2 - 1;
        for (let i = 0; i < 2; i++) {
            if (_el.move(delta, 1))
                return;
            delta *= -1;
        }
    }

    simulate() {
        for (const el of this.elements) {
            switch (el.type) {
                case SAND:
                    this.simulateSAND(el);
                    break;
            }
        }
    }
}

class Cursor {
    constructor(_scheduler) {
        this.scheduler      = _scheduler;

        this.x              = 0;
        this.y              = 0;

        this.leftPressed    = false;
        this.rightPressed   = false;
        this.typeSelected   = SAND;
    }

    move(_x, _y) {
        this.x  = Math.floor((_x * this.scheduler.grid.cols) / canvas.width);
        this.y  = Math.floor((_y * this.scheduler.grid.rows) / canvas.height);
    }

    run() {
        if (this.leftPressed)
            this.scheduler.addElement(this.x, this.y, this.typeSelected);
        if (this.rightPressed)
            this.scheduler.removeElement(this.x, this.y);
    }
}
//------ Classes ------//

//------ Main ------//
function main() {
    //  Background
    canvas.style = "background:" + VOIDCOLOR + ";";

    //  Init
    const   scheduler   = new Scheduler();
    const   cursor      = new Cursor(scheduler);
    initEvents(cursor);

    //  Run
    const animate = () => {
        // Simulate
        scheduler.simulate();
        cursor.run();

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

function initEvents(_cursor) {
    window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        _cursor.move(e.clientX, e.clientY);
    });

    window.addEventListener('mousedown', (e) => {
        _cursor.move(e.clientX, e.clientY);
        
        switch (e.button) {
            case 0:
                _cursor.leftPressed     = true;
                break;
            case 2:
                _cursor.rightPressed    = true;
                break;
        }
    });

    window.addEventListener('mouseup', (e) => {
        _cursor.move(e.clientX, e.clientY);
        
        switch (e.button) {
            case 0:
                _cursor.leftPressed     = false;
                break;
            case 2:
                _cursor.rightPressed    = false;
                break;
        }
    });
}
//------ Events ------//