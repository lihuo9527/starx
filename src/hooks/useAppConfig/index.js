import { useCallback, useEffect, useState } from 'react';
import useLocales from '../useLocales';

import Config from './config';

// ----------------------------------------------------------------------

export default function useAppConfig() {
  const { getI18nText } = useLocales('config');

  const [ options, setOptions ] = useState();
  const [ dict, setDict ] = useState();

  // 给配置项加上文案
  const buildConfig = useCallback(() => {
    if (!getI18nText) return;
    const optionsValue = {};
    const dictValue = {};

    for (let i = 0, len = Config.length; i < len; i += 1) {
      const { key, values } = Config[i];
      const options = [];
      const dict = {};

      for (let j = 0, jLen = values.length; j < jLen; j += 1) {
        const v = values[j];
        const label = getI18nText(v, key);
        // 字典表
        dict[v] = label;
        // 可选项
        options.push({
          value: v,
          label,
        })
      }
      dictValue[key] = dict;
      optionsValue[key] = options;
    }
    
    setDict(dictValue);
    setOptions(optionsValue);
  }, [getI18nText]);

  useEffect(() => {
    buildConfig();
  }, [buildConfig]);

  return {
    options,
    dict,
  };
}
