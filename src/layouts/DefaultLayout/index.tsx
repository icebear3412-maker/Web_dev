import { CssBaseline } from '@mui/material';

import type { IDefaultReactProps } from '@/types';

import HeaderComponent from '@/layouts/components/Header';
import FooterComponent from '@/layouts/components/Footer';

const DefaultLayout: React.FC<IDefaultReactProps> = ({ children }) => {
  return (
    <>
      <CssBaseline />
      <div>
        <HeaderComponent />
        {children}
        <FooterComponent />
      </div>
    </>
  );
};

export default DefaultLayout;