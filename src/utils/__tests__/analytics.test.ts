import { trackEvent, trackScreenView } from '../analytics';

describe('analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('trackEvent logs event in development', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    trackEvent('test_event', { key: 'value' });
    expect(spy).toHaveBeenCalledWith('📊 Analytics: test_event', {
      key: 'value',
    });
  });

  it('trackEvent works without params', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    trackEvent('button_click');
    expect(spy).toHaveBeenCalledWith('📊 Analytics: button_click', '');
  });

  it('trackScreenView calls trackEvent with correct params', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    trackScreenView('HomeScreen');
    expect(spy).toHaveBeenCalledWith('📊 Analytics: screen_view', {
      screen_name: 'HomeScreen',
    });
  });

  it('handles Firebase analytics errors gracefully', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // This will trigger the catch block since analytics is mocked as undefined in tests
    trackEvent('test_event');

    // Should still log the event even if Firebase fails
    expect(warnSpy).toHaveBeenCalledWith('📊 Analytics: test_event', '');
  });
});
