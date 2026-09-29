import type { SvgIconComponent } from '@mui/icons-material';
interface IDefaultReactProps {
  children: React.ReactNode;
}

interface IRoute {
  path: string;
  component: React.FC;
  layout: React.FC<IDefaultReactProps> | null;
}

interface INameLink {
  display: string;
  link: string;
  icon: SvgIconComponent;
}

export type { IDefaultReactProps, IRoute, INameLink };
