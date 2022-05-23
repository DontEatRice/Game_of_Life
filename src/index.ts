console.log("I'm working!")
console.log("Hot reload")
const NUMBER_OF_CELLS = 15*15;

enum Status {
    DEAD, ALIVE
}

class Cell {
    private body: HTMLDivElement
    private _status: Status
    private toggleStatus = () => {
        this.body.classList.toggle('dead')
        this.body.classList.toggle('alive')
    }

    constructor(body: HTMLDivElement) {
        this.body = body;
        this._status = Status.DEAD;
        this.enableOnClick()
    }

    static forEach(cells: Cell[][], cb: (cell: Cell) => void) {
        cells.forEach(row => row.forEach(cb))
    }

    static applyStatusChange(cells: Cell[][]) {
        this.forEach(cells, cell => {
            if (cell._status != cell.status)
                cell.toggleStatus()
        })
    }

    get status() {
        return this.body.classList.contains('dead') ? Status.DEAD : Status.ALIVE;
    }

    enableOnClick() {
        this.body.addEventListener('click', this.toggleStatus)
    }

    disableOnClick() {
        this.body.removeEventListener('click', this.toggleStatus)
    }

    set status(s: Status) {
        this._status = s;
    }
}

class Game {
    private _cells: Cell[][]
    private intervalId?: number

    constructor(cells: Cell[][]) {
        this._cells = cells;
    }

    run(stayAliveCond: number[], resurrectionCond: number[], interval: number) {
        this.intervalId = setInterval(() => {
            const cells = this._cells;
            // for(let y = 0; y < cells.length; y++) {
            //     for(let x = 0; x < cells[y].length; x++) {

            //     }
            // }
            Cell.forEach(cells, cell => cell.status = Status.ALIVE)
            Cell.applyStatusChange(cells)
        }, interval)
    }

    stop() {
        if (this.intervalId != undefined){
            clearInterval(this.intervalId)
            this.intervalId = undefined;
        }
    }

    get cells() {
        return this._cells;
    }
}


const generateCells = (): Cell[][] => {
    const cells: Cell[][] = []
    const board = document.getElementById('board')
    const nCellsSqrt = Math.sqrt(NUMBER_OF_CELLS)
    for(let y = 0; y < nCellsSqrt; y++) {
        const level: Cell[] = [] 
        for(let x = 0; x < nCellsSqrt; x++) {
            const deadCell = document.createElement('div')
            deadCell.classList.add('cell')
            deadCell.classList.add('dead')
            board?.appendChild(deadCell)
            level.push(new Cell(deadCell));
        }
        cells.push(level)
    }

    return cells;
}

window.onload = () => {
    const matrix = generateCells()
    const game = new Game(matrix);

    document.getElementById('runBtn')?.addEventListener('click', (_) => {
        console.log('clicked')
        Cell.forEach(matrix, cell => cell.disableOnClick())
        const formula = (document.getElementById('formulaInput') as HTMLInputElement).value;
        const interval = (document.getElementById('tickTimeInput') as HTMLInputElement).value.replace(',', '.')
        const formulaSplitted = formula.split('/');
        const stayAliveCond = formulaSplitted[0].split('').map(s => parseInt(s))
        const resurrectCond = formulaSplitted[1].split('').map(s => parseInt(s))
        console.log(interval)
        game.run(stayAliveCond, resurrectCond, parseFloat(interval)*1000)
    })

    document.getElementById('stopBtn')?.addEventListener('click', (_) => {
        game.stop()
        Cell.forEach(matrix, cell => cell.enableOnClick())
    })
}