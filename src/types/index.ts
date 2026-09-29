import type { SvgIconComponent } from '@mui/icons-material';
interface IDefaultReactProps {
  children: React.ReactNode;
}

interface IRoute {
  path: string;
  component: React.FC;
  layout: React.FC<IDefaultReactProps> | null;
}

interface IButtonWithIconAndDisplayText {
  display: string,
  link: string,
  icon: SvgIconComponent,
} 

interface ICardWithLink {
  image: string;
  linkTo: string;
}

interface ICardWithDescription {
  title: string;
  text: string;
  image: string;
}

interface IMovieCard {
  title: string;
  age: number;
  image: string;
  linkTo: string;
}

export type { IDefaultReactProps, IRoute, ICardWithLink, ICardWithDescription, IMovieCard, IButtonWithIconAndDisplayText };
