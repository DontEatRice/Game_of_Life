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
        this._status = this.status
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

    // Cell[y][x]
    static isAlive(cells: Cell[][], x: number, y: number) {
        if (y < 0)
            y = cells.length-1
        else if (y > cells.length-1)
            y = 0
        
        if (x < 0)
            x = cells[y].length-1
        else if (x > cells[y].length-1)
            x = 0

        return cells[y][x].status == Status.ALIVE ? 1 : 0;
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
    private _isRunning: boolean

    constructor(cells: Cell[][]) {
        this._cells = cells;
        this._isRunning = false;
    }

    run(stayAliveCond: number[], resurrectionCond: number[], interval: number) {
        this.intervalId = setInterval(() => {
            const cells = this._cells;
            for(let y = 0; y < cells.length; y++) {
                for(let x = 0; x < cells[y].length; x++) {
                    let neighboursAlive = 0;
                    const currentCell = cells[y][x]
                    // top
                    neighboursAlive += Cell.isAlive(cells, x-1, y+1) + Cell.isAlive(cells, x, y+1) + Cell.isAlive(cells, x+1, y+1)
                    // middle
                    neighboursAlive += Cell.isAlive(cells, x-1, y) + Cell.isAlive(cells, x+1, y)
                    // bottom
                    neighboursAlive += Cell.isAlive(cells, x-1, y-1) + Cell.isAlive(cells, x, y-1) + Cell.isAlive(cells, x+1, y-1)
                    
                    if (currentCell.status == Status.ALIVE && !stayAliveCond.includes(neighboursAlive))
                    currentCell.status = Status.DEAD
                    else if (currentCell.status == Status.DEAD && resurrectionCond.includes(neighboursAlive))
                    currentCell.status = Status.ALIVE
                }
            }
            Cell.applyStatusChange(cells)
        }, interval)
        this._isRunning = true;
    }

    stop() {
        if (this.intervalId != undefined){
            clearInterval(this.intervalId)
            this.intervalId = undefined;
            this._isRunning = false;
        }
    }

    get cells() {
        return this._cells;
    }

    isRunning() {
        return this._isRunning
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
    const gameStatus = document.querySelector('span.gameStatus') as HTMLSpanElement

    document.getElementById('runBtn')?.addEventListener('click', (_) => {
        console.log('clicked')
        Cell.forEach(matrix, cell => cell.disableOnClick())
        const formula = (document.getElementById('formulaInput') as HTMLInputElement).value;
        const interval = (document.getElementById('tickTimeInput') as HTMLInputElement).value.replace(',', '.')
        const formulaSplitted = formula.split('/');
        const stayAliveCond = formulaSplitted[0].split('').map(s => parseInt(s))
        const resurrectCond = formulaSplitted[1].split('').map(s => parseInt(s))
        game.run(stayAliveCond, resurrectCond, parseFloat(interval)*1000)
        gameStatus.innerText = 'Running'
    })

    document.getElementById('stopBtn')?.addEventListener('click', (_) => {
        game.stop()
        Cell.forEach(matrix, cell => cell.enableOnClick())
        gameStatus.innerText = ''
    })

    document.getElementById('clearBtn')?.addEventListener('click', (_) => {
        if (!game.isRunning()) {
            Cell.forEach(matrix, cell => cell.status = Status.DEAD)
            Cell.applyStatusChange(matrix)
        }
    })
}