import { defaultLimitOrderDecryptTime } from 'modules/limitOrders/pure/DecryptTimeSelector/deadlines'

import { DecryptTimeSelector } from './index'

const Fixtures = {
  default: (
    <DecryptTimeSelector
      decryptTime={defaultLimitOrderDecryptTime}
      customDeadline={null}
      selectDecryptTime={() => void 0}
      selectCustomDeadline={() => void 0}
    />
  ),
}

export default Fixtures
