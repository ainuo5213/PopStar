(function () {
    let config = {
        squareWidth: 40,
        squareHeight: 40,
        squareSet: [],
        tableRows: 10,
        baseScore: 5,
        stepScore: 10,
        targetScore: 2000,
        el: document.getElementsByClassName('pop_star')[0]
    };

    let computed = {
        flag: true,
        choose: [],
        timer: null,
        totalScore: 0,
        tempSquare: null,
        level: 1,
        stepTargetScore: 1000,
        score: 0
    };

    function Block(bg, row, col) {
        let width = config.squareWidth,
            height = config.squareHeight,
            div = document.createElement('div');
        div.number = bg;
        div.row = row;
        div.col = col;
        div.style.width = width + "px";
        div.style.height = height + "px";
        div.style.display = "inline-block";
        div.style.position = "absolute";
        div.style.boxSizing = "border-box";
        div.style.borderRadius = "1.2rem";
        return div;
    }

    function PopStar() {
        return new PopStar.prototype.init();
    }

    PopStar.prototype = {
        init: function () {
            this.initTable();
        },
        initTable: function () {
            this.initSquareSet();
            this.initBlocks();
        },
        mouseClick: function () {
            let squareSet = config.squareSet,
                choose = computed.choose,
                baseScore = config.baseScore,
                stepScore = config.stepScore,
                el = config.el,
                self = this,
                len = choose.length;
            if (!computed.flag || len <= 1) {
                return;
            }
            computed.flag = false;
            computed.tempSquare = null;
            let score = 0;
            for (let i = 0; i < len; i++) {
                score += baseScore + i * stepScore;
            }
            computed.totalScore += score;
            let curScore = document.getElementsByClassName("current_score")[0];
            curScore.innerHTML = "当前分数：" + computed.totalScore;
            for (let i = 0; i < len; i++) {
                setTimeout(function () {
                    squareSet[choose[i].row][choose[i].col] = null;
                    el.removeChild(choose[i]);
                }, i * 100);
            }
            setTimeout(function () {
                self.move();
                //判断结束
                setTimeout(function () {
                    let is = self.isFinish();
                    if (is) {
                        if (computed.totalScore >= config.targetScore) {
                            alert("恭喜获胜");
                        } else {
                            alert("游戏失败");
                        }
                    } else {
                        choose = [];
                        computed.flag = true;//在所有动作都执行完成之后释放锁
                        self.mouseOver(computed.tempSquare);
                    }
                }, 300 + choose.length * 150);
            }, choose.length * 100);
        },
        isFinish: function () {
            let squareSet = config.squareSet, rows = squareSet.length;
            for (let i = 0; i < rows; i++) {
                let row = squareSet[i].length;
                for (let j = 0; j < row; j++) {
                    let temp = [];
                    this.checkLink(squareSet[i][j], temp);
                    if (temp.length > 1) {
                        return false;
                    }
                }
            }
            return true;
        },
        move: function () {
            let width = config.tableRows, squareSet = config.squareSet;
            //向下移动
            for (let i = 0; i < width; i++) {
                let pointer = 0;//pointer指向小方块，当遇到null的时候停止，等待上面的小方块落到这里来
                for (let j = 0; j < width; j++) {
                    if (squareSet[j][i] != null) {
                        if (j !== pointer) {
                            squareSet[pointer][i] = squareSet[j][i];
                            squareSet[j][i].row = pointer;
                            squareSet[j][i] = null;
                        }
                        pointer++;
                    }
                }
            }
            //横向移动（最下面一行其中有无空列）
            for (let i = 0; i < squareSet[0].length;) {
                if (squareSet[0][i] == null) {
                    for (let j = 0; j < width; j++) {
                        squareSet[j].splice(i, 1);
                    }
                    continue;
                }
                i++;
            }
            this.refresh()
        },

        mouseOver: function (obj) {
            if (!computed.flag) {//处于锁定状态不允许有操作
                computed.tempSquare = obj;
                return;
            }
            this.clearFlicker();
            let choose = [];
            this.checkLink(obj, choose);
            computed.choose = choose;
            if (choose.length <= 1) {
                choose = [];
                return;
            }
            this.flicker(choose);
            this.computeScore(choose);
        },

        computeScore: function (arr) {
            let score = 0,
                len = arr.length,
                baseScore = config.baseScore,
                stepScore = config.stepScore;
            for (let i = 0; i < len; i++) {
                score += baseScore + i * stepScore
            }
            if (score <= 0) {
                return;
            }
            computed.score = score;
            let selectScore = document.getElementsByClassName('selecting_score')[0];
            selectScore.style.opacity = '1';
            selectScore.style.transition = null;
            selectScore.innerHTML = arr.length + "块 " + score + "分";
            setTimeout(function () {
                selectScore.style.opacity = '0';
                selectScore.style.transition = 'opacity 1s';
            }, 1000)
        },
        clearFlicker: function () {
            let timer = computed.timer,
                squareSet = config.squareSet,
                rows = squareSet.length;
            if (timer !== null) {
                clearInterval(timer)
            }
            for (let i = 0; i < rows; i++) {
                let row = squareSet[i].length;
                for (let j = 0; j < row; j++) {
                    let div = squareSet[i][j];
                    if (div === null) {
                        continue;
                    }
                    div.style.border = '0px solid #BFEFFF';
                    div.style.transform = 'scale(0.95)'
                }
            }
        },

        flicker: function (arr) {
            let len = arr.length, num = 0;
            computed.timer = setInterval(function () {
                for (let i = 0; i < len; i++) {
                    let div = arr[i];
                    div.style.border = "3px solid #BFEFFF";
                    div.style.transform = `scale(${0.90 + Math.pow(-1, num) * 0.05})`
                }
                num++;
            }, 300)
        },

        checkLink: function (obj, arr) {
            if (obj === null) {
                return;
            }
            arr.push(obj);
            /**
             * 检查左边方块是否可以加入到选入的可消除星星行列：
             * 选中的星星不能是最左边的，
             * 选中的星星左边要有星星，
             * 选中的星星左边的星星的跟选中的星星一样，
             * 选中的星星左边的星星没有被选中过
             */
            let squareSet = config.squareSet, width = config.tableRows;
            if (obj.col > 0 && squareSet[obj.row][obj.col - 1] && squareSet[obj.row][obj.col - 1].number === obj.number && arr.indexOf(squareSet[obj.row][obj.col - 1]) === -1) {
                this.checkLink(squareSet[obj.row][obj.col - 1], arr);
            }
            if (obj.col < width - 1 && squareSet[obj.row][obj.col + 1] && squareSet[obj.row][obj.col + 1].number === obj.number && arr.indexOf(squareSet[obj.row][obj.col + 1]) === -1) {
                this.checkLink(squareSet[obj.row][obj.col + 1], arr);
            }
            if (obj.row < width - 1 && squareSet[obj.row + 1][obj.col] && squareSet[obj.row + 1][obj.col].number === obj.number && arr.indexOf(squareSet[obj.row + 1][obj.col]) === -1) {
                this.checkLink(squareSet[obj.row + 1][obj.col], arr);
            }
            if (obj.row > 0 && squareSet[obj.row - 1][obj.col] && squareSet[obj.row - 1][obj.col].number === obj.number && arr.indexOf(squareSet[obj.row - 1][obj.col]) === -1) {
                this.checkLink(squareSet[obj.row - 1][obj.col], arr);
            }
        },
        initSquareSet: function () {
            let rows = config.tableRows, arr = config.squareSet;
            for (let i = 0; i < rows; i++) {
                arr[i] = [];
                for (let j = 0; j < rows; j++) {
                    arr[i][j] = [];
                }
            }
        },
        initBlocks: function () {
            let squareSet = config.squareSet,
                self = this,
                el = config.el,
                rows = squareSet.length;
            for (let i = 0; i < rows; i++) {
                let row = squareSet[i].length;
                for (let j = 0; j < row; j++) {
                    let square = this.createBlock(Math.floor(Math.random() * 5), i, j);
                    square.onmouseover = function () {
                        self.mouseOver(this)
                    };
                    square.onclick = function () {
                        self.mouseClick();
                    };
                    squareSet[i][j] = square;
                    el.appendChild(square);
                }
            }
            this.refresh()
        },
        refresh: function () {
            let squareSet = config.squareSet, rows = squareSet.length,
                width = config.squareWidth,
                height = config.squareHeight;
            for (let i = 0; i < rows; i++) {
                let row = squareSet[i].length;
                for (let j = 0; j < row; j++) {
                    let square = squareSet[i][j];
                    if (square == null) {
                        continue;
                    }
                    square.row = i;
                    square.col = j;
                    square.style.transition = "left 0.3s, bottom 0.3s";
                    square.style.left = squareSet[i][j].col * width + "px";
                    square.style.bottom = squareSet[i][j].row * height + "px";
                    square.style.backgroundImage = "url('./img/" + squareSet[i][j].number + ".png')";
                    square.style.backgroundSize = "cover";
                    square.style.transform = "scale(0.95)";
                }
            }
        },
        createBlock: function (prefix, row, col) {
            return new Block(prefix, row, col);
        }
    };
    PopStar.prototype.init.prototype = PopStar.prototype;
    window.PopStar = PopStar;
})();