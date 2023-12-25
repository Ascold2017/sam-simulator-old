/**
 * The vector factory.
 *
 * @method Vector3d
 * @param {number} x The first (x) Cartesian coordinate.
 * @param {number} y The second (y) Cartesian coordinate.
 * @param {number} z The third (z) Cartesian coordinate.
 * @constructor
 */

export default class Vector3D {
  private _x = 0;
  private _y = 0;
  private _z = 0;
  constructor({ x, y, z }: { x: number; y: number; z: number }) {
    this._x = x;
    this._y = y;
    this._z = z;
  }
  /**
   * Returns a deep copy of the vector.
   *
   * @method copy
   * @memberOf Vector3d
   * @return {Vector3d} A new vector which is the copy of the current one.
   */
  copy() {
    return new Vector3D({ x: this._x, y: this._y, z: this._z });
  }

  /**
   * Returns or sets the X coordinate.
   *
   * @method x
   * @memberOf Vector3d
   * @param {number=} x Value for the X coordinate. If not provided, the X coordinate is returned.
   * @returns {(number|Vector3d)} The value of the X coordinate or a new vector with the X coordinate as provided.
   */
  x(x?: number) {
    return typeof x === "undefined"
      ? this._x
      : new Vector3D({ x, y: this._y, z: this._z });
  }

  /**
   * Returns or sets the Y coordinate.
   *
   * @method y
   * @memberOf Vector3d
   * @param {number=} y Value for the Y coordinate. If not provided, the Y coordinate is returned.
   * @returns {(number|Vector3d)} The value of the Y coordinate or a new vector with the Y coordinate as provided.
   */
  y(y?: number) {
    return typeof y === "undefined"
      ? this._y
      : new Vector3D({ x: this._x, y, z: this._z });
  }

  /**
   * Returns or sets the Z coordinate.
   *
   * @method z
   * @memberOf Vector3d
   * @param {number=} z Value for the Z coordinate. If not provided, the Z coordinate is returned.
   * @returns {(number|Vector3d)} The value of the Z coordinate or a new vector with the Z coordinate as provided.
   */
  z(z?: number) {
    return typeof z === "undefined"
      ? this._z
      : new Vector3D({ x: this._x, y: this._y, z });
  }

  /**
   * Scales the vector by the specified value.
   *
   * @method scale
   * @memberOf Vector3d
   * @param {number} value Scaling factor.
   * @returns {Vector3d} A new vector which is parallel to the original and scaled by the scaling factor.
   */
  scale(value: number) {
    return new Vector3D({
      x: this._x * value,
      y: this._y * value,
      z: this._z * value,
    });
  }

  /**
   * Returns or sets the vector's length.
   *
   * @method r
   * @memberOf Vector3d
   * @param {number=} value The length to set. If not provided, the vector's length is returned.
   * @returns {(number|Vector3d)} The length of the vector or a new vector which is parallel to the original and has the
   * specified length.
   */
  r(value?: number) {
    const length = Math.sqrt(this._x ** 2 + this._y ** 2 + this._z ** 2);
    if (typeof value === "undefined") {
      return length;
    } else {
      return this.scale(value / length);
    }
  }

  /**
   * Returns or sets the inclination of the vector in spherical coordinates.
   *
   * @method inclination
   * @memberOf Vector3d
   * @param {number=} value The vector's inclination to set. If not provided, the vector's inclination is returned.
   * @return {(number|Vector3d)} The inclination of the vector or a new vector with the same length and azimuth but the
   * inclination is set as specified.
   */
  inclination(value?: number) {
    const length = Math.sqrt(this._x ** 2 + this._y ** 2 + this._z ** 2);
    if (typeof value === "undefined") {
      return Math.atan2(Math.sqrt(this._x ** 2 + this._y ** 2), this._z);
    } else {
      const r = this.r() as number;
      const azimuth = this.azimuth() as number;
      return new Vector3D({
        x: r * Math.cos(azimuth) * Math.sin(value),
        y: r * Math.sin(azimuth) * Math.sin(value),
        z: r * Math.cos(value),
      });
    }
  }

  /**
   * Returns or sets the azimuth of the vector in spherical coordinates.
   *
   * @method azimuth
   * @memberOf Vector3d
   * @param {number=} value The vector's azimuth to set. If not provided, the vector's azimuth is returned.
   * @return {(number|Vector3d)} The azimuth of the vector or a new vector with the same length and inclination but the
   * azimuth is set as specified.
   */
  azimuth(value?: number) {
    if (typeof value === "undefined") {
      return Math.atan2(this._y, this._x);
    } else {
      const r = this.r() as number;
      const inclination = this.inclination() as number;
      return new Vector3D({
        x: r * Math.cos(value) * Math.sin(inclination),
        y: r * Math.sin(value) * Math.sin(inclination),
        z: r * Math.cos(inclination),
      });
    }
  }

  /**
   * Adds a vector to the current vector.
   *
   * @method add
   * @memberOf Vector3d
   * @param {Vector3d} vec The vector to be added to the current vector.
   * @return {Vector3d} A new vector that is the sum of the two vectors.
   */
  add(vec: Vector3D) {
    return new Vector3D({
      x: this._x + (vec.x() as number),
      y: this._y + (vec.y() as number),
      z: this._z + (vec.z() as number),
    });
  }

  /**
   * Subtracts a vector from the current vector.
   *
   * @method sub
   * @memberOf Vector3d
   * @param {Vector3d} vec The vector to be subtracted from the current vector.
   * @return {Vector3d} A new vector that is the difference of the two vectors.
   */
  sub(vec: Vector3D) {
    return new Vector3D({
      x: this._x - (vec.x() as number),
      y: this._y - (vec.y() as number),
      z: this._z - (vec.z() as number),
    });
  }

  /**
   * Returns the dot (scalar) product with another vector.
   *
   * @method dot
   * @memberOf Vector3d
   * @param {Vector3d} vec Vector to multiply the current vector with.
   * @return {number} The scalar product of the two vectors.
   */
  dot(vec: Vector3D) {
    return this._x * (vec.x() as number) +
      this._y * (vec.y() as number) +
      this._z * (vec.z() as number);
  }

  /**
   * Returns the cross (vector) product with another vector.
   *
   * @method cross
   * @memberOf Vector3d
   * @param {Vector3d} vec Vector to multiply the current vector with.
   * @return {Vector3d} The vector product of the two vectors.
   */
  cross(vec: Vector3D) {
    return new Vector3D({
      x: this._y * (vec.z() as number) - this._z * (vec.y() as number),
      y: this._z * (vec.x() as number) - this._x * (vec.z() as number),
      z: this._x * (vec.y() as number) - this._y * (vec.x() as number),
    });
  }

  xyz() {
    return { x: this._x, y: this._y, z: this._z}
  }
}
