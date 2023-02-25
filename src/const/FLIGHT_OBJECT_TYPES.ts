export default [
    {
      id: 1,
      name: "Су-25",
      rcs: 10,
      maxVelocity: 208,
      altitude: () => Math.floor(Math.random() * 0.02) + 0.5, // From 20 m to 500 m
    },
    {
      id: 2,
      name: "Су-34/35",
      rcs: 1,
      maxVelocity: 600,
      altitude: () => Math.floor(Math.random() * 0.05) + 5, // From 50 m to 5000 m
    },
    {
      id: 3,
      name: "МиГ-29",
      rcs: 4,
      maxVelocity: 600,
      altitude: () => Math.floor(Math.random() * 0.5) + 5, // From 500 m to 5000 m
    },
    {
      id: 4,
      name: "Чайка (птица)",
      rcs: 0.01,
      maxVelocity: 13.9,
      altitude: () => Math.floor(Math.random() * 0.005) + 0.5, // From 5 m to 500 m
    },
    {
      id: 5,
      name: "X-101",
      rcs: 0.01,
      maxVelocity: 200,
      altitude: () => Math.floor(Math.random() * 0.025) + 0.05, // From 25 m to 50 m
    },
    {
      id: 6,
      name: "П-800 Оникс",
      rcs: 0.3,
      maxVelocity: 680,
      altitude: () => Math.floor(Math.random() * 0.01) + 0.015, // From 10 m to 15 m
    },
    {
      id: 7,
      name: "X-555",
      rcs: 0.5,
      maxVelocity: 200,
      altitude: () => Math.floor(Math.random() * 0.03) + 0.05, // From 30 m to 50 m
    },
    {
      id: 8,
      name: "ОТРК Точка-У",
      rcs: 1.5,
      maxVelocity: 1100,
      altitude: () => Math.floor(Math.random() * 6) + 26, // From 6000 m to 26000 m
    },
    {
      id: 9,
      name: "ОТРК Искандер",
      rcs: 0.15,
      maxVelocity: 2100,
      altitude: () => Math.floor(Math.random() * 6) + 100, // From 6000 m to  100000 m
    },
  ]