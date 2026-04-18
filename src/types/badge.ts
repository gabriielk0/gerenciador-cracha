export interface Point {
  x: number;
  y: number;
}

export interface BadgePoints {
  topRight: Point | null;
  topLeft: Point | null;
  bottomRight: Point | null;
  bottomLeft: Point | null;
}

export interface BadgeData {
  name: string;
  team: string;
}

export type PointKey = 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';

export type InputMode = 'manual' | 'bulk';
