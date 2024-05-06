import { Settings, SettingsProps } from './index'

const defaultProps: SettingsProps = {
  state: {
    showRecipient: false,
    partialFillsEnabled: true,
    deadlineMilliseconds: 200_000,
    customDeadlineTimestamp: null,
    decryptTimeMilliseconds: 1_000 * 1_000 * 60 // 1 minute
  },
  onStateChanged(state) {
    console.log('Settings state changed: ', state)
  },
}

export default <Settings {...defaultProps} />
