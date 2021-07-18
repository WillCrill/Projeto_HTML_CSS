'use strict';
!function()
{
    var request = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame
        || function(cb) { return setTimeout(cb, 30) };

    Math.TAU = Math.PI * 2;

    //h90
    var Green = function()
    {
        var me     = this;
        var canvas = document.getElementById('canvas');
        var engine = canvas.getContext('2d');

        var config = {
            small  : {
                data      : [],
                lines     : true,
                size      : [2, 5],
                speed     : [0.1, 3],
                count     : 300,
                color     : [90, 0],
                lineRange : window.innerWidth / 40,
                paralax   : 0.2
            },
            middle : {
                data      : [],
                lines     : true,
                size      : [5, 15],
                speed     : [0.1, 2],
                count     : 70,
                color     : [90, 0],
                lineRange : window.innerWidth / 30,
                round     : [1, 1.9],
                paralax   : 0.5
            },
            big    : {
                data      : [],
                lines     : false,
                smooth    : true,
                size      : [15, 50],
                speed     : [0.1, 1],
                color     : [90, 0],
                count     : 30,
                smoothColor : [90, 0, 0],
                round     : [1, 5.9],
                paralax   : 1
            },
            faaaaaaat : {
                data      : [],
                lines     : false,
                smooth    : true,
                size      : [150, 500],
                speed     : [0.1, 1],
                color     : [90, 0, 0.3],
                count     : 5,
                smoothColor : [90, 0, 0],
                paralax   : 3
            }
        };

        var mouse = {
            x : window.innerWidth / 2,
            y : window.innerHeight / 2
        };

        var paralax     = 400;
        var paralaxMove = {
            x : 0,
            y : 0
        };

        var light    = 50;
        var maxLight = 50;

        var right  = 0;
        var left   = 0;
        var top    = 0;
        var bottom = 0;

        this.run = function()
        {
            canvas.setAttribute('width', window.innerWidth);
            canvas.setAttribute('height', window.innerHeight);

            window.addEventListener('mousemove', function(e) {
                mouse.x = e.clientX;
                mouse.y = e.clientY;

                light += 2;

                if (light > maxLight) {
                    light = maxLight;
                }
            });

            build();
            tick();
        };

        var build = function()
        {
            for (var type in config) {
                var part = config[type];

                for (var i = 0; i < part.count; i++) {
                    if (part.round) {

                        var round      = range(part.round);
                        var roundSpeed = [];
                        var width      = [];

                        for (var j = 0; j < round; j++) {
                            roundSpeed.push(range([5, 30], true));
                            width.push(range([1, Math.TAU - 0.5]));
                        }

                        part.data.push({
                            x      : randomPosition(window.innerWidth, part.size[1] + paralax),
                            y      : randomPosition(window.innerHeight, part.size[1] + paralax),
                            size   : range(part.size),
                            dirX   : range(part.speed, 1),
                            dirY   : range(part.speed, 1),
                            offset : 0,
                            width      : width,
                            round      : round,
                            roundSpeed : roundSpeed
                        });
                    } else {
                        part.data.push({
                            x      : randomPosition(window.innerWidth, part.size[1] + paralax),
                            y      : randomPosition(window.innerHeight, part.size[1] + paralax),
                            size   : range(part.size),
                            dirX   : range(part.speed, 1),
                            dirY   : range(part.speed, 1),
                            offset : 0
                        });
                    }
                }
            }
        };

        var clear = function()
        {
            //engine.fillStyle = 'rgba(0, 0, 0, 0.5)';
            //engine.fillRect(0, 0, window.innerWidth, window.innerHeight);
            engine.clearRect(0, 0, window.innerWidth, window.innerHeight);
        };

        var tick = function()
        {
            light--;

            if (light < 0) {
                light = 0;
            }

            paralaxMove.x = paralax - paralax / window.innerWidth * mouse.x - paralax / 2;
            paralaxMove.y = paralax - paralax / window.innerHeight * mouse.y - paralax / 2;

            clear();
            drawPoints();

            request(tick);
        };

        var drawPoint = function(obj, part)
        {
            obj.offset++;

            if (part.smooth) {
                var g = engine.createRadialGradient(x(obj.x, part.paralax), y(obj.y, part.paralax), obj.size / 3, x(obj.x, part.paralax), y(obj.y, part.paralax), obj.size);
                g.addColorStop(0, buildColor(part.color));
                g.addColorStop(1, buildAlphaColor(part.smoothColor));
                engine.fillStyle = g;
            } else {
                engine.fillStyle = buildColor(part.color);
            }

            engine.beginPath();
            engine.arc(
                x(obj.x, part.paralax),
                y(obj.y, part.paralax),
                obj.size | 0,
                0,
                Math.TAU
            );
            engine.fill();

            if (part.round) {
                for (var i = 1; i < obj.round + 1; i++) {
                    engine.lineWidth = 1;
                    engine.beginPath();
                    engine.arc(
                        x(obj.x, part.paralax),
                        y(obj.y, part.paralax),
                        obj.size + obj.size * 0.2 * i,
                        obj.offset / obj.roundSpeed[i],
                        obj.offset / obj.roundSpeed[i] + obj.width[i]
                    );
                    engine.stroke();

                    var mid   = obj.width[i] / 2;
                    var range = mid * 0.2;

                    engine.lineWidth = 5;
                    engine.beginPath();
                    engine.arc(
                        x(obj.x, part.paralax),
                        y(obj.y, part.paralax),
                        obj.size + obj.size * 0.2 * i,
                        obj.offset / obj.roundSpeed[i] + mid - range,
                        obj.offset / obj.roundSpeed[i] + mid + range
                    );
                    engine.stroke();
                }
            }

            if (obj.x >right) {
                obj.dirX = 0 - obj.dirX;
            } else if (obj.x < left) {
                obj.dirX = Math.abs(obj.dirX);
            } else if (obj.y > bottom) {
                obj.dirY = 0 - obj.dirY;
            } else if (obj.y < top) {
                obj.dirY = Math.abs(obj.dirY);
            }

            obj.x += obj.dirX;
            obj.y += obj.dirY;
        };

        var buildColor = function(c)
        {
            if (c.length == 3) {
                return buildAlphaColor(c);
            }

            return 'hsl(' + c[0] + ', 100%, ' + (c[1] + light) + '%)';
        };

        var buildAlphaColor = function(c)
        {
            return 'hsla(' + c[0] + ', 100%, ' + (c[1] + light) + '%,' + c[2] + ')';
        };

        var drawPoints = function()
        {
            for (var type in config) {
                var part = config[type];

                engine.fillStyle   = buildColor(part.color);
                engine.strokeStyle = buildColor(part.color);

                right  = window.innerWidth + part.size[1] * 2 + paralax / 2;
                left   = 0 - part.size[1] * 2 - paralax / 2;
                top    = left;
                bottom = window.innerHeight + part.size[1] * 2 + paralax / 2;

                engine.lineWidth = parseInt(part.size[1] / 2);

                if (part.lines) {
                    for (var i = 0; i < part.data.length; i++) {
                        var obj = part.data[i];

                        for (var j = 0; j < part.data.length; j++) {
                            if (inRange(obj, part.data[j], part.lineRange) && j != i) {
                                engine.beginPath();
                                engine.moveTo(x(obj.x, part.paralax), y(obj.y, part.paralax));
                                engine.lineTo(x(part.data[j].x, part.paralax), y(part.data[j].y, part.paralax));
                                engine.stroke();
                            }
                        }

                        drawPoint(obj, part);
                    }
                } else {
                    for (var i = 0; i < part.data.length; i++) {
                        drawPoint(part.data[i], part);
                    }
                }
            }
        };

        var x = function(x, p)
        {
            return parseInt(x + paralaxMove.x * p);
        };

        var y = function(y, p)
        {
            return parseInt(y + paralaxMove.y * p);
        };


        var inRange = function(obj1, obj2, range)
        {
           return (
                obj1.x > obj2.x - range &&
                obj1.x < obj2.x + range &&
                obj1.y > obj2.y - range &&
                obj1.y < obj2.y + range
            );
        };

        var randomPosition = function(width, size)
        {
            return Math.random() * (width + size * 4) - size * 2;
        };

        var range = function(range, negative)
        {
            var result = range[0] + (range[1] - range[0]) * Math.random();

            if (negative && Math.random() < 0.5) {
                result = 0 - result;
            }

            return result;
        }
    };

    var g = new Green();
    g.run();
}();