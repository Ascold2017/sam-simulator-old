import SAM_PARAMS from "@/const/SAM_PARAMS";
import type Engine from "../Engine/Engine";
import Enemy from "../Engine/FlightObject/Enemy";
import Missile from "../Engine/FlightObject/Missile";
import Sounds from "../Sounds";
import BaseRadarObject from "./RadarObject/BaseRadarObject";
import DetectedRadarObject from "./RadarObject/DetectedRadarObject";
import SnowRadarObject from "./RadarObject/SnowRadarObject";
import UndetectedRadarObject from "./RadarObject/UndetectedRadarObject";
import _ from 'lodash';
export class MissileChannel {
  public id: number;
  public target: DetectedRadarObject | null = null;
  public missile: Missile | null = null;
  constructor(id: number) {
    this.id = id;
  }
  public set(target: DetectedRadarObject, missile: Missile) {
    this.target = target;
    this.missile = missile;
  }
  public reset() {
    this.target = null;
    this.missile?.destroy();
    this.missile = null;
  }
}
export class SAM {
  public isEnabled = false;
  private engine: Engine;
  private radarObjects: BaseRadarObject[] = [];
  private selectedObjectIds: string[] = [];
  private missileChannels: Record<number, MissileChannel> = {};
  private missilesLeft = SAM_PARAMS.MISSILES_COUNT;
  constructor(engine: Engine) {
    this.engine = engine;
    this.engine.addFPSLoop("updateRadar", () => this.updateRadar(), 40);
    for (let i = 0; i < SAM_PARAMS.MISSILES_CHANNEL_COUNT; i++) {
      this.missileChannels[i] = new MissileChannel(i);
    }
  }

  private updateRadar() {

    const enemys = this.engine.getFlightObjects()
      .filter(fo => fo instanceof Enemy && BaseRadarObject.getDistance(fo.getCurrentPoint()) < SAM_PARAMS.MAX_DISTANCE)
      .sort(DetectedRadarObject.sortByVisibilityComparator);
    
    const detectedEnemys = enemys
      .filter(e => {
        const distance = BaseRadarObject.getDistance(e.getCurrentPoint());
        return distance < SAM_PARAMS.MAX_CAPTURE_RANGE && distance > SAM_PARAMS.MIN_CAPTURE_RANGE
      })
      .slice(0, SAM_PARAMS.RADAR_MAX_DETECT_COUNT - 1);

    const undetectedEnemys = enemys.filter(e => !detectedEnemys.some(de => de.id === e.id));

    const missiles = this.engine.getFlightObjects().filter(fo => fo instanceof Missile);
    const detectedRadarObjects = detectedEnemys.map(fo => new DetectedRadarObject(fo)).filter(fo => fo.isVisible);
    this.radarObjects = [
      ...detectedRadarObjects,
      ...undetectedEnemys.map(fo => new UndetectedRadarObject(fo)).filter(fo => fo.isVisible),
      ...missiles.map(fo => new DetectedRadarObject(fo)),
      ...Array.from(Array(50)).map(() => new SnowRadarObject())
    ];
    // remove disapperead selected objects
    this.selectedObjectIds = this.selectedObjectIds.filter(selectedObjectId => {
      return detectedRadarObjects.some(dro => dro.id === selectedObjectId);
    });
    // free missile channels with disappered targets
    for (let missileChannelId in this.missileChannels) {
      const missileChannelTarget = this.missileChannels[missileChannelId].target;
      if (!!missileChannelTarget?.id && !detectedRadarObjects.some(dro => dro.id === missileChannelTarget?.id)) {
        this.missileChannels[missileChannelId].reset();
      }
    }
  }

  public setIsEnabled(value: boolean) {
    this.isEnabled = value;
  }

  public getRadarObjects(): BaseRadarObject[] {
    return _.cloneDeep(this.radarObjects);
  }

  public getSelectedObjects(): DetectedRadarObject[] {
    return this.radarObjects.filter(ro => this.selectedObjectIds.includes(ro.id)) as DetectedRadarObject[];
  }

  public getMissileChannels(): MissileChannel[] {
    return _.cloneDeep(Object.values(this.missileChannels));
  }

  public getMissilesCount() {
    return this.missilesLeft;
  }

  public launchMissile(targetId: string, channelId: number, method: '3P' | '1/2') {
    const target = this.radarObjects.find(dfo => dfo.id === targetId && dfo instanceof DetectedRadarObject && !dfo.isMissile) as DetectedRadarObject;
    const channel = this.missileChannels[channelId];
    if (target && this.selectedObjectIds.includes(targetId) && this.missilesLeft > 0 && channel && !channel.missile) {
      const missile = new Missile(this.engine, target.getFlightObject() as Enemy, method);
      this.missilesLeft--;

      channel.set(target, missile);

      this.engine.addFlightObject(missile);
      Sounds.missileStart();
    }
  }

  public resetMissile(channelId: number) {
    this.missileChannels[channelId]?.reset();
  }

  public selectTarget(targetId: string) {
    const radarObject = this.radarObjects.filter(ro => ro instanceof DetectedRadarObject).find(dro => dro.id === targetId) as DetectedRadarObject;

    if (radarObject && !this.selectedObjectIds.some(id => id === targetId) && this.selectedObjectIds.length < SAM_PARAMS.RADAR_MAX_SELECTED_COUNT) {
      this.selectedObjectIds.push(radarObject.id)
    }
  }

  public unselectTarget(targetId: string) {
    if (this.selectedObjectIds.some(id => id === targetId)) {
      Object.values(this.missileChannels).forEach(missileChannel => {
        if (missileChannel.target && missileChannel.target.id === targetId) {
          missileChannel.reset();
        }
      })
      this.selectedObjectIds = this.selectedObjectIds.filter(id => id !== targetId)
    }
  }

  public resetTargets() {
    this.selectedObjectIds = [];
    Object.values(this.missileChannels).forEach(missileChannel => missileChannel.reset())
  }
}