import React from 'react';
import { BoutiqueSettings } from '../../../types';
import { CalendarConnect } from './CalendarConnect';

interface TabCalendarProps {
  settingsForm: BoutiqueSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<BoutiqueSettings>>;
}

export const TabCalendar: React.FC<TabCalendarProps> = ({
  settingsForm,
  setSettingsForm,
}) => {
  return <CalendarConnect settingsForm={settingsForm} setSettingsForm={setSettingsForm} />;
};
