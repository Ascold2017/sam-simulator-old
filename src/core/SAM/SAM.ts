import SAM_PARAMS from "@/const/SAM_PARAMS";
import type Engine from "../Engine/Engine";
import Enemy from "../Engine/FlightObject/Enemy";
import Missile from "../Engine/FlightObject/Missile";
import Sounds from "../Sounds";
import type BaseRadarObject from "./RadarObject/BaseRadarObject";
import DetectedRadarObject from "./RadarObject/DetectedRadarObject";
import SnowRadarObject from "./RadarObject/SnowRadarObject";
import UndetectedRadarObject from "./RadarObject/UndetectedRadarObject";

export class SAM {
  public isEnabled = false;
  private engine: Engine;
  private radarObjects: BaseRadarObject[] = [];
  constructor(engine: Engine) {
    this.engine = engine;
    this.engine.addFPSLoop("updateRadar", () => this.updateRadar());
  }

  private updateRadar() {
    const enemys = this.engine.getFlightObjects().filter(fo => fo instanceof Enemy);
    const detectedEnemys = enemys.slice(0, SAM_PARAMS.RADAR_MAX_DETECT_COUNT - 1);
    const undetectedEnemys = enemys.slice(SAM_PARAMS.RADAR_MAX_DETECT_COUNT);
    const missiles = this.engine.getFlightObjects().filter(fo => fo instanceof Missile);
    this.radarObjects = [
      ...detectedEnemys.map(fo => new DetectedRadarObject(fo)).filter(fo => fo.isVisible),
      ...undetectedEnemys.map(fo => new UndetectedRadarObject(fo)).filter(fo => fo.isVisible),
      ...missiles.map(fo => new DetectedRadarObject(fo)),
      ...Array.from(Array(50)).map(() => new SnowRadarObject())
    ]
  }

  public setIsEnabled(value: boolean) {
    this.isEnabled = value;
  }

  public getRadarObjects(): BaseRadarObject[] {
    return this.radarObjects.slice(0);
  }

  public launchMissile(targetId: string) {
    const target = this.radarObjects.find(dfo => dfo.id === targetId);
    if (target && target instanceof DetectedRadarObject && !target.isMissile) {
      Sounds.missileStart();
      this.engine.addFlightObject(new Missile(this.engine, target.getFlightObject() as Enemy));
    }
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