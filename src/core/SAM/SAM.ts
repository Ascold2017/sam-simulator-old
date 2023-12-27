import SAM_PARAMS from "@/const/SAM_PARAMS";
import type Engine from "../Engine/Engine";
import Enemy from "../Engine/FlightObject/Enemy";
import Missile from "../Engine/FlightObject/Missile";
import Sounds from "../Sounds";
import type BaseRadarObject from "./RadarObject/BaseRadarObject";
import DetectedRadarObject from "./RadarObject/DetectedRadarObject";
import SnowRadarObject from "./RadarObject/SnowRadarObject";
import UndetectedRadarObject from "./RadarObject/UndetectedRadarObject";

class SelectedTargetObject {
  public target: DetectedRadarObject;
  public missiles: Missile[] = [];
  constructor(target: DetectedRadarObject) {
    this.target = target;
  }
}
export class SAM {
  public isEnabled = false;
  private engine: Engine;
  private radarObjects: BaseRadarObject[] = [];
  private selectedObjects = new Map<string, SelectedTargetObject>();
  constructor(engine: Engine) {
    this.engine = engine;
    this.engine.addFPSLoop("updateRadar", () => this.updateRadar());
  }

  private updateRadar() {
    const enemys = this.engine.getFlightObjects()
      .filter(fo => fo instanceof Enemy)
      .sort(DetectedRadarObject.sortByVisibilityComparator);
    const detectedEnemys = enemys.slice(0, SAM_PARAMS.RADAR_MAX_DETECT_COUNT - 1);
    const undetectedEnemys = enemys.slice(SAM_PARAMS.RADAR_MAX_DETECT_COUNT);

    const missiles = this.engine.getFlightObjects().filter(fo => fo instanceof Missile);
    const detectedRadarObjects = detectedEnemys.map(fo => new DetectedRadarObject(fo)).filter(fo => fo.isVisible);
    this.radarObjects = [
      ...detectedRadarObjects,
      ...undetectedEnemys.map(fo => new UndetectedRadarObject(fo)).filter(fo => fo.isVisible),
      ...missiles.map(fo => new DetectedRadarObject(fo)),
      ...Array.from(Array(50)).map(() => new SnowRadarObject())
    ];

    this.selectedObjects.forEach(selectedObject => {
      if (!detectedRadarObjects.some(dro => dro.id === selectedObject.target.id)) {
        this.selectedObjects.delete(selectedObject.target.id);
        // TODO destroy missiles
      }
    })
  }

  public setIsEnabled(value: boolean) {
    this.isEnabled = value;
  }

  public getRadarObjects(): BaseRadarObject[] {
    return this.radarObjects.slice(0);
  }

  public getSelectedObjects(): SelectedTargetObject[] {
    return Array.from(this.selectedObjects.values());
  }

  public launchMissile(targetId: string) {
    const target = this.radarObjects.find(dfo => dfo.id === targetId);
    if (target && target instanceof DetectedRadarObject && !target.isMissile) {
      Sounds.missileStart();
      this.engine.addFlightObject(new Missile(this.engine, target.getFlightObject() as Enemy));
    }
  }

  public selectTarget(targetId: string) {
    const radarObject = this.radarObjects.filter(ro => ro instanceof DetectedRadarObject).find(dro => dro.id === targetId) as DetectedRadarObject;
 
    if (radarObject && !this.selectedObjects.has(targetId) && this.selectedObjects.size < SAM_PARAMS.RADAR_MAX_SELECTED_COUNT) {
      this.selectedObjects.set(targetId, new SelectedTargetObject(radarObject));
    }
  }

  public unselectTarget(targetId: string) {
    if (this.selectedObjects.has(targetId)) {
      // TODO destroy missiles
      this.selectedObjects.delete(targetId)
    }
  }

  public resetTargets() {
    this.selectedObjects.clear();
    // TODO destroy missiles
  }
}