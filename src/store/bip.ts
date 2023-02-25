import type FlightObject from "@/core/FlightObject";
import { defineStore } from "pinia";

export const useBipStore = defineStore("bip", {
  state: () => ({
    flightObjects: [] as FlightObject[],
    wayPoints: {} as Record<string, { x: number, y: number }[]>
  }),

  actions: {
    updateBip(flightObjects: FlightObject[]) {
      this.flightObjects = [...flightObjects];
      this.wayPoints = flightObjects.reduce((acc, fo) => {
        const updatedWayPoints = this.wayPoints[fo.identifier!] || [];
        const lastWayPoint = updatedWayPoints[updatedWayPoints.length -1]
        if ((lastWayPoint && fo.currentPoint.x !== lastWayPoint.x && fo.currentPoint.y !== lastWayPoint.y) || !lastWayPoint) {
          updatedWayPoints.push({ x: fo.currentPoint.x, y: fo.currentPoint.y })
        }
        return {...acc, [fo.identifier!]: [...updatedWayPoints] }
      }, this.wayPoints)
    },
  },
});
