function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export default [
    {
      id: 1,
      name: "Su-25",
      rcs: 10,
      maxVelocity: 208,
      altitude: () => getRandomInt(20, 500)
    },
    {
      id: 2,
      name: "Su-34/35",
      rcs: 1,
      maxVelocity: 600,
      altitude: () => getRandomInt(50, 5000), // From 50 m to 5000 m
    },
    {
      id: 3,
      name: "MIG-29",
      rcs: 4,
      maxVelocity: 600,
      altitude: () =>  getRandomInt(500, 5000), // From 500 m to 5000 m
    },
    {
      id: 4,
      name: "Bird",
      rcs: 0.01,
      maxVelocity: 13.9,
      altitude: () =>  getRandomInt(5, 500), // From 5 m to 500 m
    },
    {
      id: 5,
      name: "X-101",
      rcs: 0.01,
      maxVelocity: 200,
      altitude: () =>  getRandomInt(25, 50), // From 25 m to 50 m
    },
    {
      id: 6,
      name: "P-800 Onix",
      rcs: 0.3,
      maxVelocity: 680,
      altitude: () => getRandomInt(10, 15), // From 10 m to 15 m
    },
    {
      id: 7,
      name: "X-555",
      rcs: 0.5,
      maxVelocity: 200,
      altitude: () =>  getRandomInt(30, 50), // From 30 m to 50 m
    },
    {
      id: 8,
      name: "SSM Tochka-U",
      rcs: 1.5,
      maxVelocity: 1100,
      altitude: () =>  getRandomInt(6000, 26000), // From 6000 m to 26000 m
    },
    {
      id: 9,
      name: "SSM Iskander",
      rcs: 0.15,
      maxVelocity: 2100,
      altitude: () =>  getRandomInt(6000, 10000), // From 6000 m to  100000 m
    },
  ]