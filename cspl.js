if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis
                    ? this
                    : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}
window.Spline = (function () {
    var _gaussJ = {};
    _gaussJ.solve = function (A, x) // in Matrix, out solutions
    {
        var i, j;
        var m = A.length;
        for (var k = 0; k < m; k++)  // column
        {
            // pivot for column
            var i_max = 0;
            var vali = Number.NEGATIVE_INFINITY;
            for (i = k; i < m; i++) if (A[i][k] > vali) {
                i_max = i;
                vali = A[i][k];
            }
            _gaussJ.swapRows(A, k, i_max);

            if (A[i_max][i] == 0) console.log("matrix is singular!");

            // for all rows below pivot
            for (i = k + 1; i < m; i++) {
                for (j = k + 1; j < m + 1; j++)
                    A[i][j] = A[i][j] - A[k][j] * (A[i][k] / A[k][k]);
                A[i][k] = 0;
            }
        }

        for (i = m - 1; i >= 0; i--)   // rows = columns
        {
            var v = A[i][m] / A[i][i];
            x[i] = v;
            for (j = i - 1; j >= 0; j--)   // rows
            {
                A[j][m] -= A[j][i] * v;
                A[j][i] = 0;
            }
        }
    };
    _gaussJ.zerosMat = function (r, c) {
        var A = [];
        for (var i = 0; i < r; i++) {
            A.push([]);
            for (var j = 0; j < c; j++) A[i].push(0);
        }
        return A;
    };
    _gaussJ.printMat = function (A) {
        for (var i = 0; i < A.length; i++) console.log(A[i]);
    };
    _gaussJ.swapRows = function (m, k, l) {
        var p = m[k];
        m[k] = m[l];
        m[l] = p;
    };


    var getNaturalKs = function (parameters)    // in x values, in y values, out k values
    {
        var xs = parameters.xs;
        var ys = parameters.ys;
        var ks = parameters.ks;
        var n = xs.length - 1;
        var A = _gaussJ.zerosMat(n + 1, n + 2);

        for (var i = 1; i < n; i++)  // rows
        {
            A[i][i - 1] = 1 / (xs[i] - xs[i - 1]);

            A[i][i  ] = 2 * (1 / (xs[i] - xs[i - 1]) + 1 / (xs[i + 1] - xs[i]));

            A[i][i + 1] = 1 / (xs[i + 1] - xs[i]);

            A[i][n + 1] = 3 * ( (ys[i] - ys[i - 1]) / ((xs[i] - xs[i - 1]) * (xs[i] - xs[i - 1])) + (ys[i + 1] - ys[i]) / ((xs[i + 1] - xs[i]) * (xs[i + 1] - xs[i])) );
        }

        A[0][0  ] = 2 / (xs[1] - xs[0]);
        A[0][1  ] = 1 / (xs[1] - xs[0]);
        A[0][n + 1] = 3 * (ys[1] - ys[0]) / ((xs[1] - xs[0]) * (xs[1] - xs[0]));

        A[n][n - 1] = 1 / (xs[n] - xs[n - 1]);
        A[n][n  ] = 2 / (xs[n] - xs[n - 1]);
        A[n][n + 1] = 3 * (ys[n] - ys[n - 1]) / ((xs[n] - xs[n - 1]) * (xs[n] - xs[n - 1]));

        _gaussJ.solve(A, ks);
    };

    var evalSpline = function (parameters, x) {
        var xs = parameters.xs,
            ys = parameters.ys,
            ks = parameters.ks,
            i = 1;
        while (xs[i] < x) i++;
        if (xs[i]) {
            var t = (x - xs[i - 1]) / (xs[i] - xs[i - 1]);

            var a = ks[i - 1] * (xs[i] - xs[i - 1]) - (ys[i] - ys[i - 1]);
            var b = -ks[i  ] * (xs[i] - xs[i - 1]) + (ys[i] - ys[i - 1]);

            return (1 - t) * ys[i - 1] + t * ys[i] + t * (1 - t) * (a * (1 - t) + b * t);
        } else {
            throw 'out of range error'
        }
    };


    var cspl = function (grid) {
        this.xs = [];
        this.ys = [];
        this.ks = [];
        for (var x in grid) {
            if (grid.hasOwnProperty(x)) {
                this.xs.push(parseFloat(x));
                this.ys.push(grid[x]);
            }
        }
        getNaturalKs(this);
        return evalSpline.bind(this, this);
    };
    cspl.prototype.recompute = function () {
        getNaturalKs(this);
    };

    return cspl
})();

