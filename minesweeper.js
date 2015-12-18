function Minesweeper(nrows, ncols) {
    var boardLength = nrows * ncols;
    var board = new Array(boardLength);
    var nbombs = 0;
    var failrow = null, failcol = null;
    for (var i = boardLength; --i >= 0;) {
        var setBomb = Math.random() <= 0.15;
        if (setBomb) {
            nbombs++;
        }
        board[i] = (setBomb ? 1 : 0);
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

    function isFlagged(row, col) {
        return getField(row, col) & 4;
    }

    function isSeen(row, col) {
        return getField(row, col) & 8;
    }

    function setUncover(row, col) {
        setField(row, col, getField(row, col) | 2);
    }

    function setFlag(row, col) {
        setField(row, col, getField(row, col) | 4);
    }

    function unsetFlag(row, col) {
        setField(row, col, (getField(row, col) | 4) ^ 4);
    }

    function setSeen(row, col) {
        setField(row, col, getField(row, col) | 8);
    }

    function finished() {
        var f = 0, u = 0;
        forEach(function(row, col){
            if (isFlagged(row, col)) f++;
            if (isUncovered(row, col)) u++;
        });
        return f + u == nrows * ncols;
    }

    function forEach(f) {
        for (var i = 0; i < nrows; ++i) {
            for (var j = 0; j < ncols; ++j) {
                f(i, j);
            }
        }
    }

    function neighboring(row, col, pred) {
        var count = 0;
        function add(dr, dc) {
            var r = row + dr, c = col + dc;
            if (r >= 0 && r < nrows &&
                c >= 0 && c < ncols &&
                pred(r, c))
            {
                count++;
            }
        }
        add(-1, -1); add(-1, 0); add(-1, 1);
        add(0, -1); add(0, 1);
        add(1, -1); add(1, 0); add(1, 1);
        return count;
    }

    function nearBombs(row, col) {
        return neighboring(row, col, isBomb);
    }

    // XXX: switch to virtual DOM
    function renderInner() {
        var out = "";
        for (var i = 0; i < nrows; ++i) {
            out += "<div class='row'>";
            for (var j = 0; j < ncols; ++j) {
                var bombs = nearBombs(i, j);
                var clss = [ "cell" ], body = "";
                if (isFlagged(i, j)) {
                    clss.push("flagged");
                }
                if (isUncovered(i, j)) {
                    clss.push("uncovered");
                    if (isBomb(i, j)) {
                        clss.push("bomb");
                    }
                } else {
                    clss.push("covered");
                }
                if (failrow == i && failcol == j) {
                    clss.push("fail");
                }
                if (isUncovered(i, j)) {
                    if (!isBomb(i, j)) {
                        if (bombs > 0) {
                            body = bombs;
                            var flags = neighboring(i, j, isFlagged);
                            if (bombs < flags) {
                                clss.push("careful");
                            }
                        }
                    }
                }
                out += "<div class='" + clss.join(" ") + "' data-row='" + i + "' data-col='" + j + "'>" + body + "</div>";
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
        if (isUncovered(row, col) || isFlagged(row, col)) {
            return;
        }
        setUncover(row, col);
        if (isBomb(row, col)) {
            failrow = row;
            failcol = col;
            forEach(function(row, col){
                setUncover(row, col);
            });
        } else {
            var count = nearBombs(row, col);
            if (count == 0) {
                uncoverArea(row, col);
            }
        }
        refresh(boardEl);
    }

    function refresh(boardEl) {
        boardEl.innerHTML = renderInner();
        if (finished()) {
            boardEl.classList.add("finished");
        }
    }

    function uncoverArea(row, col) {
        if (row < 0 || row >= nrows || col < 0 || col >= ncols) return;
        if (isSeen(row, col)) {
            return;
        }
        setSeen(row, col);
        setUncover(row, col);
        if (nearBombs(row, col)) {
            return;
        }
        neighboring(row, col, uncoverArea);
    }

    function rightClick(row, col, boardEl) {
        if (isUncovered(row, col)) {
            return;
        }
        if (isFlagged(row, col)) {
            unsetFlag(row, col);
        } else {
            setFlag(row, col);
        }
        refresh(boardEl);
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("contextmenu", onContextMenu);

    function onMouseDown(ev) {
        var boardEl = onContextMenu(ev);
        if (boardEl) {
            var div = ev.target.closest("div.cell");
            if (div) {
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
