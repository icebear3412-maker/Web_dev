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

interface IMovieShowday {
  date: number[],
}

interface IMovieShowTime {
  time: number[],
}

interface IMovieInfoPayload {
  image: string,
  name: string,
  time: number,
  director: string,
  genre: string,
  actor: string,
  releaseDate: string,
  rating: number,
  subtitle: string,
  description: string,
  trailerLink: string,
}

export type { IDefaultReactProps, IRoute, IRoomDetailResPayload, IMovieInfoPayload, IMovieShowTime, IMovieShowday};
