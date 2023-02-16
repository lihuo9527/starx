import { useEffect } from 'react';

import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
// routes
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import Settings from './components/settings';
import RtlLayout from './components/RtlLayout';
import { ChartStyle } from './components/chart';
import ScrollToTop from './components/ScrollToTop';
import { ProgressBarStyle } from './components/ProgressBar';
import NotistackProvider from './components/NotistackProvider';
import ThemeColorPresets from './components/ThemeColorPresets';
import ThemeLocalization from './components/ThemeLocalization';
import MotionLazyContainer from './components/animate/MotionLazyContainer';
import useLocales from './hooks/useLocales';

// ----------------------------------------------------------------------

export default function App() {

  return (
    <ThemeProvider>
      <ThemeColorPresets>
        <ThemeLocalization>
          <RtlLayout>
            <NotistackProvider>
              <MotionLazyContainer>
                <ProgressBarStyle />
                <ChartStyle />
                <Settings />
                <ScrollToTop />
                <Router />
                {/* 扔出去避免影响渲染 */}
                <Message />
              </MotionLazyContainer>
            </NotistackProvider>
          </RtlLayout>
        </ThemeLocalization>
      </ThemeColorPresets>
    </ThemeProvider>
  );
}



/* 全局消息 */
const Message = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { getI18nText } = useLocales('global.message');

  const {
    message,
  } = useSelector(state => ({
    ...state.global,
  }));

  // 报错
  useEffect(() => {
    if (message) {
      const {
        msg,
        i18nKey,
        variant = 'info',
      } = message;

      // 多语言影响, 部分文字不能写死.
      // 现在只处理 i18n + msg 更复杂情况以后再说, react内的自己处理成msg
      const content = ((i18nKey && getI18nText(i18nKey)) || '') + msg;
      if (content) enqueueSnackbar(content, {
        variant,
        autoHideDuration: 3000,
      })
    }
  }, [message]);

  return null;
}
