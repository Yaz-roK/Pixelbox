//------ Constants ------//
//--- Canvas ---//
const   mainCanvas      = document.querySelector('canvas.main');
const   mainCtx         = mainCanvas.getContext('2d');
mainCanvas.width        = window.innerWidth;
mainCanvas.height       = window.innerHeight;

const   cursorCanvas    = document.querySelector('canvas.cursor');
const   cursorCtx       = cursorCanvas.getContext('2d');
cursorCanvas.width      = window.innerWidth;
cursorCanvas.height     = window.innerHeight;
//--- Canvas ---//

//--- Pixelbox ---//
const   RES             = 5;

const   VOIDCOLOR       = "#000000";

const   SAND            = 0;
const   SANDCOLOR1      = "#ffda79";
const   SANDCOLOR2      = "#ccae62";

const   GRAVEL          = 1;
const   GRAVELCOLOR1    = "#84817a";
const   GRAVELCOLOR2    = "#aaa69d";

const   WATER           = 2;
const   WATERCOLOR1     = "#34ace0";
const   WATERCOLOR2     = "#227093";
//--- Pixelbox ---//
//------ Constants ------//

//------ Classes ------//
class Element {
    constructor(_x, _y, _type, _grid) {
        this.type       = _type;
        this.grid       = _grid;

        this.x          = _x;
        this.y          = _y;
        this.color      = Element.initColor(this.type);

        this.updated    = false;
    }

    static initColor(_type) {
        const rnd = Math.random();

        switch (_type) {
            case SAND:
                if (rnd <= .9)  return SANDCOLOR1;
                                return SANDCOLOR2;
            case GRAVEL:
                if (rnd <= .9)  return GRAVELCOLOR1;
                                return GRAVELCOLOR2;
            case WATER:
                if (rnd <= .9)  return WATERCOLOR1;
                                return WATERCOLOR2;
            case DIRT:
                if (rnd <= .9)  return DIRTCOLOR1;
                                return DIRTCOLOR2;
            case GRASS:
                if (rnd <= .9)  return GRASSCOLOR1;
                                return GRASSCOLOR2;
        }
    }

    move(_dx, _dy, _in = null) {
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

            this.updated = true;
            return true;
        }

        if (el.updated)
            return false;

        if (_in != null && _in.includes(el.type)) {
            el.x = this.x;
            el.y = this.y;
            this.grid.setElement(el.x, el.y, el);

            this.x = nextX;
            this.y = nextY;
            this.grid.setElement(this.x, this.y, this);

            this.draw();
            el.draw();

            this.updated    = true;
            el.updated      = true;
            return true;
        }
    }

    evolveNextTo(_nextTo) {

    }

    clear() {
        mainCtx.save();
            mainCtx.fillStyle = VOIDCOLOR;
            mainCtx.fillRect(this.x * RES, this.y * RES, RES, RES);
        mainCtx.restore();
    }

    draw() {
        mainCtx.save();
            mainCtx.fillStyle = this.color;
            mainCtx.fillRect(this.x * RES, this.y * RES, RES, RES);
        mainCtx.restore();
    }
}

class Grid {
    constructor() {
        this.cols       = Math.ceil(mainCanvas.width    / RES);
        this.rows       = Math.ceil(mainCanvas.height   / RES);
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

        if (this.grid.addElement(_x, _y, el)) {
            this.elements.push(el);
            el.draw();
        }
    }

    addElements(_x, _y, _radius, _type) {
        if (_radius == 1) {
            this.addElement(_x, _y, _type);
            return;
        }

        for (let xx = _x - _radius; xx < _x + _radius; xx++)
            for (let yy = _y - _radius; yy < _y + _radius; yy++) {
                const dx    = _x - xx;
                const dy    = _y - yy;
                const dist  = dx * dx + dy * dy;

                if (dist <= _radius * _radius) {
                    if (Math.random() <= .01)
                        this.addElement(xx, yy, _type);
                }
            }
    }

    removeElement(_x, _y) {
        const el = this.grid.removeElement(_x, _y);
        if (el != null) {
            el.clear();
            const index = this.elements.indexOf(el);
            this.elements.splice(index, 1);
        }
    }

    removeElements(_x, _y, _radius) {
        if (_radius == 1) {
            this.removeElement(_x, _y);
            return;
        }

        for (let xx = _x - _radius; xx < _x + _radius; xx++)
            for (let yy = _y - _radius; yy < _y + _radius; yy++) {
                const dx    = _x - xx;
                const dy    = _y - yy;
                const dist  = dx * dx + dy * dy;

                if (dist <= _radius * _radius)
                    this.removeElement(xx, yy);
            }
    }

    simulateSAND(_el) {
        if (_el.move(0, 1, [WATER]))
            return;

        let delta = Math.floor(Math.random() * 2) * 2 - 1;
        for (let i = 0; i < 2; i++) {
            if (_el.move(delta, 1, [WATER]))
                return;
            delta *= -1;
        }
    }

    simulateGRAVEL(_el) {
        if (_el.move(0, 1, [WATER]))
            return;
    }

    simulateWATER(_el) {
        if (_el.move(0, 1))
            return;

        let delta = Math.floor(Math.random() * 2) * 2 - 1;
        for (let i = 0; i < 2; i++) {
            if (_el.move(delta, 1))
                return;
            delta *= -1;
        }

        for (let i = 0; i < 2; i++) {
            if (_el.move(delta, 0))
                return;
            delta *= -1;
        }
    }

    simulate() {
        for (const el of this.elements) {
            if (el.updated)
                continue;

            switch (el.type) {
                case SAND:
                    this.simulateSAND(el);
                    break;
                case GRAVEL:
                    this.simulateGRAVEL(el);
                    break;
                case WATER:
                    this.simulateWATER(el);
                    break;
            }
        }

        this.elements.map((el) => el.updated = false);
    }
}

class Cursor {
    constructor(_scheduler) {
        this.scheduler      = _scheduler;

        this.realX          = 0;
        this.realY          = 0;
        this.x              = 0;
        this.y              = 0;

        this.radius         = 25;

        this.leftPressed    = false;
        this.rightPressed   = false;
        this.typeSelected   = SAND;
    }

    move(_x, _y) {
        this.realX  = _x;
        this.realY  = _y;
        this.x      = Math.floor((_x * this.scheduler.grid.cols) / mainCanvas.width);
        this.y      = Math.floor((_y * this.scheduler.grid.rows) / mainCanvas.height);
    }

    run() {
        if (this.leftPressed)
            this.scheduler.addElements(this.x, this.y, this.radius, this.typeSelected);
        if (this.rightPressed)
            this.scheduler.removeElements(this.x, this.y, this.radius);

        this.draw();
    }

    draw() {
        cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
        cursorCtx.save();
            cursorCtx.strokeStyle = "#ffffff";
            cursorCtx.beginPath();
                cursorCtx.arc(this.realX, this.realY, this.radius * RES, 0, Math.PI * 2);
            cursorCtx.stroke();
        cursorCtx.restore();
    }
}
//------ Classes ------//

//------ Main ------//
function main() {
    //  Background
    mainCanvas.style = "background:" + VOIDCOLOR + ";";

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

    window.addEventListener('keydown', (e) => {
        switch (e.key) {
            case "a":
                _cursor.typeSelected = SAND;
                break;
            case "z":
                _cursor.typeSelected = GRAVEL;
                break;
            case "e":
                _cursor.typeSelected = WATER;
                break;
        }
    });
}
//------ Events ------//