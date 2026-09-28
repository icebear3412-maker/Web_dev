interface IDefaultReactProps {
  children: React.ReactNode;
}

interface IRoute {
  path: string;
  component: React.FC;
  layout: React.FC<IDefaultReactProps> | null;
}

interface IRoomDetailResPayload {
  occupiedSeat: string[],
  size: [number, number],
  price: number,
}

export type { IDefaultReactProps, IRoute, IRoomDetailResPayload };
