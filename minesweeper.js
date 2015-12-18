function Minesweeper(nrows, ncols) {
    var boardLength = nrows * ncols;
    var board = new Array(boardLength);
    for (var i = boardLength; --i >= 0;) {
        board[i] = (Math.random() <= 0.1 ? 1 : 0);
    }

    function index(row, col) {
        return row * ncols + col;
    }

    function getField(row, col) {
        return board[index(row, col)];
    }

    function setField(row, col, value) {
        return board[index(row, col)] = value;
    }

    function isBomb(row, col) {
        return getField(row, col) & 1;
    }

    function isUncovered(row, col) {
        return getField(row, col) & 2;
    }

    function uncover(row, col) {
        setField(row, col, getField(row, col) | 2);
    }

    function forEach(f) {
        for (var i = 0; i < nrows; ++i) {
            for (var j = 0; j < ncols; ++j) {
                f(i, j);
            }
        }
    }

    function nearBombs(row, col) {
        var count = 0;
        if (row > 0) {
            if (isBomb(row - 1, col)) count++;
        }
        if (row < nrows - 1) {
            if (isBomb(row + 1, col)) count++;
        }
        if (col > 0) {
            if (isBomb(row, col - 1)) count++;
        }
        if (col < ncols - 1) {
            if (isBomb(row, col + 1)) count++;
        }
        return count;
    }

    // XXX: switch to virtual DOM
    function renderInner() {
        var out = "";
        for (var i = 0; i < nrows; ++i) {
            out += "<div class='row'>";
            for (var j = 0; j < ncols; ++j) {
                out += "<div class='cell";
                if (isUncovered(i, j)) {
                    out += " uncovered";
                    if (isBomb(i, j)) {
                        out += " bomb";
                    }
                }
                out += "' data-row='" + i + "' data-col='" + j + "'>";
                if (isUncovered(i, j)) {
                    if (isBomb(i, j)) {
                        out += "&#x1F4A3;";
                    } else {
                        var count = nearBombs(i, j);
                        if (count > 0) {
                            out += count;
                        }
                    }
                }
                out += "</div>";
            }
            out += "</div>";
        }
        return out;
    }

    function render() {
        var out = "";
        out += "<div class='minesweeper-board'>";
        out += renderInner();
        out += "</div>";
        return out;
    }

    function leftClick(row, col, boardEl) {
        if (isUncovered(row, col)) {
            return;
        }
        uncover(row, col);
        if (isBomb(row, col)) {
            forEach(function(row, col){
                uncover(row, col);
            });
        }
        boardEl.innerHTML = renderInner();
    }

    function rightClick(row, col) {
        if (isUncovered(row, col)) {
            return;
        }
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("contextmenu", onContextMenu);

    function onMouseDown(ev) {
        var boardEl = onContextMenu(ev);
        if (boardEl) {
            var div = ev.target.closest("div.cell");
            var row = parseFloat(div.dataset.row);
            var col = parseFloat(div.dataset.col);
            if (div) {
                if (ev.button == 0) {
                    leftClick(row, col, boardEl, div);
                } else if (ev.button == 2) {
                    rightClick(row, col, boardEl, div);
                }
            }
        }
    }

    function onContextMenu(ev) {
        var boardEl = ev.target.closest("div.minesweeper-board");
        if (boardEl) {
            ev.stopPropagation();
            ev.preventDefault();
            return boardEl;
        }
    }

    return {
        render: render
    };
}
