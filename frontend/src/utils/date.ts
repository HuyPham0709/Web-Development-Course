import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';

import 'dayjs/locale/vi';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

// timezone mặc định
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

// locale tiếng Việt
dayjs.locale('vi');

export default dayjs;