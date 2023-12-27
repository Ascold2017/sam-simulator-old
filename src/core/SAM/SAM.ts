import type Engine from "../Engine/Engine";
import type Enemy from "../Engine/FlightObject/Enemy";
import Missile from "../Engine/FlightObject/Missile";
import Sounds from "../Sounds";
import DetectedFlightObject from "./DetectedFlightObject";

export class SAM {
  public isEnabled = false;
  private engine: Engine;
  private detectedFlightObjects: DetectedFlightObject[] = [];
  constructor(engine: Engine) {
    this.engine = engine;
    this.engine.addFPSLoop("updateRadar", () => this.updateRadar());
  }

  private updateRadar() {
    this.detectedFlightObjects = this.engine.getFlightObjects().map(fo => new DetectedFlightObject(fo));
  }

  public setIsEnabled(value: boolean) {
    this.isEnabled = value;
  }

  public getDetectedFlightObjects(): DetectedFlightObject[] {
    return this.detectedFlightObjects.slice(0);
  }

  public launchMissile(targetId: string) {
    const target = this.detectedFlightObjects.find(dfo => dfo.id === targetId);
    if (!target || (target && target.isMissile)) return;

    Sounds.missileStart();
    this.engine.addFlightObject(new Missile(this.engine, target.getFlightObject() as Enemy));
  }

  /*
   getTargetOnAzimutAndElevation(azimuth: number, elevation: number) {
  const fo = this.recognizedFlightObjects.find(fo => {
    return (Math.abs(fo.azimuth - azimuth) <= SAM_PARAMS.RADAR_AZIMUT_DETECT_ACCURACY / 2) &&
      (Math.abs(elevation - fo.elevation) <= SAM_PARAMS.RADAR_ELEVATION_DETECT_ACCURACY / 2)
  });

  return fo ? fo.identifier : null;
}

getTargetOnAzimutElevationAndDistance(azimuth: number, elevation: number, distance: number) {
  const id = this.getTargetOnAzimutAndElevation(azimuth, elevation);
  if (!id) return null;
  const fo = this.recognizedFlightObjects.find(f => f.identifier === id)!;
  return Math.abs(fo.distance - distance) <= SAM_PARAMS.RADAR_DISTANCE_DETECT_ACCURACY / 2 ? fo.identifier : null;
}

*/
}