import createMergedConfiguration from './webpack.common.config';
import { getChosenCreateConfiguration } from './utils';

export default createMergedConfiguration(getChosenCreateConfiguration);
