import { EntryForm } from '../components/EntryForm';
import { useSettings } from '../hooks/useSettings';

export function Entry() {
  const { settings } = useSettings();

  return (
    <div className="p-6">
      <EntryForm settings={settings} />
    </div>
  );
}
