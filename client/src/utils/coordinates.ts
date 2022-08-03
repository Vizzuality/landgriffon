export const isCoordinates = (coordinates: string) =>
  /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/.test(coordinates);
