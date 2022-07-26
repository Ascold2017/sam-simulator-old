export default class FlightObject {
    identifier: string | null = null
    _wayPoints: { x: number, y: number, z: number }[] = []
    _velocity = 0;
    _launchTime = 0;
    _timeInAir = 0;
    _flightTime = 0;
    isLaunched = false;
    isDestroyed = false;
    currentPoint = { x: 0, y: 0, z: 0 }
    visibilityCoefficient = 0.5;
    constructor({ identifier = new Date().toString(), wayPoints = [], velocity = 100, visibilityCoefficient = 0.5 }: { identifier: string; wayPoints: { x: number; y: number; z: number }[]; velocity: number; visibilityCoefficient?: number; }) {
        this.identifier = identifier;
        this.visibilityCoefficient = visibilityCoefficient;
        this._wayPoints = wayPoints;
        this._velocity = velocity;
        let flightRange = this._getFlightRange();
        let flightTime = (flightRange * 1000) / velocity; // Time in seconds
        this._flightTime = flightTime * 1000; // time in milliseconds
        console.log(`Flight range: ${flightRange} km. Flight time: ${Math.round(flightTime / 60)} min. Velocity: ${velocity} m/s`)
    }

    launch(listener: ((arg0: string) => void)) {
        this.isLaunched = true;
        this._launchTime = +new Date();
        
        console.log(`Flight object launched at ${new Date(this._launchTime)}`)
        listener(`Flight object launched at ${new Date(this._launchTime).toLocaleTimeString()}`)
        const interval = setInterval(() => {
            this._timeInAir = +new Date() - this._launchTime;
            const partOfFlyWay = this._timeInAir / this._flightTime;
            this.currentPoint = this._getCubicBezierXYZatT(this._wayPoints[0], this._wayPoints[1], this._wayPoints[2], this._wayPoints[3], partOfFlyWay);
            if (this._timeInAir >= this._flightTime) {
                console.log('Flight object hit!')
                listener(`Flight object hit at ${new Date(this._launchTime).toLocaleTimeString()}!`)
                this.isDestroyed = true;
                clearInterval(interval)
            }
        }, 0);
        return this;
    }

    _getFlightRange() {
        return this._wayPoints.reduce((acc, point, index, points) => {
            const prevPoint = index === 0 ? point : points[index - 1];
            const length = Math.hypot(point.x - prevPoint.x, point.y - prevPoint.y);
            return acc + length
        }, 0)
    }

    // Given the 4 control points on a Bezier curve 
    // Get x,y at interval T along the curve (0<=T<=1)
    // The curve starts when T==0 and ends when T==1
    _getCubicBezierXYZatT(startPt: { x: any; y: any; z: any; }, controlPt1: { x: any; y: any; z: any; }, controlPt2: { x: any; y: any; z: any; }, endPt: { x: any; y: any; z: any; }, T: number) {
        return ({
            x: this._CubicN(T, startPt.x, controlPt1.x, controlPt2.x, endPt.x),
            y: this._CubicN(T, startPt.y, controlPt1.y, controlPt2.y, endPt.y),
            z: this._CubicN(T, startPt.z, controlPt1.z, controlPt2.z, endPt.z),
        });
    }

    // cubic helper formula
    _CubicN(T: number, a: number, b: number, c: number, d: number) {
        var t2 = T * T;
        var t3 = t2 * T;
        return a + (-a * 3 + T * (3 * a - a * T)) * T + (3 * b + T * (-6 * b + b * 3 * T)) * T + (c * 3 - c * 3 * T) * t2 + d * t3;
    }
}